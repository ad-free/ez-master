from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends, Response

from app.clients.ez import EzClient
from app.core.exceptions import EzException
from app.schemas.auth import LoginRequest, LoginResponse, ProfileResponse
from app.routers.common import get_user_profile


router = APIRouter(prefix="", tags=["auth"])


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
def profile(profile_data: dict = Depends(get_user_profile)):
    """Get the current user's EZ profile identifier.

    Authentication:
    - Use HTTP Bearer in the Authorization header. In Swagger, click "Authorize" and enter
      `Bearer <token>` obtained from `/login`.

    Returns:
    - user_id: The EZ user ID associated with the provided token

    Errors:
    - 401: Invalid or expired token
    """
    return ProfileResponse(**profile_data)


