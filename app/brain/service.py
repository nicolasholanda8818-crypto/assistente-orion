from uuid import uuid4

from app.brain.execution import ExecutionService
from app.brain.knowledge import KnowledgeService
from app.brain.learning import LearningService
from app.brain.memory import MemoryService
from app.brain.models import BrainMode, BrainRequest, BrainResponse, BrainStatus, ContextSummary
from app.brain.orion_reasoning import reason_about_message
from app.brain.planning import PlanningService
from app.tools.dependencies import get_tool_registry


class BrainService:
    def __init__(
        self,
        *,
        memory: MemoryService | None = None,
        planning: PlanningService | None = None,
        execution: ExecutionService | None = None,
        learning: LearningService | None = None,
        knowledge: KnowledgeService | None = None,
    ) -> None:
        self.memory = memory or MemoryService()
        self.planning = planning or PlanningService()
        self.execution = execution or ExecutionService(get_tool_registry())
        self.learning = learning or LearningService()
        self.knowledge = knowledge or KnowledgeService()

    def process(self, request: BrainRequest) -> BrainResponse:
        reasoning = reason_about_message(request.text)
        knowledge_hits = self.knowledge.search(request.text)
        context = self.memory.build_context(
            query=request.text,
            conversation_id=request.conversation_id,
            knowledge_hits=knowledge_hits,
        )
        plan = self.planning.create_plan(text=request.text, context=context)
        execution = self.execution.execute(plan=plan, context=context)
        message = execution.message
        if plan.intent not in {"system.status", "knowledge.answer", "identity.creator", "identity.user"}:
            message = reasoning.response

        self.memory.remember(conversation_id=request.conversation_id, role="user", content=request.text)
        self.memory.remember(conversation_id=request.conversation_id, role="assistant", content=message)
        self.learning.record(plan=plan, execution=execution)

        return BrainResponse(
            correlation_id=uuid4().hex,
            mode=BrainMode.DETERMINISTIC_FALLBACK,
            intent=plan.intent,
            message=message,
            plan=plan.steps,
            context=ContextSummary(
                recent_messages=len(context.recent_messages),
                relevant_memories=len(context.relevant_memories),
                knowledge_hits=len(context.knowledge_hits),
            ),
            emotion=reasoning.emotion,
            keywords=reasoning.keywords,
            avatar_mood=reasoning.avatar_mood,
            avatar_reaction=reasoning.avatar_reaction,
            suggested_animation=reasoning.suggested_animation,
        )

    def status(self) -> BrainStatus:
        return BrainStatus(
            status="ready",
            mode=BrainMode.DETERMINISTIC_FALLBACK,
            components={
                "memory": "volatile",
                "planning": "allowlist",
                "execution": "side-effect-free",
                "learning": "metadata-only",
                "knowledge": "local-static",
            },
            capabilities=[
                "conversation.reply",
                "knowledge.answer",
                "system.status",
            ],
            restrictions=[
                "localhost-only",
                "no-sensitive-data",
                "no-host-actions",
                "no-external-model",
                "no-persistent-memory",
            ],
        )
