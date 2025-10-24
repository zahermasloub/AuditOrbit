import mimetypes
import os
import tempfile

from sqlalchemy import text as sql_text

from .db import SessionLocal, insert_extraction
from .normalize import to_uniform_json
from .ocr import extract_pdf_text, is_scanned_pdf, ocr_image_to_text, ocr_pdf_to_text
from .storage import s3_client


def extract_evidence(evidence_id: str) -> dict[str, object]:
  s3 = s3_client()
  with SessionLocal() as session:
    record = session.execute(
      sql_text(
        """
          SELECT id, bucket, object_key, filename, mime_type
          FROM evidence
          WHERE id = :id
        """
      ),
      {"id": evidence_id},
    ).mappings().first()

    if record is None:
      return {"ok": False, "error": "evidence_not_found"}

    with tempfile.TemporaryDirectory() as tmp_dir:
      local_path = os.path.join(tmp_dir, record["filename"])
      with open(local_path, "wb") as downloaded:
        s3.download_fileobj(record["bucket"], record["object_key"], downloaded)

      mime = record["mime_type"] or (mimetypes.guess_type(record["filename"])[0] or "")
      source_type = "pdf" if "pdf" in mime or local_path.lower().endswith(".pdf") else "image"

      if source_type == "pdf":
        if is_scanned_pdf(local_path):
          text, confidence = ocr_pdf_to_text(local_path)
        else:
          text, confidence = extract_pdf_text(local_path), 0.75
      else:
        with open(local_path, "rb") as handle:
          blob = handle.read()
        text, confidence = ocr_image_to_text(blob)

      payload = to_uniform_json(str(record["id"]), text, source_type)
      insert_extraction(session, evidence_id, payload, source_type, confidence)
      session.execute(sql_text("UPDATE evidence SET status = 'ready' WHERE id = :id"), {"id": evidence_id})
      session.commit()

      return {"ok": True, "confidence": confidence, "chars": len(text)}
