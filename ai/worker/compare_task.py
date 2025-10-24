from __future__ import annotations

from typing import Any, Dict

from .compare import compare_and_store
from .db import SessionLocal


def run_compare(evidence_id: str, scenario_id: str) -> Dict[str, Any]:
  with SessionLocal() as session:
    return compare_and_store(session, evidence_id, scenario_id)
