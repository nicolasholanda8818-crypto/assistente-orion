"""Shared event contracts for ORION modules and generated documentation."""

from app.events.catalog import (
    CLIENT_MESSAGE,
    CONNECTION_CLOSED,
    CONNECTION_OPENED,
    EVENT_CATALOG,
    SYSTEM_READY,
)

__all__ = [
    "CLIENT_MESSAGE",
    "CONNECTION_CLOSED",
    "CONNECTION_OPENED",
    "EVENT_CATALOG",
    "SYSTEM_READY",
]
