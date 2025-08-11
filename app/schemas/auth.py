from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., description="Your username")
    password: str = Field(..., description="Your password")


class ProfileResponse(BaseModel):
    ID: str
    Email: str
    LastName: str
    FirstName: str
    ChucVu: str
    ChucDanh: str
    PhongBan: str


class LoginResponse(BaseModel):
    token: str


class SalaryDownloadRequest(LoginRequest):
    date: Optional[str] = Field(None, description="Salary month YYYY-MM")


