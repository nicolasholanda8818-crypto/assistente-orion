from pathlib import Path

from app.core.config import settings
from app.db.connection import database_connection

SCHEMA_PATH = Path("database/schema.sql")
SEED_PATH = Path("database/seed.sql")
MIGRATIONS_PATH = Path("database/migrations")


def _column_exists(connection, table_name: str, column_name: str) -> bool:
    rows = connection.execute(f"PRAGMA table_info({table_name})").fetchall()
    return any(row["name"] == column_name for row in rows)


def run_lightweight_migrations(connection) -> None:
    if not _column_exists(connection, "websocket_events", "connection_id"):
        connection.execute("ALTER TABLE websocket_events ADD COLUMN connection_id TEXT")


def run_sql_migrations(connection) -> None:
    if not MIGRATIONS_PATH.exists():
        return

    for migration_path in sorted(MIGRATIONS_PATH.glob("*.sql")):
        connection.executescript(migration_path.read_text(encoding="utf-8"))


def initialize_database() -> None:
    settings.database_path.parent.mkdir(parents=True, exist_ok=True)
    settings.log_path.mkdir(parents=True, exist_ok=True)

    with database_connection() as connection:
        connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        run_lightweight_migrations(connection)
        run_sql_migrations(connection)
        connection.executescript(SEED_PATH.read_text(encoding="utf-8"))
