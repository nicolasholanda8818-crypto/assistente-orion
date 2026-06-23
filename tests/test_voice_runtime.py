from app.voice_runtime.service import VoiceRuntimeService


def test_voice_runtime_exposes_advanced_provider_catalog():
    catalog = VoiceRuntimeService().catalog()

    assert catalog.status == "ready"
    assert catalog.automatic_selection is True
    assert catalog.fallback_provider == "speech-synthesis"
    assert set(catalog.modes) == {"conversation", "assistant", "teacher", "calm", "animated", "grandma", "narrator"}
    providers = {provider.provider_id: provider for provider in catalog.providers}
    assert providers["speech-synthesis"].configured is True
    assert providers["azure-speech"].requires_secret is True
    assert providers["elevenlabs"].requires_secret is True
    assert providers["openai-tts"].requires_secret is True
    assert providers["coqui-local"].kind == "local"
    assert "no-hardcoded-secrets" in catalog.restrictions
