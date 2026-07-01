from dataclasses import dataclass

from app.brain.models import ContextSnapshot
from app.brain.orion_context import OrionConversationContext
from app.brain.orion_memory import OrionMemoryContext

COGNITIVE_STAGE_NAMES = (
    "understand_intent",
    "identify_context",
    "consult_memory",
    "evaluate_session_history",
    "check_local_knowledge",
    "decide_web_validation",
    "compare_sources",
    "compose_answer",
    "adapt_to_user_profile",
    "learn_when_safe",
)


@dataclass(frozen=True)
class CognitiveStage:
    name: str
    status: str
    note: str


@dataclass(frozen=True)
class OrionCognitivePipeline:
    stages: tuple[CognitiveStage, ...]
    sufficient_local_knowledge: bool
    should_validate_web: bool
    response_style: str
    learning_signal: str

    @property
    def stage_count(self) -> int:
        return len(self.stages)


def build_cognitive_pipeline(
    *,
    intent: str,
    emotion: str,
    keywords: list[str],
    memory_context: OrionMemoryContext,
    conversation_context: OrionConversationContext,
    context: ContextSnapshot,
    should_search_web: bool,
) -> OrionCognitivePipeline:
    local_knowledge = bool(context.knowledge_hits)
    persistent_memory = memory_context.has_persistent_context or bool(memory_context.profile_summary)
    session_history = bool(context.recent_messages)
    response_style = choose_response_style(
        intent=intent,
        emotion=emotion,
        conversation_context=conversation_context,
    )
    learning_signal = choose_learning_signal(intent=intent, persistent_memory=persistent_memory)

    stages = (
        CognitiveStage("understand_intent", "done", f"Intent: {intent}; emotion: {emotion}."),
        CognitiveStage(
            "identify_context",
            "done",
            f"Style: {conversation_context.style}; depth: {conversation_context.depth}.",
        ),
        CognitiveStage(
            "consult_memory",
            "done",
            "Persistent context available." if persistent_memory else "No persistent context needed.",
        ),
        CognitiveStage(
            "evaluate_session_history",
            "done",
            "Session history available." if session_history else "First turn or no session context.",
        ),
        CognitiveStage(
            "check_local_knowledge",
            "done",
            "Local knowledge matched." if local_knowledge else "No local knowledge hit.",
        ),
        CognitiveStage(
            "decide_web_validation",
            "recommended" if should_search_web else "skipped",
            "External validation recommended." if should_search_web else "Local answer is enough.",
        ),
        CognitiveStage(
            "compare_sources",
            "pending-confirmation" if should_search_web else "skipped",
            (
                "Source comparison requires confirmed web search."
                if should_search_web
                else "No external sources required."
            ),
        ),
        CognitiveStage("compose_answer", "done", f"Response style: {response_style}."),
        CognitiveStage("adapt_to_user_profile", "done", f"Tone: {conversation_context.tone}."),
        CognitiveStage("learn_when_safe", "done", learning_signal),
    )

    return OrionCognitivePipeline(
        stages=stages,
        sufficient_local_knowledge=local_knowledge or not should_search_web,
        should_validate_web=should_search_web,
        response_style=response_style,
        learning_signal=learning_signal,
    )


def choose_response_style(
    *,
    intent: str,
    emotion: str,
    conversation_context: OrionConversationContext,
) -> str:
    if intent == "career.mentor":
        return "mentor-roadmap"
    if intent in {"teacher", "study", "technical"}:
        if conversation_context.depth == "technical":
            return "technical-teaching"
        return "guided-teaching"
    if intent in {"sales", "sales.script", "sales.message", "negotiation", "objection.price", "consultant.senior"}:
        return "consultative"
    if emotion in {"tired", "sad", "worried", "confused"}:
        return "supportive"
    return "contextual"


def choose_learning_signal(*, intent: str, persistent_memory: bool) -> str:
    if intent in {"goal.setting", "preference.update", "career.mentor"}:
        return "Safe profile or preference learning is allowed."
    if persistent_memory:
        return "Use existing safe memory without storing sensitive data."
    return "Record only non-sensitive metadata."
