from uuid import UUID
from sqlalchemy import text
from app.core.db import session


class RCMService:
def add_risk(self, engagement_id: UUID, p: dict):
with session() as db:
rid = p.get("id") or str(UUID())
db.execute(text("""
INSERT INTO rcm_risks (id, engagement_id, title, description, coso_component, likelihood, impact)
VALUES (:id, :eid, :title, :desc, :coso, :lh, :imp)
"""), {"id": rid, "eid": str(engagement_id), "title": p["title"], "desc": p.get("description"),
"coso": p.get("coso_component"), "lh": p["likelihood"], "imp": p["impact"]})
db.commit()
return {"id": rid}

def add_control(self, risk_id: UUID, p: dict):
with session() as db:
cid = p.get("id") or str(UUID())
db.execute(text("""
INSERT INTO rcm_controls (id, risk_id, control_title, control_type, owner)
VALUES (:id, :rid, :title, :type, :owner)
"""), {"id": cid, "rid": str(risk_id), "title": p["control_title"],
"type": p.get("control_type"), "owner": p.get("owner")})
db.commit()
return {"id": cid}

def add_test(self, control_id: UUID, p: dict):
with session() as db:
tid = p.get("id") or str(UUID())
db.execute(text("""
INSERT INTO rcm_tests (id, control_id, procedure, sample_method, sample_size, criteria)
VALUES (:id, :cid, :proc, :method, :size, :criteria)
"""), {"id": tid, "cid": str(control_id), "proc": p["procedure"],
"method": p.get("sample_method"), "size": p.get("sample_size"), "criteria": p.get("criteria")})
db.commit()
return {"id": tid}

def signoff(self, engagement_id: UUID):
with session() as db:
db.execute(text("UPDATE engagements SET planning_signoff=true WHERE id=:eid"),
{"eid": str(engagement_id)})
db.commit()
return {"success": True}
