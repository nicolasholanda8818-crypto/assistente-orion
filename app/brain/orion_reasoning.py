from dataclasses import dataclass
from hashlib import sha256

from app.brain.orion_intents import (
    classify_emotion,
    detect_intent,
    extract_entities,
    extract_keywords,
    needs_follow_up,
)


@dataclass(frozen=True)
class ReasoningResult:
    intent: str
    emotion: str
    keywords: list[str]
    entities: dict[str, list[str]]
    strategy: str
    response: str
    avatar_mood: str
    avatar_reaction: str
    suggested_animation: str
    needs_memory: bool
    follow_up_needed: bool
    topic: str | None
    urgency: str
    reasoning_state: str
    response_length: str
    should_speak: bool


RESPONSE_BANK = {
    "greeting": [
        "Estou aqui, Mestre. O que vamos criar agora?",
        "Pronto para agir, Mestre. Minha galaxia esta ouvindo.",
        "Sistema acordado. Pode falar comigo.",
        "Fala comigo, Mestre. Estou atento.",
        "Oi. Cheguei com a aura calibrada e a curiosidade ligada.",
        "Bom te ver por aqui. Quer conversar ou construir alguma coisa?",
    ],
    "farewell": [
        "Ate logo. Vou manter tudo em ordem por aqui.",
        "Combinado. Fico em espera, mas continuo atento.",
        "Encerrando a conversa por agora. Quando voltar, eu continuo daqui.",
    ],
    "returning": [
        "Bem-vindo de volta. Eu mantive o fio da conversa por aqui.",
        "Detectei seu retorno. Quer continuar de onde paramos?",
        "Voce voltou. Posso retomar o contexto anterior com calma.",
    ],
    "identity.self": [
        "Eu sou o Orion, seu assistente local em evolucao, com chat, avatar, PWA e memoria planejada.",
        "Sou o Orion: um assistente pessoal local, futurista e um pouco dramatico quando precisa.",
    ],
    "identity.creator": [
        "Meu criador e Nicolas Keven Lopes de Holanda.",
        "Fui criado por Nicolas Keven Lopes de Holanda. Eu costumo chamar ele de Mestre.",
    ],
    "identity.user": [
        "Voce e Nicolas Keven Lopes de Holanda, meu criador. Posso ajudar, Mestre?",
    ],
    "study": [
        "Posso te ajudar a estudar. Quer revisar teoria, fazer exercicios ou montar um resumo curto?",
        "Modo estudo pronto. Me diga a materia e eu organizo em passos simples.",
    ],
    "finance": [
        "Posso ajudar com financas. Voce quer registrar algo, ver saldo ou pensar em um relatorio?",
        "Entendi o assunto financeiro. Para ser preciso, me diga se e receita, despesa ou consulta.",
    ],
    "games": [
        "Quer jogar? Posso seguir com Lord Dragons ou conversar sobre uma ideia de jogo.",
        "Portal de jogo detectado. Quer abrir Lord Dragons ou planejar alguma mecanica nova?",
    ],
    "music": [
        "Musica detectada. Quer organizar biblioteca, playlist ou pensar em controle por voz?",
        "Posso entrar no clima musical. Qual faixa ou estilo voce quer usar?",
    ],
    "anime": [
        "Anime e estilo visual combinam comigo. Quer falar de historia, personagem ou visual?",
        "Modo anime ativado discretamente. Qual ideia voce quer explorar?",
    ],
    "help": [
        "Claro. Me diga se voce quer que eu explique, organize ou execute um passo.",
        "Eu ajudo. Qual e o objetivo final?",
        "Eu fico com voce nisso. Quer que eu comece perguntando, explicando ou montando um plano curto?",
        "Pode deixar comigo. Me diga o que ja existe e o que voce quer mudar primeiro.",
    ],
    "teacher": [
        "Modo professor ativado. Quer uma explicacao curta, exemplos ou exercicios?",
        "Vamos aprender por partes. Qual assunto eu coloco na lousa?",
    ],
    "grandma": [
        "Posso responder com mais calma e carinho. Vamos resolver uma coisa de cada vez.",
        "Modo avo ativado: paciencia, clareza e nada de pressa.",
    ],
    "curiosity": [
        "Isso e curioso. Quer que eu explique a causa, compare opcoes ou procure um caminho pratico?",
        "Minha curiosidade acendeu. Qual parte voce quer entender melhor?",
    ],
    "joke": [
        "Posso brincar, mas mantendo a pose. Quer uma resposta divertida ou uma piada curta?",
        "Modo brincalhao ativado com moderacao. Eu ainda tenho reputacao holografica.",
    ],
    "pc_command": [
        "Comando de PC detectado. Por seguranca, eu preciso de permissao administrativa antes de qualquer acao real.",
        "Isso parece uma acao no computador. Posso orientar, mas executar exige confirmacao administrativa.",
    ],
    "file": [
        "Arquivo detectado. Voce quer enviar, listar, organizar ou procurar um documento?",
        "Posso ajudar com arquivos. Me diga o que deve acontecer com eles.",
    ],
    "camera": [
        "Camera detectada. Posso preparar a interacao visual quando esse modulo estiver ativo.",
        "Visao em pauta. Voce quer capturar, ler texto ou analisar imagem?",
    ],
    "technical": [
        "Entendi uma duvida tecnica. Quer diagnostico, explicacao ou um plano de correcao?",
        "Vamos por partes tecnicas. Qual erro ou comportamento voce quer analisar?",
    ],
    "memory.recall": [
        "Se estivermos no mesmo navegador, eu consulto sua memoria local e continuo pelo que voce ja me contou.",
        "Eu posso lembrar do seu perfil local e dos assuntos seguros que voce mencionou aqui.",
    ],
    "goal.setting": [
        "Boa meta. Posso lembrar disso e ajudar a quebrar em passos pequenos.",
        "Objetivo registrado mentalmente. Qual seria o primeiro passo realista?",
        "Gostei da direcao. Vamos transformar esse objetivo em um plano simples?",
    ],
    "preference.update": [
        "Perfeito. Vou levar essa preferencia em conta nas proximas respostas.",
        "Entendido. Isso me ajuda a ajustar melhor o jeito de conversar com voce.",
        "Preferencia anotada no meu contexto local, sem guardar nada sensivel.",
    ],
    "user.feeling": [
        "Entendi como voce esta se sentindo. Quer que eu simplifique o proximo passo?",
        "Estou contigo. Posso responder com calma e transformar isso em uma acao pequena.",
        "Respira um pouco. A gente pode escolher uma tarefa minima e tirar o peso do caminho.",
        "Tudo bem nao saber por onde comecar. Quer que eu te ajude a escolher uma opcao simples?",
    ],
    "request.incomplete": [
        "Captei a intencao, mas preciso de uma pista a mais. Voce quer que eu explique, execute ou organize?",
        "Entendi uma parte. Me diga o objetivo em uma frase curta e eu continuo.",
        "Quero te ajudar direito. Esse 'isso' e sobre visual, memoria, voz, codigo ou outra coisa?",
        "Consigo continuar, mas preciso do alvo. Quer melhorar aparencia, conversa, desempenho ou algum modulo?",
    ],
    "question.general": [
        "Boa pergunta. Posso responder com o que sei localmente e pedir detalhes se faltar contexto.",
        "Consigo pensar sobre isso. Voce quer uma resposta curta ou uma explicacao passo a passo?",
        "Vamos pensar nisso juntos. Posso comecar pelo caminho mais simples.",
        "Tenho uma leitura inicial, mas posso ajustar se voce me der mais contexto.",
    ],
    "conversation.reply": [
        "Estou acompanhando. Quer continuar nesse assunto ou mudar para outra etapa?",
        "Entendi. Posso te ajudar a organizar o proximo passo.",
        "Certo. Me de mais uma pista e eu transformo isso em uma resposta util.",
        "Estou com voce nessa. Podemos seguir devagar ou atacar direto o ponto principal.",
        "Boa. Isso me da um fio para puxar. Quer explorar a ideia ou transformar em acao?",
        "Faz sentido. Se quiser, eu posso resumir, expandir ou pensar em alternativas.",
        "Podemos conversar sim. Me conta o que esta passando pela sua cabeca agora.",
        "Estou presente. Podemos falar leve, pensar em um projeto ou resolver algo pequeno.",
    ],
}

