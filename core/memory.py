import os


class MemoryManager:
    """
    Gerencia o histórico de conversas por sessão do usuário
    para garantir que o Orion mantenha o contexto do diálogo.
    """

    def __init__(self, system_prompt_path="prompts/system_prompt.txt", max_history=15):
        self.system_prompt_path = system_prompt_path
        self.max_history = max_history
        self.sessions = {}
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self):
        """Carrega o prompt de sistema do arquivo de configuração."""
        if os.path.exists(self.system_prompt_path):
            with open(self.system_prompt_path, "r", encoding="utf-8") as f:
                return f.read().strip()
        return "Você é o Orion, um assistente virtual inteligente."

    def get_history(self, session_id: str):
        """Retorna o histórico da sessão ou inicializa com o System Prompt."""
        if session_id not in self.sessions:
            self.sessions[session_id] = [
                {"role": "system", "content": self.system_prompt}
            ]
        return self.sessions[session_id]

    def add_message(self, session_id: str, role: str, content: str):
        """
        Adiciona uma nova mensagem (user ou assistant) e limita
        o tamanho do histórico para não estourar a memória.
        """
        history = self.get_history(session_id)
        history.append({"role": role, "content": content})

        # Mantém apenas o system prompt [0] + as últimas N mensagens
        if len(history) > (self.max_history + 1):
            self.sessions[session_id] = [history[0]] + history[-self.max_history:]

    def clear_history(self, session_id: str):
        """Reseta a memória do Orion para essa sessão."""
        self.sessions[session_id] = [
            {"role": "system", "content": self.system_prompt}
        ]
