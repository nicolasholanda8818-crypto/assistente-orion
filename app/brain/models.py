from datetime import UTC, datetime
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


def utc_now() -> datetime:
    return datetime.now(UTC)


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class BrainMode(StrEnum):
    DETERMINISTIC_FALLBACK = "deterministic-fallback"


ReasoningState = Literal["listening", "understanding", "thinking", "clarifying", "answering", "waiting"]


class BrainRequest(StrictModel):
    text: str = Field(min_length=1, max_length=2000)
    conversation_id: str = Field(default="local", min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_.-]+$")
    user_id: str | None = Field(default=None, min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_.-]+$")


class MemoryEntry(StrictModel):
    conversation_id: str
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime = Field(default_factory=utc_now)


class KnowledgeEntry(StrictModel):
    entry_id: str
    topic: str
    content: str


class ContextSnapshot(StrictModel):
    recent_messages: list[MemoryEntry]
    relevant_memories: list[MemoryEntry]
    knowledge_hits: list[KnowledgeEntry]


class ContextSummary(StrictModel):
    recent_messages: int
    relevant_memories: int
    knowledge_hits: int


class PlanStep(StrictModel):
    action: str
    reason: str


class BrainPlan(StrictModel):
    intent: str
    steps: list[PlanStep]


class ExecutionResult(StrictModel):
    message: str
    succeeded: bool


class LearningEvent(StrictModel):
    intent: str
    succeeded: bool
    step_count: int
    created_at: datetime = Field(default_factory=utc_now)


class BrainResponse(StrictModel):
    correlation_id: str
    mode: BrainMode
    intent: str
    message: str
    plan: list[PlanStep]
    context: ContextSummary
    emotion: str = "neutral"
    keywords: list[str] = Field(default_factory=list)
    avatar_mood: str = "neutral"
    avatar_reaction: str = "direct-look"
    suggested_animation: str = "talk"
    reasoning_state: ReasoningState = "answering"
    response_length: Literal["short", "medium", "long"] = "short"
    urgency: Literal["low", "normal", "high"] = "normal"
    topic: str | None = None
    should_speak: bool = True
    user_name: str | None = None
    memory_prompt: bool = False
    conversation_starter: str | None = None
    dialogue_strategy: str | None = None
    should_search_web: bool = False
    search_query: str | None = None
    response_mode: str | None = None


class BrainStatus(StrictModel):
    status: Literal["ready"]
    mode: BrainMode
    components: dict[str, str]
    capabilities: list[str]
    restrictions: list[str]
