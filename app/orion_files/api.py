from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status

from app.orion_files.models import (
    OrionCameraPhotoRequest,
    OrionFileAnalysisRequest,
    OrionFileAnalysisResponse,
    OrionFileList,
    OrionFileRecord,
    OrionFilesStatus,
    OrionFileUploadResponse,
)
from app.orion_files.service import OrionFilesService

files_router = APIRouter(prefix="/files", tags=["files"])
camera_router = APIRouter(prefix="/camera", tags=["camera"])


def get_files_service() -> OrionFilesService:
    return OrionFilesService()


FilesServiceDependency = Annotated[OrionFilesService, Depends(get_files_service)]


@files_router.get("/status", response_model=OrionFilesStatus)
def files_status(service: FilesServiceDependency) -> OrionFilesStatus:
    return service.status()


@files_router.post("/upload", response_model=OrionFileUploadResponse)
async def upload_file(
    service: FilesServiceDependency,
    file: Annotated[UploadFile, File(...)],
    user_id: Annotated[str, Form(min_length=1, max_length=64)],
    category: Annotated[str, Form(max_length=40)] = "geral",
    description: Annotated[str | None, Form(max_length=1000)] = None,
) -> OrionFileUploadResponse:
    try:
        return await service.save_upload(
            upload=file,
            user_id=user_id,
            category=category,
            description=description,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@files_router.get("", response_model=OrionFileList)
def list_files(
    service: FilesServiceDependency,
    user_id: Annotated[str, Query(min_length=1, max_length=64)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> OrionFileList:
    try:
        return OrionFileList(files=service.list_files(user_id=user_id, limit=limit))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@files_router.get("/{file_id}", response_model=OrionFileRecord)
def get_file(
    file_id: str,
    service: FilesServiceDependency,
    user_id: Annotated[str, Query(min_length=1, max_length=64)],
) -> OrionFileRecord:
    try:
        return service.get_file(file_id=file_id, user_id=user_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@files_router.delete("/{file_id}", response_model=OrionFileRecord)
def delete_file(
    file_id: str,
    service: FilesServiceDependency,
    user_id: Annotated[str, Query(min_length=1, max_length=64)],
) -> OrionFileRecord:
    try:
        return service.delete_file(file_id=file_id, user_id=user_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@files_router.post("/{file_id}/analyze", response_model=OrionFileAnalysisResponse)
def analyze_file(
    file_id: str,
    request: OrionFileAnalysisRequest,
    service: FilesServiceDependency,
) -> OrionFileAnalysisResponse:
    try:
        return service.analyze_file(
            file_id=file_id,
            user_id=request.user_id,
            instructions=request.instructions,
            manual_description=request.manual_description,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@camera_router.post("/photo", response_model=OrionFileUploadResponse)
def save_camera_photo(
    request: OrionCameraPhotoRequest,
    service: FilesServiceDependency,
) -> OrionFileUploadResponse:
    try:
        return service.save_camera_photo(
            image_data=request.image_data,
            user_id=request.user_id,
            filename=request.filename,
            category=request.category,
            description=request.description,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
