from uuid import uuid4

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket) -> str:
        await websocket.accept()
        connection_id = uuid4().hex
        self.active_connections[websocket] = connection_id
        return connection_id

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.pop(websocket, None)

    async def broadcast(self, message: dict) -> None:
        for connection in list(self.active_connections):
            await connection.send_json(message)

    def count(self) -> int:
        return len(self.active_connections)


manager = ConnectionManager()
