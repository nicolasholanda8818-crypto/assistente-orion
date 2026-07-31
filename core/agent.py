import os
from openai import OpenAI
from core.memory import MemoryManager

class OrionAgent:
    """
    O Cérebro do Orion: gerencia as chamadas para a API de Inteligência Artificial
    integrando o histórico de conversas e o prompt de sistema.
    """
    def __init__(self, api_key=None, model="gpt-4o-mini"):
        # Puxa a chave da API do ambiente ou usa a passada por parâmetro
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)
        self.model = model
        self.memory = MemoryManager()

    def process_message(self, session_id: str, user_message: str) -> str:
        """
        Processa a mensagem do usuário, envia para a LLM junto com o histórico
        e retorna a resposta mantendo o contexto.
        """
        if not user_message.strip():
            return "Por favor, digite ou fale algo para eu poder ajudar."

        # 1. Adiciona a mensagem do usuário na memória da sessão
        self.memory.add_message(session_id, "user", user_message)

        # 2. Pega todo o histórico atualizado (System Prompt + Histórico)
        messages_history = self.memory.get_history(session_id)

        try:
            # 3. Chama a API da IA
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages_history,
                temperature=0.7
            )

            bot_reply = response.choices[0].message.content

            # 4. Salva a resposta do Orion no histórico
            self.memory.add_message(session_id, "assistant", bot_reply)

            return bot_reply

        except Exception as e:
            return (
                f"Erro de conexão com o cérebro do Orion: {str(e)} "
                "(Nota: se estiver usando o modelo da OpenAI, certifique-se de que a biblioteca `openai` está instalada "
                "no seu ambiente executando `pip install openai`)."
            )
