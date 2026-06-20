from app.onboarding.credentials import create_admin_credential, verify_admin_password
from app.onboarding.crypto import OnboardingCrypto
from app.onboarding.models import (
    OnboardingProfileResponse,
    OnboardingRequest,
    OnboardingStatus,
    OnboardingUpdateRequest,
    StoredOnboardingProfile,
)
from app.onboarding.repository import OnboardingRepository


class OnboardingNotCompletedError(ValueError):
    pass


class InvalidAdminPasswordError(ValueError):
    pass


class OnboardingService:
    def __init__(self, *, repository: OnboardingRepository, crypto: OnboardingCrypto) -> None:
        self._repository = repository
        self._crypto = crypto

    def status(self) -> OnboardingStatus:
        row = self._repository.status()
        return OnboardingStatus(
            required=row is None,
            completed=row is not None,
            completed_at=None if row is None else row["completed_at"],
        )

    def complete(self, request: OnboardingRequest) -> OnboardingStatus:
        profile_payload = request.model_dump(exclude={"admin_password", "admin_password_confirmation"})
        stored_profile = StoredOnboardingProfile(
            **profile_payload,
            admin_credential=create_admin_credential(request.admin_password),
        )
        nonce, ciphertext = self._crypto.encrypt(stored_profile.model_dump(mode="json"))
        self._repository.create(nonce=nonce, ciphertext=ciphertext)
        return self.status()

    def read_profile(self) -> StoredOnboardingProfile | None:
        row = self._repository.encrypted_payload()
        if row is None:
            return None
        payload = self._crypto.decrypt(nonce=row["nonce"], ciphertext=row["payload_ciphertext"])
        return StoredOnboardingProfile.model_validate(payload)

    def public_profile(self) -> OnboardingProfileResponse:
        row = self._repository.encrypted_payload()
        if row is None:
            raise OnboardingNotCompletedError("Onboarding is not completed.")
        profile = self.read_profile()
        if profile is None:
            raise OnboardingNotCompletedError("Onboarding is not completed.")
        return OnboardingProfileResponse(
            completed_at=row["completed_at"],
            updated_at=row["updated_at"],
            **profile.model_dump(exclude={"schema_version", "admin_credential"}),
        )

    def update_profile(self, request: OnboardingUpdateRequest) -> OnboardingProfileResponse:
        current_profile = self.read_profile()
        if current_profile is None:
            raise OnboardingNotCompletedError("Onboarding is not completed.")
        if not verify_admin_password(request.current_admin_password, current_profile.admin_credential):
            raise InvalidAdminPasswordError("Current admin password is invalid.")

        admin_credential = current_profile.admin_credential
        if request.new_admin_password is not None:
            admin_credential = create_admin_credential(request.new_admin_password)

        stored_profile = StoredOnboardingProfile(
            name=request.name,
            response_style=request.response_style,
            profile=request.profile,
            voice=request.voice,
            appearance=request.appearance,
            admin_credential=admin_credential,
        )
        nonce, ciphertext = self._crypto.encrypt(stored_profile.model_dump(mode="json"))
        self._repository.update(nonce=nonce, ciphertext=ciphertext)
        return self.public_profile()
