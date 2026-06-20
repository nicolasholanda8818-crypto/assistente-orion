from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"


def read_frontend(path: str) -> str:
    return (FRONTEND / path).read_text(encoding="utf-8")


def test_lord_dragons_entrypoint_uses_phaser_and_game_modules():
    game = read_frontend("game.html")

    assert "Lord Dragons: The Lost Kingdom" in game
    assert "/assets/vendor/phaser.min.js" in game
    assert "/assets/js/lord-dragons/main.js" in game
    assert 'id="hud-health"' in game
    assert 'id="btn-attack"' in game
    assert 'id="title-screen"' in game
    assert 'class="official-logo"' in game
    assert 'id="btn-new-game"' in game
    assert 'id="btn-continue-game"' in game
    assert 'id="btn-load-game"' in game
    assert 'id="btn-multiplayer"' in game
    assert 'id="btn-settings"' in game
    assert 'id="btn-save-settings"' in game
    assert 'id="title-settings"' in game
    assert 'id="title-multiplayer-panel"' in game
    assert 'id="title-character-panel"' in game
    assert 'id="character-name"' in game
    assert 'id="character-class"' in game
    assert 'id="btn-confirm-character"' in game
    assert 'class="title-cast"' in game
    assert 'sprite-ryden' in game
    assert 'sprite-altheron' in game
    assert 'id="btn-equipment"' in game
    assert 'id="btn-map"' in game
    assert 'id="btn-heavy-attack"' in game
    assert 'id="btn-chronicles"' in game
    assert 'id="hud-health-mini"' in game
    assert 'id="mini-map"' in game
    assert 'id="btn-minimap-zoom"' in game
    assert 'id="mini-map-player"' in game
    assert 'id="btn-game-menu-toggle"' in game
    assert 'id="virtual-joystick"' in game
    assert 'class="desktop-controls"' in game
    assert 'data-control-action="heavy"' in game
    assert 'data-control-action="spin"' in game
    assert 'data-control-action="interact"' in game
    assert 'data-mobile-action="attack"' in game
    assert 'data-mobile-action="heavy"' in game
    assert 'data-mobile-action="special"' in game
    assert 'data-mobile-action="interact"' in game
    assert 'data-mobile-action="map"' in game


def test_lord_dragons_content_declares_required_story_and_systems():
    content = read_frontend("assets/js/lord-dragons/content.js")

    for required_name in ["Ryden", "Altheron", "Lyra", "Elandor", "Azgorath", "Boost"]:
        assert required_name in content

    for required_region in [
        "Vale dos Dragoes",
        "Casa do Mago",
        "Floresta Inicial",
        "Ponte Antiga",
        "Acampamento",
        "Cidade de Valoria",
        "Academia dos Guerreiros",
    ]:
        assert required_region in content

    assert "flameSword" in content
    assert "dragonFlames" in content
    assert "azgorath" in content
    assert "defeat_azgorath" in content
    assert "Sylvandor" in content
    assert "Kar-Dur" in content
    assert "Drakhar" in content
    assert "Umbraxis" in content
    assert "Capitulo 1: O Filho do Mago" in content
    assert "Fagulha Selvagem" in content
    assert "Sella" in content
    assert "Brann" in content
    assert "trainingSword" in content
    assert "DISCOVERIES" in content
    assert "Marca Queimada" in content
    assert "Eco de Mordrake" not in content
    assert "STORY_PANELS" in content
    assert "CHRONICLES" in content


def test_lord_dragons_visual_layer_declares_premium_interface():
    styles = read_frontend("assets/css/lord-dragons.css")
    ui = read_frontend("assets/js/lord-dragons/ui.js")

    assert ".title-screen" in styles
    assert ".world-map" in styles
    assert ".menu-card" in styles
    assert ".top-hud" in styles
    assert ".desktop-controls" in styles
    assert ".virtual-joystick" in styles
    assert ".mobile-actions" in styles
    assert "showEquipment" in ui
    assert "showSkills" in ui
    assert "showWorldMap" in ui
    assert "showDiscoveries" in ui
    assert "showChronicles" in ui
    assert "showStoryPanel" in ui


