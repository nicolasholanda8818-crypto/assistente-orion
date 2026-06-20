from fastapi import APIRouter

from app.brain.api import brain_router
from app.brain.dependencies import get_brain_service
from app.core.config import settings
from app.db import repositories
from app.hosting.api import hosting_router
from app.hosting.service import HostingService
from app.model_runtime.api import models_router
from app.model_runtime.dependencies import get_model_registry
from app.monitoring.api import monitoring_router
from app.monitoring.metrics import metrics_registry
from app.onboarding.api import onboarding_router
from app.onboarding.dependencies import get_onboarding_service
from app.tools.api import tools_router
from app.tools.dependencies import get_tool_registry

api_router = APIRouter()
api_router.include_router(brain_router)
api_router.include_router(tools_router)
api_router.include_router(models_router)
api_router.include_router(onboarding_router)
api_router.include_router(hosting_router)
api_router.include_router(monitoring_router)


@api_router.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.app_env,
    }


@api_router.get("/status", tags=["system"])
def application_status() -> dict:
    return {
        "backend": "online",
        "database": repositories.get_database_status(),
        "pwa": {
            "cache_name": settings.pwa_cache_name,
            "static_dir": settings.static_dir,
        },
        "brain": get_brain_service().status().model_dump(),
        "tools": get_tool_registry().catalog().model_dump(),
        "models": get_model_registry().catalog().model_dump(),
        "onboarding": get_onboarding_service().status().model_dump(),
        "hosting": HostingService().status().model_dump(),
        "monitoring": metrics_registry.snapshot(),
    }
