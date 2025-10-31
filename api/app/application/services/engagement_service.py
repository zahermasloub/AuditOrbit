from __future__ import annotations

from typing import Optional

from app.application.dtos.engagements import EngagementCreate, EngagementOut, PageOut
from app.domain.entities.engagement import Engagement
from app.domain.ports.engagement_repository import EngagementRepository


class EngagementService:
    """Application service orchestrating engagement flows."""

    def __init__(self, repository: EngagementRepository) -> None:
        self._repository = repository

    def list_engagements(self, *, page: int, size: int, status: Optional[str]) -> PageOut:
        result = self._repository.fetch_page(page, size, status)
        items = [self._to_out(engagement) for engagement in result.items]
        return PageOut(items=items, page=result.page, size=result.size, total=result.total)

    def create_engagement(self, payload: EngagementCreate) -> EngagementOut:
        plan_id = self._repository.ensure_annual_plan(payload.annual_plan_year)
        engagement = self._repository.create_engagement(
            annual_plan_id=plan_id,
            title=payload.title,
            scope=payload.scope,
            risk_rating=payload.risk_rating,
        )
        return self._to_out(engagement)

    @staticmethod
    def _to_out(engagement: Engagement) -> EngagementOut:
        return EngagementOut(
            id=engagement.id,
            annual_plan_id=engagement.annual_plan_id,
            title=engagement.title,
            scope=engagement.scope,
            risk_rating=engagement.risk_rating,
            status=engagement.status,
            start_date=engagement.start_date,
            end_date=engagement.end_date,
            created_at=engagement.created_at,
        )