MOOD_BY_INTENT = {
    "greeting": ("happy", "wave", "talk"),
    "farewell": ("neutral", "wave", "idle"),
    "returning": ("happy", "wave", "talk"),
    "identity.self": ("confident", "direct-look", "talk"),
    "identity.creator": ("proud", "proud", "talk"),
    "identity.user": ("happy", "direct-look", "talk"),
    "study": ("teacher", "teacher", "talk"),
    "finance": ("focused", "attention", "talk"),
    "games": ("playful", "surprised", "talk"),
    "music": ("playful", "pose", "talk"),
    "anime": ("curious", "look-around", "talk"),
    "help": ("focused", "lean-forward", "talk"),
    "teacher": ("teacher", "point-chat", "talk"),
    "grandma": ("neutral", "soft-nod", "talk"),
    "curiosity": ("curious", "hand-chin", "talk"),
    "joke": ("playful", "laugh", "talk"),
    "pc_command": ("focused", "attention", "talk"),
    "file": ("focused", "point-chat", "talk"),
    "camera": ("curious", "direct-look", "talk"),
    "technical": ("focused", "hand-chin", "talk"),
    "memory.recall": ("thoughtful", "direct-look", "talk"),
    "goal.setting": ("focused", "attention", "talk"),
    "preference.update": ("happy", "soft-nod", "talk"),
    "user.feeling": ("neutral", "lean-forward", "talk"),
    "request.incomplete": ("curious", "hand-chin", "talk"),
    "question.general": ("thoughtful", "hand-chin", "talk"),
    "conversation.reply": ("neutral", "direct-look", "talk"),
}

