import argparse
import hashlib
import json
import re
import sys
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
SCRIPTS_PATH = ROOT / "scripts"
if str(SCRIPTS_PATH) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_PATH))

from build_release import build_release  # noqa: E402

CANDIDATE_PATTERN = re.compile(r"^[0-9]+\.[0-9]+\.[0-9]+-rc\.[0-9]+$")
ALLOWED_PROMOTION_STATUSES = {"blocked-for-promotion", "ready-for-promotion-review"}
REQUIRED_FIELDS = {"candidate", "scope", "promotion_status", "blockers"}


class ReleaseCandidateValidationError(ValueError):
    pass


def load_candidate(candidate_path: Path) -> dict[str, Any]:
    payload = json.loads(candidate_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or set(payload) != REQUIRED_FIELDS:
        raise ReleaseCandidateValidationError(f"Candidate must contain only: {sorted(REQUIRED_FIELDS)}.")
    if not isinstance(payload["candidate"], str) or CANDIDATE_PATTERN.fullmatch(payload["candidate"]) is None:
        raise ReleaseCandidateValidationError("Candidate must use MAJOR.MINOR.PATCH-rc.NUMBER.")
    if payload["promotion_status"] not in ALLOWED_PROMOTION_STATUSES:
        raise ReleaseCandidateValidationError("Unsupported promotion status.")
    if not isinstance(payload["scope"], str) or not payload["scope"].strip():
        raise ReleaseCandidateValidationError("Candidate scope cannot be blank.")
    if not isinstance(payload["blockers"], list) or not all(
        isinstance(blocker, str) and blocker.strip() for blocker in payload["blockers"]
    ):
        raise ReleaseCandidateValidationError("Candidate blockers must be a list of non-empty strings.")
    if payload["promotion_status"] == "blocked-for-promotion" and not payload["blockers"]:
        raise ReleaseCandidateValidationError("Blocked candidates must declare at least one blocker.")
    if payload["promotion_status"] == "ready-for-promotion-review" and payload["blockers"]:
        raise ReleaseCandidateValidationError("Review-ready candidates cannot declare blockers.")
    return payload


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as artifact:
        for chunk in iter(lambda: artifact.read(64 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_candidate(*, candidate_path: Path, output_dir: Path) -> tuple[Path, Path, Path]:
    candidate = load_candidate(candidate_path)
    output_dir.mkdir(parents=True, exist_ok=True)
    artifact_path = output_dir / f"orion-foundation-{candidate['candidate']}.zip"
    build_release(artifact_path)

    artifact_sha256 = sha256_file(artifact_path)
    checksum_path = artifact_path.with_suffix(".zip.sha256")
    checksum_path.write_text(f"{artifact_sha256}  {artifact_path.name}\n", encoding="utf-8")

    manifest_path = output_dir / f"orion-foundation-{candidate['candidate']}.manifest.json"
    manifest = {
        **candidate,
        "created_on": date.today().isoformat(),
        "artifact": artifact_path.name,
        "artifact_sha256": artifact_sha256,
        "artifact_size_bytes": artifact_path.stat().st_size,
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return artifact_path, checksum_path, manifest_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--candidate",
        type=Path,
        default=ROOT / "release-candidates" / "0.1.0-rc.1.json",
        help="Release Candidate definition.",
    )
    parser.add_argument("--output-dir", type=Path, default=ROOT / "dist")
    args = parser.parse_args()

    try:
        artifact_path, checksum_path, manifest_path = build_candidate(
            candidate_path=args.candidate.resolve(),
            output_dir=args.output_dir.resolve(),
        )
    except ReleaseCandidateValidationError as exc:
        raise SystemExit(str(exc)) from exc

    print(f"Release Candidate artifact: {artifact_path.relative_to(ROOT)}")
    print(f"Release Candidate checksum: {checksum_path.relative_to(ROOT)}")
    print(f"Release Candidate manifest: {manifest_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
