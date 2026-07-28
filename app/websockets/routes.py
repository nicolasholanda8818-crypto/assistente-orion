import json
import logging
import re
import time
from collections import deque
from urllib.parse import urlparse

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.brain.dependencies import get_brain_service
from app.brain.models import BrainRequest
from app.core.config import settings
from app.db import repositories
from app.events import CLIENT_MESSAGE, CONNECTION_CLOSED, CONNECTION_OPENED, SYSTEM_READY
from app.websockets.manager import manager

websocket_router = APIRouter()
logger = logging.getLogger(__name__)
SAFE_ID_PATTERN = re.compile(r"^[A-Za-z0-9_.-]{1,64}$")
SAFE_TOKEN_PATTERN = re.compile(r"^[A-Za-z0-9_.-]{8,128}$")


class ConnectionRateLimiter:
    def __init__(self) -> None:
        self._events: dict[str, deque[float]] = {}

    def allow(self, *, key: str, limit: int, window_seconds: int) -> bool:
        now = time.monotonic()
        queue = self._events.setdefault(key, deque())
        while queue and now - queue[0] > window_seconds:
            queue.popleft()
        if len(queue) >= limit:
            return False
        queue.append(now)
        return True

    def clear(self, *, key: str) -> None:
        self._events.pop(key, None)


rate_limiter = ConnectionRateLimiter()


@websocket_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    if not is_ws_origin_allowed(websocket):
        await websocket.close(code=1008, reason="Origin not allowed")
        return

    if not is_ws_session_token_valid(websocket):
        await websocket.close(code=1008, reason="Session token required")
        return

    connection_id = await manager.connect(websocket)
    user_id = sanitize_identifier(websocket.query_params.get("userId") or websocket.query_params.get("user_id"))
    repositories.create_websocket_event(
        event_type=CONNECTION_OPENED,
        payload={"connection_id": connection_id, "user_id": user_id},
        connection_id=connection_id,
    )

    try:
        await websocket.send_json(
            {
                "type": SYSTEM_READY,
                "payload": {
                    "connectionId": connection_id,
                    "message": "Orion WebSocket connected",
                    "connections": manager.count(),
                },
            }
        )
        if user_id:
            welcome = get_brain_service().welcome(user_id)
            await websocket.send_json(
                {
                    "type": "orion.response",
                    "payload": build_orion_payload(welcome),
                    "connectionId": connection_id,
                }
            )

        while True:
            raw_message = await websocket.receive_text()

            if settings.websocket_max_message_chars > 0 and len(raw_message) > settings.websocket_max_message_chars:
                await websocket.send_json(
                    {
                        "type": "orion.error",
                        "payload": {"message": "Mensagem muito longa. Reduza o tamanho e tente novamente."},
                        "connectionId": connection_id,
                    }
                )
                continue

            if settings.websocket_rate_limit_enabled and not rate_limiter.allow(
                key=connection_id,
                limit=settings.websocket_rate_limit_messages_per_window,
                window_seconds=settings.websocket_rate_limit_window_seconds,
            ):
                await websocket.send_json(
                    {
                        "type": "orion.error",
                        "payload": {"message": "Muitas mensagens em pouco tempo. Aguarde alguns segundos."},
                        "connectionId": connection_id,
                    }
                )
                continue

            repositories.create_websocket_event(
                event_type=CLIENT_MESSAGE,
                payload=raw_message,
                connection_id=connection_id,
            )

            try:
                payload = json.loads(raw_message)
            except json.JSONDecodeError:
                payload = {"message": raw_message}

            await manager.broadcast(
                {
                    "type": CLIENT_MESSAGE,
                    "payload": payload,
                    "connectionId": connection_id,
                }
            )

            text = str(payload.get("message") or payload.get("text") or "").strip()
            if text:
                try:
                    conversation_id = str(payload.get("conversationId") or connection_id)
                    message_user_id = sanitize_identifier(
                        str(payload.get("userId") or payload.get("user_id") or user_id or "")
                    )
                    response = get_brain_service().process(
                        BrainRequest(text=text, conversation_id=conversation_id, user_id=message_user_id)
                    )
                    await websocket.send_json(
                        {
                            "type": "orion.response",
                            "payload": build_orion_payload(response),
                            "connectionId": connection_id,
                        }
                    )
                except Exception:
                    logger.exception("Orion response failed")
                    await websocket.send_json(
                        {
                            "type": "orion.error",
                            "payload": {
                                "message": "Tive uma falha de conexão, Mestre. Vou tentar novamente.",
                            },
                            "connectionId": connection_id,
                        }
                    )
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        rate_limiter.clear(key=connection_id)
        repositories.create_websocket_event(
            event_type=CONNECTION_CLOSED,
            payload={"connection_id": connection_id},
            connection_id=connection_id,
        )
        logger.info("WebSocket disconnected")


def sanitize_identifier(value: str | None) -> str | None:
    if not value:
        return None
    return value if SAFE_ID_PATTERN.fullmatch(value) else None


def normalize_origin(value: str | None) -> str:
    if not value:
        return ""
    parsed = urlparse(value)
    if not parsed.scheme or not parsed.netloc:
        return value.rstrip("/")
    return f"{parsed.scheme}://{parsed.netloc}"


def is_ws_origin_allowed(websocket: WebSocket) -> bool:
    if not settings.websocket_require_origin_check:
        return True
    origin = normalize_origin(websocket.headers.get("origin"))
    allowed_origins = settings.websocket_allowed_origins or settings.cors_origins
    return origin in allowed_origins


def is_ws_session_token_valid(websocket: WebSocket) -> bool:
    if not settings.websocket_require_session_token:
        return True
    token = websocket.query_params.get("sessionToken") or websocket.query_params.get("session_token")
    if not token:
        return False
    if len(token) < settings.websocket_session_token_min_length:
        return False
    return SAFE_TOKEN_PATTERN.fullmatch(token) is not None


def build_orion_payload(response) -> dict:
    return {
        "message": response.message,
        "text": response.message,
        "intent": response.intent,
        "emotion": response.emotion,
        "keywords": response.keywords,
        "avatar_mood": response.avatar_mood,
        "avatar_reaction": response.avatar_reaction,
        "suggested_animation": response.suggested_animation,
        "reasoning_state": response.reasoning_state,
        "reasoningState": response.reasoning_state,
        "response_length": response.response_length,
        "responseLength": response.response_length,
        "urgency": response.urgency,
        "topic": response.topic,
        "should_speak": response.should_speak,
        "shouldSpeak": response.should_speak,
        "correlationId": response.correlation_id,
        "userName": response.user_name,
        "memoryPrompt": response.memory_prompt,
        "conversationStarter": response.conversation_starter,
        "dialogue_strategy": response.dialogue_strategy,
        "dialogueStrategy": response.dialogue_strategy,
        "should_search_web": response.should_search_web,
        "shouldSearchWeb": response.should_search_web,
        "searchQuery": response.search_query,
        "responseMode": response.response_mode,
    }
