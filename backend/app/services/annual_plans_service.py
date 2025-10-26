from uuid import UUID
from sqlalchemy import text
from app.core.db import session

class AnnualPlansService:
    def submit(self, plan_id: UUID, user_id: UUID) -> bool:
        with session() as db:
            # سجّل التقديم
            db.execute(text("""
                INSERT INTO annual_plan_approvals (id, annual_plan_id, step, decision, decided_by, decided_at)
                VALUES (gen_random_uuid(), :pid, 'manager', 'submitted', :uid, now())
            """), {"pid": str(plan_id), "uid": str(user_id)})
            # حدّث حالة الخطة
            db.execute(text("UPDATE annual_plans SET status='submitted', updated_at=now() WHERE id=:pid"),
                       {"pid": str(plan_id)})
            db.commit()
            return True
    
    def approve(self, plan_id: UUID, step: str, user_id: UUID, notes: str|None) -> bool:
        with session() as db:
            if step not in {"manager","cae","committee"}:
                return False
            db.execute(text("""
                INSERT INTO annual_plan_approvals (id, annual_plan_id, step, decision, decided_by, decided_at, notes)
                VALUES (gen_random_uuid(), :pid, :step, 'approved', :uid, now(), :notes)
            """), {"pid": str(plan_id), "step": step, "uid": str(user_id), "notes": notes})
            # إذا كانت موافقة اللجنة تمت، اجعل الحالة committee_approved
            if step == "committee":
                db.execute(text("""
                    UPDATE annual_plans SET status='committee_approved', updated_at=now() WHERE id=:pid
                """), {"pid": str(plan_id)})
            db.commit()
            return True
    
    def publish(self, plan_id: UUID, user_id: UUID) -> bool:
        with session() as db:
            # تأكد من وجود موافقة CAE + Committee
            row = db.execute(text("""
                SELECT
                  SUM(CASE WHEN step='cae' AND decision='approved' THEN 1 ELSE 0 END) AS cae_ok,
                  SUM(CASE WHEN step='committee' AND decision='approved' THEN 1 ELSE 0 END) AS comm_ok
                FROM annual_plan_approvals
                WHERE annual_plan_id=:pid
            """), {"pid": str(plan_id)}).first()
            if not row or row.cae_ok < 1 or row.comm_ok < 1:
                return False
            db.execute(text("""
                UPDATE annual_plans SET status='published', updated_at=now() WHERE id=:pid
            """), {"pid": str(plan_id)})
            db.commit()
            return True

