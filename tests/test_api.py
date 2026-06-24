def test_health_check(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "Orion",
        "environment": "development",
    }


def test_render_healthz(client):
    response = client.get("/healthz")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_application_status(client):
    response = client.get("/api/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["backend"] == "online"
    assert payload["database"]["status"] == "ready"
    assert payload["database"]["metadata_records"] == 5
    assert payload["pwa"]["static_dir"] == "frontend"
    assert payload["pwa"]["cache_name"] == "orion-pwa-v37-files-documents"
    assert payload["brain"]["mode"] == "deterministic-fallback"
    assert payload["brain"]["components"]["memory"] == "volatile+user-sqlite+continuity"
    assert payload["brain"]["components"]["orion_memory"] == "profile-facts-summaries"
    assert payload["tools"]["enabled"] == 3
    assert payload["models"]["external_calls"] == "disabled"
    assert payload["voice"]["fallback_provider"] == "speech-synthesis"
    assert payload["voice"]["states"] == ["listening", "thinking", "responding"]
    assert payload["web_search"]["requires_user_confirmation"] is True
    assert "news.summary" in payload["web_search"]["capabilities"]
    assert payload["files"]["status"] == "ready"
    assert ".pdf" in payload["files"]["allowed_extensions"]
    assert ".pptx" in payload["files"]["allowed_extensions"]
    assert payload["onboarding"]["required"] is True


def test_frontend_pwa_files_are_served(client):
    assert client.get("/").status_code == 200
    assert client.get("/index.html").status_code == 200
    assert client.get("/assets/css/styles.css").headers["content-type"].startswith("text/css")
    assert client.get("/assets/js/main.js").headers["content-type"].startswith("text/javascript")
    assert client.get("/manifest.webmanifest").headers["content-type"].startswith("application/manifest+json")
    assert client.get("/service-worker.js").headers["content-type"].startswith("text/javascript")
    assert client.get("/offline.html").status_code == 200


def test_brain_status(client):
    response = client.get("/api/brain/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["components"]["memory"] == "volatile+user-sqlite+continuity"
    assert payload["components"]["execution"] == "side-effect-free"


def test_brain_process(client):
    response = client.post("/api/brain/process", json={"text": "Orion, status"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["intent"] == "system.status"
    assert payload["message"] == "Orion Brain esta online em modo local deterministico."
    assert payload["reasoning_state"] == "answering"
    assert payload["should_speak"] is True


def test_brain_process_learns_user_name_and_greets_later(client):
    first_response = client.post(
        "/api/brain/process",
        json={"text": "oi", "conversation_id": "profile-api-a", "user_id": "browser-api-a"},
    )

    assert first_response.status_code == 200
    assert first_response.json()["intent"] == "user.name.request"
    assert first_response.json()["memory_prompt"] is True

    name_response = client.post(
        "/api/brain/process",
        json={"text": "meu nome e Joao", "conversation_id": "profile-api-a", "user_id": "browser-api-a"},
    )

    assert name_response.status_code == 200
    name_payload = name_response.json()
    assert name_payload["intent"] == "user.name.set"
    assert name_payload["user_name"] == "Joao"
    assert "Joao" in name_payload["message"]

    greeting_response = client.post(
        "/api/brain/process",
        json={"text": "oi", "conversation_id": "profile-api-b", "user_id": "browser-api-a"},
    )

    assert greeting_response.status_code == 200
    greeting_payload = greeting_response.json()
    assert greeting_payload["intent"] == "greeting"
    assert greeting_payload["user_name"] == "Joao"
    assert "Joao" in greeting_payload["message"]


def test_brain_process_remembers_project_summary(client):
    client.post(
        "/api/brain/process",
        json={"text": "me chamo Marina", "conversation_id": "summary-api-a", "user_id": "browser-api-summary"},
    )
    project_response = client.post(
        "/api/brain/process",
        json={
            "text": "Estou criando um jogo de aventura",
            "conversation_id": "summary-api-a",
            "user_id": "browser-api-summary",
        },
    )

    assert project_response.status_code == 200

    greeting_response = client.post(
        "/api/brain/process",
        json={"text": "oi", "conversation_id": "summary-api-b", "user_id": "browser-api-summary"},
    )

    assert greeting_response.status_code == 200
    payload = greeting_response.json()
    assert payload["user_name"] == "Marina"
    assert "jogo de aventura" in payload["message"]


def test_brain_process_connects_feeling_after_user_returns(client):
    client.post(
        "/api/brain/process",
        json={"text": "me chamo Nicolas", "conversation_id": "continuity-api-a", "user_id": "browser-api-cont"},
    )
    feeling_response = client.post(
        "/api/brain/process",
        json={"text": "estou cansado", "conversation_id": "continuity-api-a", "user_id": "browser-api-cont"},
    )

    assert feeling_response.status_code == 200
    assert feeling_response.json()["emotion"] == "tired"

    return_response = client.post(
        "/api/brain/process",
        json={"text": "voltei", "conversation_id": "continuity-api-b", "user_id": "browser-api-cont"},
    )

    assert return_response.status_code == 200
    payload = return_response.json()
    assert payload["intent"] == "returning"
    assert "Nicolas" in payload["message"]
    assert "Conseguiu descansar" in payload["message"]


def test_brain_process_remembers_goals_without_new_schema(client):
    client.post(
        "/api/brain/process",
        json={"text": "me chamo Lara", "conversation_id": "goal-api-a", "user_id": "browser-api-goal"},
    )
    goal_response = client.post(
        "/api/brain/process",
        json={
            "text": "meu objetivo e publicar o Orion no Render",
            "conversation_id": "goal-api-a",
            "user_id": "browser-api-goal",
        },
    )

    assert goal_response.status_code == 200
    assert goal_response.json()["intent"] == "goal.setting"

    recall_response = client.post(
        "/api/brain/process",
        json={"text": "lembra de mim?", "conversation_id": "goal-api-b", "user_id": "browser-api-goal"},
    )

    assert recall_response.status_code == 200
    assert "publicar o Orion no Render" in recall_response.json()["message"]


def test_brain_process_does_not_store_memory_recall_as_topic(client):
    client.post(
        "/api/brain/process",
        json={"text": "me chamo Clara", "conversation_id": "recall-api-a", "user_id": "browser-api-recall"},
    )
    recall_response = client.post(
        "/api/brain/process",
        json={"text": "lembra de mim?", "conversation_id": "recall-api-a", "user_id": "browser-api-recall"},
    )

    assert recall_response.status_code == 200
    assert recall_response.json()["intent"] == "memory.recall"

    greeting_response = client.post(
        "/api/brain/process",
        json={"text": "oi", "conversation_id": "recall-api-b", "user_id": "browser-api-recall"},
    )

    assert greeting_response.status_code == 200
    assert "lembra mim" not in greeting_response.json()["message"]


def test_brain_process_rejects_invalid_payload(client):
    assert client.post("/api/brain/process", json={"text": ""}).status_code == 422
    assert client.post("/api/brain/process", json={"text": "status", "unexpected": True}).status_code == 422


def test_voice_status_api(client):
    response = client.get("/api/voice/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["fallback_provider"] == "speech-synthesis"
    assert "teacher" in payload["modes"]


def test_web_search_api_requires_permission_before_network(client):
    response = client.post(
        "/api/web-search/query",
        json={"query": "versao mais recente do Python", "allow_external": False},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "permission-required"
    assert payload["search_type"] == "technical"
    assert payload["searched_online"] is False
    assert payload["results"] == []


def test_files_status_api(client):
    response = client.get("/api/files/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ready"
    assert payload["max_upload_bytes"] >= 1_000_000
    assert ".exe" in payload["blocked_extensions"]


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
