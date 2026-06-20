from pydantic import BaseModel, ConfigDict


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ManagedDatabaseStatus(StrictModel):
    provider: str
    configured: bool
    active_runtime: str
    url_exposed: bool = False
    notes: list[str]


class FileStorageStatus(StrictModel):
    backend: str
    configured: bool
    bucket: str | None = None
    endpoint_configured: bool
    local_path: str | None = None
    notes: list[str]


class HorizontalScalingStatus(StrictModel):
    enabled: bool
    instance_id: str
    session_backend: str
    websocket_broker: str
    stateless_http_ready: bool
    websocket_ready: bool
    notes: list[str]


class MonitoringStatus(StrictModel):
    enabled: bool
    metrics_endpoint: str
    prometheus_endpoint: str
    structured_logs: bool
    notes: list[str]


class HostingStatus(StrictModel):
    deployment_target: str
    cloud_ready: bool
    database: ManagedDatabaseStatus
    storage: FileStorageStatus
    horizontal_scaling: HorizontalScalingStatus
    monitoring: MonitoringStatus
    blockers: list[str]