def test_lord_dragons_chapter_one_declares_tutorial_progression():
    content = read_frontend("assets/js/lord-dragons/content.js")
    state = read_frontend("assets/js/lord-dragons/state.js")
    world = read_frontend("assets/js/lord-dragons/scenes/WorldScene.js")

    for step in [
        "talk_altheron",
        "tutorial_move",
        "discover_dragon_mark",
        "open_first_chest",
        "meet_tomas",
        "defeat_first_monsters",
        "visit_first_shop",
        "visit_first_blacksmith",
    ]:
        assert step in content

    assert "completeTutorialMove" in state
    assert "recordEnemyDefeat" in state
    assert "discover(discoveryId)" in state
    assert "getNextHint" in state
    assert "completeTutorialMove()" in world
    assert "createDiscoveries" in world
    assert "heavyAttack" in world
    assert "spinAttack" in world
    assert "playSwordAttack" in world
    assert "playSwingEffect" in world
    assert "backSword" in world
    assert "heldSword" in world
    assert "updateEquippedSword" in world
    assert "restoreBackSword" in world
    assert "bindMobileControls" in world
    assert "bindControlButtons" in world
    assert "runControlAction" in world
    assert "lastControlAction" in world
    assert "ryden-walk" in read_frontend("assets/js/lord-dragons/scenes/BootScene.js")
    assert "sword" in read_frontend("assets/js/lord-dragons/scenes/BootScene.js")


def test_lord_dragons_official_pixel_sprites_replace_temp_actors():
    boot = read_frontend("assets/js/lord-dragons/scenes/BootScene.js")
    world = read_frontend("assets/js/lord-dragons/scenes/WorldScene.js")

    assert 'const rydenStates = ["idle", "walk", "run", "attack", "hurt", "dodge", "cast"]' in boot
    assert 'const directions = ["front", "back", "left", "right"]' in boot
    assert "`ryden-${state}-${direction}`" in boot
    assert "`altheron-idle-${direction}`" in boot

    assert "function drawRyden" in boot
    assert "function drawAltheron" in boot
    assert "drawBackScabbard" in boot
    assert "0xd44825" in boot
    assert "0xf1c84f" in boot
    assert "0x1e3b68" in boot
    assert '"ryden-idle-front"' in world
    assert '"altheron"' in world
    assert "setPlayerTexture(state)" in world
    assert "getFacingDirection()" in world


def test_lord_dragons_wizard_house_has_fantasy_cabin_props():
    world = read_frontend("assets/js/lord-dragons/scenes/WorldScene.js")

    assert "drawWizardHouse(region)" in world
    assert "drawWizardBed" in world
    assert "drawWizardDesk" in world
    assert "drawWizardBookshelf" in world
    assert "drawAlchemyTable" in world
    assert "drawWarmLamp" in world
    assert "drawScrollPile" in world
    assert "drawHearth" in world
    assert "Phaser.BlendModes.ADD" in world


def test_lord_dragons_reference_art_style_guides_ui_and_maps():
    styles = read_frontend("assets/css/lord-dragons.css")
    world = read_frontend("assets/js/lord-dragons/scenes/WorldScene.js")
    ui = read_frontend("assets/js/lord-dragons/ui.js")

    assert "--parchment" in styles
    assert "border: 3px double" in styles
    assert ".title-art::before" in styles
    assert ".world-map::before" in styles
    assert "MAPA DO MUNDO" in styles
    assert ".map-pin small" in styles
    assert "drawValoriaFountain" in world
    assert "Reino Humano" in ui
    assert "Imperio Demoniaco" in ui


