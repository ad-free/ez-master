from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.clients.ez import EzClient
from app.core.exceptions import EzException
from app.schemas.auth import LoginRequest, LoginResponse


router = APIRouter(prefix="", tags=["auth"])
security = HTTPBearer(auto_error=True)


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
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
        return LoginResponse(token=token)
    except EzException as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.get("/profile")
def profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
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
        token = credentials.credentials
        user_id = client.get_user_id(token)
        return {"user_id": user_id}
    except EzException as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


