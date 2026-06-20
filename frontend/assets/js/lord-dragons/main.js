import { BootScene } from "./scenes/BootScene.js";
import { WorldScene } from "./scenes/WorldScene.js";
import { CHAPTERS, PLAYABLE_CHARACTERS } from "./content.js";
import { GameState, STORAGE_KEY, createDefaultState } from "./state.js";
import { Hud } from "./ui.js";

const SETTINGS_KEY = "lord-dragons-settings-v1";
const MULTIPLAYER_KEY = "lord-dragons-local-session-v1";
const DEFAULT_SETTINGS = {
  music: 70,
  effects: 80,
  resolution: "1920x1080",
  fullscreen: false,
  language: "Portugues",
  controls: "Teclado + Mouse"
};
const DEFAULT_CHARACTER = {
  name: "Ryden",
  sex: "masculino",
  appearance: "aventureiro-sombrio",
  hair: "ruivo",
  eyes: "dourados",
  classId: "guerreiro"
};
const CLASS_STARTING_STATS = {
  guerreiro: { maxHp: 112, maxPower: 92, stamina: 112, attack: 14, defense: 3 },
  mago: { maxHp: 88, maxPower: 132, stamina: 92, attack: 10, defense: 1 },
  arqueiro: { maxHp: 96, maxPower: 108, stamina: 124, attack: 12, defense: 2 },
  paladino: { maxHp: 120, maxPower: 104, stamina: 96, attack: 12, defense: 4 },
  assassino: { maxHp: 92, maxPower: 96, stamina: 138, attack: 15, defense: 1 },
  invocador: { maxHp: 90, maxPower: 136, stamina: 90, attack: 11, defense: 2 }
};
const TITLE_ACTIONS = ["new", "continue", "load", "multiplayer", "settings", "credits", "exit"];

const gameState = new GameState();
const hud = new Hud(gameState);
window.lordDragonsRuntime = { gameState, hud };

const config = {
  type: Phaser.AUTO,
  parent: "lord-dragons-game",
  backgroundColor: "#11191f",
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540
  },
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: [BootScene, WorldScene]
};

const game = new Phaser.Game(config);
game.registry.set("gameState", gameState);
game.registry.set("hud", hud);

let audioContext;
let titleThemeGain;
let titleThemeStarted = false;
let selectedTitleIndex = 0;
let lastGamepadMoveAt = 0;

function getSaveData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hasSave() {
  return Boolean(getSaveData());
}

function getSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY)) ?? {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function setFieldValue(selector, value) {
  const field = document.querySelector(selector);
  if (!field) return;
  if (field.type === "checkbox") field.checked = Boolean(value);
  else field.value = value;
}

function loadTitleSettings() {
  const settings = getSettings();
  setFieldValue("#setting-music", settings.music);
  setFieldValue("#setting-effects", settings.effects);
  setFieldValue("#setting-resolution", settings.resolution);
  setFieldValue("#setting-fullscreen", settings.fullscreen);
  setFieldValue("#setting-language", settings.language);
  setFieldValue("#setting-controls", settings.controls);
  applyTitleAudioSettings(settings);
}

function readTitleSettings() {
  return {
    music: Number(document.querySelector("#setting-music")?.value ?? DEFAULT_SETTINGS.music),
    effects: Number(document.querySelector("#setting-effects")?.value ?? DEFAULT_SETTINGS.effects),
    resolution: document.querySelector("#setting-resolution")?.value ?? DEFAULT_SETTINGS.resolution,
    fullscreen: Boolean(document.querySelector("#setting-fullscreen")?.checked),
    language: document.querySelector("#setting-language")?.value ?? DEFAULT_SETTINGS.language,
    controls: document.querySelector("#setting-controls")?.value ?? DEFAULT_SETTINGS.controls
  };
}

function saveTitleSettings() {
  const settings = readTitleSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applyTitleAudioSettings(settings);
  if (settings.fullscreen && document.documentElement.requestFullscreen && !document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
  playUiTone("confirm");
  gameState.log("Configuracoes do menu inicial salvas.");
  hud.update();
}

function ensureAudioContext() {
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function applyTitleAudioSettings(settings = getSettings()) {
  if (titleThemeGain) titleThemeGain.gain.value = Math.max(0, settings.music) / 100 * 0.035;
}

function playUiTone(type = "hover") {
  try {
    const settings = getSettings();
    const volume = Math.max(0, settings.effects) / 100;
    if (!volume) return;
    const context = ensureAudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const frequencies = {
      hover: 740,
      click: 420,
      confirm: 560,
      denied: 180,
      open: 660,
      close: 280,
      cancel: 220,
      newGame: 880,
      load: 510
    };
    oscillator.type = type === "denied" || type === "cancel" ? "sawtooth" : "triangle";
    oscillator.frequency.setValueAtTime(frequencies[type] ?? frequencies.hover, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime((frequencies[type] ?? 740) * (type === "close" ? 0.72 : 1.22), context.currentTime + 0.08);
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime((type === "newGame" ? 0.065 : 0.045) * volume, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + (type === "newGame" ? 0.26 : 0.16));
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + (type === "newGame" ? 0.28 : 0.17));
  } catch {
    // Audio sintetico e opcional; navegadores antigos apenas ignoram.
  }
}

function startTitleTheme() {
  if (titleThemeStarted) return;
  try {
    const context = ensureAudioContext();
    titleThemeStarted = true;
    titleThemeGain = context.createGain();
    titleThemeGain.connect(context.destination);
    applyTitleAudioSettings();

    const notes = [146.83, 196, 220, 174.61, 246.94, 293.66, 246.94, 220, 196, 164.81];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.38;
      oscillator.type = index % 3 === 0 ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(index % 4 === 0 ? 0.31 : 0.22, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.68);
      oscillator.connect(gain).connect(titleThemeGain);
      oscillator.start(start);
      oscillator.stop(start + 0.76);
    });

    [73.42, 82.41, 98, 110].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.95;
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
      oscillator.connect(gain).connect(titleThemeGain);
      oscillator.start(start);
      oscillator.stop(start + 1.16);
    });

    setTimeout(() => {
      titleThemeStarted = false;
      if (!document.querySelector("#title-screen")?.classList.contains("is-hidden")) startTitleTheme();
    }, notes.length * 380);
  } catch {
    titleThemeStarted = false;
  }
}

function fadeOutTitleTheme() {
  if (!titleThemeGain || !audioContext) return;
  try {
    titleThemeGain.gain.cancelScheduledValues(audioContext.currentTime);
    titleThemeGain.gain.setValueAtTime(titleThemeGain.gain.value, audioContext.currentTime);
    titleThemeGain.gain.linearRampToValueAtTime(0.0001, audioContext.currentTime + 0.58);
  } catch {
    // O fade e apenas polimento sonoro; falhas nao bloqueiam o jogo.
  }
}

function restartWorld() {
  game.registry.set("gameState", gameState);
  game.registry.set("hud", hud);
  game.scene.stop("WorldScene");
  game.scene.start("WorldScene", { gameState, hud });
}

function showTitlePanel(panelId) {
  document.querySelectorAll(".title-subpanel").forEach((panel) => panel.classList.add("is-hidden"));
  document.querySelector(panelId)?.classList.remove("is-hidden");
  playUiTone("open");
}

function closeTitlePanels() {
  document.querySelectorAll(".title-subpanel").forEach((panel) => panel.classList.add("is-hidden"));
}

function titlePanelIsOpen() {
  return Boolean(document.querySelector(".title-subpanel:not(.is-hidden)"));
}

function getTitleButton(action) {
  return document.querySelector(`[data-title-action="${action}"]`);
}

function setSelectedTitleAction(index) {
  const wrapped = (index + TITLE_ACTIONS.length) % TITLE_ACTIONS.length;
  selectedTitleIndex = wrapped;
  const selectedAction = TITLE_ACTIONS[selectedTitleIndex];
  document.querySelectorAll(".title-menu-button").forEach((button) => {
    const isSelected = button.dataset.titleAction === selectedAction;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
  });
}

function activateSelectedTitleAction() {
  const action = TITLE_ACTIONS[selectedTitleIndex];
  const button = getTitleButton(action);
  if (!button || button.disabled) {
    playUiTone("denied");
    return;
  }
  button.click();
}

