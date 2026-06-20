import secrets

import pytest

from app.core.config import settings
from app.db.connection import database_connection
from app.db.init_db import initialize_database
from app.onboarding.crypto import OnboardingCrypto, OnboardingCryptoError
from app.onboarding.dependencies import get_onboarding_service
from app.onboarding.models import OnboardingRequest
from app.onboarding.repository import OnboardingAlreadyCompletedError


def onboarding_payload(name: str) -> dict[str, str]:
    return {
        "name": name,
        "response_style": "balanced",
        "profile": "adult",
        "voice": "calm",
        "appearance": "dark",
        "admin_password": "StrongAdmin123",
        "admin_password_confirmation": "StrongAdmin123",
    }


def update_payload(name: str, current_password: str = "StrongAdmin123") -> dict[str, str]:
    return {
        "name": name,
        "response_style": "detailed",
        "profile": "elderly",
        "voice": "energetic",
        "appearance": "high-contrast",
        "current_admin_password": current_password,
    }


def test_onboarding_status_starts_required_and_completes_once(client):
    name = f"Local {secrets.token_hex(8)}"

    initial_status = client.get("/api/onboarding/status")
    completed_status = client.post(
        "/api/onboarding/complete",
        json=onboarding_payload(name),
        headers={"Origin": "http://127.0.0.1:8000"},
    )
    repeated_completion = client.post(
        "/api/onboarding/complete",
        json=onboarding_payload(name),
        headers={"Origin": "http://127.0.0.1:8000"},
    )

    assert initial_status.json() == {
        "required": True,
        "completed": False,
        "completed_at": None,
    }
    assert completed_status.status_code == 201
    assert completed_status.json()["required"] is False
    assert completed_status.json()["completed"] is True
    assert repeated_completion.status_code == 409


def test_onboarding_rejects_hostile_browser_origin(client):
    response = client.post(
        "/api/onboarding/complete",
        json=onboarding_payload("Local User"),
        headers={"Origin": "https://hostile.example.test"},
    )

    assert response.status_code == 403


def test_onboarding_requires_browser_origin(client):
    response = client.post(
        "/api/onboarding/complete",
        json=onboarding_payload("Local User"),
    )

    assert response.status_code == 403


def test_onboarding_validates_controlled_preferences(client):
    payload = onboarding_payload("Local User")
    payload["voice"] = "unknown"

    assert (
        client.post(
            "/api/onboarding/complete",
            json=payload,
            headers={"Origin": "http://127.0.0.1:8000"},
        ).status_code
        == 422
    )


def test_onboarding_requires_matching_admin_password_confirmation(client):
    payload = onboarding_payload("Local User")
    payload["admin_password_confirmation"] = "Different123"

    response = client.post(
        "/api/onboarding/complete",
        json=payload,
        headers={"Origin": "http://127.0.0.1:8000"},
    )

    assert response.status_code == 422


def test_onboarding_stores_personal_data_encrypted(isolated_settings):
    initialize_database()
    service = get_onboarding_service()
    name = f"Local {secrets.token_hex(12)}"

    service.complete(OnboardingRequest.model_validate(onboarding_payload(name)))

    with database_connection() as connection:
        row = connection.execute("SELECT payload_ciphertext, nonce FROM onboarding_profile WHERE id = 1").fetchone()

    assert row is not None
    assert name.encode("utf-8") not in row["payload_ciphertext"]
    assert b"StrongAdmin123" not in row["payload_ciphertext"]
    assert len(row["nonce"]) == 12
    assert settings.onboarding_key_path.is_file()
    assert service.read_profile().name == name
    assert service.read_profile().admin_credential.password_hash != "StrongAdmin123"


def test_onboarding_profile_response_excludes_admin_credential(client):
    name = f"Local {secrets.token_hex(8)}"

    client.post(
        "/api/onboarding/complete",
        json=onboarding_payload(name),
        headers={"Origin": "http://127.0.0.1:8000"},
    )
    response = client.get("/api/onboarding/profile", headers={"Origin": "http://127.0.0.1:8000"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["name"] == name
    assert "admin_credential" not in payload
    assert "admin_password" not in payload


def test_onboarding_profile_update_requires_current_admin_password(client):
    name = f"Local {secrets.token_hex(8)}"
    client.post(
        "/api/onboarding/complete",
        json=onboarding_payload(name),
        headers={"Origin": "http://127.0.0.1:8000"},
    )

    response = client.put(
        "/api/onboarding/profile",
        json=update_payload("Updated Local", current_password="WrongAdmin123"),
        headers={"Origin": "http://127.0.0.1:8000"},
    )

    assert response.status_code == 403


def test_onboarding_profile_can_be_edited_and_admin_password_rotated(client):
    name = f"Local {secrets.token_hex(8)}"
    client.post(
        "/api/onboarding/complete",
        json=onboarding_payload(name),
        headers={"Origin": "http://127.0.0.1:8000"},
    )
    payload = update_payload("Updated Local")
    payload["new_admin_password"] = "NewStrongAdmin123"
    payload["new_admin_password_confirmation"] = "NewStrongAdmin123"

    response = client.put(
        "/api/onboarding/profile",
        json=payload,
        headers={"Origin": "http://127.0.0.1:8000"},
    )
    old_password_response = client.put(
        "/api/onboarding/profile",
        json=update_payload("Second Update", current_password="StrongAdmin123"),
        headers={"Origin": "http://127.0.0.1:8000"},
    )
    new_password_response = client.put(
        "/api/onboarding/profile",
        json=update_payload("Second Update", current_password="NewStrongAdmin123"),
        headers={"Origin": "http://127.0.0.1:8000"},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Updated Local"
    assert response.json()["profile"] == "elderly"
    assert old_password_response.status_code == 403
    assert new_password_response.status_code == 200


def test_onboarding_repository_prevents_plaintext_overwrite(isolated_settings):
    initialize_database()
    service = get_onboarding_service()
    request = OnboardingRequest.model_validate(onboarding_payload("Local User"))

    service.complete(request)

    with pytest.raises(OnboardingAlreadyCompletedError):
        service.complete(request)


def test_onboarding_crypto_rejects_tampered_payload(tmp_path):
    crypto = OnboardingCrypto(tmp_path / "keys" / "onboarding.key")
    nonce, ciphertext = crypto.encrypt({"name": "Local User"})
    tampered = ciphertext[:-1] + bytes([ciphertext[-1] ^ 1])

    with pytest.raises(OnboardingCryptoError):
        crypto.decrypt(nonce=nonce, ciphertext=tampered)
