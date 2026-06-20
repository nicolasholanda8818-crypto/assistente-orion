from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


def utc_now() -> datetime:
    return datetime.now(UTC)


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ToolAvailability(StrEnum):
    ENABLED = "enabled"
    PLANNED = "planned"


class ToolRisk(StrEnum):
    READ_ONLY = "read-only"
    INTERNAL = "internal"
    PRIVILEGED = "privileged"


class ToolDefinition(StrictModel):
    name: str = Field(pattern=r"^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$")
    description: str = Field(min_length=1, max_length=240)
    availability: ToolAvailability
    risk: ToolRisk
    required_permissions: list[str] = Field(default_factory=list)
    requires_confirmation: bool = False
    ticket: str | None = Field(default=None, pattern=r"^T[0-9]{4}$")


class ToolResult(StrictModel):
    tool_name: str
    status: str
    output: dict[str, Any] = Field(default_factory=dict)


class ToolAuditRecord(StrictModel):
    tool_name: str
    actor_id: str
    outcome: str
    created_at: datetime = Field(default_factory=utc_now)


class ToolCatalog(StrictModel):
    status: str
    enabled: int
    planned: int
    tools: list[ToolDefinition]


class EmptyToolArguments(StrictModel):
    pass


@dataclass(frozen=True)
class ToolExecutionContext:
    actor_id: str
    permissions: frozenset[str] = frozenset()
    confirmed_tools: frozenset[str] = frozenset()
    resources: dict[str, Any] = field(default_factory=dict)
