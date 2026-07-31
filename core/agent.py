import os
import base64
import sys
import io
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

        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
            except Exception as e:
                print(f"⚠️ Erro ao inicializar cliente OpenAI: {e}")

    def process_message(self, session_id: str, user_message: str, image_b64: str = None) -> str:
        if not user_message.strip() and not image_b64:
            return "Por favor, envie um comando para eu ajudar."

        if not self.client:
            return "⚠️ **Orion Offline**: Defina a variável `OPENAI_API_KEY` para ativar a IA."

        # Execução de Código Python em Tempo Real
        if user_message.lower().startswith("executar:") or user_message.lower().startswith("calcular:"):
            code = user_message.split(":", 1)[1].strip()
            return self._execute_python_code(code)

        # Pesquisa Web
        if user_message.lower().startswith("pesquisar:") or "pesquise na web" in user_message.lower():
            query = user_message.replace("pesquisar:", "").replace("pesquise na web", "").strip()
            search_context = self.tools.search_web(query)
            user_message = f"[RESULTADOS DA WEB PARA: '{query}']\n{search_context}\n\n[INSTRUÇÃO]: Responda com base nestes dados."

        # Suporte a Visão Computacional
        if image_b64:
            content = [
                {"type": "text", "text": user_message or "Analise esta imagem detalhadamente."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
            ]
            self.memory.add_message(session_id, "user", "[ENVIOU UMA IMAGEM DO MUNDO REAL]")
        else:
            content = user_message
            self.memory.add_message(session_id, "user", user_message)

        messages_history = self.memory.get_history(session_id)

        # Atualiza a última mensagem do usuário se for multimodal
        if image_b64:
            messages_history[-1] = {"role": "user", "content": content}

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages_history,
                max_tokens=800
            )

            bot_reply = response.choices[0].message.content
            self.memory.add_message(session_id, "assistant", bot_reply)
            return bot_reply

        except Exception as e:
            return f"Erro no cérebro do Orion: {str(e)}"

    def _execute_python_code(self, code: str) -> str:
        """Executa scripts Python em ambiente isolado para dados e matemática."""
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

    def process_pdf_context(self, session_id: str, pdf_text: str, filename: str) -> str:
        context_msg = f"[DOCUMENTO CARREGADO: {filename}]\nConteúdo:\n{pdf_text[:3000]}...\n\nConfirme a leitura."
        return self.process_message(session_id, context_msg)
