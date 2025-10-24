from datetime import datetime, timezone


def to_uniform_json(evidence_id: str, text: str, source_type: str) -> dict[str, object]:
  return {
    "evidence_id": evidence_id,
    "source_type": source_type,
  "extracted_at": datetime.now(timezone.utc).isoformat(),
    "sections": [{"title": "Full Text", "text": text, "refs": []}],
    "entities": {"dates": [], "amounts": [], "departments": []},
  }
