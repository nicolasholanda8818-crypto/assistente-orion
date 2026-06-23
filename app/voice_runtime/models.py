from typing import Literal

from pydantic import BaseModel, ConfigDict


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class VoiceProvider(StrictModel):
    provider_id: str
    label: str
    kind: Literal["browser", "cloud", "local"]
    priority: int
    configured: bool
    runtime: Literal["frontend", "backend", "local-service"]
    modes: list[str]
    requires_secret: bool
    notes: list[str]


class VoiceCatalog(StrictModel):
    status: Literal["ready"]
    automatic_selection: bool
    fallback_provider: str
    active_default: str
    modes: list[str]
    states: list[str]
    language: str
    avatar_sync: bool
    providers: list[VoiceProvider]
    restrictions: list[str]
