from functools import lru_cache

from app.core.config import settings
from app.onboarding.crypto import OnboardingCrypto
from app.onboarding.repository import OnboardingRepository
from app.onboarding.service import OnboardingService


@lru_cache
def get_onboarding_service() -> OnboardingService:
    return OnboardingService(
        repository=OnboardingRepository(),
        crypto=OnboardingCrypto(settings.onboarding_key_path),
    )
