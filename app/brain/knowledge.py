from collections.abc import Iterable

from app.brain.models import KnowledgeEntry
from app.brain.text import similarity_score

DEFAULT_KNOWLEDGE = (
    KnowledgeEntry(
        entry_id="orion-brain",
        topic="orion brain",
        content="Orion Brain esta operando em modo local deterministico e sem efeitos colaterais.",
    ),
    KnowledgeEntry(
        entry_id="security-localhost",
        topic="seguranca localhost",
        content="A fundacao ORION permanece restrita a localhost ate o endurecimento de autenticacao e WebSocket.",
    ),
    KnowledgeEntry(
        entry_id="brain-components",
        topic="componentes do brain",
        content="O Brain separa memoria, planejamento, execucao, aprendizado e conhecimento.",
    ),
    KnowledgeEntry(
        entry_id="programming-python-fastapi",
        topic="programacao python fastapi",
        content=(
            "Em Python com FastAPI, separe rotas, modelos, servicos e repositorios. "
            "Use validacao Pydantic, consultas parametrizadas e testes de API com TestClient."
        ),
    ),
    KnowledgeEntry(
        entry_id="frontend-pwa-websocket",
        topic="frontend pwa websocket",
        content=(
            "PWAs precisam de manifest, service worker, cache versionado e caminhos relativos ao host. "
            "Em HTTPS, WebSocket publico deve usar wss:// com window.location.host."
        ),
    ),
    KnowledgeEntry(
        entry_id="sqlite-debugging",
        topic="sqlite banco debugging",
        content=(
            "SQLite e adequado para uso local. Prefira migrations idempotentes, chaves por usuario, "
            "backup do arquivo do banco e isolamento de dados por owner_id."
        ),
    ),
    KnowledgeEntry(
        entry_id="github-docker-render",
        topic="git github docker render deploy",
        content=(
            "GitHub guarda o codigo. Docker padroniza execucao. Render hospeda o backend 24/7 "
            "quando o servico inicia FastAPI na porta esperada e recebe variaveis de ambiente seguras."
        ),
    ),
    KnowledgeEntry(
        entry_id="it-support-network-security",
        topic="gestao de ti redes seguranca suporte",
        content=(
            "No suporte tecnico, leia logs, reproduza o erro, isole rede, permissao, banco e frontend. "
            "Nunca exponha senhas, tokens, bancos reais ou uploads privados em repositorios publicos."
        ),
    ),
    KnowledgeEntry(
        entry_id="sales-funnel-ethical",
        topic="vendas prospeccao atendimento proposta valor funil",
        content=(
            "Em vendas eticas, comece pela descoberta da necessidade, valide a dor, conecte beneficios ao resultado, "
            "apresente proposta clara, combine proximo passo e faca follow-up sem pressionar o cliente."
        ),
    ),
    KnowledgeEntry(
        entry_id="negotiation-price-objection",
        topic="negociacao objecao preco caro desconto cliente",
        content=(
            "Quando o cliente diz que esta caro, nao reduza preco imediatamente. Pergunte se a comparacao e preco, "
            "resultado, prazo ou confianca; depois reforce valor e ofereca alternativas proporcionais."
        ),
    ),
    KnowledgeEntry(
        entry_id="senior-consultant-mode",
        topic="consultor senior ti vendas projetos produto automacao",
        content=(
            "O modo consultor senior deve responder com diagnostico, riscos, opcoes, recomendacao e proximo passo, "
            "sem afirmar experiencia humana real."
        ),
    ),
    KnowledgeEntry(
        entry_id="programming-teacher-levels",
        topic="professor programacao python javascript fastapi docker render git sql",
        content=(
            "Ao ensinar TI, adapte o nivel: iniciante recebe analogia e passo a passo; intermediario recebe padroes; "
            "avancado recebe trade-offs, riscos, testes e deploy."
        ),
    ),
    KnowledgeEntry(
        entry_id="document-analysis-support",
        topic="documentos ocr imagens suporte tecnico",
        content=(
            "Ao analisar prints e documentos, identifique mensagens de erro, contexto, caminho afetado "
            "e proximo teste seguro. OCR e leitura avancada devem ser opcionais e autorizados."
        ),
    ),
)


class KnowledgeService:
    def __init__(self, entries: Iterable[KnowledgeEntry] = DEFAULT_KNOWLEDGE) -> None:
        self._entries = list(entries)

    def search(self, query: str, limit: int = 3) -> list[KnowledgeEntry]:
        ranked = [(similarity_score(query, f"{entry.topic} {entry.content}"), entry) for entry in self._entries]
        ranked.sort(key=lambda item: item[0], reverse=True)
        return [entry for score, entry in ranked if score > 0][:limit]

    def count(self) -> int:
        return len(self._entries)
