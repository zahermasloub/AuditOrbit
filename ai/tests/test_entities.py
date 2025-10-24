from worker.entities import extract_entities


def test_entities_arabic_text() -> None:
  text = (
    "فاتورة رقم 123 بتاريخ 2025-01-15 بقيمة 5,000 ريال قطري (QAR 5000)."
    " إدارة المشتريات تؤكد الموافقة النهائية. تاريخ الاستلام 15/02/2025."
  )
  entities = extract_entities(text)

  assert any(date_value.startswith("2025-01-15") for date_value in entities["dates"])
  assert any("15/02/2025" in date_value or "2025-02-15" in date_value for date_value in entities["dates"])
  assert any(
    amount.get("value") and float(amount["value"]) >= 5000 for amount in entities["amounts"]
  )
  assert "المشتريات" in entities["departments"]
