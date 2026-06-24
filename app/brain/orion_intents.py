import re
import unicodedata

WORD_PATTERN = re.compile(r"[a-z0-9]+")

INTENT_KEYWORDS = {
    "greeting": {"oi", "ola", "olá", "eai", "bom", "boa", "fala"},
    "farewell": {"tchau", "adeus", "sair", "encerrar", "ate", "até"},
    "returning": {"voltei", "retornei", "cheguei"},
    "identity.self": {"quem", "voce", "você", "orion"},
    "identity.creator": {"criou", "criador", "fez", "dono"},
    "study": {"estudar", "estudo", "materia", "matematica", "portugues", "programacao", "aula", "revisar"},
    "finance": {"saldo", "financa", "finanças", "dinheiro", "receita", "despesa", "gasto", "relatorio"},
    "games": {"jogar", "jogo", "lorddragons", "dragons", "game", "rpg"},
    "music": {"musica", "música", "mp3", "playlist", "tocar", "som"},
    "anime": {"anime", "manga", "mangá", "personagem"},
    "help": {"ajuda", "ajudar", "socorro", "como", "pode"},
    "teacher": {"professor", "ensina", "explica", "explique", "aula"},
    "grandma": {"avo", "avó", "calma", "carinho"},
    "curiosity": {"curioso", "curiosidade", "porque", "porquê", "como"},
    "joke": {"piada", "brinca", "brincadeira", "engracado", "engraçado"},
    "pc_command": {"abrir", "fechar", "reiniciar", "desligar", "calculadora", "programa"},
    "file": {"arquivo", "pasta", "upload", "download", "documento"},
    "camera": {"camera", "câmera", "foto", "imagem", "visao", "visão"},
    "technical": {
        "erro",
        "codigo",
        "código",
        "api",
        "backend",
        "frontend",
        "websocket",
        "pwa",
        "python",
        "javascript",
        "html",
        "css",
        "sql",
        "fastapi",
        "docker",
        "render",
        "github",
        "git",
        "linux",
        "windows",
        "rede",
        "seguranca",
        "cloud",
        "debugging",
        "deploy",
    },
    "memory.recall": {"lembra", "lembrar", "recorda", "recordar", "memoria"},
    "goal.setting": {"meta", "objetivo", "objetivos", "conseguir", "terminar", "finalizar"},
    "preference.update": {"gosto", "prefiro", "preferencia", "preferencias"},
    "conversation.reply": {"conversar", "conversa", "papo", "continuar"},
    "sales": {
        "vender",
        "venda",
        "vendas",
        "cliente",
        "clientes",
        "servico",
        "proposta",
        "orcamento",
        "atendimento",
        "whatsapp",
        "prospectar",
        "prospeccao",
        "fechamento",
        "follow",
    },
    "negotiation": {
        "negociar",
        "negociacao",
        "objecao",
        "objeccao",
        "caro",
        "preco",
        "desconto",
        "valor",
        "contraproposta",
    },
    "consultant.senior": {
        "consultor",
        "senior",
        "mercado",
        "estrategia",
        "estrategico",
        "experiente",
        "profissional",
    },
}

EMOTION_KEYWORDS = {
    "tired": {"cansado", "cansada", "sono", "exausto", "exausta"},
    "sad": {"triste", "mal", "desanimado", "desanimada"},
    "worried": {"preocupado", "preocupada", "ansioso", "ansiosa", "nervoso", "nervosa"},
    "happy": {"feliz", "bom", "otimo", "ótimo", "legal", "gostei"},
    "confused": {"confuso", "confusa", "duvida", "dúvida", "nao", "não", "entendi"},
    "angry": {"irritado", "irritada", "raiva", "chato"},
}


def normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii").lower()
    return " ".join(WORD_PATTERN.findall(ascii_text))


def extract_keywords(text: str) -> list[str]:
    tokens = normalize_text(text).split()
    stop_words = {"o", "a", "e", "de", "do", "da", "um", "uma", "me", "eu", "voce", "você", "orion"}
    return [token for token in tokens if token not in stop_words and len(token) > 2][:12]


def extract_entities(text: str) -> dict[str, list[str]]:
    entities: dict[str, list[str]] = {"modules": [], "topics": []}
    normalized = normalize_text(text)

    module_terms = {
        "finance": "finance",
        "financas": "finance",
        "lorddragons": "games",
        "dragons": "games",
        "camera": "vision",
        "arquivo": "files",
        "musica": "music",
        "professor": "academy",
    }
    for term, module in module_terms.items():
        if term in normalized and module not in entities["modules"]:
            entities["modules"].append(module)

    entities["topics"] = extract_keywords(text)[:6]
    return entities


def classify_emotion(text: str) -> str:
    tokens = set(normalize_text(text).split())
    for emotion, terms in EMOTION_KEYWORDS.items():
        normalized_terms = {normalize_text(term) for term in terms}
        if tokens & normalized_terms:
            return emotion
    return "neutral"


def is_question(text: str) -> bool:
    normalized = normalize_text(text)
    question_words = ("quem", "como", "quando", "onde", "porque", "por que", "qual", "quais", "quanto")
    return "?" in text or normalized.startswith(question_words)


def needs_follow_up(text: str) -> bool:
    keywords = extract_keywords(text)
    normalized = normalize_text(text)
    vague_terms = {"isso", "aquilo", "coisa", "ajuda", "resolver", "fazer"}
    return len(keywords) == 0 or bool(set(normalized.split()) & vague_terms)


def detect_intent(text: str) -> str:
    normalized = normalize_text(text)
    tokens = set(normalized.split())

    if "quem criou" in normalized or "seu criador" in normalized or "criador do orion" in normalized:
        return "identity.creator"
    if "quem e voce" in normalized or "quem voce e" in normalized or "quem e orion" in normalized:
        return "identity.self"
    if "quem sou eu" in normalized:
        return "identity.user"
    if "lembra de mim" in normalized or "voce lembra de mim" in normalized:
        return "memory.recall"
    if "cliente disse que esta caro" in normalized or "esta caro" in normalized or "ta caro" in normalized:
        return "objection.price"
    if "crie uma mensagem para cliente" in normalized or "mensagem para cliente" in normalized:
        return "sales.message"
    if "script de vendas" in normalized or "roteiro de vendas" in normalized:
        return "sales.script"
    if "fale como consultor" in normalized or "modo consultor" in normalized or "consultor senior" in normalized:
        return "consultant.senior"
    if "quero vender" in normalized or "vender um servico" in normalized:
        return "sales"
    if "me ajude a negociar" in normalized or "ajude a negociar" in normalized:
        return "negotiation"
    if normalized.startswith("meu objetivo") or normalized.startswith("minha meta") or "quero conseguir" in normalized:
        return "goal.setting"
    if "de volta" in normalized or "voltei" in normalized or "retornei" in normalized:
        return "returning"
    if classify_emotion(text) != "neutral":
        return "user.feeling"

    for intent, keywords in INTENT_KEYWORDS.items():
        if intent == "identity.self" and not is_question(text):
            continue
        normalized_keywords = {normalize_text(keyword) for keyword in keywords}
        if tokens & normalized_keywords:
            return intent

    if is_question(text):
        return "question.general"
    if needs_follow_up(text):
        return "request.incomplete"
    return "conversation.reply"
