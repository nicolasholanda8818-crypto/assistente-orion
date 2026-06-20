import pytest

from app.core.config import Settings
from app.model_runtime.adapters import AdapterNotRegisteredError
from app.model_runtime.builtins import create_model_registry
from app.model_runtime.models import (
    ChatMessage,
    ChatRequest,
    ModelDefinition,
    NetworkScope,
    ProviderAvailability,
    ProviderDefinition,
    ProviderKind,
    ProviderProtocol,
)
from app.model_runtime.registry import (
    ModelRegistry,
    ModelUnavailableError,
    ProviderAlreadyRegisteredError,
    ProviderNotRegisteredError,
    RemoteProviderDisabledError,
)


def local_provider(
    *,
    provider_id: str = "local-test",
    kind: ProviderKind = ProviderKind.LM_STUDIO,
    protocol: ProviderProtocol = ProviderProtocol.OPENAI_COMPATIBLE,
    base_url: str = "http://127.0.0.1:1234/v1",
) -> ProviderDefinition:
    return ProviderDefinition(
        provider_id=provider_id,
        kind=kind,
        protocol=protocol,
        network_scope=NetworkScope.LOCAL,
        availability=ProviderAvailability.ENABLED,
        base_url=base_url,
        description="Provider local para teste.",
    )


def test_default_registry_declares_supported_providers_without_enabling_calls():
    catalog = create_model_registry(Settings()).catalog()

    assert catalog.external_calls == "disabled"
    assert catalog.selection_mode == "explicit-only"
    assert catalog.models == []
    assert [provider.provider_id for provider in catalog.providers] == [
        "ollama-local",
        "lm-studio-local",
        "openai-compatible",
        "future-provider-template",
    ]
    assert all(provider.availability is not ProviderAvailability.ENABLED for provider in catalog.providers)


def test_openai_compatible_adapter_builds_request_without_network_call():
    registry = ModelRegistry()
    registry.register_provider(local_provider())
    registry.register_model(
        ModelDefinition(
            model_id="local.chat",
            provider_id="local-test",
            model_name="local-model",
            enabled=True,
        )
    )

    request = registry.build_chat_request(
        ChatRequest(
            model_id="local.chat",
            messages=[ChatMessage(role="user", content="Ola")],
        )
    )

    assert request.url == "http://127.0.0.1:1234/v1/chat/completions"
    assert request.json_body == {
        "model": "local-model",
        "messages": [{"role": "user", "content": "Ola"}],
        "stream": False,
    }


def test_ollama_adapter_uses_native_chat_endpoint():
    registry = ModelRegistry()
    registry.register_provider(
        local_provider(
            provider_id="ollama-test",
            kind=ProviderKind.OLLAMA,
            protocol=ProviderProtocol.OLLAMA,
            base_url="http://localhost:11434",
        )
    )
    registry.register_model(
        ModelDefinition(
            model_id="ollama.chat",
            provider_id="ollama-test",
            model_name="example",
            enabled=True,
        )
    )

    request = registry.build_chat_request(
        ChatRequest(
            model_id="ollama.chat",
            messages=[ChatMessage(role="system", content="Responda de forma curta.")],
        )
    )

    assert request.url == "http://localhost:11434/api/chat"
    assert request.json_body["model"] == "example"


@pytest.mark.parametrize(
    "provider_url",
    [
        "http://192.168.0.10:1234/v1",
        "https://127.0.0.1:1234/v1",
        "http://user:password@127.0.0.1:1234/v1",
        "http://127.0.0.1:1234/v1?unsafe=true",
    ],
)
def test_local_providers_accept_only_plain_loopback_urls(provider_url):
    registry = ModelRegistry()

    with pytest.raises(ValueError):
        registry.register_provider(local_provider(base_url=provider_url))


def test_remote_provider_requires_https_and_explicit_runtime_opt_in():
    registry = ModelRegistry()
    definition = ProviderDefinition(
        provider_id="remote-test",
        kind=ProviderKind.OPENAI_COMPATIBLE,
        protocol=ProviderProtocol.OPENAI_COMPATIBLE,
        network_scope=NetworkScope.REMOTE,
        availability=ProviderAvailability.ENABLED,
        base_url="https://models.example.test/v1",
        requires_explicit_consent=True,
        description="Provider remoto para teste.",
    )

    with pytest.raises(RemoteProviderDisabledError):
        registry.register_provider(definition)

    allowed_registry = ModelRegistry(
        allow_remote=True,
        remote_host_allowlist=["models.example.test"],
    )
    allowed_registry.register_provider(definition)
    assert allowed_registry.catalog().external_calls == "enabled"


def test_remote_provider_rejects_plain_http_even_while_disabled():
    registry = ModelRegistry()

    with pytest.raises(ValueError, match="HTTPS"):
        registry.register_provider(
            ProviderDefinition(
                provider_id="remote-test",
                kind=ProviderKind.OPENAI_COMPATIBLE,
                protocol=ProviderProtocol.OPENAI_COMPATIBLE,
                network_scope=NetworkScope.REMOTE,
                base_url="http://models.example.test/v1",
                description="Provider remoto inseguro para teste.",
            )
        )


def test_remote_provider_host_must_be_allowlisted():
    registry = ModelRegistry(allow_remote=True)

    with pytest.raises(RemoteProviderDisabledError, match="allowlist"):
        registry.register_provider(
            ProviderDefinition(
                provider_id="remote-test",
                kind=ProviderKind.OPENAI_COMPATIBLE,
                protocol=ProviderProtocol.OPENAI_COMPATIBLE,
                network_scope=NetworkScope.REMOTE,
                availability=ProviderAvailability.ENABLED,
                base_url="https://models.example.test/v1",
                requires_explicit_consent=True,
                description="Provider remoto fora da allowlist.",
            )
        )


def test_registry_rejects_duplicate_provider_and_unknown_model_provider():
    registry = ModelRegistry()
    registry.register_provider(local_provider())

    with pytest.raises(ProviderAlreadyRegisteredError):
        registry.register_provider(local_provider())
    with pytest.raises(ProviderNotRegisteredError):
        registry.register_model(
            ModelDefinition(
                model_id="missing.chat",
                provider_id="missing",
                model_name="missing",
            )
        )


def test_known_provider_kind_requires_its_protocol():
    registry = ModelRegistry()

    with pytest.raises(ValueError, match="ollama"):
        registry.register_provider(
            local_provider(
                provider_id="ollama-test",
                kind=ProviderKind.OLLAMA,
            )
        )


def test_disabled_model_cannot_be_resolved():
    registry = ModelRegistry()
    registry.register_provider(local_provider())
    registry.register_model(
        ModelDefinition(
            model_id="disabled.chat",
            provider_id="local-test",
            model_name="disabled",
        )
    )

    with pytest.raises(ModelUnavailableError):
        registry.resolve("disabled.chat")


def test_enabled_custom_provider_requires_registered_adapter():
    registry = ModelRegistry(
        allow_remote=True,
        remote_host_allowlist=["future.example.test"],
    )

    with pytest.raises(AdapterNotRegisteredError):
        registry.register_provider(
            ProviderDefinition(
                provider_id="future-test",
                kind=ProviderKind.FUTURE,
                protocol=ProviderProtocol.CUSTOM,
                network_scope=NetworkScope.REMOTE,
                availability=ProviderAvailability.ENABLED,
                base_url="https://future.example.test/v1",
                requires_explicit_consent=True,
                description="Provider futuro para teste.",
            )
        )
