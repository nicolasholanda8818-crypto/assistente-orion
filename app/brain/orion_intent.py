from dataclasses import dataclass

from app.brain.orion_intents import (
    classify_emotion,
    detect_intent,
    extract_entities,
    extract_keywords,
    needs_follow_up,
)


@dataclass(frozen=True)
class OrionIntentAnalysis:
    intent: str
    emotion: str
    keywords: list[str]
    entities: dict[str, list[str]]
    needs_clarification: bool
    is_returning: bool
    should_remember: bool


MEMORY_RELEVANT_INTENTS = {
    "study",
    "finance",
    "games",
    "music",
    "technical",
    "teacher",
    "goal.setting",
    "preference.update",
    "conversation.reply",
    "user.feeling",
}


def analyze_intent(text: str) -> OrionIntentAnalysis:
    intent = detect_intent(text)
    emotion = classify_emotion(text)
    keywords = extract_keywords(text)
    entities = extract_entities(text)

    return OrionIntentAnalysis(
        intent=intent,
        emotion=emotion,
        keywords=keywords,
        entities=entities,
        needs_clarification=needs_follow_up(text),
        is_returning=intent == "returning",
        should_remember=intent in MEMORY_RELEVANT_INTENTS or bool(keywords),
    )
