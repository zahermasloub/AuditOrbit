from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from .config import Config

engine = create_engine(Config.DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, future=True)


def insert_extraction(session, evidence_id: str, payload: dict, source_type: str, confidence: float | None):
  session.execute(
    text(
      """
        INSERT INTO evidence_extractions(evidence_id, json_payload, source_type, confidence)
        VALUES (:e, :j::jsonb, :s, :c)
      """
    ),
    {"e": evidence_id, "j": payload, "s": source_type, "c": confidence},
  )
  session.commit()
