import sqlite3
from contextlib import closing

from app.core.config import settings
from app.db import repositories
from app.db.connection import database_connection
from app.db.init_db import initialize_database


def test_database_initialization_and_metadata(isolated_settings):
    initialize_database()

    metadata = repositories.get_system_metadata()
    status = repositories.get_database_status()

    assert metadata["project_name"] == "Orion"
    assert metadata["project_stage"] == "pwa-foundation"
    assert metadata["schema_version"] == "5"
    assert status == {
        "status": "ready",
        "metadata_records": 5,
        "websocket_events": 0,
    }


def test_database_connection_commits_changes(isolated_settings):
    initialize_database()

    with database_connection() as connection:
        connection.execute(
            "INSERT INTO system_metadata (key, value) VALUES (?, ?)",
            ("test_key", "test_value"),
        )

    assert repositories.get_system_metadata()["test_key"] == "test_value"


def test_websocket_event_repository(isolated_settings):
    initialize_database()

    repositories.create_websocket_event(
        event_type="test.event",
        payload={"message": "hello"},
        connection_id="connection-1",
    )
    repositories.create_websocket_event(
        event_type="test.raw",
        payload="raw-message",
        connection_id=None,
    )

    events = repositories.list_websocket_events(limit=10)
    assert len(events) == 2
    assert events[0]["event_type"] == "test.raw"
    assert events[1]["connection_id"] == "connection-1"


def test_user_memory_repository(isolated_settings):
    initialize_database()

    profile = repositories.ensure_user_profile("browser-db-a")
    assert profile["user_id"] == "browser-db-a"
    assert profile["display_name"] is None

    updated = repositories.set_user_display_name("browser-db-a", "Joao")
    assert updated["display_name"] == "Joao"

    repositories.upsert_user_memory_fact("browser-db-a", "preference", "programacao")
    repositories.upsert_user_memory_fact("browser-db-a", "preference", "programacao")
    facts = repositories.list_user_memory_facts("browser-db-a")

    assert facts[0]["fact_type"] == "preference"
    assert facts[0]["fact_value"] == "programacao"
    assert facts[0]["weight"] == 2

    repositories.upsert_user_summary("browser-db-a", "Projeto mencionado: jogo")
    repositories.upsert_user_summary("browser-db-a", "Projeto mencionado: jogo")
    summaries = repositories.list_user_summaries("browser-db-a")

    assert summaries[0]["summary"] == "Projeto mencionado: jogo"
    assert summaries[0]["weight"] == 2


def test_file_repository_isolated_by_user(isolated_settings):
    initialize_database()

    record = repositories.create_file_record(
        file_id="file-db-a",
        user_id="browser-db-files-a",
        original_name="erro.txt",
        safe_name="erro.txt",
        content_type="text/plain",
        extension=".txt",
        size_bytes=32,
        category="texto",
        source="upload",
        storage_path="users/browser-db-files-a/file-db-a_erro.txt",
    )

    assert record["id"] == "file-db-a"
    assert repositories.get_file_record("file-db-a", "browser-db-files-a") is not None
    assert repositories.get_file_record("file-db-a", "browser-db-files-b") is None

    updated = repositories.update_file_analysis(
        file_id="file-db-a",
        user_id="browser-db-files-a",
        analysis_status="ready",
        summary="Resumo tecnico",
        keywords_json='["websocket"]',
    )

    assert updated is not None
    assert updated["summary"] == "Resumo tecnico"
    assert repositories.list_file_records("browser-db-files-a")[0]["id"] == "file-db-a"
    assert repositories.delete_file_record("file-db-a", "browser-db-files-a") is not None
    assert repositories.get_file_record("file-db-a", "browser-db-files-a") is None


def test_lightweight_migration_adds_connection_id(isolated_settings):
    settings.database_path.parent.mkdir(parents=True, exist_ok=True)

    with closing(sqlite3.connect(settings.database_path)) as connection:
        connection.executescript(
            """
            CREATE TABLE websocket_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                payload TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )

    initialize_database()

    with closing(sqlite3.connect(settings.database_path)) as connection:
        columns = [row[1] for row in connection.execute("PRAGMA table_info(websocket_events)").fetchall()]

    assert "connection_id" in columns