def test_lord_dragons_official_start_menu_has_reference_composition():
    game = read_frontend("game.html")
    styles = read_frontend("assets/css/lord-dragons.css")
    main = read_frontend("assets/js/lord-dragons/main.js")
    state = read_frontend("assets/js/lord-dragons/state.js")

    for required in [
        "Lord<br />Dragons",
        "The Lost Kingdom",
        "Ryden",
        "Altheron",
        "Lyra",
        "Elandor",
        "Duran",
        "Mordrake",
        "Novo Jogo",
        "Continuar",
        "Carregar Jogo",
        "Configuracoes",
        "Creditos",
        "Sair",
        "Volume da musica",
        "Volume dos efeitos",
        "Tela cheia",
        "Salvar configuracoes",
        "Criar Personagem",
        "Comecar jornada",
        "Guerreiro",
        "Mago",
        "Arqueiro",
        "Paladino",
        "Assassino",
        "Invocador",
    ]:
        assert required in game

    for required in [
        ".title-cloud",
        ".title-castle",
        ".title-river",
        ".title-forest",
        ".title-flag",
        ".title-fog",
        ".title-light-particles",
        ".dragon-guardian",
        ".dragon-shadow",
        ".official-menu",
        ".title-menu-button:hover",
        ".title-menu-button.is-selected",
        ".title-subpanel",
        ".title-character-panel",
        ".title-depth-light",
        ".title-dragon-breath",
        ".title-dragon-eye",
        ".title-dragon-smoke",
        ".title-wind-lines",
        ".title-logo-sparks",
        "official-title-reference.jpeg",
        "@keyframes cloudDrift",
        "@keyframes riverFlow",
        "@keyframes treeSway",
        "@keyframes flagWave",
        "@keyframes fogDrift",
        "@keyframes particlesRise",
        "@keyframes titleCinematicFade",
        "@keyframes titleParallax",
        "@keyframes dragonBreath",
        "@keyframes dragonBlink",
        "@keyframes smokeRise",
        "@keyframes logoPulse",
        "@keyframes buttonSelectedGlow",
    ]:
        assert required in styles

    for required in [
        "SETTINGS_KEY",
        "STORAGE_KEY",
        "TITLE_ACTIONS",
        "CLASS_STARTING_STATS",
        "beginJourney",
        "saveTitleSettings",
        "startTitleTheme",
        "fadeOutTitleTheme",
        "playUiTone",
        "updateLoadSummary",
        "setSelectedTitleAction",
        "activateSelectedTitleAction",
        "handleTitleKeydown",
        "navigator.getGamepads",
        "openCharacterCreator",
        "readCharacterCreation",
        "applyCharacterToState",
        "confirmCharacterCreation",
        "createDefaultState",
    ]:
        assert required in main

    assert "export const STORAGE_KEY" in state
    assert "character:" in state


def test_lord_dragons_demo_starts_in_dragon_valley_with_playable_systems():
    content = read_frontend("assets/js/lord-dragons/content.js")
    state = read_frontend("assets/js/lord-dragons/state.js")
    world = read_frontend("assets/js/lord-dragons/scenes/WorldScene.js")

    for required in [
        "INITIAL_DEMO_MAP",
        "Vale dos Dragoes",
        "Vila inicial",
        "Caverna Antiga",
        "Castelo em ruinas",
        "Maia",
        "Orin",
        "dragon-valley-sign",
    ]:
        assert required in content

    for required in [
        "mana: 100",
        "maxMana: 100",
        "stamina: 100",
        "maxStamina: 100",
        "classId: \"guerreiro\"",
    ]:
        assert required in state

    for required in [
        "drawDragonValleySetpieces",
        "drawValleyVillage",
        "drawValleyCave",
        "Vale dos Dragoes",
        "Caverna Antiga",
    ]:
        assert required in world


