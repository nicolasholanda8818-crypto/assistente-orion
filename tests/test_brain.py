import pytest

from app.brain.execution import ExecutionService, UnsafePlanError
from app.brain.knowledge import KnowledgeService
from app.brain.learning import LearningService
from app.brain.memory import MemoryService
from app.brain.models import BrainPlan, BrainRequest, ContextSnapshot, PlanStep
from app.brain.orion_intents import classify_emotion, detect_intent, extract_keywords, is_question
from app.brain.planning import PlanningService
from app.brain.service import BrainService


def test_brain_status_exposes_separated_components():
    status = BrainService().status()

    assert status.status == "ready"
    assert status.components == {
        "memory": "volatile+user-sqlite",
        "planning": "allowlist",
        "execution": "side-effect-free",
        "learning": "metadata-only",
        "knowledge": "local-static",
    }
    assert "no-host-actions" in status.restrictions


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


def test_orion_intents_extract_keywords_and_emotion():
    assert detect_intent("me ajuda com um erro no backend") == "help"
    assert classify_emotion("estou cansado") == "tired"
    assert "backend" in extract_keywords("me ajuda com um erro no backend")
    assert is_question("quem e voce?")


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
