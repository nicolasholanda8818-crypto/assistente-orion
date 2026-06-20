import hashlib
import json

from scripts.prepare_distribution import evaluate_distribution


def test_distribution_readiness_blocks_non_promotable_candidate(tmp_path, monkeypatch):
    root = tmp_path / "orion"
    dist = root / "dist"
    release_docs = root / "docs" / "releases" / "0.1.0-rc.1"
    dist.mkdir(parents=True)
    release_docs.mkdir(parents=True)
    artifact = dist / "orion-foundation-0.1.0-rc.1.zip"
    artifact.write_bytes(b"blocked-candidate")
    artifact_sha256 = hashlib.sha256(b"blocked-candidate").hexdigest()
    (dist / "orion-foundation-0.1.0-rc.1.zip.sha256").write_text(
        f"{artifact_sha256}  {artifact.name}\n",
        encoding="utf-8",
    )
    manifest = dist / "orion-foundation-0.1.0-rc.1.manifest.json"
    manifest.write_text(
        json.dumps(
            {
                "candidate": "0.1.0-rc.1",
                "scope": "local-foundation-evaluation-only",
                "promotion_status": "blocked-for-promotion",
                "blockers": ["Known blocker."],
                "artifact": artifact.name,
                "artifact_sha256": artifact_sha256,
            }
        ),
        encoding="utf-8",
    )
    (release_docs / "RELEASE_CANDIDATE.md").write_text("# report\n", encoding="utf-8")
    (release_docs / "SECURITY_AUDIT.md").write_text("# security\n", encoding="utf-8")
    (release_docs / "performance.json").write_text('{"passed": true}\n', encoding="utf-8")

    monkeypatch.setattr("scripts.prepare_distribution.ROOT", root)

    report = evaluate_distribution(
        target_version="1.0.0",
        manifest_path=manifest,
        output_path=dist / "readiness.json",
    )

    assert report["status"] == "blocked"
    assert "Release Candidate is not ready for promotion review." in report["blockers"]
    assert "candidate_ready_for_promotion_review" in report["failed_checks"]
    assert "artifact_sha256_matches_manifest" not in report["failed_checks"]
