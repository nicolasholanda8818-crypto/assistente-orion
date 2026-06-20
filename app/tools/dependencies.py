from functools import lru_cache

from app.tools.builtins import create_default_registry
from app.tools.registry import ToolRegistry


@lru_cache
def get_tool_registry() -> ToolRegistry:
    return create_default_registry()
