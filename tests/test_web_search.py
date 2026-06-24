from app.orion_web_search.service import RawSearchResult, SearchClient, WebSearchService


class FakeSearchClient(SearchClient):
    def search(self, query: str, *, max_results: int) -> list[RawSearchResult]:
        return [
            RawSearchResult(
                title="Python Releases",
                url="https://www.python.org/downloads/",
                snippet=f"Latest release information for {query}.",
            ),
            RawSearchResult(
                title="Python News",
                url="https://blog.python.org/",
                snippet="Official Python project updates.",
            ),
        ][:max_results]


def test_web_search_requires_explicit_external_permission():
    response = WebSearchService(client=FakeSearchClient()).search(
        query="versao mais recente do Python",
        allow_external=False,
    )

    assert response.status == "permission-required"
    assert response.searched_online is False
    assert response.results == []


def test_web_search_summarizes_sources_without_memory_payload():
    response = WebSearchService(client=FakeSearchClient()).search(
        query="versao mais recente do Python",
        allow_external=True,
        max_results=2,
    )

    assert response.status == "ready"
    assert response.search_type == "technical"
    assert response.searched_online is True
    assert "versao mais recente do Python" in response.summary
    assert response.results[0].source == "python.org"
    assert response.source_count == 2
    assert "Gerar checklist de correcao" in response.suggested_followups
    assert "Informacao obtida pela internet." == response.sources_notice


def test_web_search_blocks_sensitive_queries():
    response = WebSearchService(client=FakeSearchClient()).search(
        query="pesquise minha senha 123",
        allow_external=True,
    )

    assert response.status == "blocked"
    assert response.searched_online is False
    assert "dados sensiveis" in response.summary


def test_web_search_detects_recency_requests():
    service = WebSearchService(client=FakeSearchClient())

    assert service.should_search("Qual e a versao mais recente do Python?")
    assert service.should_search("pesquise noticias de tecnologia")
    assert service.should_search("clima em Sao Paulo hoje")
    assert service.should_search("buscar documentacao FastAPI websocket")
    assert service.should_search("veja na web a ferramenta nova")
    assert service.should_search("compare fontes sobre GitHub Actions")
    assert service.should_search("o que saiu de novo em Docker")
    assert not service.should_search("me conte uma piada")


def test_web_search_supports_news_weather_and_technical_types():
    service = WebSearchService(client=FakeSearchClient())

    news = service.search(query="noticias de tecnologia", allow_external=True, search_type="auto")
    weather = service.search(query="clima em Curitiba", allow_external=True, search_type="auto")
    technical = service.search(query="erro websocket FastAPI", allow_external=True, search_type="auto")

    assert news.search_type == "news"
    assert "noticias" in news.summary
    assert weather.search_type == "weather"
    assert "clima" in weather.summary
    assert technical.search_type == "technical"
    assert "busca tecnica" in technical.summary.lower()


def test_web_search_status_documents_conversational_browser_capabilities():
    status = WebSearchService(client=FakeSearchClient()).status()

    assert status.supported_types == ["web", "news", "weather", "technical"]
    assert "news.summary" in status.capabilities
    assert "weather.lookup" in status.capabilities
    assert "technical.search" in status.capabilities
    assert "recency.detection" in status.capabilities
    assert "source.comparison" in status.capabilities
    assert "no-automatic-search-without-user-request" in status.restrictions
