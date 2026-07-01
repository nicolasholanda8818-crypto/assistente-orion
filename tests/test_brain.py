import pytest

from app.brain.execution import ExecutionService, UnsafePlanError
from app.brain.knowledge import KnowledgeService
from app.brain.learning import LearningService
from app.brain.memory import MemoryService
from app.brain.models import BrainPlan, BrainRequest, ContextSnapshot, PlanStep
from app.brain.orion_cognitive_pipeline import COGNITIVE_STAGE_NAMES, build_cognitive_pipeline
from app.brain.orion_context import build_orion_context
from app.brain.orion_dialogue_manager import should_use_web_search
from app.brain.orion_intent import analyze_intent
from app.brain.orion_intents import classify_emotion, detect_intent, extract_keywords, is_question
from app.brain.orion_memory import build_orion_memory_context
from app.brain.planning import PlanningService
from app.brain.service import BrainService
from app.brain.user_memory import UserMemorySnapshot


def test_brain_status_exposes_separated_components():
    status = BrainService().status()

    assert status.status == "ready"
    assert status.components == {
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
    }
    assert "no-host-actions" in status.restrictions
    assert "user.context.continuity" in status.capabilities
    assert "conversation.context.adaptation" in status.capabilities
    assert "cognitive.pipeline.ten-stage" in status.capabilities
    assert "technical.mentor.mode" in status.capabilities
    assert "sales.negotiation.guidance" in status.capabilities


def test_brain_processes_status_and_records_volatile_context():
    brain = BrainService()

    response = brain.process(BrainRequest(text="Orion, status"))

    assert response.intent == "system.status"
    assert response.message == "Orion Brain esta online em modo local deterministico."
    assert brain.memory.count() == 2
    assert brain.learning.count() == 1


def test_brain_answers_from_local_knowledge():
    brain = BrainService()

    response = brain.process(BrainRequest(text="Quais sao os componentes do brain?"))

    assert response.intent == "knowledge.answer"
    assert "memoria, planejamento, execucao, aprendizado e conhecimento" in response.message
    assert response.context.knowledge_hits >= 1


def test_brain_identifies_orion_creator_without_external_model():
    brain = BrainService()

    response = brain.process(BrainRequest(text="Orion, quem criou voce?"))

    assert response.intent == "identity.creator"
    assert response.message == "Meu criador e Nicolas Keven Lopes de Holanda."


def test_brain_identifies_current_admin_user_without_external_model():
    brain = BrainService()

    response = brain.process(BrainRequest(text="Orion, quem sou eu?"))

    assert response.intent == "identity.user"
    assert "Nicolas Keven Lopes de Holanda" in response.message


@pytest.mark.parametrize(
    ("text", "expected_intent"),
    [
        ("oi", "greeting"),
        ("quem e voce?", "identity.self"),
        ("quem criou voce?", "identity.creator"),
        ("me ajuda a estudar", "study"),
        ("estou cansado", "user.feeling"),
        ("quero jogar", "games"),
        ("meu saldo", "finance"),
        ("nao entendi nada", "user.feeling"),
        ("Orion, fala comigo", "greeting"),
        ("vamos conversar", "conversation.reply"),
        ("lembra de mim?", "memory.recall"),
        ("voltei", "returning"),
        ("meu objetivo e publicar o Orion", "goal.setting"),
        ("prefiro respostas curtas", "preference.update"),
        ("quero vender um servico", "sales"),
        ("o cliente disse que esta caro", "objection.price"),
        ("me ajude a negociar", "negotiation"),
        ("crie uma mensagem para cliente", "sales.message"),
        ("fale como consultor", "consultant.senior"),
        ("quero melhorar meu portfolio", "career.mentor"),
        ("mensagem aleatoria de teste", "conversation.reply"),
    ],
)
def test_orion_conversation_engine_always_answers_examples(text, expected_intent):
    response = BrainService().process(BrainRequest(text=text))

    assert response.intent == expected_intent
    assert response.message
    assert response.avatar_mood
    assert response.avatar_reaction
    assert response.suggested_animation
    assert response.reasoning_state
    assert response.response_length in {"short", "medium", "long"}
    assert response.urgency in {"low", "normal", "high"}
    assert response.should_speak is True


