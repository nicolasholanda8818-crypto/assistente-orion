from collections import deque

from app.brain.models import ContextSnapshot, KnowledgeEntry, MemoryEntry
from app.brain.text import similarity_score


class MemoryService:
    def __init__(self, short_limit: int = 12) -> None:
        if short_limit < 1:
            raise ValueError("Memory short limit must be positive.")
        self._entries: deque[MemoryEntry] = deque(maxlen=short_limit)

    def remember(self, *, conversation_id: str, role: str, content: str) -> MemoryEntry:
        entry = MemoryEntry(conversation_id=conversation_id, role=role, content=content)
        self._entries.append(entry)
        return entry

    def build_context(
        self,
        *,
        query: str,
        conversation_id: str,
        knowledge_hits: list[KnowledgeEntry],
    ) -> ContextSnapshot:
        conversation_entries = [entry for entry in self._entries if entry.conversation_id == conversation_id]
        relevant = sorted(
            (entry for entry in conversation_entries if similarity_score(query, entry.content) > 0),
            key=lambda entry: similarity_score(query, entry.content),
            reverse=True,
        )
        return ContextSnapshot(
            recent_messages=conversation_entries[-6:],
            relevant_memories=relevant[:3],
            knowledge_hits=knowledge_hits,
        )

    def count(self) -> int:
        return len(self._entries)
