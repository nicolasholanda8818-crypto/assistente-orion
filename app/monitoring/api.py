from fastapi import APIRouter, Response

from app.monitoring.metrics import metrics_registry

monitoring_router = APIRouter(prefix="/monitoring", tags=["monitoring"])


@monitoring_router.get("/metrics")
def metrics_snapshot() -> dict:
    return metrics_registry.snapshot()


@monitoring_router.get("/prometheus")
def prometheus_metrics() -> Response:
    return Response(metrics_registry.prometheus_text(), media_type="text/plain; version=0.0.4")
