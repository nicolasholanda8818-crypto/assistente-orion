from pathlib import Path

import pytest

from scripts.check_secrets import check_secrets


def test_secret_scan_rejects_hardcoded_assignment(tmp_path: Path):
    source = "ADMIN_" + "PASS" + "WORD = " + repr("unsafe-value") + "\n"
    (tmp_path / "module.py").write_text(source, encoding="utf-8")

    with pytest.raises(RuntimeError, match="Hardcoded sensitive value"):
        check_secrets(tmp_path)


def test_secret_scan_allows_runtime_environment_loading(tmp_path: Path):
    name = "ADMIN_" + "PASS" + "WORD"
    source = f'import os\n{name} = os.environ["{name}"]\n'
    (tmp_path / "module.py").write_text(source, encoding="utf-8")

    check_secrets(tmp_path)


def test_secret_scan_rejects_tracked_environment_file(tmp_path: Path):
    environment_file = tmp_path / ".env"
    environment_file.write_text("APP_HOST=127.0.0.1\n", encoding="utf-8")

    with pytest.raises(RuntimeError, match="Sensitive file must not be committed"):
        check_secrets(tmp_path, tracked_files={Path(".env")})


def test_secret_scan_requires_empty_sensitive_example_value(tmp_path: Path):
    example = tmp_path / ".env.example"
    example.write_text("APP_HOST=127.0.0.1\nADMIN_" + "PASSWORD=\n", encoding="utf-8")
    check_secrets(tmp_path)

    example.write_text("ADMIN_" + "PASSWORD=unsafe-value\n", encoding="utf-8")
    with pytest.raises(RuntimeError, match="Sensitive example value must be empty"):
        check_secrets(tmp_path)