function handleTitleKeydown(event) {
  const titleScreen = document.querySelector("#title-screen");
  if (!titleScreen || titleScreen.classList.contains("is-hidden")) return;
  const activeTag = document.activeElement?.tagName?.toLowerCase();
  const editingField = ["input", "select", "textarea"].includes(activeTag);

  if (event.key === "Escape") {
    if (titlePanelIsOpen()) {
      closeTitlePanels();
      playUiTone("close");
      event.preventDefault();
    }
    return;
  }

  if (editingField || titlePanelIsOpen()) return;

  if (["ArrowDown", "s", "S"].includes(event.key)) {
    setSelectedTitleAction(selectedTitleIndex + 1);
    playUiTone("hover");
    event.preventDefault();
  }
  if (["ArrowUp", "w", "W"].includes(event.key)) {
    setSelectedTitleAction(selectedTitleIndex - 1);
    playUiTone("hover");
    event.preventDefault();
  }
  if (event.key === "Enter") {
    activateSelectedTitleAction();
    event.preventDefault();
  }
}

function updateTitleGamepadNavigation() {
  const titleScreen = document.querySelector("#title-screen");
  if (!titleScreen || titleScreen.classList.contains("is-hidden") || titlePanelIsOpen()) return;
  if (!navigator.getGamepads) return;
  const pad = Array.from(navigator.getGamepads()).find(Boolean);
  if (!pad) return;
  const now = performance.now();
  if (now - lastGamepadMoveAt < 210) return;
  const vertical = pad.axes?.[1] ?? 0;
  if (vertical > 0.45 || pad.buttons?.[13]?.pressed) {
    setSelectedTitleAction(selectedTitleIndex + 1);
    playUiTone("hover");
    lastGamepadMoveAt = now;
  } else if (vertical < -0.45 || pad.buttons?.[12]?.pressed) {
    setSelectedTitleAction(selectedTitleIndex - 1);
    playUiTone("hover");
    lastGamepadMoveAt = now;
  } else if (pad.buttons?.[0]?.pressed || pad.buttons?.[9]?.pressed) {
    activateSelectedTitleAction();
    lastGamepadMoveAt = now;
  }
}

function openCharacterCreator() {
  const save = getSaveData();
  const character = save?.character ?? DEFAULT_CHARACTER;
  setFieldValue("#character-name", character.name ?? DEFAULT_CHARACTER.name);
  setFieldValue("#character-sex", character.sex ?? DEFAULT_CHARACTER.sex);
  setFieldValue("#character-appearance", character.appearance ?? DEFAULT_CHARACTER.appearance);
  setFieldValue("#character-hair", character.hair ?? DEFAULT_CHARACTER.hair);
  setFieldValue("#character-eyes", character.eyes ?? DEFAULT_CHARACTER.eyes);
  setFieldValue("#character-class", character.classId ?? DEFAULT_CHARACTER.classId);
  showTitlePanel("#title-character-panel");
  document.querySelector("#character-name")?.focus();
}

function readCharacterCreation() {
  const cleanName = (document.querySelector("#character-name")?.value ?? DEFAULT_CHARACTER.name).trim().slice(0, 18);
  return {
    name: cleanName || DEFAULT_CHARACTER.name,
    sex: document.querySelector("#character-sex")?.value ?? DEFAULT_CHARACTER.sex,
    appearance: document.querySelector("#character-appearance")?.value ?? DEFAULT_CHARACTER.appearance,
    hair: document.querySelector("#character-hair")?.value ?? DEFAULT_CHARACTER.hair,
    eyes: document.querySelector("#character-eyes")?.value ?? DEFAULT_CHARACTER.eyes,
    classId: document.querySelector("#character-class")?.value ?? DEFAULT_CHARACTER.classId
  };
}

