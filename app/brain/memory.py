from collections import deque

from app.brain.conversation_manager import has_implicit_reference
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
        recent_limit: int = 6,
        relevant_limit: int = 3,
        knowledge_limit: int = 3,
    ) -> ContextSnapshot:
        conversation_entries = [entry for entry in self._entries if entry.conversation_id == conversation_id]
        relevant_scored = sorted(
            (entry for entry in conversation_entries if similarity_score(query, entry.content) > 0),
            key=lambda entry: similarity_score(query, entry.content),
            reverse=True,
        )

        relevant = relevant_scored[:relevant_limit]
        if has_implicit_reference(query) and not relevant:
            # Referencias vagas como "isso" ou "aquele negocio" precisam puxar o fio recente.
            recent_user_memory = [entry for entry in reversed(conversation_entries) if entry.role == "user"]
            recent_assistant_memory = [entry for entry in reversed(conversation_entries) if entry.role == "assistant"]
            fallback = []
            if recent_user_memory:
                fallback.append(recent_user_memory[0])
            if recent_assistant_memory:
                fallback.append(recent_assistant_memory[0])
            relevant = fallback[:relevant_limit]

        return ContextSnapshot(
            recent_messages=conversation_entries[-recent_limit:],
            relevant_memories=relevant,
            knowledge_hits=knowledge_hits[:knowledge_limit],
        )

    def count(self) -> int:
        return len(self._entries)
