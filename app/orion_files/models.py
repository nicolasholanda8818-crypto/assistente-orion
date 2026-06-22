from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class OrionFileRecord(StrictModel):
    id: str
    user_id: str
    original_name: str
    safe_name: str
    content_type: str
    extension: str
    size_bytes: int
    category: str
    source: Literal["upload", "camera"]
    analysis_status: Literal["pending", "ready", "limited", "error"]
    summary: str | None = None
    keywords: list[str] = Field(default_factory=list)
    description: str | None = None
    created_at: str
    updated_at: str


class OrionFileList(StrictModel):
    files: list[OrionFileRecord]


class OrionFileUploadResponse(StrictModel):
    file: OrionFileRecord
    message: str


class OrionFileAnalysisRequest(StrictModel):
    user_id: str = Field(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_.-]+$")
    instructions: str | None = Field(default=None, max_length=500)
    manual_description: str | None = Field(default=None, max_length=1000)


class OrionFileAnalysisResponse(StrictModel):
    file: OrionFileRecord
    summary: str
    keywords: list[str]
    message: str


class OrionCameraPhotoRequest(StrictModel):
    user_id: str = Field(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_.-]+$")
    image_data: str = Field(min_length=20, max_length=22_000_000)
    filename: str = Field(default="orion-camera-photo.png", max_length=120)
    category: str = Field(default="camera", max_length=40)
    description: str | None = Field(default=None, max_length=1000)


class OrionFilesStatus(StrictModel):
    status: Literal["ready"]
    storage_backend: str
    storage_path: str
    max_upload_bytes: int
    allowed_extensions: list[str]
    blocked_extensions: list[str]
    restrictions: list[str]
