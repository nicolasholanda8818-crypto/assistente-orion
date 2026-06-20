import os
import platform
import threading
import time
from collections import defaultdict
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


@dataclass
class RouteMetric:
    count: int = 0
    errors: int = 0
    total_ms: float = 0.0
    max_ms: float = 0.0


@dataclass
class MetricsRegistry:
    started_at: float = field(default_factory=time.time)
    process_started_at: float = field(default_factory=time.process_time)
    requests: dict[str, RouteMetric] = field(default_factory=lambda: defaultdict(RouteMetric))
    lock: threading.Lock = field(default_factory=threading.Lock)

    def record(self, *, method: str, path: str, status_code: int, duration_ms: float) -> None:
        route_key = f"{method} {path}"
        with self.lock:
            metric = self.requests[route_key]
            metric.count += 1
            metric.total_ms += duration_ms
            metric.max_ms = max(metric.max_ms, duration_ms)
            if status_code >= 500:
                metric.errors += 1

    def snapshot(self) -> dict[str, Any]:
        uptime_seconds = time.time() - self.started_at
        cpu_seconds = time.process_time() - self.process_started_at
        with self.lock:
            routes = {
                route: {
                    "count": metric.count,
                    "errors": metric.errors,
                    "avg_ms": round(metric.total_ms / metric.count, 3) if metric.count else 0,
                    "max_ms": round(metric.max_ms, 3),
                }
                for route, metric in sorted(self.requests.items())
            }
        return {
            "process": {
                "pid": os.getpid(),
                "platform": platform.system(),
                "python": platform.python_version(),
                "uptime_seconds": round(uptime_seconds, 3),
                "cpu_seconds": round(cpu_seconds, 3),
            },
            "requests": routes,
        }

    def prometheus_text(self) -> str:
        snapshot = self.snapshot()
        lines = [
            "# HELP orion_process_uptime_seconds Process uptime in seconds.",
            "# TYPE orion_process_uptime_seconds gauge",
            f"orion_process_uptime_seconds {snapshot['process']['uptime_seconds']}",
            "# HELP orion_process_cpu_seconds Process CPU time in seconds.",
            "# TYPE orion_process_cpu_seconds counter",
            f"orion_process_cpu_seconds {snapshot['process']['cpu_seconds']}",
            "# HELP orion_http_requests_total HTTP requests observed locally.",
            "# TYPE orion_http_requests_total counter",
        ]
        for route, metric in snapshot["requests"].items():
            method, path = route.split(" ", 1)
            labels = f'method="{method}",path="{path}"'
            lines.append(f"orion_http_requests_total{{{labels}}} {metric['count']}")
            lines.append(f"orion_http_request_errors_total{{{labels}}} {metric['errors']}")
            lines.append(f"orion_http_request_duration_max_ms{{{labels}}} {metric['max_ms']}")
        return "\n".join(lines) + "\n"


metrics_registry = MetricsRegistry()


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        started_at = time.perf_counter()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        finally:
            duration_ms = (time.perf_counter() - started_at) * 1000
            metrics_registry.record(
                method=request.method,
                path=request.url.path,
                status_code=status_code,
                duration_ms=duration_ms,
            )
