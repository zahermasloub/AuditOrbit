import importlib
import re
from typing import Any, Dict, List, Optional

_nlp: Optional[Any]
try:
  spacy_module = importlib.import_module("spacy")
  _nlp = getattr(spacy_module, "load")("ar_core_news_sm")
except Exception:  # pragma: no cover - spaCy model optional at runtime
  _nlp = None

_DATE_RX = re.compile(r"\b(20\d{2}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/20\d{2})\b")
_AMOUNT_RX = re.compile(r"\b(?:(?:QAR|ر\.ق|ريال\sقطري)\s*)?(\d{1,3}(?:[,\.\s]\d{3})*(?:[\.,]\d{1,2})?)\b", re.IGNORECASE)
_DEPARTMENTS = [
  "المشتريات",
  "الرواتب",
  "الحسابات",
  "الحوكمة",
  "التقنية",
  "المخاطر",
  "الامتثال",
  "المخازن",
  "الخزينة",
  "المبيعات",
]


def _extract_dates(text: str) -> List[str]:
  return list({match.group(1) if match.groups() else match.group(0) for match in _DATE_RX.finditer(text)})


def _extract_amounts(text: str) -> List[Dict[str, Any]]:
  amounts: List[Dict[str, Any]] = []
  for match in _AMOUNT_RX.finditer(text):
    raw = match.group(0)
    numeric = match.group(1).replace(",", "").replace(" ", "")
    try:
      value = float(numeric)
    except ValueError:
      continue
    currency = "QAR" if ("QAR" in raw.upper() or "ر" in raw) else None
    amounts.append({"value": value, "currency": currency})
  return amounts


def _extract_departments(text: str) -> List[str]:
  found = [dept for dept in _DEPARTMENTS if dept in text]
  if _nlp:
    doc = _nlp(text[:200000])
    for ent in doc.ents:
      if ent.label_ in {"ORG", "FAC", "GPE"} and ent.text not in found:
        found.append(ent.text)
  return found


def extract_entities(text: str) -> Dict[str, Any]:
  return {
    "dates": _extract_dates(text),
    "amounts": _extract_amounts(text),
    "departments": _extract_departments(text),
  }
