from __future__ import annotations

import re
import urllib.parse
import urllib.request
from dataclasses import dataclass
from html.parser import HTMLParser

from app.core.config import settings
from app.orion_web_search.models import WebSearchResponse, WebSearchResult, WebSearchStatus

SEARCH_TERMS = {
    "pesquise",
    "pesquisar",
    "busque",
    "buscar",
    "procure",
    "noticias",
    "noticia",
    "mais recente",
    "versao mais recente",
    "versao atual",
    "atual",
    "hoje",
    "agora",
}
SENSITIVE_PATTERNS = [
    re.compile(r"\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b"),
    re.compile(r"\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b"),
    re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    re.compile(r"\b(senha|token|segredo|cpf|cartao|cartão|api key|chave privada)\b", re.IGNORECASE),
]


@dataclass(frozen=True)
class RawSearchResult:
    title: str
    url: str
    snippet: str


class SearchClient:
    def search(self, query: str, *, max_results: int) -> list[RawSearchResult]:
        raise NotImplementedError


class CompositeSearchClient(SearchClient):
    def __init__(self, clients: list[SearchClient]) -> None:
        self.clients = clients

    def search(self, query: str, *, max_results: int) -> list[RawSearchResult]:
        last_error: Exception | None = None
        for client in self.clients:
            try:
                results = client.search(query, max_results=max_results)
            except Exception as exc:
                last_error = exc
                continue
            if results:
                return results
        if last_error:
            raise last_error
        return []


class DuckDuckGoHtmlClient(SearchClient):
    def search(self, query: str, *, max_results: int) -> list[RawSearchResult]:
        encoded = urllib.parse.urlencode({"q": query})
        url = f"https://duckduckgo.com/html/?{encoded}"
        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": "OrionLocalAssistant/0.1 (+https://local.orion)",
                "Accept": "text/html,application/xhtml+xml",
            },
        )
        with urllib.request.urlopen(request, timeout=settings.web_search_timeout_seconds) as response:
            html = response.read().decode("utf-8", errors="replace")
        parser = DuckDuckGoHtmlParser()
        parser.feed(html)
        return parser.results[:max_results]


class MojeekHtmlClient(SearchClient):
    def search(self, query: str, *, max_results: int) -> list[RawSearchResult]:
        encoded = urllib.parse.urlencode({"q": query})
        url = f"https://www.mojeek.com/search?{encoded}"
        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 OrionLocalAssistant/0.1",
                "Accept": "text/html,application/xhtml+xml",
            },
        )
        with urllib.request.urlopen(request, timeout=settings.web_search_timeout_seconds) as response:
            html = response.read().decode("utf-8", errors="replace")
        parser = MojeekHtmlParser()
        parser.feed(html)
        return parser.results[:max_results]


class DuckDuckGoHtmlParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.results: list[RawSearchResult] = []
        self._in_title = False
        self._in_snippet = False
        self._title_parts: list[str] = []
        self._snippet_parts: list[str] = []
        self._pending_url = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        classes = set((attributes.get("class") or "").split())
        if tag == "a" and "result__a" in classes:
            self._in_title = True
            self._title_parts = []
            self._pending_url = clean_result_url(attributes.get("href") or "")
        elif tag in {"a", "div"} and ("result__snippet" in classes or "result__body" in classes):
            self._in_snippet = True
            self._snippet_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._in_title:
            self._in_title = False
        elif tag in {"a", "div"} and self._in_snippet:
            self._in_snippet = False
            title = normalize_space(" ".join(self._title_parts))
            snippet = normalize_space(" ".join(self._snippet_parts))
            if title and self._pending_url and not any(result.url == self._pending_url for result in self.results):
                self.results.append(RawSearchResult(title=title, url=self._pending_url, snippet=snippet))

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self._title_parts.append(data)
        elif self._in_snippet:
            self._snippet_parts.append(data)


class MojeekHtmlParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.results: list[RawSearchResult] = []
        self._in_title = False
        self._in_snippet = False
        self._title_parts: list[str] = []
        self._snippet_parts: list[str] = []
        self._pending_url = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        classes = set((attributes.get("class") or "").split())
        if tag == "a" and "title" in classes:
            self._in_title = True
            self._title_parts = []
            self._snippet_parts = []
            self._pending_url = attributes.get("href") or ""
        elif tag == "p" and "s" in classes and self._pending_url:
            self._in_snippet = True
            self._snippet_parts = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._in_title:
            self._in_title = False
        elif tag == "p" and self._in_snippet:
            self._in_snippet = False
            title = normalize_space(" ".join(self._title_parts))
            snippet = normalize_space(" ".join(self._snippet_parts))
            if title and self._pending_url and not any(result.url == self._pending_url for result in self.results):
                self.results.append(RawSearchResult(title=title, url=self._pending_url, snippet=snippet))
            self._pending_url = ""

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self._title_parts.append(data)
        elif self._in_snippet:
            self._snippet_parts.append(data)


