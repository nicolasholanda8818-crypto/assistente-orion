from dataclasses import dataclass

from app.brain.orion_intents import normalize_text

EXPLICIT_SEARCH_TERMS = {
    "pesquise",
    "pesquisar",
    "procure",
    "buscar",
    "busque",
    "veja na web",
    "compare fontes",
    "traga fontes",
    "fontes",
}
RECENCY_TERMS = {
    "mais recente",
    "versao atual",
    "versao mais recente",
    "preco",
    "noticia",
    "noticias",
    "hoje",
    "agora",
    "lancamento",
    "documentacao atual",
    "erro recente",
    "ferramenta nova",
}
SALES_INTENTS = {"sales", "sales.script", "sales.message", "sales.proposal"}
NEGOTIATION_INTENTS = {"negotiation", "objection.price"}
PRIVATE_TERMS = {"senha", "token", "cpf", "cartao", "documento privado", "chave", "segredo"}


@dataclass(frozen=True)
class DialogueDecision:
    understanding: str
    strategy: str
    response_contract: str
    should_search_web: bool
    should_save_memory: bool
    should_ask_clarifying_question: bool
    mode: str


def analyze_dialogue(
    *,
    user_text: str,
    intent: str,
    emotion: str,
    keywords: list[str],
    profile_known: bool,
) -> DialogueDecision:
    should_search = should_use_web_search(user_text)
    incomplete = intent == "request.incomplete" or len(keywords) <= 1
    business = intent in SALES_INTENTS or intent in NEGOTIATION_INTENTS
    consultant = intent == "consultant.senior"
    mentor = intent == "career.mentor"

    if should_search:
        return DialogueDecision(
            understanding="pedido com necessidade de informacao atual ou fontes",
            strategy="web-search-recommended",
            response_contract="explicar que posso pesquisar, resumir e mostrar fontes sem expor dados privados",
            should_search_web=True,
            should_save_memory=False,
            should_ask_clarifying_question=False,
            mode="browser",
        )
    if consultant:
        return DialogueDecision(
            understanding="pedido de visao pratica e estrategica",
            strategy="senior-consultant",
            response_contract="responder como consultor experiente sem fingir experiencia humana real",
            should_search_web=False,
            should_save_memory=profile_known,
            should_ask_clarifying_question=False,
            mode="consultant",
        )
    if mentor:
        return DialogueDecision(
            understanding="pedido de mentoria tecnica, carreira ou evolucao profissional",
            strategy="technical-mentorship",
            response_contract="orientar por objetivo, lacuna atual, plano pratico e proximo passo verificavel",
            should_search_web=False,
            should_save_memory=profile_known,
            should_ask_clarifying_question=True,
            mode="mentor",
        )
    if business:
        return DialogueDecision(
            understanding="contexto comercial com venda, proposta, atendimento ou objecao",
            strategy="commercial-diagnosis",
            response_contract="dar orientacao pratica, pergunta de descoberta e proximo passo etico",
            should_search_web=False,
            should_save_memory=profile_known,
            should_ask_clarifying_question=True,
            mode="sales",
        )
    if intent in {"teacher", "study", "technical"}:
        return DialogueDecision(
            understanding="pedido de ensino ou diagnostico tecnico",
            strategy="level-based-teaching",
            response_contract="explicar por nivel, exemplo e proximo exercicio",
            should_search_web=False,
            should_save_memory=profile_known,
            should_ask_clarifying_question=False,
            mode="teacher",
        )
    if emotion in {"tired", "sad", "worried", "confused"} or incomplete:
        return DialogueDecision(
            understanding="usuario precisa de acolhimento ou falta contexto",
            strategy="supportive-clarification",
            response_contract="responder curto, humano e perguntar o minimo necessario",
            should_search_web=False,
            should_save_memory=profile_known,
            should_ask_clarifying_question=True,
            mode="conversation",
        )
    return DialogueDecision(
        understanding="conversa geral com contexto local",
        strategy="direct-contextual-answer",
        response_contract="responder claro, natural e com proximo passo quando util",
        should_search_web=False,
        should_save_memory=profile_known,
        should_ask_clarifying_question=False,
        mode="conversation",
    )


def should_use_web_search(text: str) -> bool:
    normalized = normalize_text(text)
    if any(term in normalized for term in PRIVATE_TERMS):
        return False
    return any(term in normalized for term in EXPLICIT_SEARCH_TERMS | RECENCY_TERMS)
