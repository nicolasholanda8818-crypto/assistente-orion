from typing import Annotated

from fastapi import APIRouter, Depends

from app.tools.dependencies import get_tool_registry
from app.tools.models import ToolCatalog
from app.tools.registry import ToolRegistry

tools_router = APIRouter(prefix="/tools", tags=["tools"])
ToolRegistryDependency = Annotated[ToolRegistry, Depends(get_tool_registry)]


@tools_router.get("", response_model=ToolCatalog)
def list_tools(registry: ToolRegistryDependency) -> ToolCatalog:
    return registry.catalog()


@tools_router.get("/status", response_model=ToolCatalog)
def tools_status(registry: ToolRegistryDependency) -> ToolCatalog:
    return registry.catalog()
