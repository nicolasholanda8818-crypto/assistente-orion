import re
from dataclasses import dataclass, field
from hashlib import sha256

from app.brain.orion_intents import classify_emotion, detect_intent, extract_keywords, normalize_text
from app.db import repositories

SENSITIVE_TERMS = {
    "senha",
    "password",
    "token",
    "chave",
    "secret",
    "segredo",
    "cpf",
    "rg",
    "cartao",
    "cartao de credito",
    "credito",
    "cvv",
    "pix",
    "banco",
}

COMMON_NON_NAMES = {
    "oi",
    "ola",
    "olá",
    "sim",
    "nao",
    "não",
    "ok",
    "orion",
    "status",
    "ajuda",
    "ajudar",
    "teste",
    "fala",
    "bom",
    "boa",
    "tudo",
    "beleza",
    "quero",
    "preciso",
    "vender",
    "servico",
    "cliente",
    "negociar",
    "pesquisar",
    "arquivo",
    "documento",
}

NAME_PATTERNS = (
    re.compile(r"\bmeu nome (?:e|eh|é)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]{1,58})", re.IGNORECASE),
    re.compile(r"\bmeu apelido (?:e|eh|é)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]{1,58})", re.IGNORECASE),
    re.compile(r"\bme chamo\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]{1,58})", re.IGNORECASE),
    re.compile(r"\bpode me chamar de\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]{1,58})", re.IGNORECASE),
    re.compile(r"\bsou\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]{1,58})", re.IGNORECASE),
)

PREFERENCE_PATTERNS = (
    re.compile(r"\bgosto de\s+([^.,;!?]{2,80})", re.IGNORECASE),
    re.compile(r"\bprefiro\s+([^.,;!?]{2,80})", re.IGNORECASE),
    re.compile(r"\bminha preferencia (?:e|eh|é)\s+([^.,;!?]{2,80})", re.IGNORECASE),
)

PROJECT_PATTERNS = (
    re.compile(r"\bmeu projeto (?:e|eh|é)\s+([^.,;!?]{2,80})", re.IGNORECASE),
    re.compile(r"\bprojeto\s+([^.,;!?]{2,80})", re.IGNORECASE),
    re.compile(r"\bestou criando\s+([^.,;!?]{2,80})", re.IGNORECASE),
    re.compile(r"\bestou trabalhando em\s+([^.,;!?]{2,80})", re.IGNORECASE),
)

GOAL_PATTERNS = (
    re.compile(r"\bmeu objetivo (?:e|eh|é)\s+([^.,;!?]{2,100})", re.IGNORECASE),
    re.compile(r"\bminha meta (?:e|eh|é)\s+([^.,;!?]{2,100})", re.IGNORECASE),
    re.compile(r"\bquero conseguir\s+([^.,;!?]{2,100})", re.IGNORECASE),
    re.compile(r"\bpreciso terminar\s+([^.,;!?]{2,100})", re.IGNORECASE),
)

RECURRING_TOPIC_PATTERNS = (
    re.compile(r"\bsempre falo de\s+([^.,;!?]{2,80})", re.IGNORECASE),
    re.compile(r"\bassunto recorrente (?:e|eh|é)\s+([^.,;!?]{2,80})", re.IGNORECASE),
    re.compile(r"\bestou estudando\s+([^.,;!?]{2,80})", re.IGNORECASE),
    re.compile(r"\btenho interesse em\s+([^.,;!?]{2,80})", re.IGNORECASE),
    re.compile(r"\bquero aprender\s+([^.,;!?]{2,80})", re.IGNORECASE),
)

STYLE_PATTERNS = (
    re.compile(r"\b(?:responda|fale|explique)\s+([^.,;!?]{2,80})", re.IGNORECASE),
    re.compile(r"\bgosto de respostas\s+([^.,;!?]{2,80})", re.IGNORECASE),
    re.compile(r"\bprefiro respostas\s+([^.,;!?]{2,80})", re.IGNORECASE),
)

MEMORY_SKIP_INTENTS = {
    "greeting",
    "farewell",
    "identity.self",
    "identity.creator",
    "identity.user",
    "memory.recall",
    "request.incomplete",
    "help",
    "joke",
}

