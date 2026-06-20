from app.brain.models import BrainPlan, ContextSnapshot, PlanStep
from app.brain.orion_intents import detect_intent
from app.brain.text import normalize_text, tokenize

STATUS_TERMS = {"estado", "online", "status"}
CREATOR_PHRASES = (
    "quem criou",
    "quem fez",
    "quem e seu criador",
    "seu criador",
    "criador do orion",
)
USER_IDENTITY_PHRASES = (
    "quem sou eu",
    "voce sabe quem eu sou",
)


class PlanningService:
    def create_plan(self, *, text: str, context: ContextSnapshot) -> BrainPlan:
        tokens = tokenize(text)
        normalized_text = normalize_text(text)
        detected_intent = detect_intent(text)

        if any(phrase in normalized_text for phrase in CREATOR_PHRASES):
            intent = "identity.creator"
        elif any(phrase in normalized_text for phrase in USER_IDENTITY_PHRASES):
            intent = "identity.user"
        elif tokens & STATUS_TERMS:
            intent = "system.status"
        elif context.knowledge_hits and detected_intent == "question.general":
            intent = "knowledge.answer"
        else:
            intent = detected_intent

        return BrainPlan(
            intent=intent,
            steps=[
                PlanStep(action="context.read", reason="Consultar memoria volatil da conversa."),
                PlanStep(action="knowledge.search", reason="Consultar conhecimento local permitido."),
                PlanStep(action="response.compose", reason="Compor resposta local sem efeitos colaterais."),
            ],
        )
