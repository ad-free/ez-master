from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.clients.ez import EzClient
from app.core.exceptions import EzException


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


def get_user_profile(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    request: Request = None,
) -> dict:
    """Get the user profile for the current request, caching it to avoid multiple API calls.
    
    This dependency fetches the user profile once per request and caches it,
    preventing unnecessary API calls when multiple endpoints need profile data.
    
    Args:
        credentials: HTTP authorization credentials
        request: FastAPI request object
        
    Returns:
        The user profile dictionary
        
    Raises:
        HTTPException: If authentication fails or user profile cannot be retrieved
    """
    token = get_ez_bearer_token(credentials, request)
    client = EzClient()
    try:
        return client.get_user_profile(token)
    except EzException as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


def get_user_id(profile: dict = Depends(get_user_profile)) -> str:
    """Get the user ID from the cached user profile.
    
    This dependency extracts the user ID from the already-fetched profile data,
    avoiding any additional API calls.
    
    Args:
        profile: The user profile dictionary from get_user_profile dependency
        
    Returns:
        The user ID string
    """
    return profile["ID"]
