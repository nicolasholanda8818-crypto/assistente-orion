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
