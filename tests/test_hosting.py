import pytest

from app.hosting.service import HostingService
from app.hosting.storage import LocalFileStorage


def test_hosting_status_defaults_to_local_not_cloud_ready(client):
    response = client.get("/api/hosting/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["deployment_target"] == "local"
    assert payload["cloud_ready"] is False
    assert payload["database"]["provider"] == "sqlite-local"
    assert payload["storage"]["backend"] == "local"
    assert payload["horizontal_scaling"]["websocket_ready"] is False
    assert payload["monitoring"]["metrics_endpoint"] == "/api/monitoring/metrics"


def test_hosting_status_reports_cloud_blockers(isolated_settings, monkeypatch):
    monkeypatch.setattr(isolated_settings, "deployment_target", "cloud")
    monkeypatch.setattr(isolated_settings, "managed_database_provider", "postgres-managed")
    monkeypatch.setattr(isolated_settings, "managed_database_url_ref", None)
    monkeypatch.setattr(isolated_settings, "file_storage_backend", "local")
    monkeypatch.setattr(isolated_settings, "session_backend", "memory")
    monkeypatch.setattr(isolated_settings, "websocket_broker", "memory")

    status = HostingService().status()

    assert status.cloud_ready is False
    assert "Managed database reference is not configured." in status.blockers
    assert "Managed object storage is not configured." in status.blockers
    assert "Horizontal scaling requires shared session and WebSocket backends." in status.blockers


def test_hosting_status_can_be_cloud_ready_when_shared_services_are_configured(isolated_settings, monkeypatch):
    monkeypatch.setattr(isolated_settings, "deployment_target", "cloud")
    monkeypatch.setattr(isolated_settings, "managed_database_provider", "postgres-managed")
    monkeypatch.setattr(isolated_settings, "managed_database_url_ref", "vault/database/orion")
    monkeypatch.setattr(isolated_settings, "file_storage_backend", "object-storage")
    monkeypatch.setattr(isolated_settings, "object_storage_bucket", "orion-files")
    monkeypatch.setattr(isolated_settings, "session_backend", "redis")
    monkeypatch.setattr(isolated_settings, "websocket_broker", "redis")
    monkeypatch.setattr(isolated_settings, "horizontal_replicas_enabled", True)

    status = HostingService().status()

    assert status.cloud_ready is True
    assert status.blockers == []
    assert status.storage.configured is True
    assert status.horizontal_scaling.stateless_http_ready is True
    assert status.horizontal_scaling.websocket_ready is True


def test_local_file_storage_rejects_unsafe_keys(tmp_path):
    storage = LocalFileStorage(tmp_path / "files")

    storage.write_bytes("profiles/avatar.txt", b"orion")

    assert storage.read_bytes("profiles/avatar.txt") == b"orion"
    assert storage.list_keys() == ["profiles/avatar.txt"]
    with pytest.raises(ValueError, match="Invalid storage key"):
        storage.write_bytes("../escape.txt", b"nope")
