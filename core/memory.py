import re
import sqlite3
import os
from dataclasses import dataclass


@dataclass
class UserProfile:
    session_id: str
    user_name: str | None = None
    user_role: str | None = None
    sentiment_tone: str | None = None
    key_interests: str | None = None


class MemoryManager:
    """
    Gerenciador de Memória Persistente do Orion usando SQLite.
    """

    def __init__(self, db_path="orion_memory.db"):
        self.db_path = self._resolve_db_path(db_path)
        self._init_db()

    def _resolve_db_path(self, db_path: str) -> str:
        if os.getenv("VERCEL") or os.getenv("VERCEL_ENV"):
            return "/tmp/orion_memory.db"
        return os.getenv("ORION_MEMORY_DB_PATH", db_path)

    def _init_db(self):
        directory = os.path.dirname(self.db_path)
        if directory:
            os.makedirs(directory, exist_ok=True)

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
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_profiles (
                    session_id TEXT PRIMARY KEY,
                    user_name TEXT,
                    user_role TEXT,
                    sentiment_tone TEXT,
                    key_interests TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    def _load_full_system_prompt(self) -> str:
        """Carrega e une os prompts modulares da pasta prompts/."""
        prompts_dir = "prompts"
        combined_prompt = []

        if os.path.isdir(prompts_dir):
            files = sorted(
                [f for f in os.listdir(prompts_dir) if f.endswith(".txt")],
                key=lambda name: (0 if name == "system_prompt.txt" else 1, name)
            )

            for filename in files:
                filepath = os.path.join(prompts_dir, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        text = f.read().strip()
                        if text:
                            combined_prompt.append(text)
                except (OSError, IOError):
                    continue

        if not combined_prompt:
            return "Você é o Orion, uma IA avançada estilo Saturno Vivo."

        return "\n\n".join(combined_prompt)

    def _extract_name(self, text: str) -> str | None:
        patterns = [
            r"me chamo\s+([A-ZÀ-Ÿ][a-zà-ÿ]+)",
            r"sou o professor\s+([A-ZÀ-Ÿ][a-zà-ÿ]+)",
            r"sou a professora\s+([A-ZÀ-Ÿ][a-zà-ÿ]+)",
            r"sou o visitante\s+([A-ZÀ-Ÿ][a-zà-ÿ]+)",
            r"sou a visitante\s+([A-ZÀ-Ÿ][a-zà-ÿ]+)",
            r"meu nome é\s+([A-ZÀ-Ÿ][a-zà-ÿ]+)",
            r"meu nome e\s+([A-ZÀ-Ÿ][a-zà-ÿ]+)",
            r"chamo-me\s+([A-ZÀ-Ÿ][a-zà-ÿ]+)",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                return match.group(1).strip().title()
        return None

    def _extract_role(self, text: str) -> str | None:
        lower = text.lower()
        roles = {
            "professor": "Professor",
            "professora": "Professora",
            "aluno": "Aluno",
            "aluna": "Aluna",
            "estudante": "Estudante",
            "visitante": "Visitante",
            "pesquisador": "Pesquisador",
            "pesquisadora": "Pesquisadora",
            "orientador": "Orientador",
            "orientadora": "Orientadora",
        }
        for keyword, normalized in roles.items():
            if keyword in lower:
                return normalized
        return None

    def _extract_tone(self, text: str) -> str:
        lower = text.lower()
        formal_patterns = [
            r"\b(prezado|prezada|por favor|atenciosamente|gentileza|senhor|senhora|bom dia|boa tarde|boa noite)\b"
        ]
        casual_patterns = [
            r"\b(e aí|fala|beleza|show|opa|tudo bem|oi|eae|tranks|claro|massa|bacana)\b"
        ]

        for pattern in formal_patterns:
            if re.search(pattern, lower):
                return "Formal"
        for pattern in casual_patterns:
            if re.search(pattern, lower):
                return "Descontraído"
        return "Neutro/Curioso"

    def _extract_interests(self, text: str, previous: str | None = None) -> str | None:
        topics = [
            "inteligência artificial", "ia", "machine learning", "aprendizado de máquina",
            "tecnologia", "python", "dados", "negócios", "ciência", "filosofia",
            "arte", "engenharia", "saúde", "educação", "segurança", "robótica",
            "astronomia", "cosmos", "currículo", "pesquisa", "TCC", "mídia"
        ]
        found = set()
        lower = text.lower()
        for topic in topics:
            if topic in lower:
                found.add(topic.title())

        if previous:
            for topic in re.split(r"\s*,\s*", previous):
                if topic:
                    found.add(topic)

        return ", ".join(sorted(found)) if found else None

    def _upsert_user_profile(self, profile: UserProfile):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                    INSERT INTO user_profiles (session_id, user_name, user_role, sentiment_tone, key_interests)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(session_id) DO UPDATE SET
                        user_name = COALESCE(excluded.user_name, user_name),
                        user_role = COALESCE(excluded.user_role, user_role),
                        sentiment_tone = COALESCE(excluded.sentiment_tone, sentiment_tone),
                        key_interests = COALESCE(excluded.key_interests, key_interests),
                        updated_at = CURRENT_TIMESTAMP
                """,
                (
                    profile.session_id,
                    profile.user_name,
                    profile.user_role,
                    profile.sentiment_tone,
                    profile.key_interests,
                )
            )
            conn.commit()

    def get_user_profile(self, session_id: str) -> UserProfile | None:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT session_id, user_name, user_role, sentiment_tone, key_interests FROM user_profiles WHERE session_id = ?",
                (session_id,)
            )
            row = cursor.fetchone()
            if not row:
                return None
            return UserProfile(
                session_id=row[0],
                user_name=row[1],
                user_role=row[2],
                sentiment_tone=row[3],
                key_interests=row[4],
            )

    def extract_and_update_profile(self, session_id: str, user_message: str) -> UserProfile:
        existing = self.get_user_profile(session_id) or UserProfile(session_id=session_id)
        extracted_name = existing.user_name or self._extract_name(user_message)
        extracted_role = existing.user_role or self._extract_role(user_message)
        extracted_tone = self._extract_tone(user_message)
        extracted_interests = self._extract_interests(user_message, existing.key_interests)

        updated = UserProfile(
            session_id=session_id,
            user_name=extracted_name,
            user_role=extracted_role,
            sentiment_tone=extracted_tone,
            key_interests=extracted_interests,
        )

        self._upsert_user_profile(updated)
        return updated

    def _format_profile_context(self, profile: UserProfile) -> str | None:
        if not profile:
            return None

        components = []
        if profile.user_name:
            components.append(f"Nome: {profile.user_name}")
        if profile.user_role:
            components.append(f"Papel: {profile.user_role}")
        if profile.sentiment_tone:
            components.append(f"Tom: {profile.sentiment_tone}")
        if profile.key_interests:
            components.append(f"Interesses: {profile.key_interests}")

        if not components:
            return None

        return f"[PERFIL ATUAL DO INTERLOCUTOR: {' | '.join(components)}]"

    def add_message(self, session_id: str, role: str, content: str):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO history (session_id, role, content) VALUES (?, ?, ?)",
                (session_id, role, content)
            )
            conn.commit()

    def get_history(self, session_id: str, limit: int = 15) -> list:
        system_prompt = self._load_full_system_prompt()
        messages = [{"role": "system", "content": system_prompt}]

        profile = self.get_user_profile(session_id)
        profile_context = self._format_profile_context(profile) if profile else None
        if profile_context:
            messages.append({"role": "system", "content": profile_context})

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
            cursor.execute("DELETE FROM user_profiles WHERE session_id = ?", (session_id,))
            conn.commit()
