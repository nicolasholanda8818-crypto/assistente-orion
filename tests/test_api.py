def test_health_check(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "Orion",
        "environment": "development",
    }


def test_application_status(client):
    response = client.get("/api/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["backend"] == "online"
    assert payload["database"]["status"] == "ready"
    assert payload["database"]["metadata_records"] == 5
    assert payload["pwa"]["static_dir"] == "frontend"
    assert payload["brain"]["mode"] == "deterministic-fallback"
    assert payload["tools"]["enabled"] == 3
    assert payload["models"]["external_calls"] == "disabled"
    assert payload["onboarding"]["required"] is True


def test_frontend_pwa_files_are_served(client):
    assert client.get("/").status_code == 200
    assert client.get("/manifest.webmanifest").headers["content-type"].startswith("application/manifest+json")
    assert client.get("/service-worker.js").headers["content-type"].startswith("text/javascript")
    assert client.get("/offline.html").status_code == 200


def test_brain_status(client):
    response = client.get("/api/brain/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["components"]["memory"] == "volatile"
    assert payload["components"]["execution"] == "side-effect-free"


def test_brain_process(client):
    response = client.post("/api/brain/process", json={"text": "Orion, status"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["intent"] == "system.status"
    assert payload["message"] == "Orion Brain esta online em modo local deterministico."


def test_brain_process_rejects_invalid_payload(client):
    assert client.post("/api/brain/process", json={"text": ""}).status_code == 422
    assert client.post("/api/brain/process", json={"text": "status", "unexpected": True}).status_code == 422


def test_tool_catalog(client):
    response = client.get("/api/tools")

    assert response.status_code == 200
    payload = response.json()
    assert payload["enabled"] == 3
    assert payload["planned"] == 4
    tools = {tool["name"]: tool for tool in payload["tools"]}
    assert tools["control.open_program"]["availability"] == "planned"
    assert tools["files.read"]["ticket"] == "T0020"
    assert tools["finance.get_balance"]["ticket"] == "T0019"
    assert tools["models.generate"]["ticket"] == "T0017"


def test_model_catalog(client):
    response = client.get("/api/models")

    assert response.status_code == 200
    payload = response.json()
    assert payload["external_calls"] == "disabled"
    assert payload["selection_mode"] == "explicit-only"
    assert payload["models"] == []
    assert [provider["provider_id"] for provider in payload["providers"]] == [
        "ollama-local",
        "lm-studio-local",
        "openai-compatible",
        "future-provider-template",
    ]
    assert payload["providers"][2]["has_credential_ref"] is False
    assert "credential_ref" not in payload["providers"][2]
