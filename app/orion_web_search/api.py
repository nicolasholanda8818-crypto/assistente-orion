from fastapi import APIRouter

from app.orion_web_search.models import WebSearchRequest, WebSearchResponse, WebSearchStatus
from app.orion_web_search.service import WebSearchService

web_search_router = APIRouter(prefix="/web-search", tags=["web-search"])


@web_search_router.get("/status", response_model=WebSearchStatus)
def web_search_status() -> WebSearchStatus:
    return WebSearchService().status()


@web_search_router.post("/query", response_model=WebSearchResponse)
def web_search_query(request: WebSearchRequest) -> WebSearchResponse:
    return WebSearchService().search(
        query=request.query,
        allow_external=request.allow_external,
        max_results=request.max_results,
        search_type=request.search_type,
    )
