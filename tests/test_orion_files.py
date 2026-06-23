import base64


def test_file_upload_list_analyze_and_delete_flow(client):
    upload_response = client.post(
        "/api/files/upload",
        data={"user_id": "browser-files-a", "category": "texto"},
        files={
            "file": (
                "erro-websocket.txt",
                b"Erro WebSocket no Render. Verifique wss e window.location.host.",
                "text/plain",
            )
        },
    )

    assert upload_response.status_code == 200
    uploaded = upload_response.json()["file"]
    assert uploaded["user_id"] == "browser-files-a"
    assert uploaded["category"] == "texto"
    assert uploaded["analysis_status"] == "pending"

    list_response = client.get("/api/files", params={"user_id": "browser-files-a"})
    assert list_response.status_code == 200
    assert [record["id"] for record in list_response.json()["files"]] == [uploaded["id"]]

    wrong_user_response = client.get(f"/api/files/{uploaded['id']}", params={"user_id": "browser-files-b"})
    assert wrong_user_response.status_code == 404

    analyze_response = client.post(
        f"/api/files/{uploaded['id']}/analyze",
        json={"user_id": "browser-files-a", "instructions": "explique o erro"},
    )

    assert analyze_response.status_code == 200
    analyzed = analyze_response.json()
    assert analyzed["file"]["analysis_status"] == "ready"
    assert "erro-websocket.txt" in analyzed["summary"]
    assert "websocket" in analyzed["keywords"]
    assert "pesquisar fontes atuais" in analyzed["message"]

    delete_response = client.delete(f"/api/files/{uploaded['id']}", params={"user_id": "browser-files-a"})
    assert delete_response.status_code == 200
    assert client.get(f"/api/files/{uploaded['id']}", params={"user_id": "browser-files-a"}).status_code == 404


def test_file_upload_blocks_dangerous_extension(client):
    response = client.post(
        "/api/files/upload",
        data={"user_id": "browser-files-safe", "category": "geral"},
        files={"file": ("setup.exe", b"MZ dangerous", "application/octet-stream")},
    )

    assert response.status_code == 400
    assert "bloqueado" in response.json()["detail"]


def test_camera_photo_upload_and_basic_analysis(client):
    png_bytes = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mP8z8AARQAElwG5Nq7xWQAAAABJRU5ErkJggg=="
    )
    payload = {
        "user_id": "browser-camera-a",
        "filename": "camera.png",
        "image_data": f"data:image/png;base64,{base64.b64encode(png_bytes).decode()}",
    }

    upload_response = client.post("/api/camera/photo", json=payload)

    assert upload_response.status_code == 200
    uploaded = upload_response.json()["file"]
    assert uploaded["source"] == "camera"
    assert uploaded["category"] == "camera"

    analyze_response = client.post(
        f"/api/files/{uploaded['id']}/analyze",
        json={"user_id": "browser-camera-a", "manual_description": "print de erro do navegador"},
    )

    assert analyze_response.status_code == 200
    body = analyze_response.json()
    assert body["file"]["analysis_status"] == "limited"
    assert "OCR" in body["summary"]
    assert "print de erro do navegador" in body["summary"]
