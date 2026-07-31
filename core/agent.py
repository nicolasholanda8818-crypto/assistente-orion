import os
from openai import OpenAI
from core.memory import MemoryManager
from core.tools import OrionTools

class OrionAgent:
    def __init__(self, api_key=None, model="gpt-4o-mini"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        self.model = model
        self.memory = MemoryManager()
        self.tools = OrionTools()

        # Só instancia o cliente OpenAI se houver uma chave válida
        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
            except Exception as e:
                print(f"⚠️ Erro ao inicializar cliente OpenAI: {e}")

    def process_message(self, session_id: str, user_message: str) -> str:
        if not user_message.strip():
            return "Por favor, envie um comando para eu ajudar."

        # Se não houver API KEY configurada, alerta sem derrubar o servidor
        if not self.client:
            return (
                "⚠️ **Orion em Modo Offline**: A chave `OPENAI_API_KEY` não foi detectada nas variáveis de ambiente. "
                "Por favor, adicione sua API Key no painel do Render/Ambiente."
            )

        # Processamento de Pesquisa Web
        if user_message.lower().startswith("pesquisar:") or "pesquise na web" in user_message.lower():
            query = user_message.replace("pesquisar:", "").replace("pesquise na web", "").strip()
            search_context = self.tools.search_web(query)
            user_message = (
                f"[RESULTADOS DA WEB PARA: '{query}']\n{search_context}\n\n"
                "[INSTRUÇÃO]: Responda ao usuário com base nesses dados."
            )

        self.memory.add_message(session_id, "user", user_message)
        messages_history = self.memory.get_history(session_id)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages_history,
                temperature=0.7
            )

            bot_reply = response.choices[0].message.content
            self.memory.add_message(session_id, "assistant", bot_reply)
            return bot_reply

        except Exception as e:
            return f"Erro de conexão com o cérebro da OpenAI: {str(e)}"

    def process_pdf_context(self, session_id: str, pdf_text: str, filename: str) -> str:
        context_msg = (
            f"[DOCUMENTO CARREGADO: {filename}]\nConteúdo:\n{pdf_text[:3000]}...\n\n"
            "[INSTRUÇÃO]: Confirme ao usuário que leu o documento e está pronto para tirar dúvidas sobre ele."
        )
        return self.process_message(session_id, context_msg)
