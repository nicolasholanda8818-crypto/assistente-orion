from datetime import UTC, datetime

from app.core.config import settings
from app.orion_automation.models import (
    AutomationActionRequest,
    AutomationActionResponse,
    AutomationCapability,
    AutomationRoutinePreview,
    AutomationRoutinePreviewRequest,
    AutomationRoutineTemplate,
    AutomationStatus,
    NotificationAutomationSettings,
    VoiceAutomationSettings,
)

VOICE_STATES = ["sleeping", "listening", "understanding", "thinking", "searching", "responding", "waiting"]

SAFE_CAPABILITIES = [
    AutomationCapability(
        capability_id="voice.continuous_conversation",
        label="Modo conversa continua",
        kind="voice",
        status="available",
        requires_confirmation=False,
        required_permissions=["voice.use"],
        notes=[
            "Usa Web Speech API e SpeechSynthesis API no navegador quando disponiveis.",
            "Sincroniza estados visuais do avatar sem enviar audio para servidor externo.",
        ],
    ),
    AutomationCapability(
        capability_id="voice.wake_word",
        label="Palavra de ativacao configuravel",
        kind="voice",
        status="planned",
        requires_confirmation=False,
        required_permissions=["voice.configure"],
        notes=["Contrato preparado para wake word local. A execucao continua dependente do suporte do navegador/app."],
    ),
    AutomationCapability(
        capability_id="desktop.open_authorized_app",
        label="Abrir aplicativo autorizado no computador",
        kind="desktop",
        status="planned",
        requires_confirmation=True,
        required_permissions=["desktop.app.open"],
        notes=[
            "Preparado para navegador, VS Code, Explorador, Spotify, YouTube, documentos e projetos.",
            "Desativado em cloud/Render e requer agente local no computador do usuario.",
        ],
    ),
    AutomationCapability(
        capability_id="mobile.session_sync",
        label="Sincronizacao de sessao PWA, Android e desktop",
        kind="mobile",
        status="planned",
        requires_confirmation=False,
        required_permissions=["session.sync"],
        notes=["Contrato preparado para continuidade de conversa entre dispositivos autorizados."],
    ),
    AutomationCapability(
        capability_id="tv.cast_orion",
        label="Enviar Orion para TV compativel",
        kind="tv",
        status="planned",
        requires_confirmation=True,
        required_permissions=["device.cast"],
        notes=["Preparado para Chromecast, Android TV, Google TV e apresentacoes futuras."],
    ),
    AutomationCapability(
        capability_id="device.home_assistant",
        label="Home Assistant e dispositivos compativeis",
        kind="device",
        status="planned",
        requires_confirmation=True,
        required_permissions=["device.automation"],
        notes=["Requer configuracao explicita, tokens em cofre e allowlist de dispositivos."],
    ),
    AutomationCapability(
        capability_id="device.wake_on_lan",
        label="Wake-on-LAN",
        kind="device",
        status="planned",
        requires_confirmation=True,
        required_permissions=["device.wake"],
        notes=["Preparado para computadores compativeis, sempre com confirmacao do usuario."],
    ),
    AutomationCapability(
        capability_id="notifications.smart",
        label="Notificacoes inteligentes",
        kind="notification",
        status="available",
        requires_confirmation=False,
        required_permissions=["notifications.use"],
        notes=["Usa permissao do navegador e respeita frequencia, categorias e horario silencioso."],
    ),
    AutomationCapability(
        capability_id="calendar.planning",
        label="Calendario e lembretes",
        kind="calendar",
        status="planned",
        requires_confirmation=True,
        required_permissions=["calendar.write"],
        notes=["Preparado para compromissos, estudos, tarefas e lembretes mediante consentimento."],
    ),
]

ROUTINES = [
    AutomationRoutineTemplate(
        routine_id="dev.environment",
        label="Iniciar ambiente de desenvolvimento",
        description="Sequencia segura para preparar trabalho em projetos locais.",
        steps=[
            "Confirmar usuario e permissao local.",
            "Abrir editor autorizado.",
            "Abrir pasta do projeto autorizada.",
            "Abrir navegador no Orion ou documentacao escolhida.",
            "Mostrar checklist de tarefas do dia.",
        ],
        requires_confirmation=True,
    ),
    AutomationRoutineTemplate(
        routine_id="favorite.sites",
        label="Abrir sites favoritos",
        description="Prepara uma lista de sites autorizados pelo usuario.",
        steps=[
            "Carregar lista local de sites permitidos.",
            "Pedir confirmacao antes de abrir abas.",
            "Abrir somente URLs http/https permitidas.",
        ],
        requires_confirmation=True,
    ),
    AutomationRoutineTemplate(
        routine_id="study.session",
        label="Sessao de estudos",
        description="Organiza materiais, lembrete e modo professor.",
        steps=[
            "Perguntar materia e objetivo.",
            "Ativar voz professor se disponivel.",
            "Abrir arquivos de estudo autorizados.",
            "Criar resumo curto ao final.",
        ],
        requires_confirmation=False,
    ),
]


