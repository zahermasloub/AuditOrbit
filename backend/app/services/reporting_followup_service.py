from uuid import UUID
from sqlalchemy import text
from app.core.db import session


class RFService:
def respond_finding(self, finding_id: UUID, p: dict, user_id: UUID):
with session() as db:
db.execute(text("""
INSERT INTO management_responses (id, finding_id, response, action_plan, due_date, owner)
VALUES (gen_random_uuid(), :fid, :r, :ap, :due, :owner)
"""), {"fid": str(finding_id), "r": p.get("response"), "ap": p.get("action_plan"), "due": p.get("due_date"), "owner": p.get("owner")})
db.commit(); return {"status": "response_added"}
def archive_evidence(self, evidence_id: UUID, p: dict, user_id: UUID):
with session() as db:
db.execute(text("""
INSERT INTO evidence_archive (id, evidence_id, reason, deleted_by, restore_before)
VALUES (gen_random_uuid(), :eid, :reason, :uid, now() + interval '30 days')
"""), {"eid": str(evidence_id), "reason": p.get("reason"), "uid": str(user_id)})
db.commit(); return {"status": "archived"}
def restore_evidence(self, archive_id: UUID, user_id: UUID):
with session() as db:
db.execute(text("DELETE FROM evidence_archive WHERE id=:aid"), {"aid": str(archive_id)})
db.commit(); return {"status": "restored"}
def add_action(self, engagement_id: UUID, p: dict, user_id: UUID):
with session() as db:
db.execute(text("""
INSERT INTO followup_actions (id, engagement_id, title, due_date, owner, status)
VALUES (gen_random_uuid(), :eid, :t, :due, :owner, 'open')
"""), {"eid": str(engagement_id), "t": p.get("title"), "due": p.get("due_date"), "owner": p.get("owner")})
db.commit(); return {"status": "action_added"}
