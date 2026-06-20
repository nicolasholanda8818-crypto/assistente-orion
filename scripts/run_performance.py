import argparse
import json
import logging
import platform
import statistics
import sys
import tempfile
import time
import tracemalloc
from collections.abc import Callable
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.brain.dependencies import get_brain_service  # noqa: E402
from app.core.config import settings  # noqa: E402
from app.db.init_db import initialize_database  # noqa: E402
from app.main import create_app  # noqa: E402
from app.model_runtime.dependencies import get_model_registry  # noqa: E402
from app.onboarding.dependencies import get_onboarding_service  # noqa: E402
from app.tools.dependencies import get_tool_registry  # noqa: E402

SANDBOX_PATH = ROOT / ".sandbox-tmp"
logging.getLogger("httpx").setLevel(logging.WARNING)


@dataclass(frozen=True)
class BenchmarkConfig:
    startup_iterations: int = 5
    rest_iterations: int = 150
    status_iterations: int = 75
    brain_iterations: int = 75
    websocket_iterations: int = 50


DEFAULT_CONFIG = BenchmarkConfig()


def percentile(values: list[float], ratio: float) -> float:
    ordered = sorted(values)
    index = min(round((len(ordered) - 1) * ratio), len(ordered) - 1)
    return ordered[index]


def measure(name: str, action: Callable[[], None], *, iterations: int, threshold_ms: float) -> dict[str, Any]:
    durations = []
    for _ in range(iterations):
        started_at = time.perf_counter()
        action()
        durations.append((time.perf_counter() - started_at) * 1000)

    p95_ms = percentile(durations, 0.95)
    return {
        "name": name,
        "iterations": iterations,
        "mean_ms": round(statistics.fmean(durations), 3),
        "p50_ms": round(percentile(durations, 0.50), 3),
        "p95_ms": round(p95_ms, 3),
        "max_ms": round(max(durations), 3),
        "threshold_p95_ms": threshold_ms,
        "passed": p95_ms <= threshold_ms,
    }


def clear_cached_services() -> None:
    get_brain_service.cache_clear()
    get_model_registry.cache_clear()
    get_onboarding_service.cache_clear()
    get_tool_registry.cache_clear()


def run_performance(
    *,
    output_path: Path | None = None,
    config: BenchmarkConfig | None = None,
) -> dict[str, Any]:
    config = DEFAULT_CONFIG if config is None else config
    SANDBOX_PATH.mkdir(parents=True, exist_ok=True)
    original_settings = {
        "database_url": settings.database_url,
        "log_dir": settings.log_dir,
        "onboarding_crypto_path": settings.onboarding_crypto_path,
    }

    cpu_started_at = time.process_time()
    wall_started_at = time.perf_counter()
    tracemalloc.start()

    try:
        with tempfile.TemporaryDirectory(
            prefix="performance-",
            dir=SANDBOX_PATH,
            ignore_cleanup_errors=True,
        ) as temp_directory:
            temp_path = Path(temp_directory)
            settings.log_dir = str(temp_path / "logs")
            settings.onboarding_crypto_path = str(temp_path / "keys" / "onboarding.key")

            startup_index = 0

            def initialize_clean_database() -> None:
                nonlocal startup_index
                settings.database_url = f"sqlite:///{(temp_path / f'startup-{startup_index}.db').as_posix()}"
                startup_index += 1
                initialize_database()

            metrics = [
                measure(
                    "database_startup",
                    initialize_clean_database,
                    iterations=config.startup_iterations,
                    threshold_ms=300,
                )
            ]

            settings.database_url = f"sqlite:///{(temp_path / 'benchmark.db').as_posix()}"
            clear_cached_services()

            with TestClient(create_app()) as client:
                client.get("/api/health").raise_for_status()

                metrics.append(
                    measure(
                        "rest_health",
                        lambda: client.get("/api/health").raise_for_status(),
                        iterations=config.rest_iterations,
                        threshold_ms=30,
                    )
                )
                metrics.append(
                    measure(
                        "rest_status",
                        lambda: client.get("/api/status").raise_for_status(),
                        iterations=config.status_iterations,
                        threshold_ms=75,
                    )
                )
                metrics.append(
                    measure(
                        "brain_process",
                        lambda: client.post("/api/brain/process", json={"text": "Orion, status"}).raise_for_status(),
                        iterations=config.brain_iterations,
                        threshold_ms=75,
                    )
                )

                with client.websocket_connect("/ws") as websocket:
                    websocket.receive_json()

                    def websocket_roundtrip() -> None:
                        websocket.send_json({"message": "benchmark"})
                        response = websocket.receive_json()
                        if response["type"] != "client.message":
                            raise RuntimeError("Unexpected WebSocket benchmark response.")

                    metrics.append(
                        measure(
                            "websocket_roundtrip",
                            websocket_roundtrip,
                            iterations=config.websocket_iterations,
                            threshold_ms=75,
                        )
                    )
    finally:
        _, peak_bytes = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        for name, value in original_settings.items():
            setattr(settings, name, value)
        clear_cached_services()

    wall_seconds = time.perf_counter() - wall_started_at
    cpu_seconds = time.process_time() - cpu_started_at
    peak_mib = peak_bytes / (1024 * 1024)
    result = {
        "schema_version": 1,
        "scope": "local-foundation-isolated",
        "environment": {
            "platform": platform.system(),
            "python": platform.python_version(),
        },
        "config": asdict(config),
        "metrics": metrics,
        "resources": {
            "wall_seconds": round(wall_seconds, 3),
            "cpu_seconds": round(cpu_seconds, 3),
            "cpu_ratio": round(cpu_seconds / wall_seconds, 3),
            "tracemalloc_peak_mib": round(peak_mib, 3),
            "threshold_peak_mib": 64,
            "passed": peak_mib <= 64,
        },
        "deferred": [
            {"metric": "vector_search", "reason": "ChromaDB memory is planned for T0013."},
            {"metric": "three_scene_load", "reason": "Three.js scene is planned for T0028."},
            {"metric": "backup_job", "reason": "Backup jobs are planned for T0035."},
        ],
    }
    result["passed"] = all(metric["passed"] for metric in metrics) and result["resources"]["passed"]

    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, help="Optional JSON report path.")
    parser.add_argument("--fail-on-threshold", action="store_true", help="Fail when a baseline threshold is exceeded.")
    args = parser.parse_args()

    result = run_performance(output_path=args.output)
    print(json.dumps(result, indent=2))
    if args.fail_on_threshold and not result["passed"]:
        raise SystemExit("Performance baseline failed.")


if __name__ == "__main__":
    main()
