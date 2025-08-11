from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse

from app.clients.ez import EzClient
from app.core.exceptions import EzException


from app.routers.common import security, get_ez_bearer_token


router = APIRouter(prefix="", tags=["salary"])


@router.post("/salary/download")
def salary_download(
    date: str | None = None,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    request: Request = None,
):
    """Download the salary PDF for a given month.

    Authentication:
    - Use HTTP Bearer in the Authorization header or login first to set the ez_token cookie.

    Parameters:
    - date: Optional YYYY-MM; defaults to current month (UTC)

    Returns:
    - application/pdf stream with a suggested filename like `salary_YYYY-MM.pdf`

    Errors:
    - 400: EZ API rejection or data not available
    """
    client = EzClient()
    try:
        token = get_ez_bearer_token(credentials, request)
        filename, content = client.download_salary_pdf(token, date)
        return StreamingResponse(
            iter([content]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/pdf",
            },
        )
    except EzException as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


