from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.clients.ez import EzClient
from app.core.exceptions import EzException
from app.schemas.auth import LoginRequest, LoginResponse, ProfileResponse


router = APIRouter(prefix="", tags=["auth"])
security = HTTPBearer(auto_error=False)


def get_ez_bearer_token(credentials: HTTPAuthorizationCredentials | None, request: Request) -> str:
    if credentials and credentials.scheme.lower() == "bearer" and credentials.credentials:
        return credentials.credentials
    token = request.cookies.get("ez_token")
    if token:
        return token
    raise HTTPException(status_code=401, detail="Missing bearer token. Login to get a token or provide Authorization header.")


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, response: Response):
    """Authenticate with EZ and return a bearer token.

    Request body:
    - username: EZ username (email)
    - password: EZ password

    Returns:
    - token: Bearer token string to be used for authenticated endpoints

    Errors:
    - 401: Invalid credentials or EZ rejected the login
    """
    client = EzClient()
    try:
        token = client.login(req.username, req.password)
        # Also set an HttpOnly cookie so Swagger UI can call protected endpoints without manual headers
        response.set_cookie(key="ez_token", value=token, httponly=True, samesite="lax")
        return LoginResponse(token=token)
    except EzException as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.get("/profile")
def profile(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    request: Request = None,
):
    """Get the current user's EZ profile identifier.

    Authentication:
    - Use HTTP Bearer in the Authorization header. In Swagger, click "Authorize" and enter
      `Bearer <token>` obtained from `/login`.

    Returns:
    - user_id: The EZ user ID associated with the provided token

    Errors:
    - 401: Invalid or expired token
    """
    client = EzClient()
    try:
        token = get_ez_bearer_token(credentials, request)
        profile = client.get_user_profile(token)
        return ProfileResponse(**profile)
    except EzException as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


