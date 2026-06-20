import json

from scripts.generate_wiki import PLUGIN_SCHEMA_PATH, generate_wiki, render_wiki


def test_generated_wiki_is_current():
    generate_wiki(check=True)


def test_generated_wiki_documents_current_contracts():
    pages = render_wiki()

    assert set(pages) == {"README.md", "APIS.md", "DATABASE.md", "PLUGINS.md", "EVENTS.md"}
    assert "`GET` | `/api/health`" in pages["APIS.md"]
    assert "| `/ws` | `websocket_endpoint` |" in pages["APIS.md"]
    assert "## `onboarding_profile`" in pages["DATABASE.md"]
    assert "`minimum_orion_version`" in pages["PLUGINS.md"]
    assert "`system.ready`" in pages["EVENTS.md"]


def test_generate_wiki_writes_all_pages(tmp_path):
    generated_paths = generate_wiki(output_dir=tmp_path)

    assert {path.name for path in generated_paths} == {"README.md", "APIS.md", "DATABASE.md", "PLUGINS.md", "EVENTS.md"}
    assert all(path.exists() for path in generated_paths)


def test_plugin_manifest_schema_declares_security_metadata():
    schema = json.loads(PLUGIN_SCHEMA_PATH.read_text(encoding="utf-8"))

    assert schema["additionalProperties"] is False
    assert {"permissions", "signature", "checksum"} <= set(schema["required"])
