from pathlib import Path

from app.core.config import settings


class LocalFileStorage:
    def __init__(self, root: Path | None = None) -> None:
        self._root = root or settings.file_storage_root

    @property
    def root(self) -> Path:
        return self._root

    def ensure_ready(self) -> None:
        self._root.mkdir(parents=True, exist_ok=True)

    def write_bytes(self, key: str, content: bytes) -> Path:
        safe_key = self._safe_key(key)
        self.ensure_ready()
        target = self._root / safe_key
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        return target

    def read_bytes(self, key: str) -> bytes:
        return (self._root / self._safe_key(key)).read_bytes()

    def list_keys(self) -> list[str]:
        if not self._root.exists():
            return []
        return sorted(
            str(path.relative_to(self._root)).replace("\\", "/")
            for path in self._root.rglob("*")
            if path.is_file()
        )

    def _safe_key(self, key: str) -> Path:
        path = Path(key.replace("\\", "/"))
        if path.is_absolute() or ".." in path.parts or not str(path).strip():
            raise ValueError("Invalid storage key.")
        return path
