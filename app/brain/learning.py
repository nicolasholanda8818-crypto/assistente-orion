from collections import deque

from app.brain.models import BrainPlan, ExecutionResult, LearningEvent


class LearningService:
    def __init__(self, event_limit: int = 100) -> None:
        if event_limit < 1:
            raise ValueError("Learning event limit must be positive.")
        self._events: deque[LearningEvent] = deque(maxlen=event_limit)

    def record(self, *, plan: BrainPlan, execution: ExecutionResult) -> LearningEvent:
        event = LearningEvent(
            intent=plan.intent,
            succeeded=execution.succeeded,
            step_count=len(plan.steps),
        )
        self._events.append(event)
        return event

    def count(self) -> int:
        return len(self._events)

    def list_events(self) -> list[LearningEvent]:
        return list(self._events)
