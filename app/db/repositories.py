import json
import sqlite3
from typing import Any

from app.db.connection import database_connection


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return dict(row)


def get_database_status() -> dict[str, Any]:
    with database_connection() as connection:
        metadata_count = connection.execute("SELECT COUNT(*) AS total FROM system_metadata").fetchone()
        event_count = connection.execute("SELECT COUNT(*) AS total FROM websocket_events").fetchone()

    return {
        "status": "ready",
        "metadata_records": metadata_count["total"],
        "websocket_events": event_count["total"],
    }


def get_system_metadata() -> dict[str, str]:
    with database_connection() as connection:
        rows = connection.execute("SELECT key, value FROM system_metadata ORDER BY key").fetchall()
        return {row["key"]: row["value"] for row in rows}


def create_websocket_event(
    *,
    event_type: str,
    payload: dict[str, Any] | str,
    connection_id: str | None = None,
) -> None:
    serialized_payload = payload if isinstance(payload, str) else json.dumps(payload)

    with database_connection() as connection:
        connection.execute(
            """
            INSERT INTO websocket_events (event_type, payload, connection_id)
            VALUES (?, ?, ?)
            """,
            (event_type, serialized_payload, connection_id),
        )


def list_websocket_events(limit: int = 50) -> list[dict[str, Any]]:
    with database_connection() as connection:
        rows = connection.execute(
            """
            SELECT * FROM websocket_events
            ORDER BY created_at DESC, id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
        return [dict(row) for row in rows]


def get_user_profile(user_id: str) -> dict[str, Any] | None:
    with database_connection() as connection:
        row = connection.execute(
            """
            SELECT user_id, display_name, created_at, updated_at, last_seen_at
            FROM orion_user_profiles
            WHERE user_id = ?
            """,
            (user_id,),
        ).fetchone()
        return row_to_dict(row)


def ensure_user_profile(user_id: str) -> dict[str, Any]:
    with database_connection() as connection:
        connection.execute(
            """
            INSERT INTO orion_user_profiles (user_id)
            VALUES (?)
            ON CONFLICT(user_id) DO UPDATE SET
                last_seen_at = CURRENT_TIMESTAMP
            """,
            (user_id,),
        )
        row = connection.execute(
            """
            SELECT user_id, display_name, created_at, updated_at, last_seen_at
            FROM orion_user_profiles
            WHERE user_id = ?
            """,
            (user_id,),
        ).fetchone()
        profile = row_to_dict(row)
        if profile is None:
            raise RuntimeError("Failed to create Orion user profile.")
        return profile


def set_user_display_name(user_id: str, display_name: str) -> dict[str, Any]:
    with database_connection() as connection:
        connection.execute(
            """
            INSERT INTO orion_user_profiles (user_id, display_name)
            VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                display_name = excluded.display_name,
                updated_at = CURRENT_TIMESTAMP,
                last_seen_at = CURRENT_TIMESTAMP
            """,
            (user_id, display_name),
        )
        row = connection.execute(
            """
            SELECT user_id, display_name, created_at, updated_at, last_seen_at
            FROM orion_user_profiles
            WHERE user_id = ?
            """,
            (user_id,),
        ).fetchone()
        profile = row_to_dict(row)
        if profile is None:
            raise RuntimeError("Failed to update Orion user profile.")
        return profile


def upsert_user_memory_fact(user_id: str, fact_type: str, fact_value: str) -> None:
    with database_connection() as connection:
        connection.execute(
            """
            INSERT INTO orion_user_memory (user_id, fact_type, fact_value)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, fact_type, fact_value) DO UPDATE SET
                weight = weight + 1,
                updated_at = CURRENT_TIMESTAMP
            """,
            (user_id, fact_type, fact_value),
        )


def list_user_memory_facts(user_id: str, limit: int = 20) -> list[dict[str, Any]]:
    with database_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, user_id, fact_type, fact_value, weight, created_at, updated_at
            FROM orion_user_memory
            WHERE user_id = ?
            ORDER BY weight DESC, updated_at DESC, id DESC
            LIMIT ?
            """,
            (user_id, limit),
        ).fetchall()
        return [dict(row) for row in rows]


def upsert_user_summary(user_id: str, summary: str, source_type: str = "conversation") -> None:
    with database_connection() as connection:
        connection.execute(
            """
            INSERT INTO orion_user_summaries (user_id, summary, source_type)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, summary) DO UPDATE SET
                weight = weight + 1,
                updated_at = CURRENT_TIMESTAMP
            """,
            (user_id, summary, source_type),
        )


def list_user_summaries(user_id: str, limit: int = 10) -> list[dict[str, Any]]:
    with database_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, user_id, summary, source_type, weight, created_at, updated_at
            FROM orion_user_summaries
            WHERE user_id = ?
            ORDER BY weight DESC, updated_at DESC, id DESC
            LIMIT ?
            """,
            (user_id, limit),
        ).fetchall()
        return [dict(row) for row in rows]
