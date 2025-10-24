from datetime import datetime, timezone
from typing import Any, Dict, cast

from .entities import extract_entities


def to_uniform_json(evidence_id: str, text: str, source_type: str) -> Dict[str, Any]:
  return {
    "evidence_id": evidence_id,
    "source_type": source_type,
    "extracted_at": datetime.now(timezone.utc).isoformat(),
    "sections": [{"title": "Full Text", "text": text, "refs": []}],
    "entities": {"dates": [], "amounts": [], "departments": []},
  }


def enrich_with_entities(payload: Dict[str, Any]) -> Dict[str, Any]:
  sections = payload.get("sections", [])
  text = ""
  if isinstance(sections, list) and sections:
    first = sections[0]
    if isinstance(first, dict):
      first_dict = cast(Dict[str, Any], first)
      raw_text = first_dict.get("text", "")
      text = raw_text if isinstance(raw_text, str) else str(raw_text)
  payload["entities"] = extract_entities(text)
  return payload