WELCOME_LINES = (
    "Ola, {name}. E um prazer ve-lo novamente.",
    "Bem-vindo de volta, {name}. Continuo por aqui, atento.",
    "Ola, {name}. Minha memoria local reconheceu voce.",
)

FIRST_NAME_PROMPTS = (
    "Antes de continuarmos, como posso chamar voce?",
    "Quero lembrar de voce do jeito certo. Qual e o seu nome?",
    "Primeiro registro de presenca. Como devo te chamar?",
)

NAME_SAVED_LINES = (
    "Ola, {name}. E um prazer te conhecer. Vou lembrar do seu nome neste Orion.",
    "Registrado, {name}. Da proxima vez eu ja vou te reconhecer.",
    "Perfeito, {name}. Agora a conversa fica mais pessoal.",
)

CONTEXT_LINES = (
    "Lembro que voce comentou sobre {topic}. Quer continuar por esse caminho?",
    "Posso retomar {topic} se fizer sentido agora.",
    "Esse assunto conversa com {topic}, que ja apareceu por aqui.",
)

STARTER_LINES = (
    "Quer me contar como esta seu dia ou prefere seguir em algum projeto?",
    "Se quiser, posso ajudar a organizar o proximo passo de hoje.",
    "Algum projeto merece atencao agora?",
)


@dataclass(frozen=True)
class UserMemorySnapshot:
    user_id: str
    display_name: str | None = None
    preferences: list[str] = field(default_factory=list)
    topics: list[str] = field(default_factory=list)
    projects: list[str] = field(default_factory=list)
    goals: list[str] = field(default_factory=list)
    recent_feelings: list[str] = field(default_factory=list)
    documents: list[str] = field(default_factory=list)
    summaries: list[str] = field(default_factory=list)

    @property
    def known(self) -> bool:
        return bool(self.display_name)

    @property
    def strongest_context(self) -> str | None:
        for values in (self.projects, self.goals, self.preferences, self.topics, self.documents):
            if values:
                return values[0]
        return None

    @property
    def primary_project(self) -> str | None:
        return self.projects[0] if self.projects else None

    @property
    def primary_goal(self) -> str | None:
        return self.goals[0] if self.goals else None

    @property
    def recent_feeling(self) -> str | None:
        return self.recent_feelings[0] if self.recent_feelings else None

    @property
    def primary_document(self) -> str | None:
        return self.documents[0] if self.documents else None


class UserMemoryService:
    def load(self, user_id: str) -> UserMemorySnapshot:
        profile = repositories.ensure_user_profile(user_id)
        facts = repositories.list_user_memory_facts(user_id)
        summaries = repositories.list_user_summaries(user_id)
        return snapshot_from_rows(
            user_id=user_id,
            display_name=profile.get("display_name"),
            facts=facts,
            summaries=summaries,
        )

    def learn_from_message(self, *, user_id: str, text: str, expect_name: bool = False) -> UserMemorySnapshot:
        snapshot = self.load(user_id)
        if contains_sensitive_data(text):
            return snapshot

        name = extract_display_name(text, allow_plain_name=expect_name and not snapshot.display_name)
        if name:
            repositories.set_user_display_name(user_id, name)

        if name:
            return self.load(user_id)

        intent = detect_intent(text)
        summary = summarize_safe_message(text)
        if intent in MEMORY_SKIP_INTENTS:
            if summary and summary.startswith("Estado recente: "):
                repositories.upsert_user_summary(user_id, summary, source_type="emotion")
            return self.load(user_id)

        for fact_type, value in extract_memory_facts(text):
            repositories.upsert_user_memory_fact(user_id, fact_type, value)
        if summary:
            repositories.upsert_user_summary(user_id, summary)

        return self.load(user_id)

    def build_welcome_message(self, snapshot: UserMemorySnapshot) -> tuple[str, bool, str | None]:
        if not snapshot.display_name:
            return pick_line(FIRST_NAME_PROMPTS, snapshot.user_id), True, None

        starter = build_conversation_starter(snapshot)
        message = pick_line(WELCOME_LINES, snapshot.user_id).format(name=snapshot.display_name)
        if starter:
            message = f"{message} {starter}"
        return message, False, starter

    def build_name_saved_message(self, snapshot: UserMemorySnapshot) -> str:
        name = snapshot.display_name or "Mestre"
        return pick_line(NAME_SAVED_LINES, snapshot.user_id).format(name=name)

    def build_context_hint(self, *, snapshot: UserMemorySnapshot, user_text: str) -> str | None:
        topic = snapshot.strongest_context or summary_topic(snapshot)
        if not topic or detect_intent(user_text) in {"identity.creator", "system.status"}:
            return None
        line = pick_line(CONTEXT_LINES, f"{snapshot.user_id}|{user_text}|{topic}")
        return line.format(topic=topic)


