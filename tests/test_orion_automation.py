from fastapi.testclient import TestClient

from app.main import app
from app.orion_automation.models import AutomationActionRequest, AutomationRoutinePreviewRequest
from app.orion_automation.service import AutomationService


def test_automation_status_exposes_safe_ecosystem_contracts():
    status = AutomationService().status()

    assert status.status == "ready"
    assert status.voice.mode == "continuous-conversation"
    assert status.voice.wake_word == "Orion"
    assert status.voice.wake_word_configurable is True
    assert "listening" in status.voice.states
    assert "searching" in status.voice.states
    capabilities = {capability.capability_id: capability for capability in status.capabilities}
    assert capabilities["desktop.open_authorized_app"].requires_confirmation is True
    assert capabilities["notifications.smart"].status == "available"
    assert "no-dangerous-host-actions" in status.restrictions


def test_automation_blocks_desktop_actions_without_local_agent():
    service = AutomationService()

    response = service.request_action(
        request=AutomationActionRequest(
            user_id="automation-test",
            action_id="desktop.open_authorized_app",
            target="VS Code",
        )
    )

    assert response.status == "blocked"
    assert response.requires_confirmation is True
    assert response.audit_event["action_id"] == "desktop.open_authorized_app"


def test_automation_accepts_safe_notification_request():
    response = AutomationService().request_action(
        request=AutomationActionRequest(
            user_id="automation-test",
            action_id="notifications.smart",
            target="projetos",
        )
    )

    assert response.status == "accepted"
    assert response.requires_confirmation is False
    assert "Nenhuma acao perigosa" in response.message


def test_automation_routine_preview_is_safe_and_non_executing():
    preview = AutomationService().preview_routine(
        request=AutomationRoutinePreviewRequest(
            user_id="automation-test",
            routine_id="dev.environment",
        )
    )

    assert preview.status == "ready"
    assert preview.requires_confirmation is True
    assert any("Abrir editor autorizado" in step for step in preview.steps)
    assert "Preview seguro" in preview.message


def test_automation_api_is_available_in_status():
    client = TestClient(app)

    status = client.get("/api/automation/status")
    app_status = client.get("/api/status")

    assert status.status_code == 200
    assert status.json()["voice"]["wake_word"] == "Orion"
    assert app_status.status_code == 200
    assert app_status.json()["automation"]["status"] == "ready"
