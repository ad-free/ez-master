from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


router = APIRouter(prefix="", tags=["common"])


@router.get("/healthcheck")
def healthcheck():
    return {"status": "ok"}


# Shared security dependency and token resolver
security = HTTPBearer(auto_error=False)


def get_ez_bearer_token(
    credentials: HTTPAuthorizationCredentials | None,
    request: Request,
) -> str:
    if credentials and credentials.scheme.lower() == "bearer" and credentials.credentials:
        return credentials.credentials
    token = request.cookies.get("ez_token")
    if token:
        return token
    raise HTTPException(
        status_code=401,
        detail="Missing bearer token. Login to get a token or provide Authorization header.",
    )