def snapshot_from_rows(
    *,
    user_id: str,
    display_name: str | None,
    facts: list[dict],
    summaries: list[dict],
) -> UserMemorySnapshot:
    grouped: dict[str, list[str]] = {"preference": [], "topic": [], "project": []}
    for fact in facts:
        fact_type = str(fact["fact_type"])
        if fact_type in grouped:
            grouped[fact_type].append(str(fact["fact_value"]))

    parsed_summaries = parse_summary_rows(summaries)

    return UserMemorySnapshot(
        user_id=user_id,
        display_name=display_name,
        preferences=grouped["preference"][:5],
        topics=grouped["topic"][:5],
        projects=grouped["project"][:5],
        goals=parsed_summaries["goals"][:5],
        recent_feelings=parsed_summaries["feelings"][:5],
        documents=parsed_summaries["documents"][:5],
        summaries=[str(summary["summary"]) for summary in summaries[:5]],
    )


def parse_summary_rows(summaries: list[dict]) -> dict[str, list[str]]:
    parsed: dict[str, list[str]] = {"goals": [], "feelings": [], "documents": []}
    for row in summaries:
        summary = str(row["summary"])
        source_type = str(row.get("source_type") or "")
        if summary.startswith("Objetivo mencionado: "):
            parsed["goals"].append(summary.replace("Objetivo mencionado: ", "", 1))
        elif summary.startswith("Estado recente: "):
            parsed["feelings"].append(summary.replace("Estado recente: ", "", 1))
        elif source_type == "file" and summary.startswith("Arquivo "):
            name = summary.replace("Arquivo ", "", 1).split(":", 1)[0].strip()
            if name:
                parsed["documents"].append(name)
    return parsed


def contains_sensitive_data(text: str) -> bool:
    normalized = normalize_text(text)
    if any(term in normalized for term in {normalize_text(term) for term in SENSITIVE_TERMS}):
        return True
    digits = sum(character.isdigit() for character in text)
    return digits >= 8


def extract_display_name(text: str, *, allow_plain_name: bool = False) -> str | None:
    if contains_sensitive_data(text):
        return None

    candidate = None
    for pattern in NAME_PATTERNS:
        match = pattern.search(text)
        if match:
            candidate = match.group(1)
            break

    if candidate is None and allow_plain_name:
        candidate = text

    if candidate is None:
        return None

    cleaned = clean_text_fragment(candidate, max_length=48)
    normalized = normalize_text(cleaned)
    words = normalized.split()
    if not words or len(words) > 3:
        return None
    if normalized in {normalize_text(term) for term in COMMON_NON_NAMES}:
        return None
    if any(word in {normalize_text(term) for term in COMMON_NON_NAMES} for word in words):
        return None
    if not all(word.isalpha() and len(word) >= 2 for word in words):
        return None

    return " ".join(part.capitalize() for part in cleaned.split())


