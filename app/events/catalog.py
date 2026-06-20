from dataclasses import dataclass

CONNECTION_OPENED = "connection.opened"
CONNECTION_CLOSED = "connection.closed"
CLIENT_MESSAGE = "client.message"
SYSTEM_READY = "system.ready"


@dataclass(frozen=True)
class EventField:
    name: str
    data_type: str
    required: bool
    description: str


@dataclass(frozen=True)
class EventDefinition:
    name: str
    direction: str
    transport: str
    persisted: bool
    description: str
    fields: tuple[EventField, ...]


EVENT_CATALOG = (
    EventDefinition(
        name=CONNECTION_OPENED,
        direction="WebSocket -> SQLite",
        transport="internal audit",
        persisted=True,
        description="Records the opening of a WebSocket connection.",
        fields=(EventField("connection_id", "string", True, "Ephemeral connection identifier."),),
    ),
    EventDefinition(
        name=CONNECTION_CLOSED,
        direction="WebSocket -> SQLite",
        transport="internal audit",
        persisted=True,
        description="Records the closing of a WebSocket connection.",
        fields=(EventField("connection_id", "string", True, "Ephemeral connection identifier."),),
    ),
    EventDefinition(
        name=CLIENT_MESSAGE,
        direction="client -> server -> connected clients",
        transport="WebSocket and internal audit",
        persisted=True,
        description="Carries the baseline client message broadcast.",
        fields=(EventField("payload", "JSON object or normalized text", True, "Baseline message payload."),),
    ),
    EventDefinition(
        name=SYSTEM_READY,
        direction="server -> client",
        transport="WebSocket",
        persisted=False,
        description="Confirms that the baseline WebSocket connection is ready.",
        fields=(
            EventField("connectionId", "string", True, "Ephemeral connection identifier."),
            EventField("message", "string", True, "Human-readable connection status."),
            EventField("connections", "integer", True, "Current local connection count."),
        ),
    ),
)
