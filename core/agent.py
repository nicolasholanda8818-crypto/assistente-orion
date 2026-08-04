import os
import sys
import io
from openai import OpenAI
from core.memory import MemoryManager
from core.router import MultiAgentRouter

class OrionAgent:
    def __init__(self, api_key=None, model="gpt-4o-mini"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        self.model = model
        self.memory = MemoryManager()
        self.router = MultiAgentRouter()

        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
            except Exception as e:
                print(f"⚠️ Erro ao inicializar cliente OpenAI: {e}")

    def process_message(self, session_id: str, user_message: str, image_b64: str = None) -> dict:
        if not user_message.strip() and not image_b64:
            return {"reply": "Por favor, envie um comando para eu ajudar.", "thought": "Entrada vazia."}

        if not self.client:
            return {
                "reply": "⚠️ **Orion Offline**: Defina a variável `OPENAI_API_KEY` nas variáveis de ambiente.",
                "thought": "Falha de credencial."
            }

        # 1. Orquestração e Roteamento
        route_info = self.router.route_and_execute(user_message, self)
        agent_name = route_info["agent"]
        thought_process = route_info["thought"]
        additional_context = route_info["context"]

        # 1.1. Atualiza perfil do usuário e tom com base na mensagem
        if user_message.strip():
            self.memory.extract_and_update_profile(session_id, user_message)

        # Se for execução direta de código, já retorna o resultado
        if agent_name == "Code & Math Specialist":
            return {"reply": additional_context, "thought": thought_process}

        # 2. Injeção de Contexto Multimodal/Agentes
        final_prompt = user_message
        if additional_context:
            final_prompt = f"{additional_context}\n\n[PERGUNTA DO USUÁRIO]: {user_message}"

        if image_b64:
            content = [
                {"type": "text", "text": final_prompt or "Analise esta imagem detalhadamente."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
            ]
            self.memory.add_message(session_id, "user", "[ENVIOU UMA IMAGEM DO MUNDO REAL]")
        else:
            content = final_prompt
            self.memory.add_message(session_id, "user", user_message)

        messages_history = self.memory.get_history(session_id)
        if image_b64:
            messages_history[-1] = {"role": "user", "content": content}

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages_history,
                temperature=0.7
            )

            bot_reply = response.choices[0].message.content
            self.memory.add_message(session_id, "assistant", bot_reply)

            return {
                "reply": bot_reply,
                "thought": f"[{agent_name}] {thought_process}"
            }

        except Exception as e:
            return {"reply": f"Erro no cérebro do Orion: {str(e)}", "thought": "Erro de execução."}

    def _execute_python_code(self, code: str) -> str:
        old_stdout = sys.stdout
        redirected_output = sys.stdout = io.StringIO()
        try:
            exec_globals = {"__builtins__": __builtins__}
            exec(code, exec_globals)
            output = redirected_output.getvalue()
            return f"🤖 **Resultado da Execução:**\n```\n{output if output else 'Código executado com sucesso sem saída.'}\n```"
        except Exception as e:
            return f"⚠️ Erro ao executar código: {str(e)}"
        finally:
            sys.stdout = old_stdout

    def process_pdf_context(self, session_id: str, pdf_text: str, filename: str) -> dict:
        # Armazena o PDF no Banco Vetorial RAG
        self.router.vector_db.add_document(doc_id=filename, text=pdf_text)
        
        confirm_msg = f"Documento `{filename}` indexado com sucesso no Banco Vetorial RAG! Você já pode fazer perguntas sobre o arquivo."
        self.memory.add_message(session_id, "assistant", confirm_msg)
        return {"reply": confirm_msg, "thought": "Documento vetorizado e indexado no ChromaDB."}