class AutomationService:
    def status(self) -> AutomationStatus:
        return AutomationStatus(
            status="ready",
            runtime="pwa-safe" if settings.deployment_target != "local-desktop" else "local-desktop-required",
            voice=VoiceAutomationSettings(
                mode="continuous-conversation",
                states=VOICE_STATES,
                wake_word="Orion",
                wake_word_configurable=True,
                browser_fallback="SpeechRecognition + SpeechSynthesis API",
                avatar_sync=True,
            ),
            notifications=NotificationAutomationSettings(
                categories=["projetos", "estudos", "documentos", "atualizacoes", "tarefas"],
                quiet_hours="22:00-08:00",
                max_frequency="moderada",
                requires_user_permission=True,
            ),
            capabilities=SAFE_CAPABILITIES,
            routines=ROUTINES,
            restrictions=[
                "no-dangerous-host-actions",
                "cloud-runtime-does-not-open-local-programs",
                "confirmation-required-for-sensitive-actions",
                "permissions-can-be-revoked",
                "audit-log-for-automation-requests",
                "no-hardcoded-device-tokens",
            ],
        )

    def request_action(self, request: AutomationActionRequest) -> AutomationActionResponse:
        capability = self._find_capability(request.action_id)
        if capability is None:
            return self._response(
                status="blocked",
                request=request,
                message="Acao de automacao desconhecida ou nao registrada.",
                requires_confirmation=False,
                required_permissions=[],
            )

        if capability.status == "blocked":
            return self._response(
                status="blocked",
                request=request,
                message="Esta automacao esta bloqueada nesta instalacao.",
                requires_confirmation=capability.requires_confirmation,
                required_permissions=capability.required_permissions,
            )

        if capability.kind in {"desktop", "tv", "device", "calendar"} and settings.deployment_target != "local-desktop":
            return self._response(
                status="blocked",
                request=request,
                message=(
                    "Essa automacao requer agente local no computador/dispositivo do usuario. "
                    "No Render ela fica apenas preparada e segura."
                ),
                requires_confirmation=capability.requires_confirmation,
                required_permissions=capability.required_permissions,
            )

        if capability.requires_confirmation and not request.confirmed:
            return self._response(
                status="confirmation-required",
                request=request,
                message="Preciso da sua confirmacao antes de preparar esta automacao.",
                requires_confirmation=True,
                required_permissions=capability.required_permissions,
            )

        return self._response(
            status="accepted",
            request=request,
            message="Automacao aceita em modo seguro. Nenhuma acao perigosa foi executada.",
            requires_confirmation=capability.requires_confirmation,
            required_permissions=capability.required_permissions,
        )

    def preview_routine(self, request: AutomationRoutinePreviewRequest) -> AutomationRoutinePreview:
        routine = next((item for item in ROUTINES if item.routine_id == request.routine_id), None)
        if routine is None:
            return AutomationRoutinePreview(
                status="not-found",
                routine_id=request.routine_id,
                message="Rotina nao encontrada.",
                requires_confirmation=False,
            )
        return AutomationRoutinePreview(
            status="ready",
            routine_id=routine.routine_id,
            label=routine.label,
            steps=routine.steps,
            message="Preview seguro gerado. Revise os passos antes de autorizar qualquer execucao.",
            requires_confirmation=routine.requires_confirmation,
        )

    def _find_capability(self, action_id: str) -> AutomationCapability | None:
        return next((capability for capability in SAFE_CAPABILITIES if capability.capability_id == action_id), None)

    def _response(
        self,
        *,
        status: str,
        request: AutomationActionRequest,
        message: str,
        requires_confirmation: bool,
        required_permissions: list[str],
    ) -> AutomationActionResponse:
        return AutomationActionResponse(
            status=status,
            action_id=request.action_id,
            message=message,
            requires_confirmation=requires_confirmation,
            required_permissions=required_permissions,
            audit_event={
                "actor_id": request.user_id,
                "action_id": request.action_id,
                "target": request.target or "",
                "outcome": status,
                "created_at": datetime.now(UTC).isoformat(),
            },
        )
