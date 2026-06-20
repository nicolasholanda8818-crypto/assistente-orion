import hashlib
import json

import pytest

from scripts.build_release_candidate import ReleaseCandidateValidationError, build_candidate, load_candidate


def write_candidate(path, *, status="blocked-for-promotion", blockers=None):
    path.write_text(
        json.dumps(
            {
                "candidate": "0.1.0-rc.1",
                "scope": "local-foundation-evaluation-only",
                "promotion_status": status,
                "blockers": ["Known blocker."] if blockers is None else blockers,
            }
        ),
        encoding="utf-8",
    )


def test_blocked_candidate_requires_blocker(tmp_path):
    candidate_path = tmp_path / "candidate.json"
    write_candidate(candidate_path, blockers=[])

    with pytest.raises(ReleaseCandidateValidationError, match="at least one blocker"):
        load_candidate(candidate_path)


def test_release_candidate_builds_zip_checksum_and_manifest(tmp_path, monkeypatch):
    candidate_path = tmp_path / "candidate.json"
    output_dir = tmp_path / "dist"
    write_candidate(candidate_path)
    monkeypatch.setattr(
        "scripts.build_release_candidate.build_release",
        lambda artifact_path: artifact_path.write_bytes(b"orion-release-candidate"),
    )

    artifact_path, checksum_path, manifest_path = build_candidate(candidate_path=candidate_path, output_dir=output_dir)

    expected_sha256 = hashlib.sha256(b"orion-release-candidate").hexdigest()
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert artifact_path.is_file()
    assert checksum_path.read_text(encoding="utf-8") == f"{expected_sha256}  {artifact_path.name}\n"
    assert manifest["artifact_sha256"] == expected_sha256
    assert manifest["promotion_status"] == "blocked-for-promotion"
