import json
import logging
import re

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.brain.dependencies import get_brain_service
from app.brain.models import BrainRequest
from app.db import repositories
from app.events import CLIENT_MESSAGE, CONNECTION_CLOSED, CONNECTION_OPENED, SYSTEM_READY
from app.websockets.manager import manager

websocket_router = APIRouter()
logger = logging.getLogger(__name__)
SAFE_ID_PATTERN = re.compile(r"^[A-Za-z0-9_.-]{1,64}$")


@websocket_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
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
        "correlationId": response.correlation_id,
        "userName": response.user_name,
        "memoryPrompt": response.memory_prompt,
        "conversationStarter": response.conversation_starter,
    }
