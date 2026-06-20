from enum import StrEnum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ProviderKind(StrEnum):
    OLLAMA = "ollama"
    LM_STUDIO = "lm-studio"
    OPENAI_COMPATIBLE = "openai-compatible"
    FUTURE = "future"


class ProviderProtocol(StrEnum):
    OLLAMA = "ollama"
    OPENAI_COMPATIBLE = "openai-compatible"
    CUSTOM = "custom"


class NetworkScope(StrEnum):
    LOCAL = "local"
    REMOTE = "remote"


class ProviderAvailability(StrEnum):
    DISABLED = "disabled"
    ENABLED = "enabled"
    PLANNED = "planned"


class ProviderDefinition(StrictModel):
    provider_id: str = Field(pattern=r"^[a-z0-9][a-z0-9-]{1,62}$")
    kind: ProviderKind
    protocol: ProviderProtocol
    network_scope: NetworkScope
    availability: ProviderAvailability = ProviderAvailability.DISABLED
    base_url: str | None = None
    credential_ref: str | None = None
    requires_explicit_consent: bool = False
    supports: list[str] = Field(default_factory=lambda: ["chat"])
    description: str


class ProviderSummary(StrictModel):
    provider_id: str
    kind: ProviderKind
    protocol: ProviderProtocol
    network_scope: NetworkScope
    availability: ProviderAvailability
    base_url: str | None
    has_credential_ref: bool
    requires_explicit_consent: bool
    supports: list[str]
    description: str


class ModelDefinition(StrictModel):
    model_id: str = Field(pattern=r"^[a-z0-9][a-z0-9._-]{1,127}$")
    provider_id: str
    model_name: str = Field(min_length=1, max_length=255)
    enabled: bool = False
    capabilities: list[str] = Field(default_factory=lambda: ["chat"])
    priority: int = Field(default=100, ge=0, le=10_000)


class ModelSummary(StrictModel):
    model_id: str
    provider_id: str
    model_name: str
    enabled: bool
    capabilities: list[str]
    priority: int


class ModelCatalog(StrictModel):
    status: Literal["ready"] = "ready"
    external_calls: Literal["disabled", "enabled"]
    selection_mode: str
    providers: list[ProviderSummary]
    models: list[ModelSummary]
    restrictions: list[str]


class ChatMessage(StrictModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1, max_length=32_000)


class ChatRequest(StrictModel):
    model_id: str
    messages: list[ChatMessage] = Field(min_length=1, max_length=128)


class ProviderRequest(StrictModel):
    method: Literal["POST"]
    url: str
    json_body: dict[str, Any]


class ModelRoute(StrictModel):
    provider: ProviderDefinition
    model: ModelDefinition
