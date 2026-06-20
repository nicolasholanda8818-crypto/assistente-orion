from functools import lru_cache

from app.core.config import settings
from app.model_runtime.builtins import create_model_registry
from app.model_runtime.registry import ModelRegistry


@lru_cache
def get_model_registry() -> ModelRegistry:
    return create_model_registry(settings)
