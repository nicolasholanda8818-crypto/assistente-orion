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
    assert 'id="sidebar-toggle"' in index
    assert 'id="orion-sidebar"' in index
    assert 'data-sidebar-action="brain"' in index
    assert 'data-sidebar-action="portfolio"' in index
    assert 'data-sidebar-action="files"' in index
    assert 'data-sidebar-action="voice"' in index
    assert 'aria-current="page"' in index
    assert 'for="message-input"' in index
    assert 'role="log"' in index
    assert 'aria-live="polite"' in index
    assert 'id="orion-avatar"' in index
    assert 'id="orion-avatar-3d-shell"' in index
    assert 'id="orion-bubble"' in index
    assert 'id="mic-button"' in index
    assert 'id="camera-button"' in index
    assert 'id="brain-mode-button"' in index
    assert 'id="portfolio-mode-button"' in index
    assert "Avatar &lt;-&gt; Cerebro" in index
    assert 'id="avatar-studio-button"' in index
    assert 'id="avatar-studio-panel"' in index
    assert 'id="avatar-studio-preview"' in index
    assert 'id="avatar-reference-input"' in index
    assert 'id="avatar-analyze-image-button"' in index
    assert 'id="avatar-save-skin-button"' in index
    assert 'id="wardrobe-select"' in index
    assert 'value="adventurer"' in index
    assert 'value="lord-dragons"' in index
    assert 'value="tech"' in index
    assert 'id="voice-mode-select"' in index
    assert 'value="conversation"' in index
    assert 'value="calm"' in index
    assert 'value="animated"' in index
    assert 'value="consultant"' in index
    assert 'value="grandma"' in index
    assert 'value="narrator"' in index
    assert 'id="visual-mode-select"' in index
    assert 'value="balanced"' in index
    assert 'id="system-status-panel"' in index
    assert 'data-sidebar-action="avatar"' in index
    assert 'data-sidebar-action="web-search"' in index
    assert 'data-sidebar-action="notifications"' in index
    assert 'id="brain-mode"' in index
    assert 'id="brain-vault-viewport"' in index
    assert 'id="brain-state-label"' in index
    assert 'id="portfolio-panel"' in index
    assert 'id="portfolio-close-button"' in index
    assert 'id="portfolio-chat-focus-button"' in index
    assert 'id="portfolio-voice-button"' in index
    assert "Conheca Nicolas" in index
    assert "NICOLAS KEVEN LOPES DE HOLANDA" in index
    assert "Portfolio Orion" in index
    assert "Documentos" in index
    assert "Aprendizado" in index
    assert 'id="web-search-panel"' in index
    assert 'id="file-vision-panel"' in index
    assert 'id="camera-preview"' in index
    assert 'id="orion-file-input"' in index
    assert 'id="file-list"' in index


def test_service_worker_caches_design_system_assets():
    service_worker = read_frontend("service-worker.js")

    assert 'const CACHE_NAME = "orion-pwa-v50-orb-identity";' in service_worker
    assert "cache.addAll(APP_SHELL.map((path) => freshRequest(path)))" in service_worker
    assert 'event.data.type === "SKIP_WAITING"' in service_worker
    assert "self.clients.claim()" in service_worker
    assert "ORION_SW_ACTIVATED" in service_worker
    assert 'new Request(input, { cache: "reload" })' in service_worker
    assert 'pathname.startsWith("/assets/js/")' in service_worker
    assert 'pathname.startsWith("/assets/css/")' in service_worker
    assert '"/assets/css/tokens.css"' in service_worker
    assert '"/assets/css/base.css"' in service_worker
    assert '"/assets/css/components.css"' in service_worker
    assert '"/assets/css/accessibility.css"' in service_worker
    assert '"/assets/js/avatar-3d.js"' in service_worker
    assert '"/assets/js/brain-vault.js"' in service_worker
    assert '"/assets/js/design-system.js"' in service_worker
    assert '"/assets/js/gsap-orion.js"' in service_worker
    assert '"/assets/js/living-avatar.js"' in service_worker
    assert '"/assets/js/onboarding.js"' in service_worker
    assert '"/assets/js/portfolio-profile.js"' in service_worker
    assert '"/assets/js/premium-visuals.js"' in service_worker
    assert '"/assets/js/voice-engine.js"' in service_worker
    assert '"/assets/models/avatar-manifest.json"' in service_worker
    assert '"/assets/animations/animation-manifest.json"' in service_worker


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
        "startVoiceInput",
        "stopVoiceInput",
        "speakOrion",
        "stopOrionSpeech",
        "bindSidebarControls",
        "toggleSidebar",
        "openPortfolioMode",
        "closePortfolioMode",
        "handlePortfolioCommand",
        "startVoiceCallMode",
        "stopVoiceCallMode",
        "toggleVoiceCallMode",
        "bindAvatarStudioControls",
        "openAvatarStudio",
        "closeAvatarStudio",
        "applyCustomSkin",
        "analyzeAvatarReferenceImage",
        "openFileVisionPanel",
        "openCameraPanel",
        "captureCameraPhoto",
        "uploadSelectedFiles",
        "loadUserFiles",
        "analyzeFileById",
        "transformFileById",
        "downloadFileById",
    ]:
        assert f"function {function_name}" in main


