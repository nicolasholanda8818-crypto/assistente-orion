from fastapi import APIRouter

from app.hosting.models import HostingStatus
from app.hosting.service import HostingService

hosting_router = APIRouter(prefix="/hosting", tags=["hosting"])


@hosting_router.get("/status", response_model=HostingStatus)
def hosting_status() -> HostingStatus:
    return HostingService().status()
