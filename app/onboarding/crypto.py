import json
import os
import stat
from pathlib import Path
from typing import Any

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ASSOCIATED_DATA = b"orion:onboarding:v1"
NONCE_BYTES = 12


class OnboardingCryptoError(ValueError):
    pass


class OnboardingCrypto:
    def __init__(self, key_path: Path) -> None:
        self._key_path = key_path

    def encrypt(self, payload: dict[str, Any]) -> tuple[bytes, bytes]:
        nonce = os.urandom(NONCE_BYTES)
        plaintext = json.dumps(payload, ensure_ascii=True, sort_keys=True).encode("utf-8")
        ciphertext = AESGCM(self._load_or_create_key()).encrypt(nonce, plaintext, ASSOCIATED_DATA)
        return nonce, ciphertext

    def decrypt(self, *, nonce: bytes, ciphertext: bytes) -> dict[str, Any]:
        try:
            plaintext = AESGCM(self._load_or_create_key()).decrypt(nonce, ciphertext, ASSOCIATED_DATA)
            return json.loads(plaintext.decode("utf-8"))
        except (InvalidTag, ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise OnboardingCryptoError("Encrypted onboarding data could not be read.") from exc

    def _load_or_create_key(self) -> bytes:
        if self._key_path.exists():
            return self._read_key()

        self._key_path.parent.mkdir(parents=True, exist_ok=True)
        key = AESGCM.generate_key(bit_length=256)

        try:
            with self._key_path.open("xb") as key_file:
                key_file.write(key)
        except FileExistsError:
            return self._read_key()

        try:
            self._restrict_key_file()
        except OnboardingCryptoError:
            self._key_path.unlink(missing_ok=True)
            raise
        return key

    def _read_key(self) -> bytes:
        key = self._key_path.read_bytes()
        if len(key) != 32:
            raise OnboardingCryptoError("Onboarding key has an invalid size.")
        return key

    def _restrict_key_file(self) -> None:
        try:
            self._key_path.chmod(stat.S_IRUSR | stat.S_IWUSR)
        except OSError as exc:
            raise OnboardingCryptoError("Onboarding key permissions could not be restricted.") from exc
