from typing import Annotated
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.core.config import settings
from app.onboarding.dependencies import get_onboarding_service
from app.onboarding.models import (
    OnboardingProfileResponse,
    OnboardingRequest,
    OnboardingStatus,
    OnboardingUpdateRequest,
)
from app.onboarding.repository import OnboardingAlreadyCompletedError
from app.onboarding.service import InvalidAdminPasswordError, OnboardingNotCompletedError

onboarding_router = APIRouter(prefix="/onboarding", tags=["onboarding"])


def header_origin(value: str) -> str:
    parsed = urlparse(value)
    if not parsed.scheme or not parsed.netloc:
        return value.rstrip("/")
    return f"{parsed.scheme}://{parsed.netloc}"


def require_allowed_origin(
    origin: Annotated[str | None, Header()] = None,
    referer: Annotated[str | None, Header()] = None,
) -> None:
    if origin not in settings.cors_origins:
        if referer is None or header_origin(referer) not in settings.cors_origins:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Origin is not allowed.")


@onboarding_router.get("/status", response_model=OnboardingStatus)
def onboarding_status() -> OnboardingStatus:
    return get_onboarding_service().status()


@onboarding_router.post(
    "/complete",
    response_model=OnboardingStatus,
    dependencies=[Depends(require_allowed_origin)],
    status_code=status.HTTP_201_CREATED,
)
def complete_onboarding(payload: OnboardingRequest) -> OnboardingStatus:
    try:
        return get_onboarding_service().complete(payload)
    except OnboardingAlreadyCompletedError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@onboarding_router.get(
    "/profile",
    response_model=OnboardingProfileResponse,
    dependencies=[Depends(require_allowed_origin)],
)
def read_onboarding_profile() -> OnboardingProfileResponse:
    try:
        return get_onboarding_service().public_profile()
    except OnboardingNotCompletedError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@onboarding_router.put(
    "/profile",
    response_model=OnboardingProfileResponse,
    dependencies=[Depends(require_allowed_origin)],
)
def update_onboarding_profile(payload: OnboardingUpdateRequest) -> OnboardingProfileResponse:
    try:
        return get_onboarding_service().update_profile(payload)
    except OnboardingNotCompletedError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InvalidAdminPasswordError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