function applyCharacterToState(character) {
  const stats = CLASS_STARTING_STATS[character.classId] ?? CLASS_STARTING_STATS.guerreiro;
  gameState.data.character = character;
  gameState.data.hero.name = character.name;
  gameState.data.hero.sex = character.sex;
  gameState.data.hero.appearance = character.appearance;
  gameState.data.hero.hair = character.hair;
  gameState.data.hero.eyes = character.eyes;
  gameState.data.hero.classId = character.classId;
  gameState.data.hero.maxHp = stats.maxHp;
  gameState.data.hero.hp = stats.maxHp;
  gameState.data.hero.maxPower = stats.maxPower;
  gameState.data.hero.power = stats.maxPower;
  gameState.data.hero.maxMana = stats.maxPower;
  gameState.data.hero.mana = stats.maxPower;
  gameState.data.hero.maxStamina = stats.stamina;
  gameState.data.hero.stamina = stats.stamina;
  gameState.data.hero.attack = stats.attack;
  gameState.data.hero.defense = stats.defense;
  gameState.data.messages = [
    `${character.name} inicia a jornada no Vale dos Dragoes como ${character.classId}.`,
    "Altheron observa em silencio: algumas respostas devem esperar."
  ];
}

function confirmCharacterCreation() {
  const character = readCharacterCreation();
  playUiTone("newGame");
  beginJourney({ reset: true, character });
}

function updateLoadSummary() {
  const save = getSaveData();
  const summary = document.querySelector("#load-summary");
  const confirm = document.querySelector("#btn-confirm-load");
  if (!summary || !confirm) return;
  if (!save) {
    summary.textContent = "Nenhum save encontrado. Comece um novo jogo para criar sua jornada.";
    confirm.disabled = true;
    return;
  }
  const hero = save.hero ?? {};
  const quest = save.questIndex ?? 0;
  summary.textContent = `Ryden nivel ${hero.level ?? 1}, ${hero.gold ?? 0} ouro, localizacao ${hero.x ?? 0}:${hero.y ?? 0}, progresso de historia ${save.chapter?.id ?? "chapter-1"}, missao ${quest + 1}.`;
  confirm.disabled = false;
}

function updateMultiplayerSummary() {
  const summary = document.querySelector("#multiplayer-summary");
  if (!summary) return;
  try {
    const session = JSON.parse(localStorage.getItem(MULTIPLAYER_KEY));
    if (session?.createdAt) {
      const active = session.roster?.filter((entry) => entry.status === "player").map((entry) => entry.name).join(", ") || "Ryden";
      const waiting = session.roster?.filter((entry) => entry.status === "npc").map((entry) => entry.name).join(", ") || "Lyra, Elandor, Duran";
      summary.textContent = `Sessao local criada em ${new Date(session.createdAt).toLocaleString("pt-BR")}. Ativos: ${active}. Como NPCs ate escolha local: ${waiting}.`;
      return;
    }
  } catch {
    // Uma sessao invalida e ignorada para preservar o menu.
  }
  summary.textContent = "Crie uma sessao local para preparar uma aventura cooperativa neste dispositivo.";
}

function createLocalMultiplayerSession() {
  const session = {
    id: `local-${Date.now()}`,
    createdAt: new Date().toISOString(),
    players: ["ryden"],
    maxPlayers: 4,
    roster: PLAYABLE_CHARACTERS.map((character, index) => ({
      id: character.id,
      name: character.name,
      role: character.role,
      status: index === 0 ? "player" : "npc"
    })),
    mode: "local-coop"
  };
  localStorage.setItem(MULTIPLAYER_KEY, JSON.stringify(session));
  updateMultiplayerSummary();
  playUiTone("confirm");
}

function refreshContinueButton() {
  document.querySelector("#btn-continue-game")?.toggleAttribute("disabled", !hasSave());
}

function beginJourney({ reset = false, character = null } = {}) {
  closeTitlePanels();
  if (reset) {
    gameState.data = createDefaultState();
  } else {
    gameState.data = gameState.load();
  }
  if (character) applyCharacterToState(character);
  gameState.data.chapter.introSeen = true;
  gameState.save();
  hud.update();
  restartWorld();
  fadeOutTitleTheme();
  const titleScreen = document.querySelector("#title-screen");
  titleScreen?.classList.add("is-starting");
  window.setTimeout(() => {
    titleScreen?.classList.add("is-hidden");
    hud.showStoryPanel(CHAPTERS[0]?.panelId ?? "chapter1Intro");
    refreshContinueButton();
  }, 720);
}

