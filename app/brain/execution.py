from app.brain.models import BrainPlan, ContextSnapshot, ExecutionResult
from app.tools.builtins import BRAIN_PERMISSION, create_default_registry
from app.tools.models import ToolExecutionContext
from app.tools.registry import ToolRegistry, ToolSystemError


class UnsafePlanError(ValueError):
    """Raised when a plan requests an action outside the local safe baseline."""


class ExecutionService:
    def __init__(self, registry: ToolRegistry | None = None) -> None:
        self.registry = registry or create_default_registry()

    def execute(self, *, plan: BrainPlan, context: ContextSnapshot) -> ExecutionResult:
        execution_context = ToolExecutionContext(
            actor_id="brain",
            permissions=frozenset({BRAIN_PERMISSION}),
            resources={"context": context, "plan": plan},
        )
        message = ""

        try:
            for step in plan.steps:
                result = self.registry.invoke(step.action, context=execution_context)
                if step.action == "response.compose":
                    message = str(result.output["message"])
        except ToolSystemError as error:
            raise UnsafePlanError(str(error)) from error

        if not message:
            raise UnsafePlanError("Brain plan did not compose a response.")

        return ExecutionResult(message=message, succeeded=True)
