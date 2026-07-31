import sqlite3
import json
import os


class MemoryManager:
    """
    Gerenciador de Memória Persistente do Orion usando SQLite.
    """

    def __init__(self, db_path="orion_memory.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    role TEXT,
                    content TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    def add_message(self, session_id: str, role: str, content: str):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO history (session_id, role, content) VALUES (?, ?, ?)",
                (session_id, role, content)
            )
            conn.commit()

    def get_history(self, session_id: str, limit: int = 15) -> list:
        # Puxa o System Prompt
        prompt_file = os.path.join("prompts", "system_prompt.txt")
        system_prompt = "Você é o Orion, uma IA avançada estilo Saturno Vivo."
        if os.path.exists(prompt_file):
            with open(prompt_file, "r", encoding="utf-8") as f:
                system_prompt = f.read()

        messages = [{"role": "system", "content": system_prompt}]

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT role, content FROM history WHERE session_id = ? ORDER BY id DESC LIMIT ?",
                (session_id, limit)
            )
            rows = cursor.fetchall()
            for role, content in reversed(rows):
                messages.append({"role": role, "content": content})

        return messages

    def clear_memory(self, session_id: str):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM history WHERE session_id = ?", (session_id,))
            conn.commit()
