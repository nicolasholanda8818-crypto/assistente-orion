from __future__ import annotations

import socket
import threading
import time
from collections.abc import Iterator
from urllib.error import URLError
from urllib.request import urlopen

import pytest
import uvicorn

from tests.e2e.scenario_app import create_scenario_app


@pytest.fixture(scope="session")
def e2e_base_url() -> Iterator[str]:
    with socket.socket() as port_probe:
        port_probe.bind(("127.0.0.1", 0))
        port = port_probe.getsockname()[1]

    server = uvicorn.Server(
        uvicorn.Config(
            create_scenario_app(),
            host="127.0.0.1",
            port=port,
            log_level="warning",
        )
    )
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{port}"

    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        try:
            with urlopen(f"{base_url}/api/health", timeout=0.2) as response:  # noqa: S310
                if response.status == 200:
                    break
        except (TimeoutError, URLError):
            time.sleep(0.05)
    else:
        server.should_exit = True
        thread.join(timeout=5)
        raise RuntimeError("ORION E2E scenario server did not start")

    yield base_url

    server.should_exit = True
    thread.join(timeout=5)
