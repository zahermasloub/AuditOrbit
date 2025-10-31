from dataclasses import dataclass
from typing import Optional


@dataclass
class Engagement:
    """Domain representation of an engagement row."""

    id: str
    annual_plan_id: str
    title: str
    scope: Optional[str]
    risk_rating: Optional[str]
    status: str
    start_date: Optional[str]
    end_date: Optional[str]
    created_at: str