def extract_memory_facts(text: str) -> list[tuple[str, str]]:
    if contains_sensitive_data(text):
        return []

    facts: list[tuple[str, str]] = []
    for pattern in PREFERENCE_PATTERNS:
        match = pattern.search(text)
        if match:
            value = clean_text_fragment(match.group(1), max_length=72)
            if value:
                facts.append(("preference", value))

    for pattern in STYLE_PATTERNS:
        match = pattern.search(text)
        if match:
            value = clean_text_fragment(match.group(1), max_length=72)
            if value:
                facts.append(("preference", f"estilo: {value}"))

    for pattern in PROJECT_PATTERNS:
        match = pattern.search(text)
        if match:
            value = clean_text_fragment(match.group(1), max_length=72)
            if value:
                facts.append(("project", value))

    for pattern in RECURRING_TOPIC_PATTERNS:
        match = pattern.search(text)
        if match:
            value = clean_text_fragment(match.group(1), max_length=72)
            if value:
                facts.append(("topic", value))

    intent = detect_intent(text)
    if intent in {"study", "finance", "games", "music", "technical", "teacher", "goal.setting"}:
        for keyword in extract_keywords(text)[:3]:
            if keyword not in {normalize_text(term) for term in SENSITIVE_TERMS}:
                facts.append(("topic", keyword))

    deduped: list[tuple[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for fact in facts:
        normalized_fact = (fact[0], normalize_text(fact[1]))
        if normalized_fact not in seen:
            deduped.append(fact)
            seen.add(normalized_fact)
    return deduped


def summarize_safe_message(text: str) -> str | None:
    if contains_sensitive_data(text):
        return None

    normalized = normalize_text(text)

    feeling = summarize_feeling(text)
    if feeling:
        return f"Estado recente: {feeling}"

    if len(normalized.split()) < 3:
        return None

    projects = [value for fact_type, value in extract_memory_facts(text) if fact_type == "project"]
    if projects:
        return f"Projeto mencionado: {projects[0]}"

    goal = extract_goal(text)
    if goal:
        return f"Objetivo mencionado: {goal}"

    preferences = [value for fact_type, value in extract_memory_facts(text) if fact_type == "preference"]
    if preferences:
        return f"Preferencia mencionada: {preferences[0]}"

    keywords = extract_keywords(text)
    if keywords:
        return f"Assunto recente: {' '.join(keywords[:4])}"
    return None


def extract_goal(text: str) -> str | None:
    for pattern in GOAL_PATTERNS:
        match = pattern.search(text)
        if match:
            return clean_text_fragment(match.group(1), max_length=90)
    return None


def summarize_feeling(text: str) -> str | None:
    emotion = classify_emotion(text)
    if emotion == "tired":
        return "cansado"
    if emotion == "sad":
        return "triste"
    if emotion == "worried":
        return "preocupado"
    if emotion == "confused":
        return "confuso"
    if emotion == "angry":
        return "irritado"
    return None


def clean_text_fragment(value: str, *, max_length: int) -> str:
    cleaned = " ".join(value.replace("\n", " ").replace("\r", " ").split())
    cleaned = cleaned.strip(" .,:;!?\"'")
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length].rsplit(" ", 1)[0]
    return cleaned


def build_conversation_starter(snapshot: UserMemorySnapshot) -> str | None:
    if snapshot.recent_feeling:
        return f"Da ultima vez voce parecia {snapshot.recent_feeling}. Como voce esta agora?"
    if snapshot.primary_project:
        return f"Como esta indo {snapshot.primary_project}?"
    if snapshot.primary_goal:
        return f"Quer avancar um passo em {snapshot.primary_goal}?"
    if snapshot.primary_document:
        return f"Quer retomar o arquivo {snapshot.primary_document}?"
    context = snapshot.strongest_context
    if context:
        return f"Quer continuar falando sobre {context}?"
    remembered = summary_topic(snapshot)
    if remembered:
        return f"Como esta indo {remembered}?"
    return pick_line(STARTER_LINES, snapshot.user_id)


def summary_topic(snapshot: UserMemorySnapshot) -> str | None:
    if not snapshot.summaries:
        return None
    summary = snapshot.summaries[0]
    for prefix in (
        "Projeto mencionado: ",
        "Objetivo mencionado: ",
        "Estado recente: ",
        "Preferencia mencionada: ",
        "Assunto recente: ",
    ):
        if summary.startswith(prefix):
            return summary.replace(prefix, "", 1)
    return summary.lower()


def pick_line(lines: tuple[str, ...], seed: str) -> str:
    index = int(sha256(seed.encode()).hexdigest(), 16) % len(lines)
    return lines[index]