def test_orion_voice_uses_browser_speech_apis():
    main = read_frontend("assets/js/main.js")
    voice_engine = read_frontend("assets/js/voice-engine.js")

    assert "SpeechRecognition" in main
    assert "webkitSpeechRecognition" in main
    assert 'speechRecognition.lang = "pt-BR";' in main
    assert "voiceCallActive" in main
    assert "createOrionVoiceEngine" in main
    assert "SpeechSynthesisUtterance" in voice_engine
    assert 'utterance.lang = "pt-BR";' in voice_engine
    assert "onStart" in voice_engine
    assert "orion:voice-boundary" in voice_engine
    assert "grandma" in voice_engine
    assert "animated" in voice_engine
    assert "consultant" in voice_engine
    assert "selected_voice" in voice_engine
    assert "voice_start" in voice_engine
    assert "voice_end" in voice_engine
    assert "speech_error" in voice_engine
    assert "azure-speech" in voice_engine
    assert "elevenlabs" in voice_engine
    assert "openai-tts" in voice_engine
    assert "coqui-local" in voice_engine


def test_orion_reasoning_visual_contract_is_available():
    main = read_frontend("assets/js/main.js")
    stylesheet = read_frontend("assets/css/styles.css")

    assert "applyReasoningVisual" in main
    assert "reasoningState" in main
    assert "shouldSpeak" in main
    assert 'data-reasoning-state="thinking"' in stylesheet
    assert 'data-voice-state="listening"' in stylesheet
    assert 'data-voice-state="thinking"' in stylesheet
    assert 'data-voice-state="responding"' in stylesheet


