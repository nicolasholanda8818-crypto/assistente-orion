from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


CapabilityKind = Literal["voice", "desktop", "mobile", "tv", "device", "notification", "calendar", "routine"]
CapabilityStatus = Literal["available", "planned", "blocked"]
ActionStatus = Literal["preview", "confirmation-required", "blocked", "accepted"]


class AutomationCapability(StrictModel):
    capability_id: str = Field(pattern=r"^[a-z][a-z0-9_.-]{2,80}$")
    label: str
    kind: CapabilityKind
    status: CapabilityStatus
    requires_confirmation: bool
    required_permissions: list[str] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)


class AutomationRoutineTemplate(StrictModel):
    routine_id: str = Field(pattern=r"^[a-z][a-z0-9_.-]{2,80}$")
    label: str
    description: str
    steps: list[str]
    requires_confirmation: bool


class VoiceAutomationSettings(StrictModel):
    mode: Literal["continuous-conversation"]
    states: list[str]
    wake_word: str
    wake_word_configurable: bool
    browser_fallback: str
    avatar_sync: bool


class NotificationAutomationSettings(StrictModel):
    categories: list[str]
    quiet_hours: str
    max_frequency: str
    requires_user_permission: bool


class AutomationStatus(StrictModel):
    status: Literal["ready"]
    runtime: Literal["pwa-safe", "local-desktop-required"]
    voice: VoiceAutomationSettings
    notifications: NotificationAutomationSettings
    capabilities: list[AutomationCapability]
    routines: list[AutomationRoutineTemplate]
    restrictions: list[str]


class AutomationActionRequest(StrictModel):
    user_id: str = Field(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_.-]+$")
    action_id: str = Field(min_length=3, max_length=80, pattern=r"^[a-z][a-z0-9_.-]+$")
    target: str | None = Field(default=None, max_length=160)
    confirmed: bool = False


class AutomationActionResponse(StrictModel):
    status: ActionStatus
    action_id: str
    message: str
    requires_confirmation: bool
    required_permissions: list[str]
    audit_event: dict[str, str]


class AutomationRoutinePreviewRequest(StrictModel):
    user_id: str = Field(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_.-]+$")
    routine_id: str = Field(min_length=3, max_length=80, pattern=r"^[a-z][a-z0-9_.-]+$")


class AutomationRoutinePreview(StrictModel):
    status: Literal["ready", "not-found"]
    routine_id: str
    label: str | None = None
    steps: list[str] = Field(default_factory=list)
    message: str
    requires_confirmation: bool
