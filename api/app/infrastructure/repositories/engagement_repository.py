from __future__ import annotations

import uuid
from typing import Any, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.domain.entities.engagement import Engagement
from app.domain.ports.engagement_repository import (
    EngagementRepository,
    PaginatedEngagements,
)


class SqlAlchemyEngagementRepository(EngagementRepository):
    """SQL-backed implementation for engagement persistence."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def fetch_page(self, page: int, size: int, status: Optional[str]) -> PaginatedEngagements:
        filters: list[str] = []
        params: dict[str, Any] = {"offset": (page - 1) * size, "limit": size}
        total_params: dict[str, Any] = {}
        if status:
            filters.append("e.status = :status")
            params["status"] = status
            total_params["status"] = status

        where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""

        total_query = text(f"SELECT count(*) FROM engagements e {where_sql}")
        total = int(self._session.execute(total_query, total_params).scalar_one())

        rows = self._session.execute(
            text(
                f"""
                SELECT
                    e.id::text AS id,
                    e.annual_plan_id::text AS annual_plan_id,
                    e.title,
                    e.scope,
                    COALESCE(e.risk_rating, 'medium') AS risk_rating,
                    e.status::text AS status,
                    to_char(e.start_date, 'YYYY-MM-DD') AS start_date,
                    to_char(e.end_date, 'YYYY-MM-DD') AS end_date,
                    e.responsible_auditor_id::text AS responsible_auditor_id,
                    COALESCE(e.estimated_hours, 0) AS estimated_hours,
                    COALESCE(e.actual_hours, 0) AS actual_hours,
                    to_char(e.created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at
                FROM engagements e
                {where_sql}
                ORDER BY e.created_at DESC
                OFFSET :offset LIMIT :limit
                """
            ),
            params,
        ).mappings().all()
        items = [self._map_row(row) for row in rows]
        return PaginatedEngagements(items=items, total=total, page=page, size=size)

    def ensure_annual_plan(self, year: int) -> str:
        plan = self._session.execute(
            text('SELECT id::text AS id FROM annual_plans WHERE year = :year'),
            {"year": year},
        ).mappings().first()
        if plan:
            return plan["id"]

        plan_id = str(uuid.uuid4())
        self._session.execute(
            text(
                """
                INSERT INTO annual_plans (
                    id, title, year, status, created_at
                ) VALUES (
                    :id, :title, :year, 'draft', CURRENT_TIMESTAMP
                )
                """
            ),
            {
                "id": plan_id,
                "title": f"Annual Plan {year}",
                "year": year,
            },
        )
        self._session.commit()
        return plan_id

    def create_engagement(
        self,
        *,
        annual_plan_id: str,
        title: str,
        scope: Optional[str],
        risk_rating: Optional[str],
    ) -> Engagement:
        engagement_id = str(uuid.uuid4())
        created = self._session.execute(
            text(
                """
                INSERT INTO engagements (
                    id, annual_plan_id, title, scope, risk_rating,
                    start_date, end_date, status, created_at
                ) VALUES (
                    :id, :plan_id, :title, :scope, COALESCE(:risk_rating, 'medium'),
                    CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'scheduled', CURRENT_TIMESTAMP
                )
                RETURNING
                    id::text AS id,
                    annual_plan_id::text AS annual_plan_id,
                    title,
                    scope,
                    risk_rating,
                    status::text AS status,
                    to_char(start_date, 'YYYY-MM-DD') AS start_date,
                    to_char(end_date, 'YYYY-MM-DD') AS end_date,
                    responsible_auditor_id::text AS responsible_auditor_id,
                    COALESCE(estimated_hours, 0) AS estimated_hours,
                    COALESCE(actual_hours, 0) AS actual_hours,
                    to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at
                """
            ),
            {
                "id": engagement_id,
                "plan_id": annual_plan_id,
                "title": title,
                "scope": scope or "Audit scope",
                "risk_rating": risk_rating,
            },
        ).mappings().first()
        if created is None:
            self._session.rollback()
            raise RuntimeError("Failed to create engagement")
        self._session.commit()
        return self._map_row(created)

    @staticmethod
    def _map_row(row: Any) -> Engagement:
        return Engagement(
            id=row.get("id"),
            annual_plan_id=row.get("annual_plan_id"),
            title=row.get("title"),
            scope=row.get("scope"),
            risk_rating=row.get("risk_rating"),
            status=row.get("status"),
            start_date=row.get("start_date"),
            end_date=row.get("end_date"),
            responsible_auditor_id=row.get("responsible_auditor_id"),
            estimated_hours=int(row.get("estimated_hours") or 0),
            actual_hours=int(row.get("actual_hours") or 0),
            created_at=row.get("created_at"),
        )
