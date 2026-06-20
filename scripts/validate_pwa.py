import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"

REQUIRED_FILES = [
    FRONTEND / "index.html",
    FRONTEND / "offline.html",
    FRONTEND / "manifest.webmanifest",
    FRONTEND / "service-worker.js",
    FRONTEND / "assets" / "css" / "styles.css",
    FRONTEND / "assets" / "css" / "tokens.css",
    FRONTEND / "assets" / "css" / "base.css",
    FRONTEND / "assets" / "css" / "components.css",
    FRONTEND / "assets" / "css" / "accessibility.css",
    FRONTEND / "assets" / "js" / "api.js",
    FRONTEND / "assets" / "js" / "design-system.js",
    FRONTEND / "assets" / "js" / "main.js",
    FRONTEND / "assets" / "js" / "onboarding.js",
    FRONTEND / "assets" / "js" / "pwa.js",
    FRONTEND / "assets" / "js" / "scene.js",
    FRONTEND / "assets" / "js" / "socket.js",
    FRONTEND / "assets" / "icons" / "orion-icon.svg",
    FRONTEND / "assets" / "icons" / "orion-maskable.svg",
]


def frontend_path(url_path: str) -> Path:
    if url_path == "/":
        return FRONTEND / "index.html"
    return FRONTEND / url_path.removeprefix("/")


def validate_pwa() -> None:
    missing_files = [str(path.relative_to(ROOT)) for path in REQUIRED_FILES if not path.is_file()]
    if missing_files:
        raise RuntimeError(f"Missing PWA files: {', '.join(missing_files)}")

    manifest = json.loads((FRONTEND / "manifest.webmanifest").read_text(encoding="utf-8"))
    required_manifest_keys = {
        "name",
        "short_name",
        "start_url",
        "scope",
        "display",
        "background_color",
        "theme_color",
        "icons",
    }
    missing_keys = sorted(required_manifest_keys - manifest.keys())
    if missing_keys:
        raise RuntimeError(f"Manifest keys missing: {', '.join(missing_keys)}")

    if manifest["display"] != "standalone":
        raise RuntimeError("Manifest display must be standalone")

    for icon in manifest["icons"]:
        icon_path = frontend_path(icon["src"])
        if not icon_path.is_file():
            raise RuntimeError(f"Manifest icon missing: {icon['src']}")

    service_worker = (FRONTEND / "service-worker.js").read_text(encoding="utf-8")
    cached_paths = re.findall(r'^\s*"(/[^"]*)",?\s*$', service_worker, flags=re.MULTILINE)
    for cached_path in cached_paths:
        asset_path = frontend_path(cached_path)
        if not asset_path.is_file():
            raise RuntimeError(f"Service Worker cache entry missing: {cached_path}")

    index_html = (FRONTEND / "index.html").read_text(encoding="utf-8")
    if 'rel="manifest"' not in index_html:
        raise RuntimeError("index.html does not reference the PWA manifest")

    print("PWA validation passed")


if __name__ == "__main__":
    validate_pwa()
