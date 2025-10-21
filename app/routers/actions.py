from __future__ import annotations

from calendar import c
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Path, Request
from fastapi.security import HTTPAuthorizationCredentials

from app.clients.ez import EzClient
from app.core.exceptions import EzException
from app.core.types import OTBenefitType, OTType, TicketStatus
from app.routers.common import get_ez_bearer_token, get_user_id, security
from app.schemas.requests import (
    RegisterOTRequest,
    RegisterWFHRequest,
)
from app.schemas.responses import GetTicketsResponse

router = APIRouter(prefix="", tags=["actions"])


def _dates_between_inclusive(from_date: str, to_date: str) -> List[str]:
    try:
        start = datetime.strptime(from_date, "%Y-%m-%d")
        end = datetime.strptime(to_date, "%Y-%m-%d")
    except ValueError as exc:
        raise HTTPException(
            status_code=400, detail="Invalid date format. Use YYYY-MM-DD."
        ) from exc

    if start > end:
        raise HTTPException(status_code=400, detail="to_date must be >= from_date")

    return [
        (start + timedelta(days=day)).isoformat()
        for day in range((end - start).days + 1)
    ]


@router.post("/wfh/register")
def register_wfh(
    req: RegisterWFHRequest,
    user_id: str = Depends(get_user_id),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    request: Request = None,
):
    """Register Work From Home for a date range.

    Request body:
    Authentication:
    - Use HTTP Bearer in the Authorization header. In Swagger, click "Authorize" and enter
      `Bearer <token>` obtained from `/login`.
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
        token = get_ez_bearer_token(credentials, request)
        dates = _dates_between_inclusive(req.from_date, req.to_date)
        client.register_wfh(
            token=token, user_id=user_id, dates=dates, reason=req.reason
        )
        return {"status": "ok", "user_id": user_id, "dates": dates}
    except EzException as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/ot/register")
def register_ot(
    req: RegisterOTRequest,
    user_id: str = Depends(get_user_id),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    request: Request = None,
):
    """Register Overtime for a date range and time window.

    Request body:
    Authentication:
    - Use HTTP Bearer in the Authorization header. In Swagger, click "Authorize" and enter
      `Bearer <token>` obtained from `/login`.
    - from_date, to_date: Inclusive date range in YYYY-MM-DD
    - from_time, to_time: HH:MM (24h) time window applied to each date
    - ot_type: PLAN or ADDITIONAL
    - ot_benefit_type: DILIGENCE, COMPENSATION, or SALARY
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
        token = get_ez_bearer_token(credentials, request)
        dates = _dates_between_inclusive(req.from_date, req.to_date)
        ot_type_value = (
            OTType.PLAN if req.ot_type == "PLAN" else OTType.ADDITIONAL
        ).value
        ot_benefit_value = OTBenefitType[req.ot_benefit_type]
        client.register_ot(
            token=token,
            user_id=user_id,
            dates=dates,
            from_time=req.from_time,
            to_time=req.to_time,
            ot_type=ot_type_value,
            ot_benefit_type=ot_benefit_value,
            reason=req.reason,
        )
        return {"status": "ok", "user_id": user_id, "dates": dates}
    except EzException as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/tickets")
def get_all_tickets(
    ticket_status: str = TicketStatus.Pending.name,
    page_size: int = 100,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    request: Request = None,
) -> list[GetTicketsResponse]:
    """Fetch tickets from EZ by ticket status and page size.

    ticket_status is accepted as an integer query parameter to avoid
    FastAPI/Pydantic enum coercion issues. It will be validated and
    converted to the internal TicketStatus enum before calling the client.
    """
    client = EzClient()
    try:
        token = get_ez_bearer_token(credentials, request)
        all_tickets = client.get_all_tickets(token, ticket_status, page_size)
        return [
            GetTicketsResponse(
                ticket_id=ticket["Ticket"],
                owner=ticket["RegisterName"],
                status=TicketStatus.Pending.name
                if ticket["Status"] == TicketStatus.Pending.value
                else TicketStatus.Following.name,
                reason=ticket["Reason"],
                approver=ticket["PreUserName"]
                if ticket["PreUserName"]
                else ticket["NextUserNames"],
                created_at=ticket["RegisterDate"],
            )
            for ticket in all_tickets
        ]
    except EzException as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/tickets/{ticket_id}/reject")
def reject_ticket(
    ticket_id: int = Path(description="ID of the ticket to cancel"),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    request: Request = None,
):
    """Cancel a ticket by its ID.

    Request parameters:
    - ticket_id: ID of the ticket to cancel

    Authentication:
    - Use HTTP Bearer in the Authorization header. In Swagger, click "Authorize" and enter
      `Bearer <token>` obtained from `/login`.

    Behavior:
    - Logs in to obtain a token and submits a cancellation request for the specified ticket ID.

    Returns:
    - status: "ok" if the cancellation succeeds
    - ticket_id: The ID of the cancelled ticket

    Errors:
    - 400: Validation failures or EZ API rejection
    """
    client = EzClient()
    try:
        token = get_ez_bearer_token(credentials, request)
        client.reject_ticket_by_id(token, ticket_id)
        return {"message": "Successfully reject the ticket", "ticket_id": ticket_id}
    except EzException as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