def test_lord_dragons_classic_zelda_foundation_has_tiles_collision_and_objects():
    boot = read_frontend("assets/js/lord-dragons/scenes/BootScene.js")
    world = read_frontend("assets/js/lord-dragons/scenes/WorldScene.js")
    content = read_frontend("assets/js/lord-dragons/content.js")
    state = read_frontend("assets/js/lord-dragons/state.js")

    for tile in [
        "tile-grass",
        "tile-dirt",
        "tile-stone",
        "tile-water",
        "tile-wood",
        "tile-tree",
        "tile-bush",
        "tile-sign",
        "tile-pot",
        "tile-door",
    ]:
        assert tile in boot

    assert "drawTileGround" in world
    assert "drawTilePatch" in world
    assert "drawWaterRibbon" in world
    assert "addBlocker" in world
    assert "solidObjects" in world
    assert "createInteractiveObjects" in world
    assert "openInteractiveObject" in world
    assert "`ryden-${state}-${direction}-${frame}`" in world
    assert "INTERACTIVE_OBJECTS" in content
    assert "Capitulo 2: Ecos de Valoria" in content
    assert "explore_valoria" in content
    assert "talk_elandor" in content
    assert "usedObjects" in state


def test_lord_dragons_early_game_keeps_ryden_origin_secret():
    content = read_frontend("assets/js/lord-dragons/content.js")
    ui = read_frontend("assets/js/lord-dragons/ui.js")

    forbidden_early_reveals = [
        "herdeiro dos dragoes",
        "sangue real",
        "olhos de dragao",
        "Sangue antigo desperto",
        "Mordrake esta livre",
        "Reino dos Dragoes",
        "Forma Draconica",
    ]
    for phrase in forbidden_early_reveals:
        assert phrase not in content
        assert phrase not in ui

    assert 'return iconCard("?", "???"' in ui
    assert "Missao futura" in ui


def test_lord_dragons_pwa_assets_are_cached():
    worker = read_frontend("service-worker.js")

    assert '"/game.html"' in worker
    assert '"/assets/vendor/phaser.min.js"' in worker
    assert '"/assets/js/lord-dragons/audio.js"' in worker
    assert '"/assets/images/lord-dragons/official-title-reference.jpeg"' in worker
    assert '"/assets/js/lord-dragons/scenes/WorldScene.js"' in worker


def test_lord_dragons_dynamic_soundtrack_declares_context_tracks():
    audio = read_frontend("assets/js/lord-dragons/audio.js")
    world = read_frontend("assets/js/lord-dragons/scenes/WorldScene.js")
    ui = read_frontend("assets/js/lord-dragons/ui.js")

    for track in [
        "exploration",
        "city",
        "tavern",
        "forest",
        "cave",
        "battle",
        "boost",
        "azgorath",
        "mystery",
        "revelation",
    ]:
        assert track in audio

    for required in [
        "DynamicMusicDirector",
        "MUSIC_TRACKS",
        "playCue",
        "playDefeat",
        "playStoryCue",
        "pickTrack",
        "playAmbience",
        "alaude",
        "passaros",
        "perigo",
        "adrenalina",
        "chefe agressivo",
    ]:
        assert required in audio

    for required in [
        "createDynamicMusic",
        "updateDynamicMusic",
        "registerThreat",
        "detectedThreat",
        "isNearTavern",
        "getCurrentRegion",
        "playCue(\"victory\"",
        "playDefeat()",
    ]:
        assert required in world

    assert "playStoryCue" in ui


def test_lord_dragons_dark_fantasy_art_direction_and_cinematics():
    styles = read_frontend("assets/css/lord-dragons.css")
    world = read_frontend("assets/js/lord-dragons/scenes/WorldScene.js")
    boot = read_frontend("assets/js/lord-dragons/scenes/BootScene.js")
    ui = read_frontend("assets/js/lord-dragons/ui.js")

    for required in [
        ".game-dialog.cinematic-event",
        ".cinematic-art",
        ".cinematic-illustration",
        ".cinematic-line",
        ".cinematic-boss",
        ".cinematic-azgorath",
        ".cinematic-mordrake",
        "--panel: #080504",
        "linear-gradient(135deg, #130908, #050303)",
    ]:
        assert required in styles

    for required in [
        "showCinematicEvent",
        "Avancar",
        "cinematic-event",
    ]:
        assert required in ui

    for required in [
        "isGameplayPaused",
        "showBossCinematic",
        "IMPORTANT_DISCOVERIES",
        "drawDragonRuins",
        "drawRuinedCastle",
        "drawCaveDepths",
        "drawDarkCanopy",
        "darkenColor",
        "mordrake",
        "azgorath",
    ]:
        assert required in world

    for required in [
        "0x172d24",
        "0x0b2730",
        "0x11090a",
        "0xff3a2d",
        "0x142f3c",
    ]:
        assert required in boot


