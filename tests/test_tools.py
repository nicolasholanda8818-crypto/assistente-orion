import pytest
from pydantic import BaseModel, ConfigDict

from app.brain.execution import ExecutionService
from app.brain.models import BrainPlan, ContextSnapshot, PlanStep
from app.tools.builtins import BRAIN_PERMISSION, create_default_registry
from app.tools.models import ToolAvailability, ToolDefinition, ToolExecutionContext, ToolRisk
from app.tools.registry import (
    DuplicateToolError,
    ToolArgumentsError,
    ToolConfirmationRequiredError,
    ToolPermissionError,
    ToolRegistry,
    ToolUnavailableError,
    UnknownToolError,
)


class ExampleArguments(BaseModel):
    model_config = ConfigDict(extra="forbid")
    value: str


def test_default_registry_catalogs_enabled_and_planned_tools():
    catalog = create_default_registry().catalog()

    assert catalog.status == "ready"
    assert catalog.enabled == 3
    assert catalog.planned == 4
    assert [tool.name for tool in catalog.tools] == [
        "context.read",
        "control.open_program",
        "files.read",
        "finance.get_balance",
        "knowledge.search",
        "models.generate",
        "response.compose",
    ]


def test_planned_tools_are_registered_but_blocked():
    registry = create_default_registry()
    context = ToolExecutionContext(
        actor_id="test",
        permissions=frozenset({"control.program.open"}),
        confirmed_tools=frozenset({"control.open_program"}),
    )

    with pytest.raises(ToolUnavailableError, match="control.open_program"):
        registry.invoke("control.open_program", context=context)


def test_unknown_tool_is_rejected_and_audited():
    registry = create_default_registry()

    with pytest.raises(UnknownToolError, match="not registered"):
        registry.invoke("host.shutdown", context=ToolExecutionContext(actor_id="test"))

    records = registry.list_audit_records()
    assert records[0].tool_name == "host.shutdown"
    assert records[0].outcome == "unknown"
    assert not hasattr(records[0], "arguments")


def test_tool_requires_registered_permission():
    registry = create_default_registry()

    with pytest.raises(ToolPermissionError, match=BRAIN_PERMISSION):
        registry.invoke("context.read", context=ToolExecutionContext(actor_id="test"))


def test_tool_arguments_are_validated_before_handler():
    registry = create_default_registry()

    with pytest.raises(ToolArgumentsError, match="context.read"):
        registry.invoke(
            "context.read",
            context=ToolExecutionContext(actor_id="test", permissions=frozenset({BRAIN_PERMISSION})),
            arguments={"unexpected": True},
        )


def test_enabled_tool_can_require_confirmation():
    registry = ToolRegistry()
    registry.register(
        ToolDefinition(
            name="example.confirmed",
            description="Ferramenta controlada para teste.",
            availability=ToolAvailability.ENABLED,
            risk=ToolRisk.PRIVILEGED,
            required_permissions=["example.run"],
            requires_confirmation=True,
        ),
        arguments_model=ExampleArguments,
        handler=lambda _context, arguments: {"echo": arguments.value},
    )
    context = ToolExecutionContext(actor_id="test", permissions=frozenset({"example.run"}))

    with pytest.raises(ToolConfirmationRequiredError, match="example.confirmed"):
        registry.invoke("example.confirmed", context=context, arguments={"value": "ok"})

    confirmed = ToolExecutionContext(
        actor_id="test",
        permissions=frozenset({"example.run"}),
        confirmed_tools=frozenset({"example.confirmed"}),
    )
    result = registry.invoke("example.confirmed", context=confirmed, arguments={"value": "ok"})
    assert result.output == {"echo": "ok"}


def test_registry_rejects_duplicate_names():
    registry = create_default_registry()
    definition = ToolDefinition(
        name="context.read",
        description="Nome duplicado para teste.",
        availability=ToolAvailability.PLANNED,
        risk=ToolRisk.INTERNAL,
    )

    with pytest.raises(DuplicateToolError, match="context.read"):
        registry.register(definition)


def test_brain_executes_plan_only_through_registered_tools():
    registry = create_default_registry()
    plan = BrainPlan(
        intent="conversation.reply",
        steps=[
            PlanStep(action="context.read", reason="Teste."),
            PlanStep(action="knowledge.search", reason="Teste."),
            PlanStep(action="response.compose", reason="Teste."),
        ],
    )

    result = ExecutionService(registry).execute(
        plan=plan,
        context=ContextSnapshot(recent_messages=[], relevant_memories=[], knowledge_hits=[]),
    )

    assert result.succeeded is True
    assert [record.tool_name for record in registry.list_audit_records()] == [
        "context.read",
        "knowledge.search",
        "response.compose",
    ]
