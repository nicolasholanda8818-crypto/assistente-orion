import pytest

from app.core.config import Settings


def test_database_path_accepts_sqlite_url():
    custom_settings = Settings(database_url="sqlite:///./data/example.db")

    assert custom_settings.database_path.as_posix() == "data/example.db"


def test_database_path_rejects_non_sqlite_url():
    custom_settings = Settings(database_url="postgresql://localhost/orion")

    with pytest.raises(ValueError, match="SQLite"):
        _ = custom_settings.database_path