def test_lord_dragons_clean_interface_prioritizes_world_visibility():
    game = read_frontend("game.html")
    styles = read_frontend("assets/css/lord-dragons.css")
    main = read_frontend("assets/js/lord-dragons/main.js")
    world = read_frontend("assets/js/lord-dragons/scenes/WorldScene.js")

    for required in [
        "Multiplayer",
        "title-multiplayer-panel",
        "mini-map",
        "mini-map-player",
        "btn-game-menu-toggle",
        "Hab. 1",
        "Hab. 2",
        "Hab. 3",
    ]:
        assert required in game

    for required in [
        ".mini-map",
        ".mini-map.is-expanded",
        ".game-menu-toggle",
        "body.game-panel-open .game-panel",
        "translateX(calc(100% + 16px))",
        "pointer-events: none",
        ".mobile-actions [data-mobile-action=\"inventory\"]",
        ".mobile-actions [data-mobile-action=\"map\"]",
        "display: none",
        "grid-template-columns: repeat(3, 58px)",
        "calc(50% - min(18vw, 190px))",
    ]:
        assert required in styles

    for required in [
        "MULTIPLAYER_KEY",
        "local-coop",
        "updateMultiplayerSummary",
        "createLocalMultiplayerSession",
        "btn-minimap-zoom",
        "game-panel-open",
    ]:
        assert required in main

    for required in [
        "updateMiniMap",
        "playerLight",
        "waterReflection",
        "mistParticles",
    ]:
        assert required in world


def test_lord_dragons_master_campaign_adds_coop_roster_and_drakhar_dungeon():
    content = read_frontend("assets/js/lord-dragons/content.js")
    state = read_frontend("assets/js/lord-dragons/state.js")
    world = read_frontend("assets/js/lord-dragons/scenes/WorldScene.js")
    ui = read_frontend("assets/js/lord-dragons/ui.js")
    main = read_frontend("assets/js/lord-dragons/main.js")
    audio = read_frontend("assets/js/lord-dragons/audio.js")

    for required in [
        "PLAYABLE_CHARACTERS",
        "CAMPAIGN_ARC",
        "SKILL_TREES",
        "Ryden",
        "Lyra",
        "Elandor",
        "Duran",
        "chapter-final",
        "Ruinas de Drakhar",
        "Puzzle das Tres Runas",
        "drakharGuardian",
        "skeleton",
        "spirit",
        "moonSteel",
        "guardianBlade",
        "drakhar-rune",
        "mordrakeDream",
    ]:
        assert required in content

    for required in [
        "party",
        "maxPlayers: 4",
        "levelUpFlash",
        "updateParty(step)",
        "defeat_drakhar_guardian",
        "dream_mysterious_warrior",
    ]:
        assert required in state

    for required in [
        "drawDrakharDungeon",
        "drakhar-ruins",
        "survive_drakhar_trap",
        "solve_drakhar_puzzle",
        "updateLevelUpFlash",
        "Guardiao de Drakhar",
    ]:
        assert required in world

    for required in [
        "PLAYABLE_CHARACTERS",
        "CAMPAIGN_ARC",
        "SKILL_TREES",
        "currentChapter",
    ]:
        assert required in ui

    assert "maxPlayers: 4" in main
    assert "roster: PLAYABLE_CHARACTERS" in main
    assert 'context.regionId === "drakhar-ruins"' in audio
