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
    assert response.searched_online is True
    assert "versao mais recente do Python" in response.summary
    assert response.results[0].source == "python.org"
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
    assert not service.should_search("me conte uma piada")
