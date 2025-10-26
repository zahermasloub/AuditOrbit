from fastapi import APIRouter, Depends
from uuid import UUID
from app.core.auth import require
from app.services.rcm_service import RCMService

router = APIRouter(prefix="/rcm", tags=["rcm"])
svc = RCMService()


@router.post("/{engagement_id}/risks")
async def add_risk(engagement_id: UUID, payload: dict, user=Depends(require("rcm:write"))):
    return svc.add_risk(engagement_id, payload)


@router.post("/controls/{risk_id}")
async def add_control(risk_id: UUID, payload: dict, user=Depends(require("rcm:write"))):
    return svc.add_control(risk_id, payload)


@router.post("/tests/{control_id}")
async def add_test(control_id: UUID, payload: dict, user=Depends(require("rcm:write"))):
    return svc.add_test(control_id, payload)


@router.post("/{engagement_id}/signoff")
async def signoff(engagement_id: UUID, user=Depends(require("planning:signoff"))):
    return svc.signoff(engagement_id)
