import argparse
import hashlib
import json
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = ROOT / "dist" / "orion-foundation-0.1.0-rc.1.manifest.json"
DEFAULT_OUTPUT = ROOT / "dist" / "orion-distribution-readiness-1.0.0.json"


class DistributionReadinessError(ValueError):
    pass


def read_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise DistributionReadinessError(f"Required file is missing: {path}")
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise DistributionReadinessError(f"Expected JSON object in: {path}")
    return payload


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as artifact:
        for chunk in iter(lambda: artifact.read(64 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_check(name: str, passed: bool, detail: str) -> dict[str, Any]:
    return {"name": name, "passed": passed, "detail": detail}


def evaluate_distribution(
    *,
    target_version: str,
    manifest_path: Path,
    output_path: Path,
) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    artifact_path = manifest_path.parent / str(manifest.get("artifact", ""))
    checksum_path = artifact_path.with_suffix(".zip.sha256")
    release_docs_path = ROOT / "docs" / "releases" / str(manifest.get("candidate", "")) / "RELEASE_CANDIDATE.md"
    security_docs_path = ROOT / "docs" / "releases" / str(manifest.get("candidate", "")) / "SECURITY_AUDIT.md"
    performance_path = ROOT / "docs" / "releases" / str(manifest.get("candidate", "")) / "performance.json"

    checks = [
        build_check("manifest_exists", manifest_path.is_file(), str(manifest_path.relative_to(ROOT))),
        build_check("artifact_exists", artifact_path.is_file(), str(artifact_path.relative_to(ROOT))),
        build_check("checksum_exists", checksum_path.is_file(), str(checksum_path.relative_to(ROOT))),
        build_check("release_report_exists", release_docs_path.is_file(), str(release_docs_path.relative_to(ROOT))),
        build_check("security_audit_exists", security_docs_path.is_file(), str(security_docs_path.relative_to(ROOT))),
        build_check("performance_report_exists", performance_path.is_file(), str(performance_path.relative_to(ROOT))),
    ]

    if artifact_path.is_file() and "artifact_sha256" in manifest:
        actual_sha256 = sha256_file(artifact_path)
        checks.append(
            build_check(
                "artifact_sha256_matches_manifest",
                actual_sha256 == manifest["artifact_sha256"],
                actual_sha256,
            )
        )
    else:
        checks.append(build_check("artifact_sha256_matches_manifest", False, "artifact or manifest hash missing"))

    if performance_path.is_file():
        performance = read_json(performance_path)
        checks.append(
            build_check("performance_passed", performance.get("passed") is True, str(performance.get("passed")))
        )
    else:
        checks.append(build_check("performance_passed", False, "performance report missing"))

    promotion_status = str(manifest.get("promotion_status", "unknown"))
    checks.append(
        build_check(
            "candidate_ready_for_promotion_review",
            promotion_status == "ready-for-promotion-review",
            promotion_status,
        )
    )

    blockers = list(manifest.get("blockers", []))
    if promotion_status != "ready-for-promotion-review":
        blockers.append("Release Candidate is not ready for promotion review.")

    failed_checks = [check for check in checks if not check["passed"]]
    status = "ready-for-admin-review" if not blockers and not failed_checks else "blocked"
    report = {
        "schema_version": 1,
        "target_version": target_version,
        "generated_on": date.today().isoformat(),
        "status": status,
        "candidate": manifest.get("candidate"),
        "scope": manifest.get("scope"),
        "artifact": manifest.get("artifact"),
        "artifact_sha256": manifest.get("artifact_sha256"),
        "checks": checks,
        "blockers": blockers,
        "failed_checks": [check["name"] for check in failed_checks],
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--target-version", default="1.0.0")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--fail-on-blocked", action="store_true")
    args = parser.parse_args()

    try:
        report = evaluate_distribution(
            target_version=args.target_version,
            manifest_path=args.manifest.resolve(),
            output_path=args.output.resolve(),
        )
    except DistributionReadinessError as exc:
        raise SystemExit(str(exc)) from exc

    print(json.dumps(report, indent=2))
    if args.fail_on_blocked and report["status"] != "ready-for-admin-review":
        raise SystemExit("Distribution is blocked.")


if __name__ == "__main__":
    main()
