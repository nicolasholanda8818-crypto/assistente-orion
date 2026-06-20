def test_monitoring_metrics_endpoint_records_requests(client):
    client.get("/api/health")
    response = client.get("/api/monitoring/metrics")

    assert response.status_code == 200
    payload = response.json()
    assert payload["process"]["pid"] > 0
    assert payload["process"]["uptime_seconds"] >= 0
    assert "GET /api/health" in payload["requests"]
    assert payload["requests"]["GET /api/health"]["count"] >= 1


def test_prometheus_metrics_endpoint_returns_text(client):
    client.get("/api/health")
    response = client.get("/api/monitoring/prometheus")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/plain")
    assert "orion_process_uptime_seconds" in response.text
    assert 'orion_http_requests_total{method="GET",path="/api/health"}' in response.text
