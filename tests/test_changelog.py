import json
from datetime import date

import pytest

from scripts.generate_changelog import (
    CHANGELOG_PATH,
    ChangelogOutdatedError,
    ChangelogValidationError,
    create_entry,
    generate_changelog,
    load_entries,
    render_changelog,
)


def write_json(path, payload):
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def test_generated_changelog_is_current():
    generate_changelog(check=True)


def test_changelog_documents_unreleased_entry():
    changelog = CHANGELOG_PATH.read_text(encoding="utf-8")

    assert "## [Nao lancado]" in changelog
    assert "Sistema de changelog automatico baseado em fragmentos estruturados." in changelog


def test_render_changelog_groups_released_entries(tmp_path):
    entries_path = tmp_path / "entries"
    entries_path.mkdir()
    releases_path = tmp_path / "releases.json"
    write_json(releases_path, {"releases": [{"version": "0.1.0", "date": "2026-06-02"}]})
    write_json(
        entries_path / "20260602-release.json",
        {
            "id": "20260602-release",
            "type": "fixed",
            "summary": "Correcao publicada.",
            "details": [],
            "date": "2026-06-02",
            "version": "0.1.0",
        },
    )

    changelog = render_changelog(entries_path=entries_path, releases_path=releases_path)

    assert "## [0.1.0] - 2026-06-02" in changelog
    assert "### Corrigido" in changelog
    assert "- Correcao publicada." in changelog


def test_create_entry_uses_unique_ids(tmp_path):
    first = create_entry(
        entry_type="added",
        summary="Fluxo novo",
        details=["Mantem Windows."],
        ticket="T0001",
        entries_path=tmp_path,
        created_at=date(2026, 6, 2),
    )
    second = create_entry(
        entry_type="added",
        summary="Fluxo novo",
        details=[],
        ticket=None,
        entries_path=tmp_path,
        created_at=date(2026, 6, 2),
    )

    assert first.name == "20260602-fluxo-novo.json"
    assert second.name == "20260602-fluxo-novo-2.json"
    assert json.loads(first.read_text(encoding="utf-8"))["ticket"] == "T0001"


def test_unknown_release_is_rejected(tmp_path):
    entries_path = tmp_path / "entries"
    entries_path.mkdir()
    releases_path = tmp_path / "releases.json"
    write_json(releases_path, {"releases": []})
    write_json(
        entries_path / "20260602-invalid.json",
        {
            "id": "20260602-invalid",
            "type": "added",
            "summary": "Entrada invalida.",
            "details": [],
            "date": "2026-06-02",
            "version": "9.9.9",
        },
    )

    with pytest.raises(ChangelogValidationError, match="unknown release"):
        load_entries(entries_path=entries_path, releases_path=releases_path)


def test_changelog_check_detects_drift(tmp_path):
    entries_path = tmp_path / "entries"
    entries_path.mkdir()
    releases_path = tmp_path / "releases.json"
    output_path = tmp_path / "CHANGELOG.md"
    write_json(releases_path, {"releases": []})
    output_path.write_text("stale\n", encoding="utf-8")

    with pytest.raises(ChangelogOutdatedError, match="outdated"):
        generate_changelog(output_path=output_path, entries_path=entries_path, releases_path=releases_path, check=True)
