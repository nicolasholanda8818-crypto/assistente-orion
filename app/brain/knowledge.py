from collections.abc import Iterable

from app.brain.models import KnowledgeEntry
from app.brain.text import similarity_score

DEFAULT_KNOWLEDGE = (
    KnowledgeEntry(
        entry_id="orion-brain",
        topic="orion brain",
        content="Orion Brain esta operando em modo local deterministico e sem efeitos colaterais.",
    ),
    KnowledgeEntry(
        entry_id="security-localhost",
        topic="seguranca localhost",
        content="A fundacao ORION permanece restrita a localhost ate o endurecimento de autenticacao e WebSocket.",
    ),
    KnowledgeEntry(
        entry_id="brain-components",
        topic="componentes do brain",
        content="O Brain separa memoria, planejamento, execucao, aprendizado e conhecimento.",
    ),
)


class KnowledgeService:
    def __init__(self, entries: Iterable[KnowledgeEntry] = DEFAULT_KNOWLEDGE) -> None:
        self._entries = list(entries)

    def search(self, query: str, limit: int = 3) -> list[KnowledgeEntry]:
        ranked = [(similarity_score(query, f"{entry.topic} {entry.content}"), entry) for entry in self._entries]
        ranked.sort(key=lambda item: item[0], reverse=True)
        return [entry for score, entry in ranked if score > 0][:limit]

    def count(self) -> int:
        return len(self._entries)
