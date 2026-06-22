from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import create_app
from app.onboarding.dependencies import get_onboarding_service


@pytest.fixture
def isolated_settings(tmp_path, monkeypatch):
    database_path = tmp_path / "orion-test.db"
    log_path = tmp_path / "logs"

    monkeypatch.setattr(settings, "database_url", f"sqlite:///{database_path.as_posix()}")
    monkeypatch.setattr(settings, "log_dir", str(log_path))
    monkeypatch.setattr(settings, "onboarding_crypto_path", str(tmp_path / "keys" / "onboarding.key"))
    monkeypatch.setattr(settings, "file_storage_path", str(tmp_path / "files"))
    get_onboarding_service.cache_clear()

    yield settings
    get_onboarding_service.cache_clear()


@pytest.fixture
def client(isolated_settings) -> Iterator[TestClient]:
    with TestClient(create_app()) as test_client:
        yield test_client
