from uuid import uuid4

from app.brain.conversation_manager import has_implicit_reference, select_context_budget
from app.brain.execution import ExecutionService
from app.brain.knowledge import KnowledgeService
from app.brain.learning import LearningService
from app.brain.math_engine import solve_math_query
from app.brain.memory import MemoryService
from app.brain.models import (
    BrainMode,
    BrainRequest,
    BrainResponse,
    BrainStatus,
    ContextSnapshot,
    ContextSummary,
    PlanStep,
)
from app.brain.orion_cognitive_pipeline import OrionCognitivePipeline, build_cognitive_pipeline
from app.brain.orion_context import OrionConversationContext, build_orion_context, context_instruction
from app.brain.orion_intents import normalize_text
from app.brain.orion_memory import OrionMemoryContext, build_orion_memory_context
from app.brain.orion_reasoning import reason_about_message
from app.brain.planning import PlanningService
from app.brain.portfolio_profile import PROFILE, answer_portfolio_question
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
                "memory_summary": user_snapshot.strongest_context if user_snapshot else None,
                "turn_seed": f"{request.conversation_id}:{self.memory.count()}",
            },
        )
        context_budget = select_context_budget(user_text=request.text, intent=reasoning.intent)
        knowledge_hits = self.knowledge.search(request.text)
        context = self.memory.build_context(
            query=request.text,
            conversation_id=request.conversation_id,
            knowledge_hits=knowledge_hits,
            recent_limit=context_budget.recent_limit,
            relevant_limit=context_budget.relevant_limit,
            knowledge_limit=context_budget.knowledge_limit,
        )
        plan = self.planning.create_plan(text=request.text, context=context)
        execution = self.execution.execute(plan=plan, context=context)
        message = execution.message
        if plan.intent not in {"system.status", "knowledge.answer", "identity.creator", "identity.user"}:
            message = reasoning.response

        if plan.intent == "portfolio.profile":
            message = answer_portfolio_question(request.text) or (
                f"Essa informacao ainda nao esta disponivel no portfolio. Dados confirmados: {PROFILE.name}, "
                "Desenvolvedor Web, formacao em Gestao da Tecnologia da Informacao, cursos de Python e Informatica."
            )

        if plan.intent == "math.calculate":
            math_result = solve_math_query(request.text)
            message = math_result.message
        memory_context = build_orion_memory_context(
            snapshot=user_snapshot,
            user_text=request.text,
            intent=plan.intent,
        )
        conversation_context = build_orion_context(
            user_text=request.text,
            snapshot=user_snapshot,
            memory_context=memory_context,
            intent=plan.intent,
            keywords=reasoning.keywords,
        )
        cognitive_pipeline = build_cognitive_pipeline(
            intent=plan.intent,
            emotion=reasoning.emotion,
            keywords=reasoning.keywords,
            memory_context=memory_context,
            conversation_context=conversation_context,
            context=context,
            should_search_web=reasoning.should_search_web,
        )
        if user_snapshot and user_snapshot.display_name:
            message = self._personalize_message(
                message=message,
                request=request,
                intent=plan.intent,
                snapshot=user_snapshot,
                memory_context=memory_context,
                conversation_context=conversation_context,
            )
        message = self._shape_message_for_context(
            message=message,
            request=request,
            intent=plan.intent,
            context=context,
            memory_context=memory_context,
            conversation_context=conversation_context,
            cognitive_pipeline=cognitive_pipeline,
            context_complexity=context_budget.complexity,
        )
        message = self._auto_verify_response(
            message=message,
            request=request,
            intent=plan.intent,
            context=context,
            should_search_web=reasoning.should_search_web,
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
            conversation_starter=memory_context.initiative_prompt
            or memory_context.continuity_hint
            or (
                self.user_memory.build_context_hint(snapshot=user_snapshot, user_text=request.text)
                if user_snapshot
                else None
            ),
            dialogue_strategy=reasoning.dialogue_decision.strategy,
            should_search_web=reasoning.should_search_web,
            search_query=reasoning.search_query,
            response_mode=reasoning.dialogue_decision.mode,
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

    def _personalize_message(
        self,
        *,
        message: str,
        request: BrainRequest,
        intent: str,
        snapshot,
        memory_context: OrionMemoryContext,
        conversation_context: OrionConversationContext,
    ) -> str:
        name = snapshot.display_name
        if intent == "identity.user":
            if memory_context.profile_summary:
                return f"Voce e {name}. Eu lembro deste perfil local: {memory_context.profile_summary}."
            return f"Voce e {name}. Eu lembro pelo seu perfil local neste Orion."
        if intent == "greeting":
            suffix = memory_context.continuity_hint or memory_context.initiative_prompt
            if not suffix:
                suffix = "O que vamos criar agora?"
            return f"Ola, {name}. E bom ver voce novamente. {suffix}"
        if intent == "returning":
            suffix = (
                memory_context.continuity_hint or memory_context.initiative_prompt or "Continuamos de onde paramos?"
            )
            return f"Bem-vindo de volta, {name}. {suffix}"
        if intent == "memory.recall":
            if memory_context.profile_summary:
                return f"Sim, {name}. Eu lembro com seguranca: {memory_context.profile_summary}."
            if memory_context.continuity_hint:
                return f"Sim, {name}. {memory_context.continuity_hint}"
            return f"Sim, {name}. Eu lembro do seu perfil local neste Orion."
        if intent == "goal.setting":
            hint = memory_context.continuity_hint or "Vou guardar esse objetivo como contexto seguro da nossa conversa."
            return f"Combinado, {name}. {hint} Qual primeiro passo parece possivel hoje?"
        if intent == "preference.update":
            hint = memory_context.continuity_hint or "Vou ajustar meu jeito de responder por essa preferencia."
            return f"Entendido, {name}. {hint}"
        if intent == "user.feeling":
            hint = memory_context.continuity_hint
            if hint:
                return f"Estou aqui, {name}. {hint}"
            if snapshot.recent_feeling == "cansado":
                return f"Estou aqui, {name}. Percebi que voce esta cansado. Quer reduzir isso a um passo pequeno?"
            return f"Estou aqui, {name}. Quer que eu te ajude a transformar isso em um passo pequeno?"
        if intent == "request.incomplete" and memory_context.smart_question:
            return f"{message} {memory_context.smart_question}"
        if intent == "help" and memory_context.smart_question:
            return f"{message} {memory_context.smart_question}"
        if intent in {"conversation.reply", "question.general", "technical", "study", "teacher"}:
            hint = memory_context.continuity_hint
            if hint:
                return f"{message} {hint}"
            if conversation_context.focus and conversation_context.has_user_profile:
                return f"{message} Posso usar {conversation_context.focus} como foco, se fizer sentido."
        return message

    def _shape_message_for_context(
        self,
        *,
        message: str,
        request: BrainRequest,
        intent: str,
        context: ContextSnapshot,
        memory_context: OrionMemoryContext,
        conversation_context: OrionConversationContext,
        cognitive_pipeline: OrionCognitivePipeline,
        context_complexity: str,
    ) -> str:
        normalized_message = normalize_text(message)
        normalized_user_text = normalize_text(request.text)

        reference_ack = self._build_implicit_reference_ack(
            request_text=request.text,
            context=context,
        )
        if reference_ack and normalize_text(reference_ack) not in normalized_message:
            message = f"{reference_ack} {message}"
            normalized_message = normalize_text(message)

        quick_plan = self._build_quick_plan_response(request_text=normalized_user_text)
        if quick_plan:
            return quick_plan

        dev_copilot_response = self._build_dev_copilot_response(request_text=normalized_user_text)
        if dev_copilot_response:
            if normalize_text(dev_copilot_response) not in normalize_text(message):
                message = f"{message} {dev_copilot_response}"

        if memory_context.smart_question and normalize_text(memory_context.smart_question) not in normalized_message:
            if intent in {"request.incomplete", "help", "conversation.reply"} or "melhorar" in normalized_user_text:
                message = f"{message} {memory_context.smart_question}"

        instruction = context_instruction(conversation_context)
        if instruction and normalize_text(instruction) not in normalize_text(message):
            if intent in {"technical", "teacher", "study", "question.general", "help"}:
                message = f"{message} {instruction}"

        if (
            conversation_context.style == "beginner"
            and intent in {"teacher", "study", "technical"}
            and "qual parte" not in normalize_text(message)
        ):
            message = f"{message} Qual parte voce quer que eu explique primeiro?"

        if intent in {"teacher", "study", "technical"}:
            message = self._enrich_technical_teaching_message(
                message=message,
                request=request,
                conversation_context=conversation_context,
                cognitive_pipeline=cognitive_pipeline,
            )
        if intent == "career.mentor":
            message = self._enrich_mentor_message(message=message, request=request)
        if intent == "consultant.senior":
            message = self._enrich_consultant_message(message=message)

        if context_complexity == "complex":
            message = self._append_plan_summary(message=message)

        return message

    def _build_implicit_reference_ack(self, *, request_text: str, context: ContextSnapshot) -> str | None:
        if not has_implicit_reference(request_text):
            return None
        previous_user_messages = [entry.content for entry in context.recent_messages if entry.role == "user"]
        if not previous_user_messages:
            return None

        previous_topic = previous_user_messages[-1]
        summarized_topic = previous_topic.strip().replace("\n", " ")[:120]
        if not summarized_topic:
            return None
        return (
            "Entendi. Voce esta se referindo ao contexto anterior da conversa "
            f"({summarized_topic}). Vou considerar isso para te responder com precisao."
        )

    def _append_plan_summary(self, *, message: str) -> str:
        normalized_message = normalize_text(message)
        if "plano" in normalized_message and "1" in normalized_message:
            return message
        plan_summary = (
            " Plano objetivo: 1) confirmar objetivo e restricoes, "
            "2) dividir em etapas pequenas e seguras, "
            "3) validar resultado antes de concluir."
        )
        return f"{message}{plan_summary}"

    def _auto_verify_response(
        self,
        *,
        message: str,
        request: BrainRequest,
        intent: str,
        context: ContextSnapshot,
        should_search_web: bool,
    ) -> str:
        normalized_message = normalize_text(message)
        unverifiable_claims = {
            "eu executei",
            "ja executei",
            "eu rodei",
            "ja rodei",
            "eu testei",
            "ja testei",
            "corrigi",
            "fiz deploy",
            "publiquei",
        }
        if any(claim in normalized_message for claim in unverifiable_claims):
            return (
                "Nao consigo confirmar execucao real sem validar por ferramentas. "
                "Posso executar o fluxo seguro de verificacao e te reportar o resultado."
            )

        if should_search_web and any(term in normalized_message for term in {"pesquisei", "acabei de pesquisar"}):
            return (
                "Posso pesquisar fontes externas com sua confirmacao antes de afirmar resultados online. "
                "Enquanto isso, sigo com a melhor resposta local disponivel."
            )

        if intent == "request.incomplete" and not context.recent_messages:
            return (
                "Entendi seu pedido, mas ainda nao tenho contexto suficiente para inferir 'isso'. "
                "Me diga em uma frase qual parte voce quer alterar que eu continuo dali."
            )

        if normalize_text(request.text) == normalize_text(message):
            return "Entendi. Vou te responder de forma mais objetiva e util com base no contexto atual."

        return message

    def _build_quick_plan_response(self, *, request_text: str) -> str | None:
        asks_for_plan = "plano" in request_text and ("passo" in request_text or "etapa" in request_text)
        asks_three_steps = any(token in request_text for token in {"3 passos", "tres passos", "3 etapas"})
        remote_productivity = "trabalho remoto" in request_text and "produtividade" in request_text

        if remote_productivity and (asks_for_plan or asks_three_steps):
            return (
                "Plano de 3 passos para esta semana:\n"
                "1. Prioridades: escolha 3 entregas-chave da semana e quebre cada uma "
                "em uma tarefa de 45-90 minutos por dia. "
                "Comece sempre pela tarefa de maior impacto antes de abrir chat ou email.\n"
                "2. Comunicacao: envie um update curto no inicio e no fim do dia "
                "(o que vai fazer, bloqueios, proximo passo). "
                "Isso reduz retrabalho e acelera decisoes sem reunioes longas.\n"
                "3. Energia mental: trabalhe em blocos (50 min foco + 10 min pausa), "
                "proteja 2 blocos por dia sem notificacao "
                "e encerre com revisao de 5 minutos para planejar o dia seguinte."
            )

        return None

    def _build_dev_copilot_response(self, *, request_text: str) -> str | None:
        dev_terms = {
            "projeto",
            "sistema",
            "codigo",
            "api",
            "backend",
            "frontend",
            "bug",
            "teste",
            "documentacao",
            "performance",
            "otimizar",
            "refatorar",
            "deploy",
        }
        asks_for_build = any(term in request_text for term in {"criar", "gerar", "montar", "planejar"})
        asks_for_fix = any(term in request_text for term in {"corrigir", "consertar", "ajustar", "erro", "bug"})
        asks_for_tests = any(term in request_text for term in {"teste", "testes", "validar", "qa"})
        asks_for_docs = any(term in request_text for term in {"documentacao", "docs", "explicar", "arquitetura"})
        has_dev_context = any(term in request_text for term in dev_terms)

        if not has_dev_context:
            return None

        if asks_for_build or asks_for_fix or asks_for_tests or asks_for_docs:
            return (
                "Posso atuar como copiloto de desenvolvimento com este fluxo profissional: "
                "1) analiso o contexto do projeto e dependencias, "
                "2) proponho implementacao minima segura, "
                "3) aplico alteracoes objetivas, "
                "4) executo testes automatizados e corrijo regressao, "
                "5) entrego resumo tecnico com decisoes e proximo passo. "
                "Nao afirmo teste, deploy ou correcao sem executar e validar. "
                "Se voce quiser, eu comeco agora pelo primeiro bloco: objetivo, stack e erro atual."
            )

        return None

    def _enrich_technical_teaching_message(
        self,
        *,
        message: str,
        request: BrainRequest,
        conversation_context: OrionConversationContext,
        cognitive_pipeline: OrionCognitivePipeline,
    ) -> str:
        normalized_message = normalize_text(message)
        if "exercicio" in normalized_message and "proximo passo" in normalized_message:
            return message

        normalized_text = normalize_text(request.text)
        topic = conversation_context.focus or "o assunto"
        if "programacao" in normalized_text or any(
            term in normalized_text for term in {"python", "javascript", "fastapi", "api", "docker", "git", "sql"}
        ):
            return (
                f"{message} Teoria: entenda o conceito central de {topic} antes de decorar comandos. "
                "Pratica: monte um exemplo pequeno e execute. Exercicio: altere uma parte e observe o resultado. "
                "Proximo passo: me diga seu nivel atual para eu ajustar a explicacao. "
                f"Modo: {cognitive_pipeline.response_style}."
            )
        return message

    def _enrich_mentor_message(self, *, message: str, request: BrainRequest) -> str:
        if "Portfolio:" in message:
            return message
        normalized_text = normalize_text(request.text)
        focus = "portfolio" if "portfolio" in normalized_text else "carreira"
        return (
            f"{message} Diagnostico: vamos mapear seu objetivo e seu nivel atual. "
            f"Plano: escolha uma trilha principal, crie um projeto de {focus}, publique no GitHub "
            "e registre aprendizados. "
            "Exercicio: descreva em uma frase a vaga ou papel que voce quer atingir."
        )

    def _enrich_consultant_message(self, *, message: str) -> str:
        if "Riscos:" in message:
            return message
        return (
            f"{message} Riscos: decidir sem diagnostico, medir apenas opiniao ou ignorar custo de manutencao. "
            "Proximo passo: defina objetivo, restricoes, opcoes e criterio de decisao."
        )

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
        dialogue_strategy: str | None = None,
        should_search_web: bool = False,
        search_query: str | None = None,
        response_mode: str | None = None,
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
            dialogue_strategy=dialogue_strategy,
            should_search_web=should_search_web,
            search_query=search_query,
            response_mode=response_mode,
        )

    def status(self) -> BrainStatus:
        return BrainStatus(
            status="ready",
            mode=BrainMode.DETERMINISTIC_FALLBACK,
            components={
                "memory": "volatile+user-sqlite+continuity",
                "planning": "allowlist",
                "execution": "side-effect-free",
                "learning": "metadata-only",
                "knowledge": "local-static",
                "orion_reasoning": "intent-emotion-context",
                "orion_memory": "profile-facts-summaries",
                "orion_cognitive_pipeline": "ten-stage-decision-flow",
                "orion_context": "style-focus-adaptation",
                "orion_intent": "deterministic-parser",
                "orion_dialogue_manager": "triple-layer-strategy",
                "conversation_manager": "adaptive-context-budget",
                "response_validation": "preflight-self-check",
                "portfolio_profile": "verified-profile-answers",
                "math_engine": "deterministic-calculation",
            },
            capabilities=[
                "conversation.reply",
                "knowledge.answer",
                "system.status",
                "user.name.memory",
                "user.context.continuity",
                "user.goal.memory",
                "conversation.initiative",
                "conversation.context.adaptation",
                "cognitive.pipeline.ten-stage",
                "technical.mentor.mode",
                "sales.negotiation.guidance",
                "senior.consultant.mode",
                "web.search.recommendation",
                "triple.layer.reasoning",
                "adaptive.context.selection",
                "response.self.validation",
                "portfolio.grounded.answers",
                "math.deterministic.execution",
            ],
            restrictions=[
                "localhost-only",
                "no-sensitive-data",
                "no-host-actions",
                "no-external-model",
                "no-sensitive-memory",
            ],
        )
