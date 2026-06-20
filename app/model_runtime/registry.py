from urllib.parse import urlparse

from app.model_runtime.adapters import AdapterRegistry, create_default_adapter_registry
from app.model_runtime.models import (
    ChatRequest,
    ModelCatalog,
    ModelDefinition,
    ModelRoute,
    ModelSummary,
    NetworkScope,
    ProviderAvailability,
    ProviderDefinition,
    ProviderKind,
    ProviderProtocol,
    ProviderRequest,
    ProviderSummary,
)

LOOPBACK_HOSTS = {"127.0.0.1", "::1", "localhost"}
REQUIRED_PROTOCOLS = {
    ProviderKind.OLLAMA: ProviderProtocol.OLLAMA,
    ProviderKind.LM_STUDIO: ProviderProtocol.OPENAI_COMPATIBLE,
    ProviderKind.OPENAI_COMPATIBLE: ProviderProtocol.OPENAI_COMPATIBLE,
}


class ProviderAlreadyRegisteredError(ValueError):
    pass


class ModelAlreadyRegisteredError(ValueError):
    pass


class ProviderNotRegisteredError(ValueError):
    pass


class ModelNotRegisteredError(ValueError):
    pass


class ModelUnavailableError(ValueError):
    pass


class RemoteProviderDisabledError(ValueError):
    pass


class ModelRegistry:
    def __init__(
        self,
        *,
        adapters: AdapterRegistry | None = None,
        allow_remote: bool = False,
        remote_host_allowlist: list[str] | None = None,
        selection_mode: str = "explicit-only",
    ) -> None:
        self._adapters = adapters or create_default_adapter_registry()
        self._allow_remote = allow_remote
        self._remote_host_allowlist = frozenset(
            host.strip().lower() for host in remote_host_allowlist or [] if host.strip()
        )
        self._selection_mode = selection_mode
        self._providers: dict[str, ProviderDefinition] = {}
        self._models: dict[str, ModelDefinition] = {}

    def register_provider(self, provider: ProviderDefinition) -> None:
        if provider.provider_id in self._providers:
            raise ProviderAlreadyRegisteredError(f"Provider already registered: {provider.provider_id}")

        self._validate_provider(provider)
        self._providers[provider.provider_id] = provider

    def register_model(self, model: ModelDefinition) -> None:
        if model.model_id in self._models:
            raise ModelAlreadyRegisteredError(f"Model already registered: {model.model_id}")
        if model.provider_id not in self._providers:
            raise ProviderNotRegisteredError(f"Provider is not registered: {model.provider_id}")

        self._models[model.model_id] = model

    def resolve(self, model_id: str) -> ModelRoute:
        try:
            model = self._models[model_id]
        except KeyError as exc:
            raise ModelNotRegisteredError(f"Model is not registered: {model_id}") from exc

        provider = self._providers[model.provider_id]
        if not model.enabled or provider.availability is not ProviderAvailability.ENABLED:
            raise ModelUnavailableError(f"Model is disabled: {model_id}")

        return ModelRoute(provider=provider, model=model)

    def build_chat_request(self, request: ChatRequest) -> ProviderRequest:
        route = self.resolve(request.model_id)
        adapter = self._adapters.get(route.provider.protocol)
        return adapter.build_chat_request(
            provider=route.provider,
            model=route.model,
            messages=request.messages,
        )

    def catalog(self) -> ModelCatalog:
        return ModelCatalog(
            external_calls="enabled" if self._allow_remote else "disabled",
            selection_mode=self._selection_mode,
            providers=[
                ProviderSummary(
                    provider_id=provider.provider_id,
                    kind=provider.kind,
                    protocol=provider.protocol,
                    network_scope=provider.network_scope,
                    availability=provider.availability,
                    base_url=provider.base_url,
                    has_credential_ref=provider.credential_ref is not None,
                    requires_explicit_consent=provider.requires_explicit_consent,
                    supports=provider.supports,
                    description=provider.description,
                )
                for provider in self._providers.values()
            ],
            models=[
                ModelSummary(
                    model_id=model.model_id,
                    provider_id=model.provider_id,
                    model_name=model.model_name,
                    enabled=model.enabled,
                    capabilities=model.capabilities,
                    priority=model.priority,
                )
                for model in self._models.values()
            ],
            restrictions=[
                "no-live-inference",
                "explicit-model-selection",
                "no-automatic-remote-fallback",
                "credentials-by-vault-reference-only",
                "local-providers-loopback-only",
                "remote-host-allowlist-required",
            ],
        )

    def _validate_provider(self, provider: ProviderDefinition) -> None:
        required_protocol = REQUIRED_PROTOCOLS.get(provider.kind)
        if required_protocol is not None and provider.protocol is not required_protocol:
            raise ValueError(f"{provider.kind} providers require the {required_protocol} protocol.")

        parsed_url = None
        if provider.network_scope is NetworkScope.LOCAL:
            if not provider.base_url:
                raise ValueError("Local providers require a base URL.")
            parsed_url = urlparse(provider.base_url)
            if parsed_url.scheme != "http" or parsed_url.hostname not in LOOPBACK_HOSTS:
                raise ValueError("Local provider URLs must use HTTP on a loopback host.")
            self._validate_url_parts(parsed_url)

        if provider.network_scope is NetworkScope.REMOTE and provider.base_url:
            parsed_url = urlparse(provider.base_url)
            if parsed_url.scheme != "https" or not parsed_url.hostname:
                raise ValueError("Remote provider URLs must use HTTPS.")
            self._validate_url_parts(parsed_url)

        if provider.network_scope is NetworkScope.REMOTE and provider.availability is ProviderAvailability.ENABLED:
            if parsed_url is None:
                raise ValueError("Enabled remote providers require a base URL.")
            if not self._allow_remote or not provider.requires_explicit_consent:
                raise RemoteProviderDisabledError(
                    "Remote model providers require an explicit runtime opt-in and consent."
                )
            if parsed_url.hostname not in self._remote_host_allowlist:
                raise RemoteProviderDisabledError("Remote model provider host is not present in the runtime allowlist.")

        if provider.availability is ProviderAvailability.ENABLED:
            if not provider.base_url:
                raise ValueError("Enabled providers require a base URL.")
            self._adapters.get(provider.protocol)

    @staticmethod
    def _validate_url_parts(parsed_url) -> None:
        if parsed_url.username or parsed_url.password:
            raise ValueError("Provider URLs cannot embed credentials.")
        if parsed_url.query or parsed_url.fragment:
            raise ValueError("Provider URLs cannot include query strings or fragments.")