class WebSearchService:
    def __init__(self, client: SearchClient | None = None) -> None:
        self.client = client or CompositeSearchClient([DuckDuckGoHtmlClient(), MojeekHtmlClient()])

    def status(self) -> WebSearchStatus:
        return WebSearchStatus(
            status="ready",
            provider=settings.web_search_provider,
            enabled=settings.web_search_enabled,
            requires_user_confirmation=True,
            max_results=settings.web_search_max_results,
            restrictions=[
                "explicit-user-confirmation-required",
                "no-private-memory-in-query",
                "sensitive-query-blocklist",
                "source-attribution-required",
            ],
        )

    def should_search(self, text: str) -> bool:
        normalized = normalize_for_detection(text)
        return any(term in normalized for term in SEARCH_TERMS)

    def search(self, *, query: str, allow_external: bool, max_results: int | None = None) -> WebSearchResponse:
        clean_query = sanitize_query(query)
        limit = min(max_results or settings.web_search_max_results, settings.web_search_max_results)

        if not settings.web_search_enabled:
            return self._response(
                status="blocked",
                query=clean_query,
                searched_online=False,
                summary="A pesquisa web esta desativada nesta instalacao.",
                results=[],
            )
        if not allow_external:
            return self._response(
                status="permission-required",
                query=clean_query,
                searched_online=False,
                summary="Preciso da sua confirmacao antes de pesquisar na internet.",
                results=[],
            )
        if contains_sensitive_content(clean_query):
            return self._response(
                status="blocked",
                query=clean_query,
                searched_online=False,
                summary=(
                    "Nao vou enviar dados sensiveis para pesquisa externa. "
                    "Remova senhas, tokens, CPF, cartoes ou informacoes pessoais."
                ),
                results=[],
            )

        try:
            raw_results = self.client.search(clean_query, max_results=limit)
        except TimeoutError:
            return self._offline_response(clean_query)
        except OSError:
            return self._offline_response(clean_query)
        except Exception:
            return self._response(
                status="error",
                query=clean_query,
                searched_online=False,
                summary=(
                    "Nao consegui concluir a pesquisa online agora, "
                    "mas posso responder com o conhecimento disponivel."
                ),
                results=[],
            )

        results = [
            WebSearchResult(
                title=result.title[:180],
                url=result.url[:500],
                snippet=result.snippet[:420],
                source=source_from_url(result.url),
            )
            for result in raw_results
            if result.title and result.url
        ][:limit]
        if not results:
            return self._response(
                status="error",
                query=clean_query,
                searched_online=True,
                summary="Pesquisei, mas nao encontrei resultados confiaveis para resumir.",
                results=[],
            )

        return self._response(
            status="ready",
            query=clean_query,
            searched_online=True,
            summary=summarize_results(clean_query, results),
            results=results,
        )

    def _offline_response(self, query: str) -> WebSearchResponse:
        return self._response(
            status="offline",
            query=query,
            searched_online=False,
            summary="Nao consegui acessar fontes online agora, mas posso responder com o conhecimento disponivel.",
            results=[],
        )

    def _response(
        self,
        *,
        status: str,
        query: str,
        searched_online: bool,
        summary: str,
        results: list[WebSearchResult],
    ) -> WebSearchResponse:
        prefix = (
            "Pesquisei na internet e encontrei fontes recentes."
            if searched_online
            else "Pesquisa online nao executada."
        )
        sources_notice = (
            "Informacao obtida pela internet."
            if searched_online
            else "Informacao local ou sem acesso online."
        )
        return WebSearchResponse(
            status=status,
            query=query,
            provider=settings.web_search_provider,
            searched_online=searched_online,
            summary=summary,
            results=results,
            message=f"{prefix} {summary}",
            sources_notice=sources_notice,
        )


def sanitize_query(value: str) -> str:
    clean = normalize_space(value.replace("\x00", " "))
    return clean[:220]


def normalize_space(value: str) -> str:
    return " ".join(value.split())


def normalize_for_detection(value: str) -> str:
    return normalize_space(value.lower())


def contains_sensitive_content(value: str) -> bool:
    return any(pattern.search(value) for pattern in SENSITIVE_PATTERNS)


def clean_result_url(url: str) -> str:
    if not url:
        return ""
    if url.startswith("//duckduckgo.com/l/?"):
        parsed = urllib.parse.urlparse(f"https:{url}")
        query = urllib.parse.parse_qs(parsed.query)
        return urllib.parse.unquote(query.get("uddg", [""])[0])
    if url.startswith("/l/?"):
        parsed = urllib.parse.urlparse(f"https://duckduckgo.com{url}")
        query = urllib.parse.parse_qs(parsed.query)
        return urllib.parse.unquote(query.get("uddg", [""])[0])
    return url


def source_from_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    return parsed.netloc.replace("www.", "") or "fonte online"


def summarize_results(query: str, results: list[WebSearchResult]) -> str:
    top = results[:3]
    details = []
    for index, result in enumerate(top, start=1):
        snippet = result.snippet or "resultado sem trecho disponivel"
        details.append(f"{index}. {result.title}: {snippet}")
    joined = " ".join(details)
    return f"Para '{query}', os resultados mais relevantes indicam: {joined}"
