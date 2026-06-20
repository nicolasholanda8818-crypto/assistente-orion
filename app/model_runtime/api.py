from fastapi import APIRouter

from app.model_runtime.dependencies import get_model_registry
from app.model_runtime.models import ModelCatalog

models_router = APIRouter(prefix="/models", tags=["models"])


@models_router.get("", response_model=ModelCatalog)
def list_models() -> ModelCatalog:
    return get_model_registry().catalog()


@models_router.get("/status", response_model=ModelCatalog)
def model_runtime_status() -> ModelCatalog:
    return get_model_registry().catalog()
