from __future__ import annotations

from os import stat_result

from starlette.responses import Response
from starlette.staticfiles import StaticFiles


NO_STORE_PATHS = {
    "/",
    "/index.html",
    "/offline.html",
    "/service-worker.js",
    "/manifest.webmanifest",
}


class OrionStaticFiles(StaticFiles):
    """Serve arquivos estaticos com cache-control previsivel para rollout rapido."""

    def file_response(
        self,
        full_path: str,
        stat_result: stat_result,
        scope: dict,
        status_code: int = 200,
    ) -> Response:
        response = super().file_response(full_path, stat_result, scope, status_code)
        request_path = str(scope.get("path") or "")

        if request_path in NO_STORE_PATHS or request_path.endswith(".html"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
            return response

        if request_path.endswith((".js", ".css", ".json", ".webmanifest", ".svg", ".ico", ".map")):
            response.headers["Cache-Control"] = "no-cache, must-revalidate, max-age=0"

        return response