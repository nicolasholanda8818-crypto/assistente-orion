from typing import cast

from pydantic import BaseModel

from app.brain.models import BrainPlan, ContextSnapshot
from app.tools.models import ToolAvailability, ToolDefinition, ToolExecutionContext, ToolRisk
from app.tools.registry import ToolRegistry

BRAIN_PERMISSION = "brain.execute"


def read_context(context: ToolExecutionContext, _arguments: BaseModel) -> dict:
    snapshot = cast(ContextSnapshot, context.resources["context"])
    return {
        "recent_messages": len(snapshot.recent_messages),
        "relevant_memories": len(snapshot.relevant_memories),
    }


def search_knowledge(context: ToolExecutionContext, _arguments: BaseModel) -> dict:
    snapshot = cast(ContextSnapshot, context.resources["context"])
    return {"knowledge_hits": len(snapshot.knowledge_hits)}


def compose_response(context: ToolExecutionContext, _arguments: BaseModel) -> dict:
    snapshot = cast(ContextSnapshot, context.resources["context"])
    plan = cast(BrainPlan, context.resources["plan"])

    if plan.intent == "system.status":
        message = "Orion Brain esta online em modo local deterministico."
    elif plan.intent == "identity.creator":
        message = "Meu criador e Nicolas Keven Lopes de Holanda."
    elif plan.intent == "identity.user":
        message = "Voce e Nicolas Keven Lopes de Holanda, meu criador. Posso ajudar, Mestre?"
    elif snapshot.knowledge_hits:
        message = snapshot.knowledge_hits[0].content
    elif snapshot.relevant_memories:
        message = "Estou acompanhando o fio da conversa, Mestre. Pode continuar, eu mantenho o contexto recente comigo."
    elif snapshot.recent_messages:
        message = (
            "Estou aqui com voce. Ainda estou no modo local, "
            "mas consigo continuar respondendo sem travar a conversa."
        )
    else:
        message = (
            "Oi, Mestre. Eu sou o Orion. Ainda estou em fallback local, "
            "mas vou responder sempre que voce falar comigo."
        )

    return {"message": message}


def create_default_registry() -> ToolRegistry:
    registry = ToolRegistry()
    registry.register(
        ToolDefinition(
            name="context.read",
            description="Consultar o resumo do contexto volatil da conversa atual.",
            availability=ToolAvailability.ENABLED,
            risk=ToolRisk.INTERNAL,
            required_permissions=[BRAIN_PERMISSION],
        ),
        handler=read_context,
    )
    registry.register(
        ToolDefinition(
            name="knowledge.search",
            description="Consultar resultados de conhecimento local previamente permitidos.",
            availability=ToolAvailability.ENABLED,
            risk=ToolRisk.INTERNAL,
            required_permissions=[BRAIN_PERMISSION],
        ),
        handler=search_knowledge,
    )
    registry.register(
        ToolDefinition(
            name="response.compose",
            description="Compor resposta textual local sem efeitos colaterais.",
            availability=ToolAvailability.ENABLED,
            risk=ToolRisk.INTERNAL,
            required_permissions=[BRAIN_PERMISSION],
        ),
        handler=compose_response,
    )
    registry.register(
        ToolDefinition(
            name="control.open_program",
            description="Abrir programa permitido pelo modulo Orion Control.",
            availability=ToolAvailability.PLANNED,
            risk=ToolRisk.PRIVILEGED,
            required_permissions=["control.program.open"],
            requires_confirmation=True,
            ticket="T0031",
        )
    )
    registry.register(
        ToolDefinition(
            name="files.read",
            description="Ler arquivo autorizado pelo modulo Orion Files.",
            availability=ToolAvailability.PLANNED,
            risk=ToolRisk.READ_ONLY,
            required_permissions=["files.read"],
            ticket="T0020",
        )
    )
    registry.register(
        ToolDefinition(
            name="finance.get_balance",
            description="Consultar saldo autorizado pelo modulo Orion Finance.",
            availability=ToolAvailability.PLANNED,
            risk=ToolRisk.READ_ONLY,
            required_permissions=["finance.balance.read"],
            ticket="T0019",
        )
    )
    registry.register(
        ToolDefinition(
            name="models.generate",
            description="Gerar resposta pelo modelo explicitamente selecionado e autorizado.",
            availability=ToolAvailability.PLANNED,
            risk=ToolRisk.INTERNAL,
            required_permissions=["models.generate"],
            ticket="T0017",
        )
    )
    return registry
