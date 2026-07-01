from dataclasses import dataclass

from app.brain.orion_intents import normalize_text
from app.brain.orion_memory import OrionMemoryContext
from app.brain.user_memory import UserMemorySnapshot

TECHNICAL_TERMS = {
    "api",
    "backend",
    "bug",
    "codigo",
    "deploy",
    "docker",
    "erro",
    "fastapi",
    "frontend",
    "github",
    "javascript",
    "python",
    "render",
    "sqlite",
    "teste",
    "websocket",
}

BEGINNER_TERMS = {
    "comecando",
    "iniciante",
    "nao",
    "perdido",
    "perdida",
    "simples",
}

FOCUSED_TERMS = {
    "curto",
    "curta",
    "direto",
    "direta",
    "rapido",
    "rapida",
    "resumo",
}

CASUAL_TERMS = {
    "conversar",
    "papo",
    "dia",
    "voltei",
    "cansado",
    "cansada",
}

GENERIC_FOCUS_TERMS = {
    "ajuda",
    "ajudar",
    "agora",
    "fazer",
    "isso",
    "melhorar",
    "preciso",
    "quero",
}


@dataclass(frozen=True)
class OrionConversationContext:
    style: str
    depth: str
    focus: str | None
    tone: str
    has_user_profile: bool


def build_orion_context(
    *,
    user_text: str,
    snapshot: UserMemorySnapshot | None,
    memory_context: OrionMemoryContext,
    intent: str,
    keywords: list[str],
) -> OrionConversationContext:
    normalized = normalize_text(user_text)
    tokens = set(normalized.split())
    preferences = [normalize_text(value) for value in (snapshot.preferences if snapshot else [])]
    topics = [normalize_text(value) for value in (snapshot.topics if snapshot else [])]

    style = "casual"
    depth = "balanced"
    tone = "friendly"

    if tokens & TECHNICAL_TERMS or any(any(term in topic for term in TECHNICAL_TERMS) for topic in topics):
        style = "technical"
        depth = "technical"
        tone = "precise"
    if tokens & BEGINNER_TERMS or "nao sei" in normalized or intent in {"teacher", "study"}:
        style = "beginner" if style != "technical" else style
        depth = "simple" if style != "technical" else "technical"
        tone = "patient"
    if tokens & FOCUSED_TERMS or any(any(term in pref for term in FOCUSED_TERMS) for pref in preferences):
        style = "focused"
        depth = "short"
        tone = "direct"
    if style == "casual" and tokens & CASUAL_TERMS:
        tone = "warm"

    return OrionConversationContext(
        style=style,
        depth=depth,
        focus=select_focus(snapshot=snapshot, memory_context=memory_context, keywords=keywords),
        tone=tone,
        has_user_profile=bool(snapshot and snapshot.display_name),
    )


def select_focus(
    *,
    snapshot: UserMemorySnapshot | None,
    memory_context: OrionMemoryContext,
    keywords: list[str],
) -> str | None:
    if memory_context.continuity_hint:
        return "continuidade da conversa"
    if snapshot:
        for value in (
            snapshot.primary_project,
            snapshot.primary_goal,
            snapshot.primary_document,
            snapshot.strongest_context,
        ):
            if value:
                return value
    for keyword in keywords:
        if keyword not in GENERIC_FOCUS_TERMS:
            return keyword
    return None


def context_instruction(context: OrionConversationContext) -> str | None:
    if context.style == "technical":
        return "Vou manter uma linha tecnica e objetiva."
    if context.style == "beginner":
        return "Vou explicar em passos simples."
    if context.style == "focused":
        return "Vou ser direto e manter o essencial."
    return None
