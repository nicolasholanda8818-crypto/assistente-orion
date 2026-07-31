from core.tools import OrionTools
from core.vector_db import VectorMemory

class MultiAgentRouter:
    """
    Orquestrador Central: Analisa a solicitação do usuário e delega para os agentes especialistas.
    """
    def __init__(self):
        self.tools = OrionTools()
        self.vector_db = VectorMemory()

    def route_and_execute(self, user_message: str, agent_instance) -> dict:
        msg_lower = user_message.lower()

        # Agente 1: Executor de Código / Matemática
        if msg_lower.startswith("executar:") or msg_lower.startswith("calcular:"):
            code = user_message.split(":", 1)[1].strip()
            result = agent_instance._execute_python_code(code)
            return {
                "agent": "Code & Math Specialist",
                "thought": "Executando script Python em ambiente controlado...",
                "context": result
            }

        # Agente 2: Pesquisador Web
        elif msg_lower.startswith("pesquisar:") or "pesquise na web" in msg_lower:
            query = user_message.replace("pesquisar:", "").replace("pesquise na web", "").strip()
            web_results = self.tools.search_web(query)
            return {
                "agent": "Web Research Agent",
                "thought": f"Realizando busca profunda na web para: '{query}'...",
                "context": f"[DADOS DA WEB]:\n{web_results}"
            }

        # Agente 3: RAG Documental (Busca Vetorial)
        elif "no documento" in msg_lower or "no pdf" in msg_lower:
            relevant_chunks = self.vector_db.search_relevant(user_message)
            return {
                "agent": "Document Vector RAG Agent",
                "thought": "Recuperando fragmentos semânticos do banco vetorial...",
                "context": f"[DADOS VETORIAIS DO DOCUMENTO]:\n{relevant_chunks}"
            }

        # Agente Conversacional Geral
        return {
            "agent": "General Conversation Agent",
            "thought": "Analisando contexto histórico e intenção direta...",
            "context": None
        }
