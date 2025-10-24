from __future__ import annotations

import json
from typing import Any, Dict, List, cast

from sqlalchemy import text as sql_text
from sqlalchemy.orm import Session


def _contains_any(text: str, keywords: List[str]) -> List[str]:
  lower_text = text.lower()
  return [keyword for keyword in keywords if keyword.lower() in lower_text]


def _missing_all(text: str, keywords: List[str]) -> List[str]:
  lower_text = text.lower()
  return [keyword for keyword in keywords if keyword.lower() not in lower_text]


def _extract_body(payload: Dict[str, Any]) -> str:
  sections = payload.get("sections", [])
  if isinstance(sections, list) and sections:
    first = sections[0]
    if isinstance(first, dict):
      first_dict = cast(Dict[str, Any], first)
      raw = first_dict.get("text", "")
      if isinstance(raw, str):
        return raw
      return str(raw)
  return str(payload)


def compare_and_store(session: Session, evidence_id: str, scenario_id: str) -> Dict[str, Any]:
  extraction_row = session.execute(
    sql_text(
      """
        SELECT json_payload
        FROM evidence_extractions
        WHERE evidence_id = :evidence_id
        ORDER BY extracted_at DESC
        LIMIT 1
      """
    ),
    {"evidence_id": evidence_id},
  ).mappings().first()

  if extraction_row is None:
    return {"ok": False, "error": "no_extraction"}

  payload_raw = extraction_row["json_payload"]
  if not isinstance(payload_raw, dict):
    return {"ok": False, "error": "invalid_payload"}

  payload = cast(Dict[str, Any], payload_raw)
  text_content = _extract_body(payload)

  scenario_row = session.execute(
    sql_text("SELECT rules, name FROM comparison_scenarios WHERE id = :scenario_id"),
    {"scenario_id": scenario_id},
  ).mappings().first()

  if scenario_row is None:
    return {"ok": False, "error": "scenario_not_found"}

  rules_data = scenario_row.get("rules")
  checks: List[Dict[str, Any]] = []
  if isinstance(rules_data, dict):
    rules_dict = cast(Dict[str, Any], rules_data)
    raw_checks = rules_dict.get("checks", [])
    if isinstance(raw_checks, list):
      raw_checks_list = cast(List[Any], raw_checks)
      for item in raw_checks_list:
        if isinstance(item, dict):
          checks.append(cast(Dict[str, Any], item))

  created = 0
  for check in checks:
    check_id = str(check.get("id", "RULE"))
    any_keywords = [str(item) for item in check.get("any", []) if isinstance(item, str)]
    all_keywords = [str(item) for item in check.get("all", []) if isinstance(item, str)]
    severity = str(check.get("severity", "medium"))

    matched_any = _contains_any(text_content, any_keywords) if any_keywords else []
    missing_all = _missing_all(text_content, all_keywords) if all_keywords else []

    # Trigger finding if:
    # 1. We have any_keywords and at least one matched, OR
    # 2. We have all_keywords and at least one is missing
    trigger = bool(matched_any) or bool(missing_all)

    if not trigger:
      continue

    excerpt = text_content[:600]
    details = json.dumps({"matched_any": matched_any, "missing_all": missing_all, "excerpt": excerpt})

    session.execute(
      sql_text(
        """
          INSERT INTO findings(evidence_id, scenario_id, check_id, title, severity, status, details)
          VALUES (:evidence_id, :scenario_id, :check_id, :title, :severity, 'open', CAST(:details AS jsonb))
        """
      ),
      {
        "evidence_id": evidence_id,
        "scenario_id": scenario_id,
        "check_id": check_id,
        "title": f"{check_id}: Keywords found in document",
        "severity": severity,
        "details": details,
      },
    )
    created += 1

  session.commit()
  return {"ok": True, "created": created, "scenario": scenario_row.get("name")}
