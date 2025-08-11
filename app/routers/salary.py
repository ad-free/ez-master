from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.clients.ez import EzClient
from app.core.exceptions import EzException
from app.schemas.auth import SalaryDownloadRequest


router = APIRouter(prefix="", tags=["salary"])


@router.post("/salary/download")
def salary_download(req: SalaryDownloadRequest):
    """Download the salary PDF for a given month.

    Request body:
    - username, password: EZ credentials
    - date: Optional YYYY-MM; defaults to current month (UTC)

    Returns:
    - application/pdf stream with a suggested filename like `salary_YYYY-MM.pdf`

    Errors:
    - 400: EZ API rejection or data not available
    """
    client = EzClient()
    try:
        token = client.login(req.username, req.password)
        filename, content = client.download_salary_pdf(token, req.date)
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


