from dataclasses import dataclass

from app.brain.text import normalize_text

SIMPLE_INTENTS = {
    "greeting",
    "farewell",
    "identity.self",
    "identity.creator",
    "identity.user",
    "returning",
}
COMPLEX_INTENTS = {
    "technical",
    "teacher",
    "study",
    "career.mentor",
    "consultant.senior",
    "sales",
    "sales.script",
    "sales.message",
    "negotiation",
    "objection.price",
}
COMPLEX_TERMS = {
    "arquitetura",
    "refatorar",
    "integracao",
    "integrar",
    "planejamento",
    "planejar",
    "validacao",
    "validar",
    "debug",
    "corrigir",
    "otimizar",
}
IMPLICIT_REFERENCE_TERMS = {
    "isso",
    "aquilo",
    "aquele",
    "aquela",
    "negocio",
    "antes",
    "falei",
    "falamos",
    "continuar",
    "continuacao",
}


@dataclass(frozen=True)
class ContextBudget:
    complexity: str
    recent_limit: int
    relevant_limit: int
    knowledge_limit: int


def select_context_budget(*, user_text: str, intent: str) -> ContextBudget:
    normalized = normalize_text(user_text)
    token_count = len(normalized.split())
    has_complex_terms = any(term in normalized for term in COMPLEX_TERMS)

    if intent in SIMPLE_INTENTS and token_count <= 6:
        return ContextBudget(complexity="simple", recent_limit=4, relevant_limit=2, knowledge_limit=2)

    if intent in COMPLEX_INTENTS or token_count >= 16 or has_complex_terms:
        return ContextBudget(complexity="complex", recent_limit=8, relevant_limit=4, knowledge_limit=4)

    return ContextBudget(complexity="balanced", recent_limit=6, relevant_limit=3, knowledge_limit=3)


def has_implicit_reference(user_text: str) -> bool:
    normalized = normalize_text(user_text)
    if not normalized:
        return False
    return any(term in normalized for term in IMPLICIT_REFERENCE_TERMS)