def test_orion_visual_modes_and_search_contract_are_available():
    main = read_frontend("assets/js/main.js")
    stylesheet = read_frontend("assets/css/styles.css")
    brain_vault = read_frontend("assets/js/brain-vault.js")

    for function_name in [
        "applyWardrobe",
        "applyVoiceMode",
        "applyVisualMode",
        "enterBrainMode",
        "exitBrainMode",
        "openPortfolioMode",
        "handleOptionalWebSearch",
    ]:
        assert f"function {function_name}" in main

    assert 'data-outfit="armor"' in stylesheet
    assert 'data-outfit="lord-dragons"' in stylesheet
    assert 'data-accessory="visor"' in stylesheet
    assert ".avatar-studio-panel" in stylesheet
    assert ".avatar-studio-preview" in stylesheet
    assert ".premium-visuals-ready" in stylesheet
    assert ".portfolio-panel" in stylesheet
    assert ".portfolio-card" in stylesheet
    assert ".portfolio-smart-grid" in stylesheet
    assert ".portfolio-evolution-list" in stylesheet
    assert ".system-status-panel" in stylesheet
    assert ".quick-actions-panel" in stylesheet
    assert ".orion-neural-backdrop" in stylesheet
    assert ".orion-avatar-3d-shell" in stylesheet
    assert ".orion-avatar-3d-canvas" in stylesheet
    assert ".orion-avatar-procedural-canvas" in stylesheet
    assert ".orion-scene-canvas" in stylesheet
    assert ".avatar-3d-ready" in stylesheet
    assert ".orion-iris" in stylesheet
    assert "premium-lip-sync" in stylesheet
    assert ".brain-mode" in stylesheet
    assert ".brain-vault-viewport" in stylesheet
    assert "createBrainVault" in main
    assert "createAvatar3DSystem" in main
    assert "avatar3D" in main
    assert "sceneManager" in main
    assert "startScene(elements.scene" in main
    assert "createPremiumVisualSystem" in main
    assert "premiumVisuals" in main
    assert "premium-visuals.js" in main
    assert "GSAP_URL" in read_frontend("assets/js/premium-visuals.js")
    assert "loadGsapEngine" in read_frontend("assets/js/gsap-orion.js")
    assert "animateWithOrionEngine" in read_frontend("assets/js/gsap-orion.js")
    assert "web-animations" in read_frontend("assets/js/gsap-orion.js")
    avatar_3d = read_frontend("assets/js/avatar-3d.js")
    assert "GLTFLoader" in avatar_3d
    assert "VRMLoaderPlugin" in avatar_3d
    assert "FBXLoader" in avatar_3d
    assert "createProceduralAvatarEngine" in avatar_3d
    assert "buildProceduralRig" in avatar_3d
    assert "collectVrmExpressionNames" in avatar_3d
    assert "applyVrmExpressions" in avatar_3d
    assert "createLuxuryJacketDetails" in avatar_3d
    assert "orion-original-back-sigil" in avatar_3d
    assert "catchlight" in avatar_3d
    assert "procedural-three" in avatar_3d
    assert "orion:avatar3d:modelUrl" in avatar_3d
    assert "avatar-manifest.json" in avatar_3d
    assert "animation-manifest.json" in avatar_3d
    assert "retargetMixamoClipToVrm" in avatar_3d
    assert "MIXAMO_TO_VROID_BONES" in avatar_3d
    assert "applyAvatarPoseCorrection" in avatar_3d
    assert "collectAvatarBones" in avatar_3d
    assert "data-avatar-3d-fallback" in avatar_3d
    assert "vrmCompatible" in avatar_3d
    manifest = read_frontend("assets/models/avatar-manifest.json")
    assert '"defaultModelId": "orion-local-glb"' in manifest
    assert '"enabled": true' in manifest
    assert '"url": "/assets/models/orion-avatar.glb"' in manifest
    assert '"vrmCompatible": true' in manifest
    animation_manifest = read_frontend("assets/animations/animation-manifest.json")
    assert '"defaultIdleId": "orion-standing-idle-to-fight-idle"' in animation_manifest
    assert '"url": "/assets/animations/orion-idle.fbx"' in animation_manifest
    assert '"fallback": "breathing-procedural"' in animation_manifest
    assert "MEMORY_CATEGORIES" in brain_vault
    assert "Documentos" in brain_vault
    assert "Aprendizado" in brain_vault
    assert "bloom" in brain_vault.lower()
    assert "selectedVisualMode" in brain_vault
    assert "buildBrainSulci" in brain_vault
    assert "buildCosmicEnvironment" in brain_vault
    assert "updateCosmicEnvironment" in brain_vault
    assert "drawCanvasCosmos" in brain_vault
    assert "neuralTendril" in brain_vault
    assert "premiumCodeShard" in brain_vault
    assert ".web-search-panel" in stylesheet
    assert ".file-vision-panel" in stylesheet
    assert ".orion-sidebar" in stylesheet
    assert ".sidebar-link" in stylesheet
    assert ".file-row" in stylesheet
    assert "searchWeb" in main
    assert "uploadOrionFile" in main
    assert "uploadCameraPhoto" in main
    assert "transformOrionFile" in main
    assert "orionFileDownloadUrl" in main
    assert "Apostila" in main
    assert "Flashcards" in main
    assert ".pptx" in read_frontend("index.html")
    assert "formatWebSearchAnswer" in main
    assert "performWebSearch" in main
    assert "inferWebSearchType" in main
    assert "search_type" in main
    assert "suggested_followups" in main
    assert "extractAvatarImagePalette" in main
    assert "skinFromImageAnalysis" in main
    assert "lastSkinAnalysis" in main
    assert "suggestWebResearchForFile" in main
    assert 'data-visual-mode="performance"' in stylesheet
    assert 'data-visual-mode="balanced"' in stylesheet
    scene = read_frontend("assets/js/scene.js")
    assert "createSceneManager" in scene
    assert "buildPlatform" in scene
    assert "buildPanels" in scene
    assert "particleCountFor" in scene
