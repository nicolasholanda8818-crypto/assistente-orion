import os
import platform

from app.core.config import settings
from app.hosting.models import (
    FileStorageStatus,
    HorizontalScalingStatus,
    HostingStatus,
    ManagedDatabaseStatus,
    MonitoringStatus,
)


def instance_id() -> str:
    configured = os.getenv("ORION_INSTANCE_ID")
    if configured:
        return configured
    return f"{platform.node() or 'orion'}-{os.getpid()}"


class HostingService:
    def status(self) -> HostingStatus:
        database = self._database_status()
        storage = self._storage_status()
        horizontal = self._horizontal_status()
        monitoring = self._monitoring_status()
        blockers = []

        if settings.deployment_target == "cloud":
            if not database.configured:
                blockers.append("Managed database reference is not configured.")
            if settings.file_storage_backend != "object-storage" or not storage.configured:
                blockers.append("Managed object storage is not configured.")
            if not horizontal.stateless_http_ready or not horizontal.websocket_ready:
                blockers.append("Horizontal scaling requires shared session and WebSocket backends.")

        cloud_ready = settings.deployment_target == "cloud" and not blockers and monitoring.enabled
        return HostingStatus(
            deployment_target=settings.deployment_target,
            cloud_ready=cloud_ready,
            database=database,
            storage=storage,
            horizontal_scaling=horizontal,
            monitoring=monitoring,
            blockers=blockers,
        )

    def _database_status(self) -> ManagedDatabaseStatus:
        managed = settings.managed_database_provider != "sqlite-local"
        configured = managed and settings.managed_database_url_ref is not None
        notes = ["Runtime still uses the configured DATABASE_URL adapter."]
        if managed:
            notes.append("Database URL value must be resolved from a secret manager at deploy time.")
        else:
            notes.append("SQLite local mode is suitable for local development only.")
        return ManagedDatabaseStatus(
            provider=settings.managed_database_provider,
            configured=configured,
            active_runtime="sqlite" if settings.database_url.startswith("sqlite:///") else "external",
            notes=notes,
        )

    def _storage_status(self) -> FileStorageStatus:
        managed = settings.file_storage_backend == "object-storage"
        configured = managed and settings.object_storage_bucket is not None
        notes = []
        if managed:
            notes.append("Object storage credentials must be resolved by reference, never embedded in env files.")
        else:
            notes.append("Local file storage is not shared across replicas.")
        return FileStorageStatus(
            backend=settings.file_storage_backend,
            configured=configured if managed else True,
            bucket=settings.object_storage_bucket,
            endpoint_configured=settings.object_storage_endpoint is not None,
            local_path=None if managed else str(settings.file_storage_root),
            notes=notes,
        )

    def _horizontal_status(self) -> HorizontalScalingStatus:
        stateless_http_ready = (
            settings.file_storage_backend == "object-storage"
            and settings.session_backend != "memory"
        )
        websocket_ready = settings.websocket_broker != "memory"
        notes = []
        if not stateless_http_ready:
            notes.append("HTTP replicas need shared storage and a shared session backend.")
        if not websocket_ready:
            notes.append("WebSocket replicas need a shared broker such as Redis or managed pub/sub.")
        return HorizontalScalingStatus(
            enabled=settings.horizontal_replicas_enabled,
            instance_id=instance_id(),
            session_backend=settings.session_backend,
            websocket_broker=settings.websocket_broker,
            stateless_http_ready=stateless_http_ready,
            websocket_ready=websocket_ready,
            notes=notes,
        )

    def _monitoring_status(self) -> MonitoringStatus:
        return MonitoringStatus(
            enabled=settings.monitoring_enabled,
            metrics_endpoint="/api/monitoring/metrics",
            prometheus_endpoint="/api/monitoring/prometheus",
            structured_logs=True,
            notes=["Metrics are local and expose no personal payloads."],
        )
