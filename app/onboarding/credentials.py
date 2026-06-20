import hashlib
import hmac
import os

from app.onboarding.models import AdminCredential

HASH_SCHEME = "pbkdf2-sha256"
ADMIN_CREDENTIAL_ITERATIONS = 260_000
SALT_BYTES = 16


def create_admin_credential(password: str) -> AdminCredential:
    salt = os.urandom(SALT_BYTES)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        ADMIN_CREDENTIAL_ITERATIONS,
    )
    return AdminCredential(
        algorithm=HASH_SCHEME,
        iterations=ADMIN_CREDENTIAL_ITERATIONS,
        salt=salt.hex(),
        password_hash=password_hash.hex(),
    )


def verify_admin_password(password: str, credential: AdminCredential) -> bool:
    if credential.algorithm != HASH_SCHEME:
        return False

    expected_hash = bytes.fromhex(credential.password_hash)
    actual_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(credential.salt),
        credential.iterations,
    )
    return hmac.compare_digest(actual_hash, expected_hash)
