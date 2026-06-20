import ast
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IGNORED_DIRS = {".git", ".sandbox-tmp", ".venv", "__pycache__", "dist", "storage", "venv"}
PRIVATE_FILE_SUFFIXES = {".key", ".p12", ".pfx", ".pem"}
SCANNED_SOURCE_SUFFIXES = {
    ".cjs",
    ".html",
    ".js",
    ".json",
    ".mjs",
    ".ps1",
    ".py",
    ".sql",
    ".toml",
    ".ts",
    ".yaml",
    ".yml",
}
SENSITIVE_NAME = re.compile(
    r"(?:access[_-]?key|api[_-]?key|client[_-]?secret|credential|jwt[_-]?(?:key|secret)|"
    r"passphrase|passwd|password|private[_-]?key|refresh[_-]?token|secret|token)",
    re.IGNORECASE,
)
HARDCODED_ASSIGNMENT = re.compile(
    r"""(?ix)
    \b[A-Za-z_][A-Za-z0-9_.-]*
    (?:access[_-]?key|api[_-]?key|client[_-]?secret|credential|jwt[_-]?(?:key|secret)|
    passphrase|passwd|password|private[_-]?key|refresh[_-]?token|secret|token)
    [A-Za-z0-9_.-]*\b
    \s*[:=]\s*
    (?P<quote>["'])
    (?P<value>[^"'\\r\\n]+)
    (?P=quote)
    """,
)
SECRET_PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "GitHub token": re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{30,}\b"),
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "OpenAI-style API key": re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    "JWT": re.compile(r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b"),
}


def iter_source_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in IGNORED_DIRS for part in path.relative_to(root).parts):
            continue
        yield path


def get_tracked_files(root: Path) -> set[Path]:
    try:
        result = subprocess.run(
            ["git", "ls-files", "-z"],
            cwd=root,
            check=True,
            capture_output=True,
            stdin=subprocess.DEVNULL,
            text=True,
        )
    except (FileNotFoundError, subprocess.CalledProcessError):
        return set()

    return {Path(item) for item in result.stdout.split("\0") if item}


def iter_assigned_names(target: ast.expr):
    if isinstance(target, ast.Name):
        yield target.id
    elif isinstance(target, (ast.List, ast.Tuple)):
        for element in target.elts:
            yield from iter_assigned_names(element)


def find_python_literal_assignments(path: Path, content: str) -> list[str]:
    try:
        tree = ast.parse(content, filename=str(path))
    except SyntaxError:
        return []

    issues = []
    for node in ast.walk(tree):
        targets = []
        value = None
        if isinstance(node, ast.Assign):
            targets = node.targets
            value = node.value
        elif isinstance(node, ast.AnnAssign):
            targets = [node.target]
            value = node.value

        if not isinstance(value, ast.Constant) or not isinstance(value.value, str) or not value.value.strip():
            continue

        for target in targets:
            for name in iter_assigned_names(target):
                if SENSITIVE_NAME.search(name):
                    issues.append(f"Hardcoded sensitive value in {path}:{node.lineno}")
    return issues


def find_literal_assignments(path: Path, content: str) -> list[str]:
    issues = []
    for match in HARDCODED_ASSIGNMENT.finditer(content):
        if match.group("value").strip():
            line = content.count("\n", 0, match.start()) + 1
            issues.append(f"Hardcoded sensitive value in {path}:{line}")
    return issues


def validate_environment_example(path: Path, content: str) -> list[str]:
    issues = []
    for line_number, line in enumerate(content.splitlines(), start=1):
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        name, value = stripped.split("=", 1)
        if SENSITIVE_NAME.search(name) and value.strip():
            issues.append(f"Sensitive example value must be empty in {path}:{line_number}")
    return issues


def check_secrets(root: Path = ROOT, tracked_files: set[Path] | None = None) -> None:
    root = root.resolve()
    tracked_files = get_tracked_files(root) if tracked_files is None else tracked_files
    issues = []

    for path in iter_source_files(root):
        relative_path = path.relative_to(root)

        if path.name == ".env.example":
            issues.extend(validate_environment_example(relative_path, path.read_text(encoding="utf-8")))
            continue

        if (
            path.name == ".env" or path.name.startswith(".env.") or path.suffix.lower() in PRIVATE_FILE_SUFFIXES
        ) and relative_path in tracked_files:
            issues.append(f"Sensitive file must not be committed: {relative_path}")
            continue

        if path.name == ".env" or path.name.startswith(".env."):
            continue

        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        for label, pattern in SECRET_PATTERNS.items():
            if pattern.search(content):
                issues.append(f"Possible {label} in {relative_path}")

        if path.suffix.lower() in SCANNED_SOURCE_SUFFIXES:
            issues.extend(find_literal_assignments(relative_path, content))
            if path.suffix.lower() == ".py":
                issues.extend(find_python_literal_assignments(relative_path, content))

    if issues:
        raise RuntimeError("\n".join(dict.fromkeys(issues)))

    print("Secret scan passed")


if __name__ == "__main__":
    check_secrets()
