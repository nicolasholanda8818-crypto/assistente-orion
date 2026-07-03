from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"


def read_doc(name: str) -> str:
    return (DOCS / name).read_text(encoding="utf-8")


def test_ops_2_cognitive_core_docs_exist_and_define_contracts():
    expected_docs = [
        "COGNITIVE_CORE.md",
        "VISION_ENGINE.md",
        "DOCUMENT_ENGINE.md",
        "MEMORY_SYSTEM.md",
        "WEB_SEARCH.md",
    ]

    for doc_name in expected_docs:
        assert (DOCS / doc_name).exists(), doc_name

    cognitive_core = read_doc("COGNITIVE_CORE.md")
    assert "OPS 2.0" in cognitive_core
    assert "Fluxo Cognitivo" in cognitive_core
    assert "Modo Professor" in cognitive_core
    assert "Modo Pesquisador" in cognitive_core
    assert "nunca deve expor cadeia interna completa" in cognitive_core


def test_ops_2_memory_vision_document_and_search_rules_are_documented():
    memory = read_doc("MEMORY_SYSTEM.md")
    vision = read_doc("VISION_ENGINE.md")
    documents = read_doc("DOCUMENT_ENGINE.md")
    web_search = read_doc("WEB_SEARCH.md")

    for category in ["Projetos", "Programacao", "Conversas", "Arquivos", "PDFs", "Imagens"]:
        assert category in memory

    assert "Nao afirmar identidade de pessoas" in vision
    assert "Nunca executar arquivos enviados" in documents
    assert "Quando Pesquisar" in web_search
    assert "Consulta sensivel e bloqueada" in web_search
