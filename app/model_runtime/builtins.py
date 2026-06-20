from app.core.config import Settings
from app.model_runtime.models import (
    NetworkScope,
    ProviderAvailability,
    ProviderDefinition,
    ProviderKind,
    ProviderProtocol,
)
from app.model_runtime.registry import ModelRegistry


def create_model_registry(settings: Settings) -> ModelRegistry:
    registry = ModelRegistry(
        allow_remote=settings.model_external_calls_enabled,
        remote_host_allowlist=settings.model_remote_host_allowlist,
        selection_mode=settings.model_selection_mode,
    )
    registry.register_provider(
        ProviderDefinition(
            provider_id="ollama-local",
            kind=ProviderKind.OLLAMA,
            protocol=ProviderProtocol.OLLAMA,
            network_scope=NetworkScope.LOCAL,
            base_url=settings.ollama_base_url,
            description="Ollama local API adapter. Disabled until explicitly configured.",
        )
    )
    registry.register_provider(
        ProviderDefinition(
            provider_id="lm-studio-local",
            kind=ProviderKind.LM_STUDIO,
            protocol=ProviderProtocol.OPENAI_COMPATIBLE,
            network_scope=NetworkScope.LOCAL,
            base_url=settings.lm_studio_base_url,
            description="LM Studio local OpenAI-compatible adapter. Disabled by default.",
        )
    )
    registry.register_provider(
        ProviderDefinition(
            provider_id="openai-compatible",
            kind=ProviderKind.OPENAI_COMPATIBLE,
            protocol=ProviderProtocol.OPENAI_COMPATIBLE,
            network_scope=NetworkScope.REMOTE,
            base_url=settings.openai_compatible_base_url or None,
            credential_ref=settings.openai_compatible_api_key_ref or None,
            requires_explicit_consent=True,
            description="Generic OpenAI-compatible remote adapter. Disabled by default.",
        )
    )
    registry.register_provider(
        ProviderDefinition(
            provider_id="future-provider-template",
            kind=ProviderKind.FUTURE,
            protocol=ProviderProtocol.CUSTOM,
            network_scope=NetworkScope.REMOTE,
            availability=ProviderAvailability.PLANNED,
            requires_explicit_consent=True,
            supports=[],
            description="Extension point for future provider adapters.",
        )
    )
    return registry
