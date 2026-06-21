from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"


def read_frontend(path: str) -> str:
    return (FRONTEND / path).read_text(encoding="utf-8")


def test_design_system_stylesheet_imports_all_layers():
    stylesheet = read_frontend("assets/css/styles.css")

    assert '@import url("./tokens.css");' in stylesheet
    assert '@import url("./base.css");' in stylesheet
    assert '@import url("./components.css");' in stylesheet
    assert '@import url("./accessibility.css");' in stylesheet


def test_design_system_declares_supported_themes_and_accessibility_contracts():
    tokens = read_frontend("assets/css/tokens.css")
    accessibility = read_frontend("assets/css/accessibility.css")

    assert 'html[data-theme="dark"]' in tokens
    assert 'html[data-theme="light"]' in tokens
    assert 'html[data-theme="high-contrast"]' in tokens
    assert "--color-focus-ring" in tokens
    assert ".skip-link" in accessibility
    assert '[data-profile="elderly"]' in accessibility
    assert "@media (prefers-reduced-motion: reduce)" in accessibility
    assert "@media (forced-colors: active)" in accessibility


def test_shell_exposes_accessible_navigation_and_event_feed():
    index = read_frontend("index.html")

    assert 'class="skip-link"' in index
    assert 'aria-current="page"' in index
    assert 'for="message-input"' in index
    assert 'role="log"' in index
    assert 'aria-live="polite"' in index
    assert 'id="orion-avatar"' in index
    assert 'id="orion-bubble"' in index
    assert 'id="mic-button"' in index
    assert 'id="camera-button"' in index


def test_service_worker_caches_design_system_assets():
    service_worker = read_frontend("service-worker.js")

    assert 'const CACHE_NAME = "orion-pwa-v25-render";' in service_worker
    assert 'requestUrl.pathname.startsWith("/assets/js/")' in service_worker
    assert 'requestUrl.pathname.startsWith("/assets/css/")' in service_worker
    assert '"/assets/css/tokens.css"' in service_worker
    assert '"/assets/css/base.css"' in service_worker
    assert '"/assets/css/components.css"' in service_worker
    assert '"/assets/css/accessibility.css"' in service_worker
    assert '"/assets/js/design-system.js"' in service_worker
    assert '"/assets/js/living-avatar.js"' in service_worker
    assert '"/assets/js/onboarding.js"' in service_worker


def test_shell_contains_accessible_first_run_onboarding():
    index = read_frontend("index.html")

    assert 'id="onboarding-layer"' in index
    assert 'role="dialog"' in index
    assert 'aria-modal="true"' in index
    assert 'id="onboarding-name"' in index
    assert 'name="response_style"' in index
    assert 'name="profile"' in index
    assert 'name="voice"' in index
    assert 'name="appearance"' in index
    assert 'name="admin_password"' in index
    assert 'name="admin_password_confirmation"' in index
    assert 'name="current_admin_password"' in index


def test_orion_visual_chat_controller_exposes_required_functions():
    main = read_frontend("assets/js/main.js")

    for function_name in [
        "initOrionVisual",
        "setOrionState",
        "showOrionBubble",
        "blinkOrionEyes",
        "animateOrionSpeaking",
        "animateOrionThinking",
        "handleOrionTouch",
        "addChatMessage",
        "typeOrionMessage",
        "trimVisibleMessages",
        "sendMessageToOrion",
        "connectWebSocket",
        "showConnectionStatus",
    ]:
        assert f"function {function_name}" in main
