from uuid import uuid4

from app.brain.execution import ExecutionService
from app.brain.knowledge import KnowledgeService
from app.brain.learning import LearningService
from app.brain.memory import MemoryService
from app.brain.models import BrainMode, BrainRequest, BrainResponse, BrainStatus, ContextSummary, PlanStep
from app.brain.orion_reasoning import reason_about_message
from app.brain.planning import PlanningService
from app.brain.user_memory import UserMemoryService
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
        user_memory: UserMemoryService | None = None,
    ) -> None:
        self.memory = memory or MemoryService()
        self.planning = planning or PlanningService()
        self.execution = execution or ExecutionService(get_tool_registry())
        self.learning = learning or LearningService()
        self.knowledge = knowledge or KnowledgeService()
        self.user_memory = user_memory or UserMemoryService()

    def process(self, request: BrainRequest) -> BrainResponse:
        user_snapshot = None
        if request.user_id:
            user_snapshot = self.user_memory.load(request.user_id)
            if not user_snapshot.display_name:
                learned_snapshot = self.user_memory.learn_from_message(
                    user_id=request.user_id,
                    text=request.text,
                    expect_name=True,
                )
                if learned_snapshot.display_name:
                    message = self.user_memory.build_name_saved_message(learned_snapshot)
                    self.memory.remember(conversation_id=request.conversation_id, role="user", content=request.text)
                    self.memory.remember(conversation_id=request.conversation_id, role="assistant", content=message)
                    return self._response(
                        intent="user.name.set",
                        message=message,
                        plan=[],
                        context=ContextSummary(recent_messages=0, relevant_memories=0, knowledge_hits=0),
                        emotion="happy",
                        avatar_mood="happy",
                        avatar_reaction="wave",
                        suggested_animation="talk",
                        reasoning_state="answering",
                        response_length="short",
                        topic="profile",
                        user_name=learned_snapshot.display_name,
                    )

                message, _, starter = self.user_memory.build_welcome_message(user_snapshot)
                self.memory.remember(conversation_id=request.conversation_id, role="user", content=request.text)
                self.memory.remember(conversation_id=request.conversation_id, role="assistant", content=message)
                return self._response(
                    intent="user.name.request",
                    message=message,
                    plan=[],
                    context=ContextSummary(recent_messages=0, relevant_memories=0, knowledge_hits=0),
                    emotion="curious",
                    avatar_mood="curious",
                    avatar_reaction="direct-look",
                    suggested_animation="talk",
                    reasoning_state="clarifying",
                    response_length="short",
                    topic="profile",
                    user_name=None,
                    memory_prompt=True,
                    conversation_starter=starter,
                )

            user_snapshot = self.user_memory.learn_from_message(user_id=request.user_id, text=request.text)

        reasoning = reason_about_message(
            request.text,
            user_context={
                "profile_known": bool(user_snapshot and user_snapshot.display_name),
                "turn_seed": f"{request.conversation_id}:{self.memory.count()}",
            },
        )
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
        if user_snapshot and user_snapshot.display_name:
            message = self._personalize_message(
                message=message,
                request=request,
                intent=plan.intent,
                snapshot=user_snapshot,
            )

        self.memory.remember(conversation_id=request.conversation_id, role="user", content=request.text)
        self.memory.remember(conversation_id=request.conversation_id, role="assistant", content=message)
        self.learning.record(plan=plan, execution=execution)

        return self._response(
            intent=plan.intent,
            message=message,
            plan=plan.steps,
            context=ContextSummary(
                recent_messages=len(context.recent_messages),
                relevant_memories=len(context.relevant_memories),
                knowledge_hits=len(context.knowledge_hits),
            ),
            emotion=reasoning.emotion,
            avatar_mood=reasoning.avatar_mood,
            avatar_reaction=reasoning.avatar_reaction,
            suggested_animation=reasoning.suggested_animation,
            reasoning_state=reasoning.reasoning_state,
            response_length=reasoning.response_length,
            urgency=reasoning.urgency,
            topic=reasoning.topic,
            should_speak=reasoning.should_speak,
            keywords=reasoning.keywords,
            user_name=user_snapshot.display_name if user_snapshot else None,
            conversation_starter=self.user_memory.build_context_hint(snapshot=user_snapshot, user_text=request.text)
            if user_snapshot
            else None,
        )

    def welcome(self, user_id: str) -> BrainResponse:
        snapshot = self.user_memory.load(user_id)
        message, prompt, starter = self.user_memory.build_welcome_message(snapshot)
        return self._response(
            intent="user.welcome" if snapshot.display_name else "user.name.request",
            message=message,
            plan=[],
            context=ContextSummary(recent_messages=0, relevant_memories=0, knowledge_hits=0),
            emotion="happy" if snapshot.display_name else "curious",
            avatar_mood="happy" if snapshot.display_name else "curious",
            avatar_reaction="wave" if snapshot.display_name else "direct-look",
            suggested_animation="talk",
            reasoning_state="answering" if snapshot.display_name else "clarifying",
            response_length="short",
            topic="profile",
            user_name=snapshot.display_name,
            memory_prompt=prompt,
            conversation_starter=starter,
        )

    def _personalize_message(self, *, message: str, request: BrainRequest, intent: str, snapshot) -> str:
        name = snapshot.display_name
        if intent == "identity.user":
            return f"Voce e {name}. Eu lembro pelo seu perfil local neste Orion."
        if intent == "greeting":
            starter = self.user_memory.build_context_hint(snapshot=snapshot, user_text=request.text)
            suffix = f" {starter}" if starter else " O que vamos criar agora?"
            return f"Ola, {name}. E um prazer ve-lo novamente.{suffix}"
        if intent == "memory.recall":
            hint = self.user_memory.build_context_hint(snapshot=snapshot, user_text=request.text)
            if hint:
                return f"Sim, {name}. {hint}"
            return f"Sim, {name}. Eu lembro do seu perfil local neste Orion."
        if intent in {"conversation.reply", "question.general", "technical", "study"}:
            hint = self.user_memory.build_context_hint(snapshot=snapshot, user_text=request.text)
            if hint:
                return f"{message} {hint}"
        return message

    def _response(
        self,
        *,
        intent: str,
        message: str,
        plan: list[PlanStep],
        context: ContextSummary,
        emotion: str = "neutral",
        avatar_mood: str = "neutral",
        avatar_reaction: str = "direct-look",
        suggested_animation: str = "talk",
        reasoning_state: str = "answering",
        response_length: str = "short",
        urgency: str = "normal",
        topic: str | None = None,
        should_speak: bool = True,
        keywords: list[str] | None = None,
        user_name: str | None = None,
        memory_prompt: bool = False,
        conversation_starter: str | None = None,
    ) -> BrainResponse:
        return BrainResponse(
            correlation_id=uuid4().hex,
            mode=BrainMode.DETERMINISTIC_FALLBACK,
            intent=intent,
            message=message,
            plan=plan,
            context=context,
            emotion=emotion,
            keywords=keywords or [],
            avatar_mood=avatar_mood,
            avatar_reaction=avatar_reaction,
            suggested_animation=suggested_animation,
            reasoning_state=reasoning_state,
            response_length=response_length,
            urgency=urgency,
            topic=topic,
            should_speak=should_speak,
            user_name=user_name,
            memory_prompt=memory_prompt,
            conversation_starter=conversation_starter,
        )

    def status(self) -> BrainStatus:
        return BrainStatus(
            status="ready",
            mode=BrainMode.DETERMINISTIC_FALLBACK,
            components={
                "memory": "volatile+user-sqlite",
                "planning": "allowlist",
                "execution": "side-effect-free",
                "learning": "metadata-only",
                "knowledge": "local-static",
            },
            capabilities=[
                "conversation.reply",
                "knowledge.answer",
                "system.status",
                "user.name.memory",
            ],
            restrictions=[
                "localhost-only",
                "no-sensitive-data",
                "no-host-actions",
                "no-external-model",
                "no-sensitive-memory",
            ],
        )
