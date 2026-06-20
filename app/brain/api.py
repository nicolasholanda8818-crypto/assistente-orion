from typing import Annotated

from fastapi import APIRouter, Depends

from app.brain.dependencies import get_brain_service
from app.brain.models import BrainRequest, BrainResponse, BrainStatus
from app.brain.service import BrainService

brain_router = APIRouter(prefix="/brain", tags=["brain"])
BrainDependency = Annotated[BrainService, Depends(get_brain_service)]


@brain_router.get("/status", response_model=BrainStatus)
def brain_status(brain: BrainDependency) -> BrainStatus:
    return brain.status()


@brain_router.post("/process", response_model=BrainResponse)
def process_message(
    request: BrainRequest,
    brain: BrainDependency,
) -> BrainResponse:
    return brain.process(request)
