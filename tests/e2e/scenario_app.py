from __future__ import annotations

import secrets
from dataclasses import dataclass, field
from decimal import Decimal
from pathlib import Path
from typing import Literal

from fastapi import Depends, FastAPI, Header, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

STATIC_DIR = Path(__file__).parent / "static"
SCENARIO_PASSWORD = secrets.token_urlsafe(24)
SCENARIO_TOKEN = secrets.token_urlsafe(32)


class LoginRequest(BaseModel):
    username: str
    password: str


class UploadRequest(BaseModel):
    filename: str = Field(min_length=1)
    content: str


class FinanceRequest(BaseModel):
    kind: Literal["income", "expense"]
    amount: Decimal = Field(gt=0)
    category: str = Field(min_length=1)


@dataclass
class ScenarioState:
    uploads: list[dict[str, str]] = field(default_factory=list)
    finances: list[FinanceRequest] = field(default_factory=list)
    connections: set[WebSocket] = field(default_factory=set)

    @property
    def balance(self) -> Decimal:
        total = Decimal("0")
        for item in self.finances:
            total += item.amount if item.kind == "income" else -item.amount
        return total


def require_token(authorization: str | None = Header(default=None)) -> None:
    if authorization != f"Bearer {SCENARIO_TOKEN}":
        raise HTTPException(status_code=401, detail="Invalid scenario token")


def create_scenario_app() -> FastAPI:
    app = FastAPI(title="ORION E2E Scenario")
    state = ScenarioState()
    app.state.scenario = state

    @app.get("/")
    def scenario_page() -> FileResponse:
        return FileResponse(STATIC_DIR / "index.html")

    @app.get("/app.js")
    def scenario_script() -> FileResponse:
        return FileResponse(STATIC_DIR / "app.js", media_type="text/javascript")

    @app.get("/api/health")
    def scenario_health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/api/auth/login")
    def login(payload: LoginRequest) -> dict:
        if payload.username != "admin" or not secrets.compare_digest(payload.password, SCENARIO_PASSWORD):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {
            "token": SCENARIO_TOKEN,
            "user": {"display_name": "Administrador", "role": "admin"},
        }

    @app.post("/api/uploads", dependencies=[Depends(require_token)])
    def create_upload(payload: UploadRequest) -> dict[str, str]:
        upload = {"filename": payload.filename, "content": payload.content}
        state.uploads.append(upload)
        return {"filename": upload["filename"], "status": "stored"}

    @app.post("/api/finances", dependencies=[Depends(require_token)])
    def create_finance(payload: FinanceRequest) -> dict[str, str]:
        state.finances.append(payload)
        return {"balance": format(state.balance, ".2f")}

    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket) -> None:
        if websocket.query_params.get("token") != SCENARIO_TOKEN:
            await websocket.close(code=1008)
            return

        await websocket.accept()
        state.connections.add(websocket)
        await websocket.send_json({"type": "system.ready"})

        try:
            while True:
                message = await websocket.receive_json()
                for connection in list(state.connections):
                    await connection.send_json(message)
        except WebSocketDisconnect:
            state.connections.discard(websocket)

    return app
