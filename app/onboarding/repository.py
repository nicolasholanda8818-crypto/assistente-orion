import sqlite3

from app.db.connection import database_connection


class OnboardingAlreadyCompletedError(ValueError):
    pass


class OnboardingRepository:
    def status(self) -> sqlite3.Row | None:
        with database_connection() as connection:
            return connection.execute(
                """
                SELECT completed_at, updated_at
                FROM onboarding_profile
                WHERE id = 1
                """
            ).fetchone()

    def create(self, *, nonce: bytes, ciphertext: bytes) -> None:
        try:
            with database_connection() as connection:
                connection.execute(
                    """
                    INSERT INTO onboarding_profile (id, payload_ciphertext, nonce)
                    VALUES (1, ?, ?)
                    """,
                    (ciphertext, nonce),
                )
        except sqlite3.IntegrityError as exc:
            raise OnboardingAlreadyCompletedError("Onboarding is already completed.") from exc

    def encrypted_payload(self) -> sqlite3.Row | None:
        with database_connection() as connection:
            return connection.execute(
                """
                SELECT payload_ciphertext, nonce, key_version, completed_at, updated_at
                FROM onboarding_profile
                WHERE id = 1
                """
            ).fetchone()

    def update(self, *, nonce: bytes, ciphertext: bytes) -> None:
        with database_connection() as connection:
            cursor = connection.execute(
                """
                UPDATE onboarding_profile
                SET payload_ciphertext = ?,
                    nonce = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
                """,
                (ciphertext, nonce),
            )
            if cursor.rowcount != 1:
                raise LookupError("Onboarding profile does not exist.")
