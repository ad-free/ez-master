from __future__ import annotations

from pydantic import BaseModel, Field


class ConnectionsRequest(BaseModel):
    hosts: list[str] | None = Field(
        None,
        description=(
            "Hosts to check. If omitted/empty, backend will use default host list."
        ),
    )
    include_default: bool = Field(
        True,
        description="If true, default hosts are included before any provided hosts.",
    )
    port: int | None = Field(
        None, description="Optional override of TCP port to check (default 443)."
    )
    timeout_s: float | None = Field(
        None, description="Optional override of per-host timeout seconds (default 2.0)."
    )


class ConnectionResult(BaseModel):
    host: str = Field(..., description="Host that was checked")
    port: int = Field(..., description="TCP port checked")
    status: str = Field(..., description="ONLINE or OFFLINE")
    latency_ms: float | None = Field(None, description="Latency in milliseconds if ONLINE")
    error: str | None = Field(None, description="Optional error message if the check failed")


class ConnectionsResponse(BaseModel):
    checked_at: str = Field(..., description="ISO-8601 timestamp when checks ran")
    port: int = Field(..., description="Port used for all checks")
    timeout_s: float = Field(..., description="Timeout seconds used per check")
    results: list[ConnectionResult] = Field(..., description="Results in configured host order")
    best: list[ConnectionResult] = Field(
        ..., description="ONLINE results sorted by lowest latency"
    )
