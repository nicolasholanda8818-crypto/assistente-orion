from typing import Protocol

from app.model_runtime.models import (
    ChatMessage,
    ModelDefinition,
    ProviderDefinition,
    ProviderProtocol,
    ProviderRequest,
)


class AdapterNotRegisteredError(ValueError):
    pass


class ProviderAdapter(Protocol):
    protocol: ProviderProtocol

    def build_chat_request(
        self,
        *,
        provider: ProviderDefinition,
        model: ModelDefinition,
        messages: list[ChatMessage],
    ) -> ProviderRequest: ...


def _endpoint(base_url: str | None, path: str) -> str:
    if not base_url:
        raise ValueError("Provider base URL is required to build a request.")
    return f"{base_url.rstrip('/')}/{path.lstrip('/')}"


class OllamaAdapter:
    protocol = ProviderProtocol.OLLAMA

    def build_chat_request(
        self,
        *,
        provider: ProviderDefinition,
        model: ModelDefinition,
        messages: list[ChatMessage],
    ) -> ProviderRequest:
        return ProviderRequest(
            method="POST",
            url=_endpoint(provider.base_url, "/api/chat"),
            json_body={
                "model": model.model_name,
                "messages": [message.model_dump() for message in messages],
                "stream": False,
            },
        )


class OpenAICompatibleAdapter:
    protocol = ProviderProtocol.OPENAI_COMPATIBLE

    def build_chat_request(
        self,
        *,
        provider: ProviderDefinition,
        model: ModelDefinition,
        messages: list[ChatMessage],
    ) -> ProviderRequest:
        return ProviderRequest(
            method="POST",
            url=_endpoint(provider.base_url, "/chat/completions"),
            json_body={
                "model": model.model_name,
                "messages": [message.model_dump() for message in messages],
                "stream": False,
            },
        )


class AdapterRegistry:
    def __init__(self) -> None:
        self._adapters: dict[ProviderProtocol, ProviderAdapter] = {}

    def register(self, adapter: ProviderAdapter) -> None:
        if adapter.protocol in self._adapters:
            raise ValueError(f"Adapter already registered: {adapter.protocol}")
        self._adapters[adapter.protocol] = adapter

    def get(self, protocol: ProviderProtocol) -> ProviderAdapter:
        try:
            return self._adapters[protocol]
        except KeyError as exc:
            raise AdapterNotRegisteredError(f"Adapter is not registered: {protocol}") from exc


def create_default_adapter_registry() -> AdapterRegistry:
    registry = AdapterRegistry()
    registry.register(OllamaAdapter())
    registry.register(OpenAICompatibleAdapter())
    return registry
