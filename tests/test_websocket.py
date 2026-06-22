import time

from app.db import repositories


def wait_for_event(event_type: str, timeout: float = 1.0) -> list[dict]:
    deadline = time.monotonic() + timeout

    while time.monotonic() < deadline:
        events = repositories.list_websocket_events(limit=10)
        if any(event["event_type"] == event_type for event in events):
            return events
        time.sleep(0.01)

    return repositories.list_websocket_events(limit=10)


def test_websocket_ready_broadcast_and_audit(client):
    with client.websocket_connect("/ws") as websocket:
        ready = websocket.receive_json()
        assert ready["type"] == "system.ready"
        assert ready["payload"]["message"] == "Orion WebSocket connected"
        assert ready["payload"]["connections"] == 1

        websocket.send_json({"message": "hello"})
        broadcast = websocket.receive_json()
        assert broadcast["type"] == "client.message"
        assert broadcast["payload"]["message"] == "hello"
        response = websocket.receive_json()
        assert response["type"] == "orion.response"
        assert response["payload"]["message"]
        assert response["payload"]["intent"]
        assert response["payload"]["emotion"]
        assert response["payload"]["avatar_mood"]
        assert response["payload"]["avatar_reaction"]
        assert response["payload"]["suggested_animation"]
        assert response["payload"]["reasoningState"]
        assert response["payload"]["responseLength"] in {"short", "medium", "long"}
        assert response["payload"]["urgency"] in {"low", "normal", "high"}
        assert response["payload"]["shouldSpeak"] is True

    events = wait_for_event("connection.closed")
    event_types = [event["event_type"] for event in events]
    assert "connection.opened" in event_types
    assert "client.message" in event_types
    assert "connection.closed" in event_types


def test_websocket_accepts_plain_text(client):
    with client.websocket_connect("/ws") as websocket:
        websocket.receive_json()
        websocket.send_text("plain text")

        broadcast = websocket.receive_json()
        assert broadcast["payload"] == {"message": "plain text"}
        response = websocket.receive_json()
        assert response["type"] == "orion.response"
        assert response["payload"]["message"]
        assert response["payload"]["avatar_mood"]


def test_websocket_user_memory_flow(client):
    with client.websocket_connect("/ws?userId=browser-ws-a") as websocket:
        ready = websocket.receive_json()
        assert ready["type"] == "system.ready"

        welcome = websocket.receive_json()
        assert welcome["type"] == "orion.response"
        assert welcome["payload"]["intent"] == "user.name.request"
        assert welcome["payload"]["memoryPrompt"] is True

        websocket.send_json({"message": "Joao", "conversationId": "ws-memory-a", "userId": "browser-ws-a"})
        broadcast = websocket.receive_json()
        assert broadcast["type"] == "client.message"

        response = websocket.receive_json()
        assert response["type"] == "orion.response"
        assert response["payload"]["intent"] == "user.name.set"
        assert response["payload"]["userName"] == "Joao"
        assert "Joao" in response["payload"]["message"]
