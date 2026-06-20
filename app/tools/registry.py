from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from pydantic import BaseModel, ValidationError

from app.tools.models import (
    EmptyToolArguments,
    ToolAuditRecord,
    ToolAvailability,
    ToolCatalog,
    ToolDefinition,
    ToolExecutionContext,
    ToolResult,
)

ToolHandler = Callable[[ToolExecutionContext, BaseModel], dict[str, Any]]


class ToolSystemError(ValueError):
    """Base error for controlled tool failures."""


class DuplicateToolError(ToolSystemError):
    """Raised when a tool name is registered more than once."""


class UnknownToolError(ToolSystemError):
    """Raised when a tool name does not exist in the registry."""


class ToolUnavailableError(ToolSystemError):
    """Raised when a planned tool is requested before its implementation."""


class ToolPermissionError(ToolSystemError):
    """Raised when an actor lacks a required permission."""


class ToolConfirmationRequiredError(ToolSystemError):
    """Raised when an action requires explicit confirmation."""


class ToolArgumentsError(ToolSystemError):
    """Raised when tool arguments do not match the registered schema."""


@dataclass(frozen=True)
class RegisteredTool:
    definition: ToolDefinition
    arguments_model: type[BaseModel]
    handler: ToolHandler | None


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, RegisteredTool] = {}
        self._audit_records: list[ToolAuditRecord] = []

    def register(
        self,
        definition: ToolDefinition,
        *,
        handler: ToolHandler | None = None,
        arguments_model: type[BaseModel] = EmptyToolArguments,
    ) -> None:
        if definition.name in self._tools:
            raise DuplicateToolError(f"Tool already registered: {definition.name}")
        if definition.availability == ToolAvailability.ENABLED and handler is None:
            raise ToolUnavailableError(f"Enabled tool requires handler: {definition.name}")
        self._tools[definition.name] = RegisteredTool(
            definition=definition,
            arguments_model=arguments_model,
            handler=handler,
        )

    def invoke(
        self,
        tool_name: str,
        *,
        context: ToolExecutionContext,
        arguments: dict[str, Any] | None = None,
    ) -> ToolResult:
        tool = self._tools.get(tool_name)
        if tool is None:
            self._record(tool_name=tool_name, actor_id=context.actor_id, outcome="unknown")
            raise UnknownToolError(f"Tool is not registered: {tool_name}")

        if tool.definition.availability != ToolAvailability.ENABLED or tool.handler is None:
            self._record(tool_name=tool_name, actor_id=context.actor_id, outcome="unavailable")
            raise ToolUnavailableError(f"Tool is not enabled: {tool_name}")

        missing_permissions = sorted(set(tool.definition.required_permissions) - context.permissions)
        if missing_permissions:
            self._record(tool_name=tool_name, actor_id=context.actor_id, outcome="denied")
            raise ToolPermissionError(f"Missing permissions for {tool_name}: {', '.join(missing_permissions)}")

        if tool.definition.requires_confirmation and tool_name not in context.confirmed_tools:
            self._record(tool_name=tool_name, actor_id=context.actor_id, outcome="confirmation-required")
            raise ToolConfirmationRequiredError(f"Confirmation required for tool: {tool_name}")

        try:
            parsed_arguments = tool.arguments_model.model_validate(arguments or {})
        except ValidationError as error:
            self._record(tool_name=tool_name, actor_id=context.actor_id, outcome="invalid-arguments")
            raise ToolArgumentsError(f"Invalid arguments for tool: {tool_name}") from error

        output = tool.handler(context, parsed_arguments)
        self._record(tool_name=tool_name, actor_id=context.actor_id, outcome="completed")
        return ToolResult(tool_name=tool_name, status="completed", output=output)

    def catalog(self) -> ToolCatalog:
        tools = sorted((tool.definition for tool in self._tools.values()), key=lambda item: item.name)
        enabled = sum(tool.availability == ToolAvailability.ENABLED for tool in tools)
        return ToolCatalog(
            status="ready",
            enabled=enabled,
            planned=len(tools) - enabled,
            tools=tools,
        )

    def list_audit_records(self) -> list[ToolAuditRecord]:
        return list(self._audit_records)

    def _record(self, *, tool_name: str, actor_id: str, outcome: str) -> None:
        self._audit_records.append(
            ToolAuditRecord(
                tool_name=tool_name,
                actor_id=actor_id,
                outcome=outcome,
            )
        )