function initTitleMenu() {
  loadTitleSettings();
  refreshContinueButton();
  updateLoadSummary();
  updateMultiplayerSummary();
  setSelectedTitleAction(0);

  document.querySelector("#title-screen")?.addEventListener("pointerdown", startTitleTheme, { once: true });
  document.querySelector("#title-screen")?.addEventListener("pointermove", startTitleTheme, { once: true });
  document.addEventListener("keydown", handleTitleKeydown);
  window.setInterval(updateTitleGamepadNavigation, 120);

  document.querySelectorAll(".title-menu-button, .title-subpanel button").forEach((button) => {
    button.addEventListener("pointerenter", () => playUiTone("hover"));
    button.addEventListener("click", () => {
      button.classList.add("is-pressed");
      window.setTimeout(() => button.classList.remove("is-pressed"), 170);
    });
  });
  document.querySelectorAll(".title-menu-button").forEach((button) => {
    button.addEventListener("pointerenter", () => {
      const index = TITLE_ACTIONS.indexOf(button.dataset.titleAction);
      if (index >= 0) setSelectedTitleAction(index);
    });
  });

  document.querySelector("#btn-new-game")?.addEventListener("click", openCharacterCreator);
  document.querySelector("#btn-confirm-character")?.addEventListener("click", confirmCharacterCreation);
  document.querySelector("#btn-continue-game")?.addEventListener("click", () => {
    if (!hasSave()) {
      playUiTone("denied");
      updateLoadSummary();
      showTitlePanel("#title-load-panel");
      return;
    }
    playUiTone("load");
    beginJourney({ reset: false });
  });
  document.querySelector("#btn-load-game")?.addEventListener("click", () => {
    updateLoadSummary();
    showTitlePanel("#title-load-panel");
  });
  document.querySelector("#btn-confirm-load")?.addEventListener("click", () => {
    if (hasSave()) {
      playUiTone("load");
      beginJourney({ reset: false });
    }
  });
  document.querySelector("#btn-settings")?.addEventListener("click", () => {
    showTitlePanel("#title-settings");
  });
  document.querySelector("#btn-multiplayer")?.addEventListener("click", () => {
    updateMultiplayerSummary();
    showTitlePanel("#title-multiplayer-panel");
  });
  document.querySelector("#btn-create-local-session")?.addEventListener("click", createLocalMultiplayerSession);
  document.querySelector("#btn-save-settings")?.addEventListener("click", saveTitleSettings);
  document.querySelector("#btn-credits")?.addEventListener("click", () => {
    showTitlePanel("#title-credits-panel");
  });
  document.querySelector("#btn-exit-game")?.addEventListener("click", () => {
    playUiTone("denied");
    showTitlePanel("#title-credits-panel");
    document.querySelector("#title-credits-panel p:nth-of-type(2)").textContent = "No navegador, o jogo permanece aberto para proteger sua sessao. Use a aba do aplicativo para sair quando desejar.";
  });
  document.querySelectorAll('[data-title-action="close-panel"]').forEach((button) => {
    button.addEventListener("click", () => {
      playUiTone("close");
      closeTitlePanels();
    });
  });

  ["#setting-music", "#setting-effects"].forEach((selector) => {
    document.querySelector(selector)?.addEventListener("input", () => applyTitleAudioSettings(readTitleSettings()));
  });
}

initTitleMenu();
document.querySelector("#btn-minimap-zoom")?.addEventListener("click", () => {
  document.querySelector("#mini-map")?.classList.toggle("is-expanded");
});
document.querySelector("#btn-game-menu-toggle")?.addEventListener("click", () => {
  document.body.classList.toggle("game-panel-open");
});
document.querySelector("#btn-equipment")?.addEventListener("click", () => hud.showEquipment());
document.querySelector("#btn-quests")?.addEventListener("click", () => hud.showQuests());
document.querySelector("#btn-skills")?.addEventListener("click", () => hud.showSkills());
document.querySelector("#btn-status")?.addEventListener("click", () => hud.showStatus());
document.querySelector("#btn-map")?.addEventListener("click", () => hud.showWorldMap());
document.querySelector("#btn-discoveries")?.addEventListener("click", () => hud.showDiscoveries());
document.querySelector("#btn-chronicles")?.addEventListener("click", () => hud.showChronicles());

window.addEventListener("beforeunload", () => gameState.save());
window.lordDragons = { game, gameState };
