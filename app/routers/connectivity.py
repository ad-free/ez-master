from __future__ import annotations

from datetime import datetime, timezone

import anyio
from fastapi import APIRouter

from app.core.constants import (
    VPN_PORTAL_DEFAULT_PORT,
    VPN_PORTAL_DEFAULT_TIMEOUT_S,
    VPN_PORTAL_HOSTS,
)
from app.schemas.connectivity import ConnectionResult, ConnectionsRequest, ConnectionsResponse
from app.utils.connectivity import check_tcp_port_async


router = APIRouter(prefix="", tags=["connectivity"])

def _normalize_hosts(hosts: list[str]) -> list[str]:
    normalized: list[str] = []
    seen: set[str] = set()
    for raw in hosts:
        host = (raw or "").strip()
        if not host:
            continue
        key = host.lower()
        if key in seen:
            continue
        seen.add(key)
        normalized.append(host)
    return normalized


async def _run_checks(hosts: list[str], port: int, timeout_s: float) -> tuple[list[ConnectionResult], list[ConnectionResult]]:
    results_by_host: dict[str, ConnectionResult] = {}

    async def run_one(host: str) -> None:
        res = await check_tcp_port_async(host, port, timeout_s)
        results_by_host[host] = ConnectionResult(
            host=host,
            port=port,
            status="ONLINE" if res.online else "OFFLINE",
            latency_ms=res.latency_ms,
            error=res.error,
        )

    async with anyio.create_task_group() as tg:
        for host in hosts:
            tg.start_soon(run_one, host)

    ordered = [results_by_host[h] for h in hosts if h in results_by_host]
    best = sorted(
        [r for r in ordered if r.status == "ONLINE" and r.latency_ms is not None],
        key=lambda r: r.latency_ms or 10**9,
    )
    return ordered, best


@router.get("/connections", response_model=ConnectionsResponse)
async def get_connections() -> ConnectionsResponse:
    port = VPN_PORTAL_DEFAULT_PORT
    timeout_s = VPN_PORTAL_DEFAULT_TIMEOUT_S
    hosts = _normalize_hosts(list(VPN_PORTAL_HOSTS))
    ordered, best = await _run_checks(hosts, port, timeout_s)

    return ConnectionsResponse(
        checked_at=datetime.now(timezone.utc).isoformat(),
        port=port,
        timeout_s=timeout_s,
        results=ordered,
        best=best,
    )


@router.post("/connections", response_model=ConnectionsResponse)
async def post_connections(req: ConnectionsRequest) -> ConnectionsResponse:
    port = req.port or VPN_PORTAL_DEFAULT_PORT
    timeout_s = req.timeout_s or VPN_PORTAL_DEFAULT_TIMEOUT_S

    default_hosts = _normalize_hosts(list(VPN_PORTAL_HOSTS))
    provided_hosts = _normalize_hosts(list(req.hosts or []))

    if req.include_default:
        hosts = _normalize_hosts([*default_hosts, *provided_hosts])
    else:
        hosts = provided_hosts or default_hosts

    ordered, best = await _run_checks(hosts, port, timeout_s)

    return ConnectionsResponse(
        checked_at=datetime.now(timezone.utc).isoformat(),
        port=port,
        timeout_s=timeout_s,
        results=ordered,
        best=best,
    )
