from functools import lru_cache

from app.brain.service import BrainService


@lru_cache
def get_brain_service() -> BrainService:
    return BrainService()
