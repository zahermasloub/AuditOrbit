import io
import json
import os
import tempfile
from subprocess import PIPE, CalledProcessError, run

import fitz
import pdfplumber
import pytesseract
from PIL import Image


def is_scanned_pdf(pdf_path: str) -> bool:
  try:
    with pdfplumber.open(pdf_path) as pdf:
      for page in pdf.pages[:2]:
        if (page.extract_text() or "").strip():
          return False
    return True
  except Exception:
    return True


def extract_pdf_text(pdf_path: str) -> str:
  out: list[str] = []
  try:
    with pdfplumber.open(pdf_path) as pdf:
      for page in pdf.pages:
        out.append(page.extract_text() or "")
  except Exception:
    doc = fitz.open(pdf_path)
    for page in doc:
      out.append(page.get_text("text"))
  return "\n".join(out)


def ocr_pdf_to_text(pdf_path: str) -> tuple[str, float]:
  with tempfile.TemporaryDirectory() as tmp_dir:
    out_pdf = os.path.join(tmp_dir, "ocr.pdf")
    try:
      run(
        [
          "ocrmypdf",
          "--force-ocr",
          "--skip-text",
          "--language",
          "ara+eng",
          "--optimize",
          "1",
          pdf_path,
          out_pdf,
        ],
        stdout=PIPE,
        stderr=PIPE,
        check=True,
        text=True,
      )
    except CalledProcessError:
      return extract_pdf_text(pdf_path), 0.50
    return extract_pdf_text(out_pdf), 0.90


def ocr_image_to_text(img_bytes: bytes) -> tuple[str, float]:
  img = Image.open(io.BytesIO(img_bytes))
  txt = pytesseract.image_to_string(img, lang="ara+eng")
  confidence = 0.80 if len(txt) > 20 else 0.40
  return txt, confidence
