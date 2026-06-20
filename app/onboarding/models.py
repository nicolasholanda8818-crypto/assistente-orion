from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class UserProfile(StrEnum):
    ADULT = "adult"
    CHILD = "child"
    ELDERLY = "elderly"


class VoiceStyle(StrEnum):
    CALM = "calm"
    BALANCED = "balanced"
    ENERGETIC = "energetic"


class AppearanceTheme(StrEnum):
    DARK = "dark"
    LIGHT = "light"
    HIGH_CONTRAST = "high-contrast"


class ResponseStyle(StrEnum):
    CONCISE = "concise"
    BALANCED = "balanced"
    DETAILED = "detailed"


class OnboardingProfileFields(StrictModel):
    name: str = Field(min_length=1, max_length=80)
    response_style: ResponseStyle
    profile: UserProfile
    voice: VoiceStyle
    appearance: AppearanceTheme

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if not normalized:
            raise ValueError("Name cannot be blank.")
        return normalized


class AdminCredential(StrictModel):
    algorithm: Literal["pbkdf2-sha256"]
    iterations: int = Field(ge=200_000, le=1_000_000)
    salt: str = Field(min_length=32, max_length=32)
    password_hash: str = Field(min_length=64, max_length=64)


class OnboardingRequest(OnboardingProfileFields):
    admin_password: str = Field(min_length=10, max_length=128)
    admin_password_confirmation: str = Field(min_length=10, max_length=128)

    @model_validator(mode="after")
    def validate_admin_password_confirmation(self) -> "OnboardingRequest":
        if self.admin_password != self.admin_password_confirmation:
            raise ValueError("Admin password confirmation does not match.")
        return self


class OnboardingUpdateRequest(OnboardingProfileFields):
    current_admin_password: str = Field(min_length=10, max_length=128)
    new_admin_password: str | None = Field(default=None, min_length=10, max_length=128)
    new_admin_password_confirmation: str | None = Field(default=None, min_length=10, max_length=128)

    @model_validator(mode="after")
    def validate_optional_password_change(self) -> "OnboardingUpdateRequest":
        if self.new_admin_password is None and self.new_admin_password_confirmation is None:
            return self
        if self.new_admin_password != self.new_admin_password_confirmation:
            raise ValueError("New admin password confirmation does not match.")
        return self


class StoredOnboardingProfile(OnboardingProfileFields):
    schema_version: Literal[2] = 2
    admin_credential: AdminCredential


class OnboardingProfileResponse(OnboardingProfileFields):
    completed_at: str
    updated_at: str


class OnboardingStatus(StrictModel):
    required: bool
    completed: bool
    completed_at: str | None = None
