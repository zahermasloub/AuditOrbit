from worker.compare import _contains_any, _missing_all


def test_compare_helpers() -> None:
  text = "يتطلب أمر شراء PO الموافقة من المدير. المبلغ QAR 5000."
  assert set(_contains_any(text, ["موافقة", "اعتماد", "approval"]))
  assert _missing_all(text, ["Policy", "سياسة"])


def test_compare_helpers_no_hits() -> None:
  text = "نص لا يحتوي على الكلمات المطلوبة."
  assert _contains_any(text, ["approve", "موافقة"]) == []
  assert set(_missing_all(text, ["PO", "أمر شراء"])) == {"PO", "أمر شراء"}
