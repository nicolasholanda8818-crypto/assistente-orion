from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class WebSearchRequest(StrictModel):
    query: str = Field(min_length=2, max_length=220)
    allow_external: bool = False
    max_results: int = Field(default=5, ge=1, le=8)
    search_type: Literal["auto", "web", "news", "weather", "technical"] = "auto"


class WebSearchResult(StrictModel):
    title: str
    url: str
    snippet: str
    source: str


class WebSearchResponse(StrictModel):
    status: Literal["ready", "permission-required", "blocked", "offline", "error"]
    query: str
    search_type: Literal["web", "news", "weather", "technical"]
    provider: str
    searched_online: bool
    summary: str
    results: list[WebSearchResult]
    source_count: int
    message: str
    sources_notice: str
    suggested_followups: list[str]


class WebSearchStatus(StrictModel):
    status: Literal["ready"]
    provider: str
    enabled: bool
    requires_user_confirmation: bool
    max_results: int
    supported_types: list[str]
    capabilities: list[str]
    restrictions: list[str]
