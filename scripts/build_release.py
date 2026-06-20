import argparse
import compileall
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from generate_changelog import generate_changelog
from generate_wiki import generate_wiki
from validate_pwa import ROOT, validate_pwa

INCLUDED_DIRECTORIES = [
    ".github",
    "app",
    "changelog",
    "database",
    "docs",
    "frontend",
    "models",
    "platforms",
    "plugins",
    "release-candidates",
    "scripts",
    "tests",
]
INCLUDED_FILES = [
    ".env.example",
    "AGENTS.md",
    "ARCHITECTURE.md",
    "BACKEND.md",
    "BACKLOG.md",
    "BRAIN.md",
    "CHANGELOG.md",
    "CHANGELOG_SYSTEM.md",
    "CI_CD.md",
    "CONTRIBUTING.md",
    "DATABASE.md",
    "DESIGN_SYSTEM.md",
    "DISTRIBUTION.md",
    "FRONTEND.md",
    "INSTALLATION.md",
    "MODEL_ARCHITECTURE.md",
    "ONBOARDING.md",
    "PLUGIN_SYSTEM.md",
    "PLATFORM_ARCHITECTURE.md",
    "PROJECT_STATUS.md",
    "README.md",
    "RELEASE_CANDIDATE.md",
    "ROADMAP.md",
    "SECRETS_POLICY.md",
    "SECURITY.md",
    "THREAT_MODEL.md",
    "TOOL_SYSTEM.md",
    "TODO.md",
    "WIKI.md",
    "pyproject.toml",
    "requirements.txt",
    "requirements-dev.txt",
]
IGNORED_PARTS = {"__pycache__", ".pytest_cache", ".ruff_cache"}
IGNORED_SUFFIXES = {".db", ".log", ".pyc"}


def should_include(path: Path) -> bool:
    relative_path = path.relative_to(ROOT)
    return not any(part in IGNORED_PARTS for part in relative_path.parts) and path.suffix not in IGNORED_SUFFIXES


def iter_release_files():
    for filename in INCLUDED_FILES:
        path = ROOT / filename
        if path.is_file():
            yield path

    for directory in INCLUDED_DIRECTORIES:
        for path in sorted((ROOT / directory).rglob("*")):
            if path.is_file() and should_include(path):
                yield path


def build_release(output_path: Path) -> None:
    generate_changelog()
    generate_wiki()
    validate_pwa()

    if not compileall.compile_dir(ROOT / "app", quiet=1):
        raise RuntimeError("Python compilation failed")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output_path, "w", compression=ZIP_DEFLATED) as archive:
        for path in iter_release_files():
            archive.write(path, path.relative_to(ROOT))

    print(f"Build artifact created: {output_path.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=ROOT / "dist" / "orion-foundation.zip")
    args = parser.parse_args()
    build_release(args.output.resolve())


if __name__ == "__main__":
    main()
