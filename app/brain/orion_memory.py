from dataclasses import dataclass
from hashlib import sha256

from app.brain.orion_intents import normalize_text
from app.brain.user_memory import UserMemorySnapshot


@dataclass(frozen=True)
class OrionMemoryContext:
    profile_summary: str | None
    continuity_hint: str | None
    smart_question: str | None
    initiative_prompt: str | None
    has_persistent_context: bool


RETURNING_TERMS = {"voltei", "retornei", "cheguei"}


def build_orion_memory_context(
    *,
    snapshot: UserMemorySnapshot | None,
    user_text: str,
    intent: str,
) -> OrionMemoryContext:
    if snapshot is None or not snapshot.display_name:
        return OrionMemoryContext(
            profile_summary=None,
            continuity_hint=None,
            smart_question=None,
            initiative_prompt=None,
            has_persistent_context=False,
        )

    continuity_hint = select_continuity_hint(snapshot=snapshot, user_text=user_text, intent=intent)
    smart_question = select_smart_question(snapshot=snapshot, user_text=user_text, intent=intent)
    initiative_prompt = select_initiative_prompt(snapshot=snapshot, user_text=user_text, intent=intent)

    return OrionMemoryContext(
        profile_summary=build_profile_summary(snapshot),
        continuity_hint=continuity_hint,
        smart_question=smart_question,
        initiative_prompt=initiative_prompt,
        has_persistent_context=bool(
            snapshot.preferences
            or snapshot.topics
            or snapshot.projects
            or snapshot.goals
            or snapshot.recent_feelings
            or snapshot.documents
            or snapshot.summaries
        ),
    )


def select_continuity_hint(*, snapshot: UserMemorySnapshot, user_text: str, intent: str) -> str | None:
    normalized = normalize_text(user_text)
    is_returning = intent == "returning" or bool(set(normalized.split()) & RETURNING_TERMS)

    if snapshot.recent_feeling and (is_returning or intent in {"greeting", "memory.recall"}):
        feeling = snapshot.recent_feeling
        if feeling in {"cansado", "cansada", "exausto", "exausta"}:
            return "Mais cedo voce comentou que estava cansado. Conseguiu descansar?"
        if feeling in {"preocupado", "preocupada", "ansioso", "ansiosa"}:
            return "Mais cedo voce parecia preocupado. Quer me contar se isso melhorou?"
        return f"Mais cedo voce comentou que estava {feeling}. Como voce esta agora?"

    if snapshot.primary_project and intent in {"greeting", "returning", "memory.recall", "conversation.reply"}:
        return pick_line(
            (
                "Voce estava trabalhando em {value}. Quer retomar o proximo passo?",
                "Lembro do projeto {value}. Como ele esta evoluindo?",
                "Podemos continuar pelo projeto {value}, se fizer sentido agora.",
            ),
            f"{snapshot.user_id}|project|{user_text}",
        ).format(value=snapshot.primary_project)

    if snapshot.primary_goal and intent in {"greeting", "returning", "memory.recall", "goal.setting"}:
        return pick_line(
            (
                "Voce tinha como objetivo {value}. Quer transformar isso em uma etapa pequena?",
                "Lembro da meta {value}. Posso ajudar a organizar o proximo movimento.",
                "Essa conversa pode aproximar voce de {value}. Quer seguir por ai?",
            ),
            f"{snapshot.user_id}|goal|{user_text}",
        ).format(value=snapshot.primary_goal)

    if snapshot.primary_document and intent in {"memory.recall", "file", "technical", "study"}:
        return f"Tambem lembro do arquivo {snapshot.primary_document}, se ele ajudar no contexto."

    if snapshot.preferences and intent in {"question.general", "conversation.reply", "teacher", "study"}:
        return f"Vou levar em conta sua preferencia por {snapshot.preferences[0]}."

    return None


def select_smart_question(*, snapshot: UserMemorySnapshot, user_text: str, intent: str) -> str | None:
    normalized = normalize_text(user_text)
    vague = intent == "request.incomplete" or len(normalized.split()) <= 2
    if not vague:
        return None

    if snapshot.primary_project:
        return f"Isso tem relacao com {snapshot.primary_project}?"
    if snapshot.primary_goal:
        return f"Isso ajuda no objetivo {snapshot.primary_goal}?"
    if snapshot.topics:
        return f"Voce quer continuar no assunto {snapshot.topics[0]}?"
    return "Voce quer que eu explique, organize ou transforme isso em acao?"


def select_initiative_prompt(*, snapshot: UserMemorySnapshot, user_text: str, intent: str) -> str | None:
    if intent not in {"greeting", "returning", "conversation.reply"}:
        return None
    if snapshot.primary_project:
        return f"Se quiser, posso ajudar a escolher a proxima etapa de {snapshot.primary_project}."
    if snapshot.primary_goal:
        return f"Posso ajudar a quebrar {snapshot.primary_goal} em passos menores."
    if snapshot.topics:
        return f"Tambem posso retomar {snapshot.topics[0]} quando voce quiser."
    return "Posso puxar um assunto leve ou ajudar em algum projeto seu."


def build_profile_summary(snapshot: UserMemorySnapshot) -> str | None:
    parts = []
    if snapshot.display_name:
        parts.append(f"nome: {snapshot.display_name}")
    if snapshot.projects:
        parts.append(f"projeto: {snapshot.projects[0]}")
    if snapshot.goals:
        parts.append(f"objetivo: {snapshot.goals[0]}")
    if snapshot.preferences:
        parts.append(f"preferencia: {snapshot.preferences[0]}")
    if snapshot.recent_feelings:
        parts.append(f"estado recente: {snapshot.recent_feelings[0]}")
    if snapshot.documents:
        parts.append(f"documento: {snapshot.documents[0]}")
    return "; ".join(parts) if parts else None


def pick_line(lines: tuple[str, ...], seed: str) -> str:
    index = int(sha256(seed.encode()).hexdigest(), 16) % len(lines)
    return lines[index]
