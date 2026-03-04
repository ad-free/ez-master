from __future__ import annotations

import socket
import time
from dataclasses import dataclass

import anyio


@dataclass(frozen=True)
class TcpCheckResult:
    online: bool
    latency_ms: float | None
    error: str | None = None


async def check_tcp_port_async(host: str, port: int, timeout_s: float) -> TcpCheckResult:
    """Attempt a TCP connect to host:port within timeout_s using async."""
    def _sync_check() -> TcpCheckResult:
        start = time.perf_counter()
        sock: socket.socket | None = None
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout_s)
            result = sock.connect_ex((host, port))
            end = time.perf_counter()
            if result == 0:
                return TcpCheckResult(online=True, latency_ms=round((end - start) * 1000, 2))
            return TcpCheckResult(online=False, latency_ms=None)
        except Exception as exc:  # noqa: BLE001 - we surface error string in API
            return TcpCheckResult(online=False, latency_ms=None, error=str(exc))
        finally:
            try:
                if sock is not None:
                    sock.close()
            except Exception:
                pass
    
    return await anyio.to_thread.run_sync(_sync_check)


def check_tcp_port(host: str, port: int, timeout_s: float) -> TcpCheckResult:
    """Attempt a TCP connect to host:port within timeout_s."""
    start = time.perf_counter()
    sock: socket.socket | None = None
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout_s)
        result = sock.connect_ex((host, port))
        end = time.perf_counter()
        if result == 0:
            return TcpCheckResult(online=True, latency_ms=round((end - start) * 1000, 2))
        return TcpCheckResult(online=False, latency_ms=None)
    except Exception as exc:  # noqa: BLE001 - we surface error string in API
        return TcpCheckResult(online=False, latency_ms=None, error=str(exc))
    finally:
        try:
            if sock is not None:
                sock.close()
        except Exception:
            pass
