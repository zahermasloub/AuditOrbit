from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from app.core.auth import require
from app.services.annual_plans_service import AnnualPlansService

router = APIRouter(prefix="/annual-plans", tags=["annual-plans"])
svc = AnnualPlansService()

@router.post("/{plan_id}/submit")
async def submit_plan(plan_id: UUID, user=Depends(require("annual_plans:submit"))):
    ok = svc.submit(plan_id, user.id)
    if not ok:
        raise HTTPException(400, "Cannot submit plan")
    return {"status": "submitted"}

@router.post("/{plan_id}/approve")
async def approve_plan(plan_id: UUID, step: str, notes: str|None=None, user=Depends(require("annual_plans:approve"))):
    if step not in {"manager","cae","committee"}: raise HTTPException(400, "Invalid step")
    ok = svc.approve(plan_id, step, user.id, notes)
    if not ok:
        raise HTTPException(400, "Cannot approve plan")
    return {"status": f"approved_by_{step}"}

@router.post("/{plan_id}/publish")
async def publish_plan(plan_id: UUID, user=Depends(require("annual_plans:publish"))):
    ok = svc.publish(plan_id, user.id)
    if not ok:
        raise HTTPException(400, "Cannot publish plan")
    return {"status": "published"}
