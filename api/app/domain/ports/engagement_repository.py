from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Protocol

from app.domain.entities.engagement import Engagement


@dataclass
class PaginatedEngagements:
    items: list[Engagement]
    total: int
    page: int
    size: int


class EngagementRepository(Protocol):
    """Persistence port responsible for engagements and related plans."""

    def fetch_page(self, page: int, size: int, status: Optional[str]) -> PaginatedEngagements:  # pragma: no cover
        raise NotImplementedError

    def ensure_annual_plan(self, year: int) -> str:  # pragma: no cover
        """Return plan ID for the given fiscal year, creating a draft if missing."""
        raise NotImplementedError

    def create_engagement(
        self,
        *,
        annual_plan_id: str,
        title: str,
        scope: Optional[str],
        risk_rating: Optional[str],
    ) -> Engagement:  # pragma: no cover
        raise NotImplementedError