def test_orion_commercial_reasoning_guides_sales_and_negotiation():
    brain = BrainService()

    sales = brain.process(BrainRequest(text="quero vender um servico"))
    objection = brain.process(BrainRequest(text="o cliente disse que esta caro"))
    consultant = brain.process(BrainRequest(text="fale como consultor"))

    assert sales.intent == "sales"
    assert sales.response_mode == "sales"
    assert "cliente final" in sales.message or "tipo de cliente" in sales.message
    assert objection.intent == "objection.price"
    assert "preco" in objection.message
    assert consultant.intent == "consultant.senior"
    assert "sem fingir experiencia humana real" in consultant.message


def test_orion_recommends_web_search_for_recent_information_without_leaking_memory():
    response = BrainService().process(BrainRequest(text="qual e a versao mais recente do FastAPI"))

    assert response.should_search_web is True
    assert response.search_query == "qual e a versao mais recente do FastAPI"
    assert response.dialogue_strategy == "web-search-recommended"


def test_orion_blocks_web_search_decision_for_sensitive_query():
    assert should_use_web_search("pesquise meu token secreto") is False


def test_orion_teaches_programming_with_theory_practice_and_exercise():
    response = BrainService().process(BrainRequest(text="me ensina programacao em Python"))

    assert response.intent == "study"
    assert "Teoria:" in response.message
    assert "Pratica:" in response.message
    assert "Exercicio:" in response.message
    assert response.response_mode == "teacher"


def test_orion_technical_mentor_guides_career_and_portfolio():
    response = BrainService().process(BrainRequest(text="quero melhorar meu portfolio para entrevista de emprego"))

    assert response.intent == "career.mentor"
    assert response.response_mode == "mentor"
    assert "Diagnostico:" in response.message
    assert "GitHub" in response.message


def test_orion_cognitive_pipeline_has_ten_ordered_stages():
    snapshot = UserMemorySnapshot(
        user_id="cognitive-pipeline-test",
        display_name="Nicolas",
        projects=["Orion"],
    )
    memory_context = build_orion_memory_context(snapshot=snapshot, user_text="me ensina FastAPI", intent="study")
    conversation_context = build_orion_context(
        user_text="me ensina FastAPI",
        snapshot=snapshot,
        memory_context=memory_context,
        intent="study",
        keywords=["ensina", "fastapi"],
    )
    pipeline = build_cognitive_pipeline(
        intent="study",
        emotion="neutral",
        keywords=["ensina", "fastapi"],
        memory_context=memory_context,
        conversation_context=conversation_context,
        context=ContextSnapshot(recent_messages=[], relevant_memories=[], knowledge_hits=[]),
        should_search_web=False,
    )

    assert pipeline.stage_count == 10
    assert tuple(stage.name for stage in pipeline.stages) == COGNITIVE_STAGE_NAMES
    assert pipeline.response_style in {"guided-teaching", "technical-teaching"}


@pytest.mark.parametrize(
    "text",
    [
        "oi",
        "como voce esta?",
        "estou cansado",
        "quero melhorar o Orion",
        "me ajuda",
        "lembra de mim?",
        "vamos conversar",
        "me ensina programacao",
        "nao sei o que fazer",
    ],
)
def test_orion_professional_conversation_examples_always_get_contextual_answer(text):
    response = BrainService().process(BrainRequest(text=text))

    assert response.message
    assert response.message.strip().lower() not in {"entendi.", "ok.", "certo."}
    assert response.avatar_mood
    assert response.reasoning_state in {"answering", "clarifying", "thinking"}
    assert response.should_speak is True


def test_orion_asks_targeted_question_when_user_wants_to_improve_orion():
    response = BrainService().process(BrainRequest(text="quero melhorar o Orion"))

    assert "visual" in response.message
    assert "memoria" in response.message
    assert "voz" in response.message
    assert "comportamento" in response.message
    assert "quero como foco" not in response.message


def test_orion_keeps_user_continuity_between_feeling_and_return():
    user_id = "brain-continuity-test"
    brain = BrainService()

    brain.process(BrainRequest(text="Nicolas", user_id=user_id, conversation_id="continuity"))
    tired = brain.process(BrainRequest(text="estou cansado", user_id=user_id, conversation_id="continuity"))
    returning = brain.process(BrainRequest(text="voltei", user_id=user_id, conversation_id="continuity"))

    assert "cansado" in tired.message
    assert "Conseguiu descansar?" in returning.message
    assert returning.user_name == "Nicolas"


