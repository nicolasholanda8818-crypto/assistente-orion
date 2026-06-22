from fastapi import APIRouter

from app.voice_runtime.models import VoiceCatalog
from app.voice_runtime.service import VoiceRuntimeService

voice_router = APIRouter(prefix="/voice", tags=["voice"])


@voice_router.get("/status", response_model=VoiceCatalog)
def voice_status() -> VoiceCatalog:
    return VoiceRuntimeService().catalog()
