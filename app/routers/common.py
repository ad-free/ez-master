from __future__ import annotations

from fastapi import APIRouter


router = APIRouter(prefix="", tags=["common"])


@router.get("/healthcheck")
def healthcheck():
    return {"status": "ok"}
