from __future__ import annotations

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, HTTPException

from app.clients.ez import EzClient
from app.core.exceptions import EzException
from app.core.types import OTType
from app.schemas.requests import RegisterOTRequest, RegisterWFHRequest


router = APIRouter(prefix="", tags=["actions"])


def _dates_between_inclusive(from_date: str, to_date: str) -> List[str]:
    try:
        start = datetime.strptime(from_date, "%Y-%m-%d")
        end = datetime.strptime(to_date, "%Y-%m-%d")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.") from exc

    if start > end:
        raise HTTPException(status_code=400, detail="to_date must be >= from_date")

    return [(start + timedelta(days=day)).isoformat() for day in range((end - start).days + 1)]


@router.post("/wfh/register")
def register_wfh(req: RegisterWFHRequest):
    """Register Work From Home for a date range.

    Request body:
    - username, password: EZ credentials
    - from_date, to_date: Inclusive date range in YYYY-MM-DD
    - reason: Optional reason text

    Behavior:
    - Logs in to obtain a token, fetches user_id, expands dates inclusively,
      and submits a WFH registration for each date.

    Returns:
    - status: "ok" if all submissions succeed
    - user_id: EZ user ID
    - dates: List of ISO-8601 datetime strings for each submitted day

    Errors:
    - 400: Validation failures or EZ API rejection
    """
    client = EzClient()
    try:
        token = client.login(req.username, req.password)
        user_id = client.get_user_id(token)
        dates = _dates_between_inclusive(req.from_date, req.to_date)
        client.register_wfh(token=token, user_id=user_id, dates=dates, reason=req.reason)
        return {"status": "ok", "user_id": user_id, "dates": dates}
    except EzException as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/ot/register")
def register_ot(req: RegisterOTRequest):
    """Register Overtime for a date range and time window.

    Request body:
    - username, password: EZ credentials
    - from_date, to_date: Inclusive date range in YYYY-MM-DD
    - from_time, to_time: HH:MM (24h) time window applied to each date
    - ot_type: PLAN or ADDITIONAL
    - reason: Optional reason text

    Behavior:
    - Logs in to obtain a token, fetches user_id, expands dates inclusively,
      and submits an OT registration for each date with the time window.

    Returns:
    - status: "ok" if all submissions succeed
    - user_id: EZ user ID
    - dates: List of ISO-8601 datetime strings for each submitted day

    Errors:
    - 400: Validation failures or EZ API rejection
    """
    client = EzClient()
    try:
        token = client.login(req.username, req.password)
        user_id = client.get_user_id(token)
        dates = _dates_between_inclusive(req.from_date, req.to_date)
        ot_type_value = OTType.PLAN if req.ot_type == "PLAN" else OTType.ADDITIONAL
        client.register_ot(
            token=token,
            user_id=user_id,
            dates=dates,
            from_time=req.from_time,
            to_time=req.to_time,
            ot_type=ot_type_value,
            reason=req.reason,
        )
        return {"status": "ok", "user_id": user_id, "dates": dates}
    except EzException as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