def test_orion_context_classifies_style_and_depth_from_user_signal():
    snapshot = UserMemorySnapshot(
        user_id="context-style-test",
        display_name="Nicolas",
        topics=["python"],
    )
    memory_context = build_orion_memory_context(
        snapshot=snapshot,
        user_text="erro no backend python",
        intent="technical",
    )

    context = build_orion_context(
        user_text="erro no backend python",
        snapshot=snapshot,
        memory_context=memory_context,
        intent="technical",
        keywords=["erro", "backend", "python"],
    )

    assert context.style == "technical"
    assert context.depth == "technical"
    assert context.focus


@pytest.mark.parametrize("text", ["estou cansado", "quero melhorar isso", "me ajuda", "nao sei o que fazer"])
def test_orion_reasoning_handles_human_conversation_edges(text):
    response = BrainService().process(BrainRequest(text=text))

    assert response.message
    assert response.reasoning_state in {"clarifying", "answering", "thinking"}
    assert response.avatar_mood


def test_orion_intents_extract_keywords_and_emotion():
    assert detect_intent("me ajuda com um erro no backend") == "help"
    assert classify_emotion("estou cansado") == "tired"
    assert classify_emotion("estou preocupado") == "worried"
    assert "backend" in extract_keywords("me ajuda com um erro no backend")
    assert is_question("quem e voce?")


def test_orion_intent_analysis_marks_memory_relevant_context():
    analysis = analyze_intent("meu objetivo e melhorar o Orion")

    assert analysis.intent == "goal.setting"
    assert analysis.should_remember is True
    assert analysis.needs_clarification is False


def test_orion_memory_context_prioritizes_feeling_continuity():
    snapshot = UserMemorySnapshot(
        user_id="browser-brain-context",
        display_name="Nicolas",
        projects=["Orion"],
        goals=["publicar o Orion"],
        recent_feelings=["cansado"],
    )

    context = build_orion_memory_context(snapshot=snapshot, user_text="voltei", intent="returning")

    assert context.has_persistent_context is True
    assert context.continuity_hint == "Mais cedo voce comentou que estava cansado. Conseguiu descansar?"
    assert "nome: Nicolas" in context.profile_summary


def test_memory_isolated_by_conversation():
    memory = MemoryService(short_limit=4)
    memory.remember(conversation_id="alpha", role="user", content="assunto privado alpha")
    memory.remember(conversation_id="beta", role="user", content="assunto privado beta")

    context = memory.build_context(query="privado", conversation_id="alpha", knowledge_hits=[])

    assert len(context.recent_messages) == 1
    assert context.recent_messages[0].conversation_id == "alpha"


def test_learning_records_metadata_without_message_content():
    learning = LearningService()
    plan = PlanningService().create_plan(
        text="conversa simples",
        context=ContextSnapshot(recent_messages=[], relevant_memories=[], knowledge_hits=[]),
    )
    execution = ExecutionService().execute(
        plan=plan,
        context=ContextSnapshot(recent_messages=[], relevant_memories=[], knowledge_hits=[]),
    )

    event = learning.record(plan=plan, execution=execution)

    assert event.intent == "conversation.reply"
    assert not hasattr(event, "content")


def test_execution_rejects_actions_outside_allowlist():
    plan = BrainPlan(
        intent="unsafe",
        steps=[PlanStep(action="host.shutdown", reason="Nao permitido no Brain baseline.")],
    )

    with pytest.raises(UnsafePlanError, match="host.shutdown"):
        ExecutionService().execute(
            plan=plan,
            context=ContextSnapshot(recent_messages=[], relevant_memories=[], knowledge_hits=[]),
        )


def test_knowledge_search_uses_local_entries():
    hits = KnowledgeService().search("seguranca localhost")

    assert hits[0].entry_id == "security-localhost"


def test_technical_knowledge_base_contains_deploy_and_support_topics():
    hits = KnowledgeService().search("docker render websocket pwa")

    contents = " ".join(hit.content.lower() for hit in hits)
    assert "render" in contents
    assert "websocket" in contents or "wss" in contents