HIGH_URGENCY_TERMS = {
    "agora",
    "urgente",
    "rapido",
    "rapida",
    "socorro",
    "emergencia",
    "travou",
    "quebrou",
    "falhou",
}

MEDIUM_LENGTH_INTENTS = {
    "study",
    "teacher",
    "technical",
    "finance",
    "question.general",
    "memory.recall",
    "goal.setting",
}


def reason_about_message(user_text: str, user_context: dict | None = None) -> ReasoningResult:
    intent = detect_intent(user_text)
    emotion = classify_emotion(user_text)
    keywords = extract_keywords(user_text)
    entities = extract_entities(user_text)
    follow_up_needed = needs_follow_up(user_text)
    strategy = choose_response_strategy(intent, emotion, keywords)
    response = build_contextual_response(
        user_text=user_text,
        intent=intent,
        emotion=emotion,
        variation_seed=str((user_context or {}).get("turn_seed", "")),
    )
    avatar_mood, avatar_reaction, suggested_animation = choose_avatar_reaction(intent, emotion, keywords)
    urgency = detect_urgency(keywords)
    topic = infer_topic(intent=intent, keywords=keywords, entities=entities)
    reasoning_state = choose_reasoning_state(intent=intent, emotion=emotion, follow_up_needed=follow_up_needed)
    response_length = choose_response_length(intent=intent, emotion=emotion, follow_up_needed=follow_up_needed)
    profile_known = bool((user_context or {}).get("profile_known"))

    return ReasoningResult(
        intent=intent,
        emotion=emotion,
        keywords=keywords,
        entities=entities,
        strategy=strategy,
        response=response,
        avatar_mood=avatar_mood,
        avatar_reaction=avatar_reaction,
        suggested_animation=suggested_animation,
        needs_memory=profile_known
        or intent
        in {"study", "finance", "technical", "conversation.reply", "memory.recall", "goal.setting", "returning"},
        follow_up_needed=follow_up_needed,
        topic=topic,
        urgency=urgency,
        reasoning_state=reasoning_state,
        response_length=response_length,
        should_speak=True,
    )


def choose_response_strategy(intent: str, emotion: str, keywords: list[str]) -> str:
    if emotion in {"tired", "sad", "confused", "worried"}:
        return "supportive-follow-up"
    if intent in {"returning", "memory.recall"}:
        return "persistent-context"
    if intent in {"goal.setting", "preference.update"}:
        return "personal-memory-update"
    if intent in {"pc_command", "file", "finance"}:
        return "safe-module-routing"
    if keywords:
        return "contextual-rule-response"
    return "clarifying-question"


def build_contextual_response(*, user_text: str, intent: str, emotion: str, variation_seed: str = "") -> str:
    responses = RESPONSE_BANK.get(intent, RESPONSE_BANK["conversation.reply"])
    seed = f"{user_text}|{intent}|{emotion}|{variation_seed}"
    index = int(sha256(seed.encode()).hexdigest(), 16) % len(responses)
    return responses[index]


def detect_urgency(keywords: list[str]) -> str:
    if set(keywords) & HIGH_URGENCY_TERMS:
        return "high"
    return "normal"


def infer_topic(*, intent: str, keywords: list[str], entities: dict[str, list[str]]) -> str | None:
    modules = entities.get("modules") or []
    if modules:
        return modules[0]
    if intent in {"study", "teacher"}:
        return "academy"
    if intent == "goal.setting":
        return "goals"
    if intent == "technical":
        return "technology"
    if intent == "user.feeling":
        return "wellbeing"
    if intent == "memory.recall":
        return "memory"
    return keywords[0] if keywords else None


def choose_reasoning_state(*, intent: str, emotion: str, follow_up_needed: bool) -> str:
    if intent in {"greeting", "farewell", "returning", "identity.self", "identity.creator", "identity.user"}:
        return "answering"
    if intent == "memory.recall":
        return "thinking"
    if intent == "request.incomplete" or follow_up_needed:
        return "clarifying"
    if emotion in {"tired", "sad", "confused", "worried"}:
        return "clarifying"
    if intent in {"technical", "teacher", "study", "question.general", "memory.recall"}:
        return "thinking"
    return "answering"


def choose_response_length(*, intent: str, emotion: str, follow_up_needed: bool) -> str:
    if follow_up_needed or emotion in {"tired", "sad", "confused", "worried"}:
        return "short"
    if intent in MEDIUM_LENGTH_INTENTS:
        return "medium"
    return "short"


def choose_avatar_reaction(intent: str, emotion: str, keywords: list[str]) -> tuple[str, str, str]:
    if emotion == "tired":
        return "sleepy", "lean-forward", "talk"
    if emotion in {"sad", "worried"}:
        return "thoughtful", "lean-forward", "talk"
    if emotion == "happy":
        return "happy", "proud", "talk"
    if emotion == "confused":
        return "curious", "hand-chin", "talk"
    return MOOD_BY_INTENT.get(intent, ("neutral", "direct-look", "talk"))
