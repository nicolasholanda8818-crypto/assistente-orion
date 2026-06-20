from scripts.run_performance import BenchmarkConfig, run_performance


def test_performance_baseline_runs_in_isolated_storage(tmp_path):
    output_path = tmp_path / "performance.json"
    result = run_performance(
        output_path=output_path,
        config=BenchmarkConfig(
            startup_iterations=1,
            rest_iterations=2,
            status_iterations=2,
            brain_iterations=2,
            websocket_iterations=2,
        ),
    )

    assert result["scope"] == "local-foundation-isolated"
    assert result["passed"] is True
    assert {metric["name"] for metric in result["metrics"]} == {
        "database_startup",
        "rest_health",
        "rest_status",
        "brain_process",
        "websocket_roundtrip",
    }
    assert output_path.is_file()
