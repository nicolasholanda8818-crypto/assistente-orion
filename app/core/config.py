from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Orion"
    app_env: str = "development"
    app_host: str = "127.0.0.1"
    app_port: int = 8000
    database_url: str = "sqlite:///./database/orion.db"
    static_dir: str = "frontend"
    log_dir: str = "storage/logs"
    onboarding_crypto_path: str = "storage/keys/onboarding.key"
    pwa_cache_name: str = "orion-pwa-v37-files-documents"
    deployment_target: str = "local"
    managed_database_provider: str = "sqlite-local"
    managed_database_url_ref: str | None = None
    file_storage_backend: str = "local"
    file_storage_path: str = "storage/files"
    object_storage_provider: str | None = None
    object_storage_bucket: str | None = None
    object_storage_endpoint: str | None = None
    object_storage_region: str | None = None
    object_storage_access_key_ref: str | None = None
    object_storage_secret_key_ref: str | None = None
    file_upload_max_bytes: int = 15 * 1024 * 1024
    file_allowed_extensions: list[str] = [
        ".bmp",
        ".csv",
        ".doc",
        ".docx",
        ".gif",
        ".jpeg",
        ".jpg",
        ".json",
        ".md",
        ".pdf",
        ".png",
        ".pptx",
        ".txt",
        ".webp",
        ".xls",
        ".xlsx",
    ]
    file_blocked_extensions: list[str] = [
        ".bat",
        ".cmd",
        ".com",
        ".dll",
        ".exe",
        ".html",
        ".hta",
        ".jar",
        ".js",
        ".msi",
        ".php",
        ".ps1",
        ".scr",
        ".sh",
        ".svg",
        ".vbs",
    ]
    horizontal_replicas_enabled: bool = False
    session_backend: str = "memory"
    websocket_broker: str = "memory"
    monitoring_enabled: bool = True
    cors_origins: list[str] = ["http://127.0.0.1:8000", "http://localhost:8000"]
    model_selection_mode: str = "explicit-only"
    model_external_calls_enabled: bool = False
    model_remote_host_allowlist: list[str] = []
    ollama_base_url: str = "http://127.0.0.1:11434"
    lm_studio_base_url: str = "http://127.0.0.1:1234/v1"
    openai_compatible_base_url: str | None = None
    openai_compatible_api_key_ref: str | None = None
    azure_speech_key_ref: str | None = None
    azure_speech_region: str | None = None
    elevenlabs_api_key_ref: str | None = None
    openai_tts_api_key_ref: str | None = None
    coqui_tts_model_path: str | None = None
    web_search_enabled: bool = True
    web_search_provider: str = "duckduckgo-html+mojeek"
    web_search_timeout_seconds: float = 5.0
    web_search_max_results: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def database_path(self) -> Path:
        if not self.database_url.startswith("sqlite:///"):
            raise ValueError("Orion foundation currently supports SQLite database URLs only.")

        raw_path = self.database_url.replace("sqlite:///", "", 1)
        return Path(raw_path)

    @property
    def log_path(self) -> Path:
        return Path(self.log_dir)

    @property
    def onboarding_key_path(self) -> Path:
        return Path(self.onboarding_crypto_path)

    @property
    def file_storage_root(self) -> Path:
        return Path(self.file_storage_path)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
