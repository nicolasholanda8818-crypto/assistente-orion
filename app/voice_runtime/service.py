from pathlib import Path

from app.core.config import settings
from app.voice_runtime.models import VoiceCatalog, VoiceProvider

VOICE_MODES = ["conversation", "assistant", "teacher", "consultant", "calm", "animated", "grandma", "narrator"]
VOICE_STATES = ["listening", "thinking", "responding"]


class VoiceRuntimeService:
    def catalog(self) -> VoiceCatalog:
        providers = [
            VoiceProvider(
                provider_id="speech-synthesis",
                label="SpeechSynthesis API",
                kind="browser",
                priority=50,
                configured=True,
                runtime="frontend",
                modes=VOICE_MODES,
                requires_secret=False,
                notes=[
                    "Fallback offline/sem chave no navegador.",
                    (
                        "Seleciona automaticamente a melhor voz pt-BR disponivel, "
                        "priorizando voz masculina quando existir."
                    ),
                ],
            ),
            VoiceProvider(
                provider_id="azure-speech",
                label="Azure Speech",
                kind="cloud",
                priority=90,
                configured=bool(settings.azure_speech_key_ref and settings.azure_speech_region),
                runtime="backend",
                modes=VOICE_MODES,
                requires_secret=True,
                notes=[
                    "Arquitetura declarada para voz neural quando o administrador configurar referencias de segredo.",
                    "Nenhuma chave real deve ser armazenada no codigo.",
                ],
            ),
            VoiceProvider(
                provider_id="elevenlabs",
                label="ElevenLabs",
                kind="cloud",
                priority=88,
                configured=bool(settings.elevenlabs_api_key_ref),
                runtime="backend",
                modes=VOICE_MODES,
                requires_secret=True,
                notes=[
                    "Arquitetura declarada para voz realista mediante opt-in administrativo.",
                    "Nao envia texto para provider externo sem configuracao e consentimento.",
                ],
            ),
            VoiceProvider(
                provider_id="openai-tts",
                label="OpenAI TTS",
                kind="cloud",
                priority=86,
                configured=bool(settings.openai_tts_api_key_ref),
                runtime="backend",
                modes=VOICE_MODES,
                requires_secret=True,
                notes=[
                    "Arquitetura declarada para endpoint TTS compativel com OpenAI.",
                    "Credencial deve ser referenciada por cofre ou variavel segura.",
                ],
            ),
            VoiceProvider(
                provider_id="coqui-local",
                label="Coqui TTS local",
                kind="local",
                priority=80,
                configured=Path(settings.coqui_tts_model_path).exists() if settings.coqui_tts_model_path else False,
                runtime="local-service",
                modes=VOICE_MODES,
                requires_secret=False,
                notes=[
                    "Arquitetura declarada para TTS local quando modelos forem instalados.",
                    "Mantem processamento no dispositivo quando disponivel.",
                ],
            ),
        ]
        configured = [provider for provider in providers if provider.configured]
        active = (
            max(configured, key=lambda provider: provider.priority).provider_id
            if configured
            else "speech-synthesis"
        )
        return VoiceCatalog(
            status="ready",
            automatic_selection=True,
            fallback_provider="speech-synthesis",
            active_default=active,
            modes=VOICE_MODES,
            states=VOICE_STATES,
            language="pt-BR",
            avatar_sync=True,
            providers=providers,
            restrictions=[
                "no-hardcoded-secrets",
                "speech-synthesis-fallback",
                "pt-BR-default",
                "avatar-state-sync",
                "external-tts-requires-admin-configuration",
                "no-private-memory-in-tts-provider-selection",
            ],
        )
