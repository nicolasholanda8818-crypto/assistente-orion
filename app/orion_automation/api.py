from fastapi import APIRouter

from app.orion_automation.models import (
    AutomationActionRequest,
    AutomationActionResponse,
    AutomationRoutinePreview,
    AutomationRoutinePreviewRequest,
    AutomationStatus,
)
from app.orion_automation.service import AutomationService

automation_router = APIRouter(prefix="/automation", tags=["automation"])


@automation_router.get("/status", response_model=AutomationStatus)
def automation_status() -> AutomationStatus:
    return AutomationService().status()


@automation_router.post("/request", response_model=AutomationActionResponse)
def request_automation_action(request: AutomationActionRequest) -> AutomationActionResponse:
    return AutomationService().request_action(request)


@automation_router.post("/routines/preview", response_model=AutomationRoutinePreview)
def preview_automation_routine(request: AutomationRoutinePreviewRequest) -> AutomationRoutinePreview:
    return AutomationService().preview_routine(request)
