import {
  analyzeOrionFile,
  deleteOrionFile,
  getAutomationStatus,
  getHealth,
  getStatus,
  listOrionFiles,
  orionFileDownloadUrl,
  previewAutomationRoutine,
  processBrainMessage,
  requestAutomationAction,
  searchWeb,
  transformOrionFile,
  uploadCameraPhoto,
  uploadOrionFile,
} from "./api.js";
import { setupDesignSystem } from "./design-system.js";
import { setupOnboarding } from "./onboarding.js";
import { registerPwa, setupInstallPrompt } from "./pwa.js";
import { startScene } from "./scene.js";
import { createOrionSocket } from "./socket.js";
import { createLivingAvatar } from "./living-avatar.js?v=36";
import { createBrainVault } from "./brain-vault.js?v=36";
import { createOrionVoiceEngine } from "./voice-engine.js?v=38";

const MAX_VISIBLE_MESSAGES = 42;
const USER_ID_KEY = "orion:userId";
const USER_NAME_KEY = "orion:userName";
const WAKE_WORD_KEY = "orion:voice:wakeWord";
const WEB_SEARCH_TERMS = [
  "pesquise",
  "pesquisar",
  "busque",
  "buscar",
  "procure",
  "fonte",
  "fontes",
  "internet",
  "web",
  "google",
  "mais recente",
  "versao mais recente",
  "versao atual",
  "atual",
  "hoje",
  "agora",
  "noticias",
  "noticia",
  "o que saiu de novo",
  "veja na web",
  "compare fontes",
  "me traga fontes",
  "pesquise documentacao",
  "documentacao atual",
  "erro recente",
  "ferramenta nova",
  "lancamento",
  "clima",
  "tempo",
  "temperatura",
  "previsao",
  "documentacao",
];
const FILE_COMMAND_TERMS = [
  "abrir camera",
  "tirar foto",
  "meus arquivos",
  "analisar arquivo",
  "ler documento",
  "resumir documento",
  "resumir pdf",
  "explicar documento",
  "criar apostila",
  "fazer trabalho",
  "gerar pdf",
  "criar flashcards",
  "gerar flashcards",
  "o que tem nessa imagem",
];
const AUTOMATION_COMMAND_TERMS = [
  "automacoes",
  "automacao",
  "abrir automacoes",
  "modo automacao",
  "rotina",
  "abrir programas",
  "notificacoes inteligentes",
];
const WARDROBE_LINES = {
  original: "Visual original carregado. Classico, luminoso e meu.",
  casual: "Essa roupa casual ficou boa em mim.",
  formal: "Visual formal ativado. Agora eu pareco pronto para uma reuniao intergalactica.",
  teacher: "Jaleco tecnologico ativado. Agora eu pareco ainda mais professor.",
  elegant: "Visual elegante aprovado. Estou tentando nao parecer convencido.",
  future: "Modo futurista ligado. Essa energia combina comigo.",
  armor: "Armadura azul pronta. Visual aprovado para dominar o sistema.",
  adventurer: "Modo aventureiro equipado. Parece que algum portal acabou de me chamar.",
  "lord-dragons": "Traje Lord Dragons ativado. Prometo nao incendiar o tapete holografico.",
  tech: "Traje tecnologico calibrado. Nucleo, linhas de energia e postura de comando.",
  training: "Roupa de treino equipada. Vou fingir que alonguei antes.",
  game: "Modo jogo ativado. Lord Dragons sentiria orgulho.",
};
const HAIR_COLOR_MAP = {
  white: "#f5fbff",
  black: "#101827",
  blue: "#4fd7ff",
  red: "#ff4f6d",
  gold: "#ffd166",
  silver: "#cbd7e8",
};
const EYE_COLOR_MAP = {
  blue: "#49d9ff",
  green: "#68ffb8",
  red: "#ff4f6d",
  gold: "#ffd166",
  purple: "#b58cff",
  white: "#f4ffff",
};
const DEFAULT_AVATAR_SKIN = {
  outfit: "original",
  hair: "white",
  eyes: "blue",
  accessory: "none",
  primaryColor: "#45c7ff",
  accentColor: "#ff4e6e",
  auraColor: "#51f6ff",
};
const VOICE_MODE_ALIASES = {
  balanced: "conversation",
  calm: "calm",
  energetic: "conversation",
  animated: "animated",
  grandma: "grandma",
  conversation: "conversation",
  assistant: "assistant",
  teacher: "teacher",
  narrator: "narrator",
  consultant: "consultant",
};
const VOICE_MODE_LINES = {
  conversation: "Voz de conversa configurada. Mais suave e natural.",
  assistant: "Voz de assistente configurada. Calma, clara e objetiva.",
  teacher: "Voz de professor configurada. Vou explicar com pausas melhores.",
  consultant: "Voz de consultor configurada. Mais firme, profissional e objetiva.",
  calm: "Voz calma configurada. Vou falar com mais suavidade.",
  animated: "Voz animada configurada. Mais energia, sem perder clareza.",
  grandma: "Modo avo configurado. Mais paciencia, carinho e pausas.",
  narrator: "Voz de narrador configurada. Mais pausada e cinematografica.",
};
const TOUCH_REACTIONS = [
  "Ei, cuidado com o cabelo, Mestre.",
  "Isso fez cÃ³cegas.",
  "Estou tentando parecer sÃ©rio aqui.",
];

const elements = {
  apiStatus: document.querySelector("#api-status"),
  wsStatus: document.querySelector("#ws-status"),
  pwaStatus: document.querySelector("#pwa-status"),
  sidebarApiStatus: document.querySelector("#sidebar-api-status"),
  sidebarWsStatus: document.querySelector("#sidebar-ws-status"),
  backendDetail: document.querySelector("#backend-detail"),
  databaseDetail: document.querySelector("#database-detail"),
  cacheDetail: document.querySelector("#cache-detail"),
  appMode: document.querySelector("#app-mode"),
  settingsButton: document.querySelector("#settings-button"),
  installButton: document.querySelector("#install-button"),
  sidebarInstallButton: document.querySelector("#sidebar-install-button"),
  app: document.querySelector("#app"),
  sidebar: document.querySelector("#orion-sidebar"),
  sidebarToggle: document.querySelector("#sidebar-toggle"),
  sidebarCloseButton: document.querySelector("#sidebar-close-button"),
  sidebarBackdrop: document.querySelector("#sidebar-backdrop"),
  sidebarActionButtons: document.querySelectorAll("[data-sidebar-action]"),
  eventFeed: document.querySelector("#event-feed"),
  eventCount: document.querySelector("#connection-count"),
  messageForm: document.querySelector("#message-form"),
  messageInput: document.querySelector("#message-input"),
  micButton: document.querySelector("#mic-button"),
  cameraButton: document.querySelector("#camera-button"),
  orionAvatar: document.querySelector("#orion-avatar"),
  orionBubble: document.querySelector("#orion-bubble"),
  scene: document.querySelector("#orion-scene"),
  workspace: document.querySelector("#workspace"),
  orionStateIndicator: document.querySelector("#orion-state-indicator"),
  brainMode: document.querySelector("#brain-mode"),
  brainVault: document.querySelector("#brain-vault"),
  brainVaultViewport: document.querySelector("#brain-vault-viewport"),
  brainStateLabel: document.querySelector("#brain-state-label"),
  brainModeButton: document.querySelector("#brain-mode-button"),
  bodyModeButton: document.querySelector("#body-mode-button"),
  avatarStudioButton: document.querySelector("#avatar-studio-button"),
  automationPanelButton: document.querySelector("#automation-panel-button"),
  automationPanel: document.querySelector("#automation-panel"),
  automationPanelCloseButton: document.querySelector("#automation-panel-close-button"),
  automationSummary: document.querySelector("#automation-summary"),
  automationVoiceStatus: document.querySelector("#automation-voice-status"),
  automationWakeWord: document.querySelector("#automation-wake-word"),
  automationSaveWakeWordButton: document.querySelector("#automation-save-wake-word-button"),
  automationNotificationStatus: document.querySelector("#automation-notification-status"),
  automationEnableNotificationsButton: document.querySelector("#automation-enable-notifications-button"),
  automationCapabilityCount: document.querySelector("#automation-capability-count"),
  automationCapabilityList: document.querySelector("#automation-capability-list"),
  automationRoutineCount: document.querySelector("#automation-routine-count"),
  automationRoutineList: document.querySelector("#automation-routine-list"),
  avatarStudioPanel: document.querySelector("#avatar-studio-panel"),
  avatarStudioCloseButton: document.querySelector("#avatar-studio-close-button"),
  avatarStudioPreview: document.querySelector("#avatar-studio-preview"),
  avatarStudioOutfit: document.querySelector("#avatar-studio-outfit"),
  avatarHairSelect: document.querySelector("#avatar-hair-select"),
  avatarEyeSelect: document.querySelector("#avatar-eye-select"),
  avatarAccessorySelect: document.querySelector("#avatar-accessory-select"),
  avatarPrimaryColor: document.querySelector("#avatar-primary-color"),
  avatarAccentColor: document.querySelector("#avatar-accent-color"),
  avatarAuraColor: document.querySelector("#avatar-aura-color"),
  avatarReferenceInput: document.querySelector("#avatar-reference-input"),
  avatarAnalyzeImageButton: document.querySelector("#avatar-analyze-image-button"),
  avatarPreviewButton: document.querySelector("#avatar-preview-button"),
  avatarSaveSkinButton: document.querySelector("#avatar-save-skin-button"),
  avatarSkinSummary: document.querySelector("#avatar-skin-summary"),
  avatarReferenceResult: document.querySelector("#avatar-reference-result"),
  filesPanelButton: document.querySelector("#files-panel-button"),
  filesPanelCloseButton: document.querySelector("#files-panel-close-button"),
  wardrobeSelect: document.querySelector("#wardrobe-select"),
  voiceModeSelect: document.querySelector("#voice-mode-select"),
  visualModeSelect: document.querySelector("#visual-mode-select"),
  webSearchPanel: document.querySelector("#web-search-panel"),
  webSearchLink: document.querySelector("#web-search-link"),
  fileVisionPanel: document.querySelector("#file-vision-panel"),
  cameraPreview: document.querySelector("#camera-preview"),
  cameraCanvas: document.querySelector("#camera-canvas"),
  photoPreview: document.querySelector("#photo-preview"),
  cameraStatus: document.querySelector("#camera-status"),
  cameraOpenButton: document.querySelector("#camera-open-button"),
  cameraCloseButton: document.querySelector("#camera-close-button"),
  capturePhotoButton: document.querySelector("#capture-photo-button"),
  sendPhotoButton: document.querySelector("#send-photo-button"),
  fileUploadButton: document.querySelector("#file-upload-button"),
  refreshFilesButton: document.querySelector("#refresh-files-button"),
  fileInput: document.querySelector("#orion-file-input"),
  fileDropZone: document.querySelector("#file-drop-zone"),
  filesStatus: document.querySelector("#files-status"),
  fileList: document.querySelector("#file-list"),
  fileCount: document.querySelector("#file-count"),
};

let socket;
let reconnectTimer;
let heartbeatTimer;
let reconnectDelay = 1200;
let visibleMessages = 0;
let typingToken = 0;
let userId = getOrionUserId();
let conversationId = `site-${userId.slice(-10)}-${Date.now().toString(36)}`;
let livingAvatar;
let brainVault;
let voiceEngine;
let speechRecognition;
let voiceInputActive = false;
let voiceReplyEnabled = false;
let voiceCallActive = false;
let voiceRecognitionPausedForSpeech = false;
let voiceRestartTimer;
let orionSpeechActive = false;
let currentReasoningState = "waiting";
let voiceMode = "conversation";
let cameraStream;
let capturedPhotoDataUrl = "";
let currentAvatarSkin = { ...DEFAULT_AVATAR_SKIN };
let lastAvatarImageAnalysis;

export function initOrionVisual() {
  setOrionState("online");
  showOrionBubble("Estou online, Mestre. Pode falar comigo.");
  livingAvatar = createLivingAvatar({
    elements,
    setOrionState,
    showOrionBubble,
    addChatMessage,
    blinkOrionEyes,
  });
  livingAvatar.start();
  brainVault = createBrainVault({
    container: elements.brainVaultViewport,
    getVisualMode: () => document.documentElement.dataset.visualMode || "performance",
  });
  voiceEngine = createOrionVoiceEngine({ getMode: () => voiceMode });
  loadVisualPreferences();
  bindOrionControls();
  bindAvatarStudioControls();
  bindSidebarControls();
  bindFileVisionControls();
  bindAutomationControls();
  elements.orionAvatar.addEventListener("click", handleOrionTouch);
  elements.orionAvatar.addEventListener("touchstart", handleOrionTouch, { passive: true });
  elements.messageInput.addEventListener("input", () => {
    if (elements.messageInput.value.trim()) {
      livingAvatar.whileTyping();
      showOrionBubble("Estou ouvindo...");
    } else {
      setOrionState("online");
    }
  });
  elements.messageInput.addEventListener("focus", () => setOrionState("listening"));
  elements.messageInput.addEventListener("blur", () => {
    if (!elements.messageInput.value.trim()) {
      setOrionState("online");
    }
  });
  elements.micButton.addEventListener("click", () => {
    livingAvatar.microphoneAttention();
    toggleVoiceCallMode();
  });
  elements.cameraButton.addEventListener("click", () => {
    livingAvatar.cameraAttention();
    return openFileVisionPanel({ startCamera: true });
  });
  document.addEventListener("visibilitychange", () => {
    document.documentElement.classList.toggle("is-paused", document.hidden);
  });
  document.querySelector('a[href="/game.html"]')?.addEventListener("click", () => {
    livingAvatar.reactToLordDragons();
  });
  elements.brainVaultViewport?.addEventListener("orion:brain-node", (event) => {
    const label = event.detail?.label || "memoria";
    setBrainVaultState("remembering", label);
    showOrionBubble(`Acessando memoria: ${label}.`);
  });
  window.setInterval(blinkOrionEyes, 9000);
}

export function setOrionState(state) {
  elements.orionAvatar.dataset.state = state;
  elements.orionStateIndicator.dataset.state = state;
  elements.orionStateIndicator.textContent = stateLabel(state);
}

export function showOrionBubble(text) {
  elements.orionBubble.textContent = text;
}

export function setOrionMood(mood) {
  livingAvatar?.setMood(mood || "online");
}

export function playOrionReaction(reaction) {
  livingAvatar?.playReaction(reaction || "direct-look");
}

export function pulseOrionAura(color = "#51f6ff") {
  elements.orionAvatar.style.setProperty("--aura-pulse-color", color);
  elements.orionAvatar.classList.remove("pulse-aura-now");
  window.requestAnimationFrame(() => {
    elements.orionAvatar.classList.add("pulse-aura-now");
    window.setTimeout(() => elements.orionAvatar.classList.remove("pulse-aura-now"), 900);
  });
}

export function bindOrionControls() {
  elements.brainModeButton?.addEventListener("click", enterBrainMode);
  elements.bodyModeButton?.addEventListener("click", exitBrainMode);
  elements.avatarStudioButton?.addEventListener("click", openAvatarStudio);
  elements.automationPanelButton?.addEventListener("click", openAutomationPanel);
  elements.wardrobeSelect?.addEventListener("change", () => {
    applyWardrobe(elements.wardrobeSelect.value, { react: true });
  });
  elements.voiceModeSelect?.addEventListener("change", () => {
    applyVoiceMode(elements.voiceModeSelect.value, { react: true });
  });
  elements.visualModeSelect?.addEventListener("change", () => {
    applyVisualMode(elements.visualModeSelect.value, { react: true });
  });
}

export function bindAvatarStudioControls() {
  elements.avatarStudioCloseButton?.addEventListener("click", closeAvatarStudio);
  elements.avatarPreviewButton?.addEventListener("click", () => {
    applyCustomSkin(readAvatarStudioSkin(), { persist: false, react: true, source: "preview" });
  });
  elements.avatarSaveSkinButton?.addEventListener("click", () => {
    applyCustomSkin(readAvatarStudioSkin(), { persist: true, react: true, source: "save" });
  });
  elements.avatarAnalyzeImageButton?.addEventListener("click", () => analyzeAvatarReferenceImage());
  elements.avatarReferenceInput?.addEventListener("change", () => analyzeAvatarReferenceImage());

  [
    elements.avatarStudioOutfit,
    elements.avatarHairSelect,
    elements.avatarEyeSelect,
    elements.avatarAccessorySelect,
    elements.avatarPrimaryColor,
    elements.avatarAccentColor,
    elements.avatarAuraColor,
  ].forEach((control) => {
    control?.addEventListener("input", () => updateAvatarStudioPreview(readAvatarStudioSkin()));
    control?.addEventListener("change", () => updateAvatarStudioPreview(readAvatarStudioSkin()));
  });
}

export function bindSidebarControls() {
  elements.sidebarToggle?.addEventListener("click", toggleSidebar);
  elements.sidebarCloseButton?.addEventListener("click", closeSidebar);
  elements.sidebarBackdrop?.addEventListener("click", closeSidebar);
  elements.sidebarActionButtons?.forEach((button) => {
    button.addEventListener("click", () => {
      handleSidebarAction(button.dataset.sidebarAction);
      closeSidebar();
    });
  });
  document.querySelectorAll(".orion-sidebar a").forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.app?.classList.contains("is-sidebar-open")) {
      closeSidebar();
    }
  });
}

export function openSidebar() {
  elements.app?.classList.add("is-sidebar-open");
  if (elements.sidebar) {
    elements.sidebar.setAttribute("aria-hidden", "false");
  }
  if (elements.sidebarToggle) {
    elements.sidebarToggle.setAttribute("aria-expanded", "true");
  }
  if (elements.sidebarBackdrop) {
    elements.sidebarBackdrop.hidden = false;
  }
}

export function closeSidebar() {
  elements.app?.classList.remove("is-sidebar-open");
  if (elements.sidebar) {
    elements.sidebar.setAttribute("aria-hidden", "true");
  }
  if (elements.sidebarToggle) {
    elements.sidebarToggle.setAttribute("aria-expanded", "false");
  }
  if (elements.sidebarBackdrop) {
    elements.sidebarBackdrop.hidden = true;
  }
}

export function toggleSidebar() {
  if (elements.app?.classList.contains("is-sidebar-open")) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function setSidebarActive(action) {
  elements.sidebarActionButtons?.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.sidebarAction === action);
  });
}

function handleSidebarAction(action) {
  setSidebarActive(action);
  if (action === "assistant") {
    if (!elements.brainMode?.hidden) {
      exitBrainMode();
    }
    if (!elements.fileVisionPanel?.hidden) {
      closeFileVisionPanel();
    }
    elements.messageInput?.focus();
    showOrionBubble("Modo assistente pronto. O chat esta limpo para continuar.");
  } else if (action === "brain") {
    enterBrainMode();
  } else if (action === "files") {
    openFileVisionPanel();
  } else if (action === "memory") {
    enterBrainMode();
    setBrainVaultState("remembering", "Usuarios");
    showOrionBubble("Abrindo meu mapa de memoria local.");
  } else if (action === "voice") {
    toggleVoiceCallMode();
  } else if (action === "automation") {
    openAutomationPanel();
  } else if (action === "settings") {
    elements.settingsButton?.click();
  }
}

export function bindFileVisionControls() {
  elements.filesPanelButton?.addEventListener("click", () => openFileVisionPanel());
  elements.filesPanelCloseButton?.addEventListener("click", closeFileVisionPanel);
  elements.cameraOpenButton?.addEventListener("click", openCameraPanel);
  elements.cameraCloseButton?.addEventListener("click", closeCameraPanel);
  elements.capturePhotoButton?.addEventListener("click", captureCameraPhoto);
  elements.sendPhotoButton?.addEventListener("click", sendCapturedPhoto);
  elements.fileUploadButton?.addEventListener("click", () => elements.fileInput?.click());
  elements.refreshFilesButton?.addEventListener("click", () => loadUserFiles());
  elements.fileInput?.addEventListener("change", () => uploadSelectedFiles(elements.fileInput.files));
  elements.fileDropZone?.addEventListener("click", () => elements.fileInput?.click());
  elements.fileDropZone?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      elements.fileInput?.click();
    }
  });
  elements.fileDropZone?.addEventListener("dragover", (event) => event.preventDefault());
  elements.fileDropZone?.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadSelectedFiles(event.dataTransfer?.files);
  });
}

export async function openFileVisionPanel(options = {}) {
  if (!elements.fileVisionPanel) {
    return;
  }
  elements.fileVisionPanel.hidden = false;
  setOrionState("thinking");
  setBrainVaultState("files", "Arquivos");
  livingAvatar?.playReaction("point-chat");
  pulseOrionAura("#61d8ff");
  showOrionBubble("Abrindo meus olhos digitais e meus arquivos, Mestre.");
  await loadUserFiles();
  if (options.startCamera) {
    await openCameraPanel();
  } else {
    setOrionState("online");
  }
}

export function closeFileVisionPanel() {
  elements.fileVisionPanel.hidden = true;
  closeCameraPanel();
  setBrainVaultState("idle");
  setOrionState("online");
  showOrionBubble("Arquivos em espera. Quando precisar, eu olho de novo.");
}

export function bindAutomationControls() {
  elements.automationPanelCloseButton?.addEventListener("click", closeAutomationPanel);
  elements.automationSaveWakeWordButton?.addEventListener("click", saveWakeWordPreference);
  elements.automationEnableNotificationsButton?.addEventListener("click", enableSmartNotifications);
  const savedWakeWord = readWakeWordPreference();
  if (elements.automationWakeWord && savedWakeWord) {
    elements.automationWakeWord.value = savedWakeWord;
  }
}

export async function openAutomationPanel() {
  if (!elements.automationPanel) {
    return;
  }
  if (!elements.fileVisionPanel?.hidden) {
    closeFileVisionPanel();
  }
  if (!elements.brainMode?.hidden) {
    exitBrainMode();
  }
  elements.automationPanel.hidden = false;
  setOrionState("thinking");
  setBrainVaultState("thinking", "Projetos");
  showOrionBubble("Abrindo minhas automacoes seguras. Nada perigoso sera executado sem confirmacao.");
  await loadAutomationPanel();
  setOrionState("online");
}

export function closeAutomationPanel() {
  if (elements.automationPanel) {
    elements.automationPanel.hidden = true;
  }
  setBrainVaultState("idle");
  setOrionState("online");
  showOrionBubble("Automacoes em espera. Eu so executo algo sensivel com sua autorizacao.");
}

async function loadAutomationPanel() {
  try {
    const status = await getAutomationStatus();
    renderAutomationStatus(status);
  } catch {
    if (elements.automationSummary) {
      elements.automationSummary.textContent = "Nao consegui carregar automacoes agora. O chat continua funcionando.";
    }
  }
}

function renderAutomationStatus(status) {
  if (elements.automationSummary) {
    elements.automationSummary.textContent = [
      `Runtime: ${status.runtime}.`,
      "Desktop, TV e dispositivos reais ficam preparados, mas exigem agente local e confirmacao.",
    ].join(" ");
  }
  if (elements.automationVoiceStatus) {
    const wakeWord = readWakeWordPreference() || status.voice?.wake_word || "Orion";
    elements.automationVoiceStatus.textContent = `Estados: ${(status.voice?.states || []).join(", ")}. Wake word: ${wakeWord}.`;
  }
  if (elements.automationNotificationStatus) {
    elements.automationNotificationStatus.textContent = `Categorias: ${(status.notifications?.categories || []).join(", ")}. Silencio: ${status.notifications?.quiet_hours}.`;
  }
  renderAutomationCapabilities(status.capabilities || []);
  renderAutomationRoutines(status.routines || []);
}

function renderAutomationCapabilities(capabilities) {
  elements.automationCapabilityCount.textContent = String(capabilities.length);
  elements.automationCapabilityList?.replaceChildren(
    ...capabilities.map((capability) => {
      const item = document.createElement("article");
      item.className = "automation-row";
      const title = document.createElement("strong");
      title.textContent = capability.label;
      const meta = document.createElement("span");
      meta.textContent = `${capability.kind} | ${capability.status}`;
      const note = document.createElement("p");
      note.textContent = capability.notes?.[0] || "Capacidade registrada no ecossistema seguro.";
      const badge = document.createElement("small");
      badge.textContent = capability.requires_confirmation ? "Exige confirmacao" : "Seguro por padrao";
      item.append(title, meta, note, badge);
      return item;
    })
  );
}

function renderAutomationRoutines(routines) {
  elements.automationRoutineCount.textContent = String(routines.length);
  elements.automationRoutineList?.replaceChildren(
    ...routines.map((routine) => {
      const item = document.createElement("article");
      item.className = "automation-row";
      const title = document.createElement("strong");
      title.textContent = routine.label;
      const description = document.createElement("p");
      description.textContent = routine.description;
      const button = document.createElement("button");
      button.className = "mini-action";
      button.type = "button";
      button.textContent = "Preview";
      button.addEventListener("click", () => previewRoutine(routine.routine_id));
      item.append(title, description, button);
      return item;
    })
  );
}

async function previewRoutine(routineId) {
  try {
    const preview = await previewAutomationRoutine({ user_id: userId, routine_id: routineId });
    const steps = preview.steps.map((step, index) => `${index + 1}. ${step}`).join(" ");
    addChatMessage("system", `${preview.label}: ${steps}`);
    showOrionBubble(preview.message);
  } catch {
    showOrionBubble("Nao consegui gerar o preview da rotina agora.");
  }
}

async function enableSmartNotifications() {
  const response = await requestAutomationAction({
    user_id: userId,
    action_id: "notifications.smart",
    target: "projetos",
  });
  if (!("Notification" in window)) {
    showOrionBubble("Seu navegador nao oferece notificacoes para este PWA.");
    return;
  }
  const permission = await Notification.requestPermission();
  const message = permission === "granted"
    ? "Notificacoes inteligentes permitidas. Vou respeitar frequencia e horario silencioso."
    : "Notificacoes nao foram permitidas. Continuo avisando dentro do chat.";
  showOrionBubble(message);
  addChatMessage("system", `${response.message} ${message}`);
}

function saveWakeWordPreference() {
  const value = (elements.automationWakeWord?.value || "Orion").trim().slice(0, 32) || "Orion";
  try {
    window.localStorage.setItem(WAKE_WORD_KEY, value);
  } catch {
    // Wake word customization is optional when storage is unavailable.
  }
  showOrionBubble(`Palavra de ativacao configurada: ${value}. Estou ouvindo quando o modo voz estiver ativo.`);
}

function readWakeWordPreference() {
  try {
    return window.localStorage.getItem(WAKE_WORD_KEY) || "Orion";
  } catch {
    return "Orion";
  }
}

export async function openCameraPanel() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraStatus("indisponivel");
    setOrionState("error");
    showOrionBubble("Nao consegui acessar a camera. Verifique a permissao do navegador.");
    addChatMessage("orion", "Nao consegui acessar a camera. Verifique a permissao do navegador.");
    return false;
  }
  try {
    closeCameraPanel({ keepPanelOpen: true });
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    elements.cameraPreview.srcObject = cameraStream;
    elements.cameraPreview.hidden = false;
    elements.capturePhotoButton.disabled = false;
    elements.cameraCloseButton.disabled = false;
    setCameraStatus("aberta");
    setOrionState("listening");
    setBrainVaultState("searching", "Arquivos");
    livingAvatar?.cameraAttention();
    showOrionBubble("Visao ativada. Estou observando.");
    return true;
  } catch {
    setCameraStatus("bloqueada");
    setOrionState("error");
    showOrionBubble("Nao consegui acessar a camera. Verifique a permissao do navegador.");
    addChatMessage("orion", "Nao consegui acessar a camera. Verifique a permissao do navegador.");
    return false;
  }
}

export function closeCameraPanel(options = {}) {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
  }
  cameraStream = undefined;
  if (elements.cameraPreview) {
    elements.cameraPreview.srcObject = null;
    elements.cameraPreview.hidden = true;
  }
  elements.capturePhotoButton.disabled = true;
  elements.cameraCloseButton.disabled = true;
  if (!capturedPhotoDataUrl) {
    elements.sendPhotoButton.disabled = true;
  }
  setCameraStatus("fechada");
  if (!options.keepPanelOpen) {
    setOrionState("online");
  }
}

export function captureCameraPhoto() {
  if (!cameraStream || !elements.cameraPreview.videoWidth) {
    showOrionBubble("Abra a camera antes de tirar a foto.");
    return "";
  }
  const width = elements.cameraPreview.videoWidth || 960;
  const height = elements.cameraPreview.videoHeight || 540;
  elements.cameraCanvas.width = width;
  elements.cameraCanvas.height = height;
  const context = elements.cameraCanvas.getContext("2d");
  context.drawImage(elements.cameraPreview, 0, 0, width, height);
  capturedPhotoDataUrl = elements.cameraCanvas.toDataURL("image/png");
  elements.photoPreview.src = capturedPhotoDataUrl;
  elements.photoPreview.hidden = false;
  elements.sendPhotoButton.disabled = false;
  livingAvatar?.playReaction("direct-look");
  pulseOrionAura("#65ffb6");
  showOrionBubble("Foto capturada. Posso enviar para analise.");
  return capturedPhotoDataUrl;
}

export async function sendCapturedPhoto() {
  if (!capturedPhotoDataUrl) {
    showOrionBubble("Tire uma foto antes de enviar.");
    return;
  }
  setFilesStatus("enviando foto");
  animateOrionThinking();
  try {
    const response = await uploadCameraPhoto({
      user_id: userId,
      image_data: capturedPhotoDataUrl,
      filename: `orion-camera-${Date.now()}.png`,
      category: "camera",
    });
    capturedPhotoDataUrl = "";
    elements.sendPhotoButton.disabled = true;
    handleUploadedFile(response, { autoAnalyze: true });
  } catch (error) {
    setFilesStatus("erro");
    setOrionState("error");
    showOrionBubble(error.message || "Nao consegui enviar a foto.");
  }
}

export async function uploadSelectedFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) {
    return;
  }
  setFilesStatus("enviando");
  await openFileVisionPanel();
  for (const file of files) {
    try {
      const response = await uploadOrionFile({
        file,
        userId,
        category: inferFileCategory(file),
      });
      handleUploadedFile(response, { autoAnalyze: true });
    } catch (error) {
      const message = error.message || `Nao consegui enviar ${file.name}.`;
      addChatMessage("orion", message);
      showOrionBubble(message);
      setOrionState("error");
    }
  }
  if (elements.fileInput) {
    elements.fileInput.value = "";
  }
  await loadUserFiles();
}

export async function loadUserFiles() {
  if (!elements.fileList) {
    return [];
  }
  try {
    const response = await listOrionFiles(userId);
    const files = response.files || [];
    renderFileList(files);
    setFilesStatus("pronto");
    return files;
  } catch (error) {
    setFilesStatus("erro");
    renderFileList([]);
    showOrionBubble(error.message || "Nao consegui listar seus arquivos.");
    return [];
  }
}

export function renderFileList(files) {
  elements.fileList.replaceChildren();
  elements.fileCount.textContent = String(files.length);
  if (!files.length) {
    const empty = document.createElement("p");
    empty.className = "file-summary";
    empty.textContent = "Nenhum arquivo salvo para este usuario ainda.";
    elements.fileList.append(empty);
    return;
  }
  files.forEach((file) => {
    const row = document.createElement("article");
    row.className = "file-row";
    row.dataset.fileId = file.id;
    row.setAttribute("role", "listitem");

    const main = document.createElement("div");
    main.className = "file-row-main";

    const name = document.createElement("strong");
    name.className = "file-name";
    name.textContent = file.original_name;

    const meta = document.createElement("span");
    meta.className = "file-meta";
    meta.textContent = `${file.category} Â· ${formatBytes(file.size_bytes)} Â· ${file.analysis_status}`;

    const summary = document.createElement("span");
    summary.className = "file-summary";
    summary.textContent = file.summary || "Aguardando analise.";

    main.append(name, meta, summary);

    const actions = document.createElement("div");
    actions.className = "file-row-actions";

    const analyzeButton = document.createElement("button");
    analyzeButton.className = "mini-action";
    analyzeButton.type = "button";
    analyzeButton.textContent = "Analisar";
    analyzeButton.addEventListener("click", () => analyzeFileById(file.id));

    const summaryButton = buildFileActionButton("Resumir", () => transformFileById(file.id, "summary"));
    const explainButton = buildFileActionButton("Explicar", () => transformFileById(file.id, "explanation"));
    const handoutButton = buildFileActionButton("Apostila", () => transformFileById(file.id, "apostila"));
    const workButton = buildFileActionButton("Trabalho", () => transformFileById(file.id, "trabalho"));
    const pdfButton = buildFileActionButton("PDF", () => transformFileById(file.id, "pdf", "pdf"));
    const flashcardsButton = buildFileActionButton("Flashcards", () => transformFileById(file.id, "flashcards"));
    const downloadButton = buildFileActionButton("Baixar", () => downloadFileById(file.id), "mini-action--quiet");

    const deleteButton = document.createElement("button");
    deleteButton.className = "mini-action mini-action--quiet";
    deleteButton.type = "button";
    deleteButton.textContent = "Apagar";
    deleteButton.addEventListener("click", () => deleteFileById(file.id));

    actions.append(
      analyzeButton,
      summaryButton,
      explainButton,
      handoutButton,
      workButton,
      pdfButton,
      flashcardsButton,
      downloadButton,
      deleteButton
    );
    row.append(main, actions);
    elements.fileList.append(row);
  });
}

function buildFileActionButton(label, handler, extraClass = "") {
  const button = document.createElement("button");
  button.className = `mini-action ${extraClass}`.trim();
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", handler);
  return button;
}

export async function analyzeFileById(fileId, instructions = "") {
  setFilesStatus("analisando");
  animateOrionThinking();
  setBrainVaultState("files", "Arquivos");
  try {
    const response = await analyzeOrionFile(fileId, {
      user_id: userId,
      instructions,
    });
    applyAvatarPayload({
      intent: "file",
      emotion: response.file.analysis_status === "ready" ? "happy" : "curious",
      avatar_mood: response.file.analysis_status === "ready" ? "focused" : "curious",
      avatar_reaction: "point-chat",
      reasoning_state: "answering",
    });
    await typeOrionMessage(response.message || response.summary);
    suggestWebResearchForFile(response.file, response.keywords || [], response.summary);
    await loadUserFiles();
  } catch (error) {
    setFilesStatus("erro");
    setOrionState("error");
    showOrionBubble(error.message || "Nao consegui analisar esse arquivo.");
  }
}

export async function transformFileById(fileId, mode, outputFormat = "text") {
  setFilesStatus("transformando");
  animateOrionThinking();
  setBrainVaultState("files", "Documentos");
  try {
    const response = await transformOrionFile(fileId, {
      user_id: userId,
      mode,
      output_format: outputFormat,
    });
    applyAvatarPayload({
      intent: "file",
      emotion: "happy",
      avatar_mood: mode === "apostila" ? "teacher" : "focused",
      avatar_reaction: mode === "flashcards" ? "point-chat" : "teacher",
      reasoning_state: "answering",
    });
    const generatedLine = response.generated_file
      ? `\n\nArquivo gerado: ${response.generated_file.original_name}.`
      : "";
    await typeOrionMessage(`${response.message}\n\n${response.content}${generatedLine}`);
    await loadUserFiles();
  } catch (error) {
    setFilesStatus("erro");
    setOrionState("error");
    showOrionBubble(error.message || "Nao consegui transformar esse arquivo.");
  }
}

export function downloadFileById(fileId) {
  window.open(orionFileDownloadUrl(fileId, userId), "_blank", "noopener,noreferrer");
}

export async function deleteFileById(fileId) {
  if (!window.confirm("Apagar este arquivo do Orion para este usuario?")) {
    return;
  }
  try {
    await deleteOrionFile(fileId, userId);
    showOrionBubble("Arquivo removido com seguranca.");
    await loadUserFiles();
  } catch (error) {
    setFilesStatus("erro");
    showOrionBubble(error.message || "Nao consegui apagar esse arquivo.");
  }
}

function handleUploadedFile(response, options = {}) {
  const file = response.file;
  setFilesStatus("salvo");
  livingAvatar?.playReaction("point-chat");
  pulseOrionAura("#65ffb6");
  showOrionBubble("Arquivo recebido. Estou olhando para o monitor.");
  addChatMessage("orion", response.message || `Recebi ${file.original_name}.`);
  if (options.autoAnalyze) {
    const instruction = file.source === "camera"
      ? "Analise esta foto capturada pela camera."
      : "Analise este arquivo e sugira proximos passos.";
    analyzeFileById(file.id, instruction);
  }
}

function suggestWebResearchForFile(file, keywords = [], summary = "") {
  const technicalTerms = ["erro", "deploy", "render", "docker", "websocket", "fastapi", "pwa", "api"];
  const queryTerms = [...keywords, file.original_name]
    .join(" ")
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2)
    .slice(0, 8);
  const hasTechnicalClue = technicalTerms.some((term) => `${summary} ${queryTerms.join(" ")}`.toLowerCase().includes(term));
  const query = queryTerms.length
    ? queryTerms.join(" ")
    : `${file.category} ${file.extension.replace(".", "")}`;
  const message = hasTechnicalClue
    ? "Analisei o arquivo. Quer que eu pesquise fontes atuais relacionadas a esse erro ou assunto?"
    : "Analisei o arquivo. Quer que eu pesquise fontes atuais relacionadas ao conteudo?";
  const node = addChatMessage("orion", message);
  const action = document.createElement("button");
  action.className = "mini-action chat-inline-action";
  action.type = "button";
  action.textContent = "Pesquisar fontes";
  action.addEventListener("click", () => performWebSearch(query, { category: "Arquivos" }));
  node.append(action);
}

function setCameraStatus(status) {
  if (elements.cameraStatus) {
    elements.cameraStatus.textContent = status;
  }
}

function setFilesStatus(status) {
  if (elements.filesStatus) {
    elements.filesStatus.textContent = status;
  }
}

function inferFileCategory(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (file.type.startsWith("image/")) {
    return "imagem";
  }
  if (extension === "pdf") {
    return "pdf";
  }
  if (["txt", "md", "csv", "json"].includes(extension)) {
    return "texto";
  }
  if (["doc", "docx", "pptx", "xls", "xlsx"].includes(extension)) {
    return "documento";
  }
  return "geral";
}

function formatBytes(size) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

async function handleLocalFileCommands(text) {
  const normalized = normalizeCommand(text);
  const isAutomationCommand = AUTOMATION_COMMAND_TERMS.some((term) => normalized.includes(term));
  if (isAutomationCommand) {
    await openAutomationPanel();
    await typeOrionMessage(
      "Painel de automacoes aberto. Posso mostrar rotinas, notificacoes, voz continua e dispositivos preparados."
    );
    return true;
  }

  const isFileCommand = FILE_COMMAND_TERMS.some((term) => normalized.includes(term));
  if (!isFileCommand) {
    return false;
  }

  if (normalized.includes("abrir camera")) {
    await openFileVisionPanel({ startCamera: true });
    await typeOrionMessage("Visao ativada. Se o navegador pedir permissao, autorize a camera para eu enxergar.");
    return true;
  }

  if (normalized.includes("tirar foto")) {
    await openFileVisionPanel({ startCamera: !cameraStream });
    const photo = captureCameraPhoto();
    if (photo) {
      await sendCapturedPhoto();
    } else {
      await typeOrionMessage("Abra a camera primeiro. Depois eu consigo capturar e enviar a foto.");
    }
    return true;
  }

  if (normalized.includes("meus arquivos")) {
    await openFileVisionPanel();
    const files = await loadUserFiles();
    const message = files.length
      ? `Encontrei ${files.length} arquivo(s) deste usuario. Posso analisar qualquer um pelo painel.`
      : "Ainda nao ha arquivos salvos para este usuario.";
    await typeOrionMessage(message);
    return true;
  }

  if (
    normalized.includes("analisar arquivo")
    || normalized.includes("ler documento")
    || normalized.includes("o que tem nessa imagem")
  ) {
    await openFileVisionPanel();
    const file = await findLatestFileForCommand(normalized);
    if (!file) {
      await typeOrionMessage("Nao encontrei um arquivo compativel para analisar. Envie um arquivo primeiro.");
      return true;
    }
    await analyzeFileById(file.id, text);
    return true;
  }

  const transformMode = inferFileTransformMode(normalized);
  if (transformMode) {
    await openFileVisionPanel();
    const file = await findLatestFileForCommand(normalized);
    if (!file) {
      await typeOrionMessage("Nao encontrei um arquivo compativel para transformar. Envie um arquivo primeiro.");
      return true;
    }
    await transformFileById(file.id, transformMode.mode, transformMode.outputFormat);
    return true;
  }

  return false;
}

function inferFileTransformMode(normalized) {
  if (normalized.includes("criar apostila") || normalized.includes("transformar em apostila")) {
    return { mode: "apostila", outputFormat: "text" };
  }
  if (normalized.includes("fazer trabalho") || normalized.includes("transformar em trabalho")) {
    return { mode: "trabalho", outputFormat: "text" };
  }
  if (normalized.includes("gerar pdf") || normalized.includes("transformar em pdf")) {
    return { mode: "pdf", outputFormat: "pdf" };
  }
  if (normalized.includes("flashcards")) {
    return { mode: "flashcards", outputFormat: "text" };
  }
  if (normalized.includes("explicar documento")) {
    return { mode: "explanation", outputFormat: "text" };
  }
  if (normalized.includes("resumir pdf") || normalized.includes("resumir documento")) {
    return { mode: "summary", outputFormat: "text" };
  }
  return undefined;
}

async function findLatestFileForCommand(normalizedCommand) {
  const response = await listOrionFiles(userId);
  const files = response.files || [];
  if (normalizedCommand.includes("imagem")) {
    return files.find((file) => ["imagem", "camera"].includes(file.category));
  }
  if (normalizedCommand.includes("pdf")) {
    return files.find((file) => file.extension === ".pdf");
  }
  return files[0];
}

export function loadVisualPreferences() {
  const preferences = readUserVisualPreferences();
  const savedSkin = preferences.avatarSkin || {
    ...DEFAULT_AVATAR_SKIN,
    outfit: preferences.outfit || DEFAULT_AVATAR_SKIN.outfit,
  };
  applyCustomSkin(savedSkin, { persist: false, react: false, source: "load" });
  applyVoiceMode(preferences.voiceMode || "balanced", { persist: false, react: false });
  applyVisualMode(preferences.visualMode || defaultVisualMode(), { persist: false, react: false });
}

export function applyWardrobe(outfit, options = {}) {
  const selected = WARDROBE_LINES[outfit] ? outfit : "original";
  elements.orionAvatar.dataset.outfit = selected;
  if (elements.wardrobeSelect) {
    elements.wardrobeSelect.value = selected;
  }
  if (elements.avatarStudioOutfit) {
    elements.avatarStudioOutfit.value = selected;
  }
  currentAvatarSkin = { ...currentAvatarSkin, outfit: selected };
  updateAvatarStudioPreview(currentAvatarSkin);
  if (options.persist !== false) {
    writeUserVisualPreferences({
      outfit: selected,
      avatarSkin: currentAvatarSkin,
    });
  }
  if (options.react) {
    playOrionReaction(wardrobeReactionFor(selected));
    setOrionMood(wardrobeMoodFor(selected));
    pulseOrionAura(selected === "armor" || selected === "lord-dragons" ? "#ff7a90" : "#65ffb6");
    showOrionBubble(WARDROBE_LINES[selected]);
    addChatMessage("orion", WARDROBE_LINES[selected]);
  }
}

export function openAvatarStudio() {
  if (!elements.avatarStudioPanel) {
    return;
  }
  if (!elements.brainMode?.hidden) {
    exitBrainMode();
  }
  elements.avatarStudioPanel.hidden = false;
  syncAvatarStudioForm(currentAvatarSkin);
  updateAvatarStudioPreview(currentAvatarSkin);
  playOrionReaction("pose");
  setOrionMood("curious");
  showOrionBubble("Avatar Studio aberto. Podemos ajustar minha skin sem perder minha identidade.");
}

export function closeAvatarStudio() {
  if (!elements.avatarStudioPanel) {
    return;
  }
  if (elements.avatarStudioPanel) {
    elements.avatarStudioPanel.hidden = true;
  }
  setOrionMood("online");
  showOrionBubble("Avatar Studio fechado. Visual preservado.");
}

export function applyCustomSkin(skin = {}, options = {}) {
  const nextSkin = normalizeAvatarSkin(skin);
  currentAvatarSkin = nextSkin;
  elements.orionAvatar.dataset.hair = nextSkin.hair;
  elements.orionAvatar.dataset.eyes = nextSkin.eyes;
  elements.orionAvatar.dataset.accessory = nextSkin.accessory;
  elements.orionAvatar.dataset.customSkin = "true";
  elements.orionAvatar.style.setProperty("--orion-hair-color", HAIR_COLOR_MAP[nextSkin.hair] || HAIR_COLOR_MAP.white);
  elements.orionAvatar.style.setProperty("--orion-eye-color", EYE_COLOR_MAP[nextSkin.eyes] || EYE_COLOR_MAP.blue);
  elements.orionAvatar.style.setProperty("--orion-primary-color", nextSkin.primaryColor);
  elements.orionAvatar.style.setProperty("--orion-accent-color", nextSkin.accentColor);
  elements.orionAvatar.style.setProperty("--orion-aura-color", nextSkin.auraColor);
  applyWardrobe(nextSkin.outfit, { persist: false, react: false });
  syncAvatarStudioForm(nextSkin);
  updateAvatarStudioPreview(nextSkin);

  if (options.persist !== false) {
    writeUserVisualPreferences({
      outfit: nextSkin.outfit,
      avatarSkin: nextSkin,
      lastSkinAnalysis: lastAvatarImageAnalysis,
    });
  }
  if (options.react) {
    const line = options.source === "preview"
      ? "Pre-visualizacao aplicada. Estou avaliando o caimento."
      : "Minha Skin foi salva neste dispositivo.";
    playOrionReaction(options.source === "save" ? "proud" : "pose");
    setOrionMood(options.source === "save" ? "confident" : "curious");
    pulseOrionAura(nextSkin.auraColor);
    showOrionBubble(line);
    addChatMessage("orion", line);
  }
  return nextSkin;
}

export async function analyzeAvatarReferenceImage(file = elements.avatarReferenceInput?.files?.[0]) {
  if (!file) {
    const message = "Envie uma imagem de referencia para eu analisar cores, roupa e estilo.";
    showOrionBubble(message);
    if (elements.avatarReferenceResult) {
      elements.avatarReferenceResult.textContent = message;
    }
    return undefined;
  }
  if (!file.type.startsWith("image/")) {
    const message = "Esse arquivo nao parece uma imagem. Escolha uma referencia visual.";
    showOrionBubble(message);
    if (elements.avatarReferenceResult) {
      elements.avatarReferenceResult.textContent = message;
    }
    return undefined;
  }

  setOrionState("thinking");
  playOrionReaction("hand-chin");
  setBrainVaultState("learning", "Aprendizado");
  showOrionBubble("Analisando a referencia visual localmente...");
  try {
    const analysis = await extractAvatarImagePalette(file);
    lastAvatarImageAnalysis = analysis;
    const suggestedSkin = skinFromImageAnalysis(analysis);
    syncAvatarStudioForm(suggestedSkin);
    updateAvatarStudioPreview(suggestedSkin);
    const message = [
      `Identifiquei ${analysis.style} com cores ${analysis.palette.join(", ")}.`,
      `Sugestao: roupa ${WARDROBE_LINES[suggestedSkin.outfit] ? suggestedSkin.outfit : "original"}, cabelo ${suggestedSkin.hair}, olhos ${suggestedSkin.eyes}.`,
      "Deseja aplicar uma versao inspirada desse visual ao meu avatar?",
    ].join(" ");
    if (elements.avatarReferenceResult) {
      elements.avatarReferenceResult.textContent = message;
    }
    if (elements.avatarSkinSummary) {
      elements.avatarSkinSummary.textContent = message;
    }
    pulseOrionAura(suggestedSkin.auraColor);
    showOrionBubble("Referencia analisada. Posso aplicar uma skin inspirada nela.");
    addChatMessage("orion", message);
    return analysis;
  } catch {
    const message = "Nao consegui analisar essa imagem no navegador. Tente outra imagem mais clara.";
    if (elements.avatarReferenceResult) {
      elements.avatarReferenceResult.textContent = message;
    }
    setOrionState("error");
    showOrionBubble(message);
    return undefined;
  }
}

function readAvatarStudioSkin() {
  return normalizeAvatarSkin({
    outfit: elements.avatarStudioOutfit?.value || elements.wardrobeSelect?.value || currentAvatarSkin.outfit,
    hair: elements.avatarHairSelect?.value || currentAvatarSkin.hair,
    eyes: elements.avatarEyeSelect?.value || currentAvatarSkin.eyes,
    accessory: elements.avatarAccessorySelect?.value || currentAvatarSkin.accessory,
    primaryColor: elements.avatarPrimaryColor?.value || currentAvatarSkin.primaryColor,
    accentColor: elements.avatarAccentColor?.value || currentAvatarSkin.accentColor,
    auraColor: elements.avatarAuraColor?.value || currentAvatarSkin.auraColor,
  });
}

function syncAvatarStudioForm(skin = currentAvatarSkin) {
  const normalized = normalizeAvatarSkin(skin);
  setSelectValue(elements.avatarStudioOutfit, normalized.outfit);
  setSelectValue(elements.avatarHairSelect, normalized.hair);
  setSelectValue(elements.avatarEyeSelect, normalized.eyes);
  setSelectValue(elements.avatarAccessorySelect, normalized.accessory);
  setInputValue(elements.avatarPrimaryColor, normalized.primaryColor);
  setInputValue(elements.avatarAccentColor, normalized.accentColor);
  setInputValue(elements.avatarAuraColor, normalized.auraColor);
  if (elements.avatarSkinSummary && !elements.avatarSkinSummary.textContent.trim()) {
    elements.avatarSkinSummary.textContent = "Visual original preservado. Envie uma imagem para eu sugerir uma adaptacao propria.";
  }
}

function updateAvatarStudioPreview(skin = currentAvatarSkin) {
  const normalized = normalizeAvatarSkin(skin);
  if (elements.avatarStudioPreview) {
    elements.avatarStudioPreview.dataset.outfit = normalized.outfit;
    elements.avatarStudioPreview.dataset.hair = normalized.hair;
    elements.avatarStudioPreview.dataset.eyes = normalized.eyes;
    elements.avatarStudioPreview.dataset.accessory = normalized.accessory;
    elements.avatarStudioPreview.style.setProperty("--orion-hair-color", HAIR_COLOR_MAP[normalized.hair] || HAIR_COLOR_MAP.white);
    elements.avatarStudioPreview.style.setProperty("--orion-eye-color", EYE_COLOR_MAP[normalized.eyes] || EYE_COLOR_MAP.blue);
    elements.avatarStudioPreview.style.setProperty("--orion-primary-color", normalized.primaryColor);
    elements.avatarStudioPreview.style.setProperty("--orion-accent-color", normalized.accentColor);
    elements.avatarStudioPreview.style.setProperty("--orion-aura-color", normalized.auraColor);
  }
  if (elements.avatarSkinSummary && !lastAvatarImageAnalysis) {
    elements.avatarSkinSummary.textContent = `Skin pronta: roupa ${normalized.outfit}, cabelo ${normalized.hair}, olhos ${normalized.eyes}, acessorio ${normalized.accessory}.`;
  }
}

function normalizeAvatarSkin(skin = {}) {
  const outfit = WARDROBE_LINES[skin.outfit] ? skin.outfit : DEFAULT_AVATAR_SKIN.outfit;
  const hair = HAIR_COLOR_MAP[skin.hair] ? skin.hair : DEFAULT_AVATAR_SKIN.hair;
  const eyes = EYE_COLOR_MAP[skin.eyes] ? skin.eyes : DEFAULT_AVATAR_SKIN.eyes;
  const accessory = ["none", "visor", "halo", "scarf", "dragon-pin"].includes(skin.accessory)
    ? skin.accessory
    : DEFAULT_AVATAR_SKIN.accessory;
  return {
    outfit,
    hair,
    eyes,
    accessory,
    primaryColor: normalizeHexColor(skin.primaryColor, DEFAULT_AVATAR_SKIN.primaryColor),
    accentColor: normalizeHexColor(skin.accentColor, DEFAULT_AVATAR_SKIN.accentColor),
    auraColor: normalizeHexColor(skin.auraColor, DEFAULT_AVATAR_SKIN.auraColor),
  };
}

function wardrobeReactionFor(outfit) {
  const reactions = {
    teacher: "teacher",
    armor: "proud",
    tech: "point-chat",
    "lord-dragons": "surprised",
    adventurer: "wave",
  };
  return reactions[outfit] || "pose";
}

function wardrobeMoodFor(outfit) {
  const moods = {
    teacher: "professor",
    armor: "confident",
    tech: "focused",
    "lord-dragons": "dramatic",
    adventurer: "curious",
  };
  return moods[outfit] || "happy";
}

function normalizeHexColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
}

function setSelectValue(select, value) {
  if (select && Array.from(select.options).some((option) => option.value === value)) {
    select.value = value;
  }
}

function setInputValue(input, value) {
  if (input) {
    input.value = value;
  }
}

async function extractAvatarImagePalette(file) {
  const image = await loadImageElement(file);
  const canvas = document.createElement("canvas");
  const size = 72;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, size, size);
  URL.revokeObjectURL(image.dataset.objectUrl);
  const pixels = context.getImageData(0, 0, size, size).data;
  const buckets = new Map();
  let redTotal = 0;
  let greenTotal = 0;
  let blueTotal = 0;
  let usablePixels = 0;

  for (let index = 0; index < pixels.length; index += 16) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const alpha = pixels[index + 3];
    if (alpha < 80) {
      continue;
    }
    usablePixels += 1;
    redTotal += red;
    greenTotal += green;
    blueTotal += blue;
    const key = [red, green, blue].map((channel) => Math.round(channel / 32) * 32).join(",");
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  const palette = Array.from(buckets.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([key]) => rgbToHex(...key.split(",").map((value) => clampNumber(Number(value), 0, 255))));
  const average = usablePixels
    ? {
        red: Math.round(redTotal / usablePixels),
        green: Math.round(greenTotal / usablePixels),
        blue: Math.round(blueTotal / usablePixels),
      }
    : { red: 69, green: 199, blue: 255 };
  const averageHex = rgbToHex(average.red, average.green, average.blue);
  const style = describePaletteStyle(average, palette);

  return {
    palette: palette.length ? palette : [averageHex],
    average: averageHex,
    style,
    dominantMood: inferMoodFromColor(average),
  };
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.dataset.objectUrl = objectUrl;
    image.onload = () => resolve(image);
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("image-load-failed"));
    };
    image.src = objectUrl;
  });
}

function skinFromImageAnalysis(analysis) {
  const palette = analysis.palette.length ? analysis.palette : [DEFAULT_AVATAR_SKIN.primaryColor];
  const primaryColor = palette[0];
  const accentColor = palette[1] || analysis.average || DEFAULT_AVATAR_SKIN.accentColor;
  const auraColor = palette.find((color) => colorDistance(color, "#45c7ff") < 150) || primaryColor;
  const averageRgb = hexToRgb(analysis.average || primaryColor);
  const outfit = averageRgb.blue > averageRgb.red + 22
    ? "future"
    : averageRgb.red > averageRgb.blue + 28
      ? "lord-dragons"
      : averageRgb.green > averageRgb.red + 20
        ? "adventurer"
        : "tech";
  return normalizeAvatarSkin({
    outfit,
    hair: inferHairFromPalette(palette),
    eyes: inferEyesFromPalette(palette),
    accessory: outfit === "lord-dragons" ? "dragon-pin" : "visor",
    primaryColor,
    accentColor,
    auraColor,
  });
}

function describePaletteStyle(average, palette) {
  const brightness = (average.red + average.green + average.blue) / 3;
  const hasBlue = palette.some((color) => hexToRgb(color).blue > hexToRgb(color).red + 32);
  const hasRed = palette.some((color) => hexToRgb(color).red > hexToRgb(color).blue + 32);
  const base = brightness < 88 ? "visual escuro" : brightness > 184 ? "visual luminoso" : "visual equilibrado";
  if (hasBlue && hasRed) {
    return `${base}, futurista e contrastado`;
  }
  if (hasBlue) {
    return `${base}, frio e tecnologico`;
  }
  if (hasRed) {
    return `${base}, dramatico e energetico`;
  }
  return `${base}, com leitura suave`;
}

function inferMoodFromColor(color) {
  if (color.blue > color.red + 28) {
    return "focused";
  }
  if (color.red > color.blue + 28) {
    return "dramatic";
  }
  if (color.green > color.red + 18) {
    return "curious";
  }
  return "confident";
}

function inferHairFromPalette(palette) {
  const bright = palette.some((color) => colorBrightness(color) > 205);
  const warm = palette.some((color) => {
    const rgb = hexToRgb(color);
    return rgb.red > rgb.blue + 30 && rgb.green > 100;
  });
  const blue = palette.some((color) => hexToRgb(color).blue > hexToRgb(color).red + 38);
  const red = palette.some((color) => hexToRgb(color).red > hexToRgb(color).blue + 38);
  if (warm) {
    return "gold";
  }
  if (blue) {
    return "blue";
  }
  if (red) {
    return "red";
  }
  return bright ? "silver" : "white";
}

function inferEyesFromPalette(palette) {
  const selected = palette[0] || DEFAULT_AVATAR_SKIN.primaryColor;
  const rgb = hexToRgb(selected);
  if (rgb.red > rgb.blue + 40 && rgb.green > 120) {
    return "gold";
  }
  if (rgb.red > rgb.blue + 35) {
    return "red";
  }
  if (rgb.blue > rgb.red + 45 && rgb.red > 90) {
    return "purple";
  }
  if (rgb.green > rgb.red + 28) {
    return "green";
  }
  return "blue";
}

function colorBrightness(color) {
  const rgb = hexToRgb(color);
  return (rgb.red * 299 + rgb.green * 587 + rgb.blue * 114) / 1000;
}

function colorDistance(left, right) {
  const a = hexToRgb(left);
  const b = hexToRgb(right);
  return Math.sqrt(
    ((a.red - b.red) ** 2)
    + ((a.green - b.green) ** 2)
    + ((a.blue - b.blue) ** 2)
  );
}

function hexToRgb(color) {
  const fallback = "45c7ff";
  const value = (color || fallback).replace("#", "").padEnd(6, "0").slice(0, 6);
  return {
    red: parseInt(value.slice(0, 2), 16),
    green: parseInt(value.slice(2, 4), 16),
    blue: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue]
    .map((value) => clampNumber(value, 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function applyVoiceMode(mode, options = {}) {
  const selected = normalizeVoiceMode(mode);
  voiceMode = selected;
  voiceEngine?.setMode(selected);
  if (elements.voiceModeSelect) {
    elements.voiceModeSelect.value = selected;
  }
  if (options.persist !== false) {
    writeUserVisualPreferences({ voiceMode: selected });
  }
  if (options.react) {
    const line = VOICE_MODE_LINES[selected] || VOICE_MODE_LINES.conversation;
    showOrionBubble(line);
    addChatMessage("orion", line);
  }
}

export function applyVisualMode(mode, options = {}) {
  const selected = ["performance", "balanced", "ultra"].includes(mode) ? mode : "performance";
  document.documentElement.dataset.visualMode = selected;
  document.documentElement.classList.toggle("low-power", selected === "performance");
  if (elements.visualModeSelect) {
    elements.visualModeSelect.value = selected;
  }
  if (options.persist !== false) {
    writeUserVisualPreferences({ visualMode: selected });
  }
  brainVault?.setVisualMode(selected);
  if (options.react) {
    const lines = {
      performance: "Modo Performance ativado. Ficarei leve e atento.",
      balanced: "Modo Equilibrado ativado. Bonito, fluido e sem exageros.",
      ultra: "Ultra Visual ativado. Prometo manter a elegancia sem travar.",
    };
    const line = lines[selected] || lines.performance;
    showOrionBubble(line);
    addChatMessage("orion", line);
  }
}

export function enterBrainMode() {
  if (!elements.brainMode || !elements.workspace) {
    return;
  }
  elements.brainMode.hidden = false;
  elements.workspace.classList.add("is-brain-mode");
  if (elements.brainModeButton) {
    elements.brainModeButton.hidden = true;
  }
  if (elements.avatarStudioPanel) {
    elements.avatarStudioPanel.hidden = true;
  }
  brainVault?.setVisualMode(document.documentElement.dataset.visualMode || "performance");
  setBrainVaultState("thinking", "Conversas");
  brainVault?.start().then(() => brainVault?.pulseMemory("Conversas"));
  setOrionState("thinking");
  pulseOrionAura("#61d8ff");
  showOrionBubble("Entrando no meu nucleo cognitivo.");
}

export function exitBrainMode() {
  if (!elements.brainMode || !elements.workspace) {
    return;
  }
  elements.workspace.classList.remove("is-brain-mode");
  elements.brainMode.hidden = true;
  if (elements.brainModeButton) {
    elements.brainModeButton.hidden = false;
  }
  setBrainVaultState("idle");
  brainVault?.stop();
  setOrionState("online");
  showOrionBubble("Retornando ao modo avatar.");
  addChatMessage("orion", "Retornando ao modo avatar.");
}

export async function handleOptionalWebSearch(text) {
  const request = extractWebSearchRequest(text);
  if (!request.query) {
    return false;
  }
  await performWebSearch(request.query, {
    originalText: text,
    category: searchCategoryLabel(request.searchType),
    searchType: request.searchType,
  });
  return true;
}

async function handleSuggestedWebSearch(payload) {
  const query = payload.searchQuery || payload.search_query;
  const shouldSearch = payload.shouldSearchWeb ?? payload.should_search_web;
  if (!shouldSearch || !query) {
    return false;
  }
  await performWebSearch(query, {
    originalText: "",
    category: "Pesquisa",
    searchType: inferWebSearchType(query),
  });
  return true;
}

export async function performWebSearch(query, options = {}) {
  if (!window.navigator.onLine) {
    await typeOrionMessage("Estou sem acesso a internet agora, mas posso tentar responder com o que ja sei.");
    return;
  }

  const searchType = options.searchType || inferWebSearchType(query);
  const allowed = window.confirm(
    `Posso pesquisar na internet por: ${query}? Nao enviarei memorias pessoais, senhas ou dados privados.`
  );
  if (!allowed) {
    if (options.originalText) {
      await sendMessageWithRestFallback(options.originalText);
    }
    return;
  }

  playOrionReaction("point-chat");
  setOrionState("thinking");
  setOrionVoiceState("searching");
  setBrainVaultState("searching", options.category || "Projetos");
  showOrionBubble("Pesquisando fontes online...");
  try {
    const response = await searchWeb({
      query,
      search_type: searchType,
      allow_external: true,
      max_results: 5,
    });
    renderWebSearchSources(response);
    await typeOrionMessage(formatWebSearchAnswer(response));
  } catch {
    await typeOrionMessage("Nao consegui acessar fontes online agora, mas posso responder com o conhecimento disponivel.");
  }
}

function setOrionVoiceState(state) {
  elements.orionAvatar.dataset.voiceState = state;
  currentReasoningState = state;
}

function applyReasoningVisual(reasoningState, payload = {}) {
  const state = reasoningState || "answering";
  currentReasoningState = state;
  elements.orionAvatar.dataset.reasoningState = state;
  elements.orionAvatar.dataset.responseLength = payload.responseLength || payload.response_length || "short";
  elements.orionAvatar.dataset.urgency = payload.urgency || "normal";
  setBrainVaultState(mapReasoningToBrainState(state), memoryCategoryFromPayload(payload));

  if (state === "thinking") {
    setOrionState("thinking");
    playOrionReaction("hand-chin");
    pulseOrionAura("#61d8ff");
    showOrionBubble("Organizando minha resposta...");
  } else if (state === "clarifying") {
    setOrionState("curious");
    playOrionReaction("direct-look");
    pulseOrionAura("#ffd166");
    showOrionBubble("Entendi parte disso. Vou pedir uma pista melhor.");
  } else if (state === "understanding") {
    setOrionState("thinking");
    playOrionReaction("attention");
    showOrionBubble("Entendi. Vou ligar os pontos.");
  } else if (state === "answering") {
    setOrionState("speaking");
  }

  if (payload.urgency === "high") {
    pulseOrionAura("#ff7a90");
  }
}

function setBrainVaultState(state, category) {
  if (elements.brainVault) {
    elements.brainVault.dataset.brainState = state;
  }
  if (elements.brainVaultViewport) {
    elements.brainVaultViewport.dataset.brainState = state;
  }
  if (elements.brainStateLabel) {
    elements.brainStateLabel.textContent = brainStateLabel(state);
  }
  brainVault?.setState(state);
  if (category) {
    brainVault?.pulseMemory(category);
  }
}

function mapReasoningToBrainState(reasoningState) {
  const states = {
    thinking: "thinking",
    clarifying: "thinking",
    understanding: "remembering",
    answering: "remembering",
    searching: "searching",
    learning: "learning",
    files: "files",
  };
  return states[reasoningState] || "idle";
}

function memoryCategoryFromPayload(payload = {}) {
  const intent = payload.intent || "";
  if (intent.includes("name") || intent.includes("user")) {
    return "Usuarios";
  }
  if (intent.includes("memory")) {
    return "Conversas";
  }
  if (intent.includes("file")) {
    return "Arquivos";
  }
  if (intent.includes("teacher") || intent.includes("study")) {
    return "Programacao";
  }
  if (intent.includes("game") || intent.includes("dragon")) {
    return "Lord Dragons";
  }
  return "Conversas";
}

function brainStateLabel(state) {
  const labels = {
    idle: "nucleo ocioso",
    thinking: "pensando",
    learning: "aprendendo",
    searching: "pesquisando",
    remembering: "lembrando",
    files: "analisando arquivos",
  };
  return labels[state] || "nucleo ativo";
}

export function animateEyes(mode = "blink") {
  elements.orionAvatar.dataset.eyeMode = mode;
  blinkOrionEyes();
}

export function triggerIdleBehavior() {
  livingAvatar?.say("silence", { state: "curious", chat: false });
}

export function chooseRandomIdleAnimation() {
  const animations = ["look-around", "look-monitor", "look-window", "arms-crossed", "hair-fix"];
  return animations[Math.floor(Math.random() * animations.length)];
}

export function blinkOrionEyes() {
  elements.orionAvatar.classList.remove("blink-now");
  window.requestAnimationFrame(() => {
    elements.orionAvatar.classList.add("blink-now");
    window.setTimeout(() => elements.orionAvatar.classList.remove("blink-now"), 280);
  });
}

export function animateOrionSpeaking(text = "") {
  livingAvatar?.whileSpeaking(text);
  setOrionState("speaking");
}

export function animateOrionThinking() {
  livingAvatar?.beforeThinking();
  setOrionState("thinking");
  showOrionBubble("Pensando...");
}

export function handleOrionTouch() {
  livingAvatar.reactToTouch();
  return;

  touchCount += 1;
  const irritated = touchCount >= 5 && touchCount % 3 === 0;
  const reaction = irritated ? "Mestre... minha aura tambÃ©m tem espaÃ§o pessoal." : TOUCH_REACTIONS[touchCount % TOUCH_REACTIONS.length];

  setOrionState(irritated ? "annoyed" : "happy");
  showOrionBubble(reaction);
  addChatMessage("orion", reaction);
  window.setTimeout(() => setOrionState("online"), 1400);
}

export function addChatMessage(role, text) {
  visibleMessages += 1;
  const message = document.createElement("article");
  message.className = "chat-message";
  message.dataset.role = role;
  message.textContent = text;
  elements.eventFeed.append(message);
  trimVisibleMessages();
  elements.eventFeed.scrollTo({ top: elements.eventFeed.scrollHeight, behavior: "smooth" });
  elements.eventCount.textContent = `${visibleMessages} mensagens visÃ­veis`;
  return message;
}

export async function typeOrionMessage(text, options = {}) {
  typingToken += 1;
  const currentToken = typingToken;
  const message = addChatMessage("orion", "");
  const delay = Math.max(10, Math.min(24, 700 / Math.max(text.length, 1)));

  setOrionVoiceState("responding");
  animateOrionSpeaking(text);
  showOrionBubble(text.slice(0, 120));
  const speaking = speakOrion(text, { shouldSpeak: options.shouldSpeak !== false });

  for (const character of text) {
    if (currentToken !== typingToken || document.hidden) {
      message.textContent = text;
      break;
    }
    message.textContent += character;
    elements.eventFeed.scrollTop = elements.eventFeed.scrollHeight;
    await wait(delay);
  }

  setBrainVaultState("idle");
  if (!speaking) {
    setOrionVoiceState("waiting");
    setOrionState("online");
  }
}

export function trimVisibleMessages() {
  while (elements.eventFeed.children.length > MAX_VISIBLE_MESSAGES) {
    elements.eventFeed.firstElementChild.remove();
  }
  visibleMessages = elements.eventFeed.children.length;
}

export async function sendMessageToOrion(text) {
  const cleanText = text.trim();
  if (!cleanText) {
    return;
  }

  addChatMessage("user", cleanText);
  stopOrionSpeech();
  livingAvatar.reactToUserMessage(cleanText);
  animateOrionThinking();
  if (voiceCallActive || voiceReplyEnabled) {
    setOrionVoiceState("thinking");
  }
  setBrainVaultState("thinking", "Conversas");
  livingAvatar.noteActivity();

  if (await handleLocalFileCommands(cleanText)) {
    return;
  }

  if (await handleOptionalWebSearch(cleanText)) {
    return;
  }

  const payload = {
    message: cleanText,
    conversationId,
    userId,
    sentAt: new Date().toISOString(),
  };

  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
    return;
  }

  await sendMessageWithRestFallback(cleanText);
}

export function connectWebSocket() {
  window.clearTimeout(reconnectTimer);
  window.clearInterval(heartbeatTimer);
  socket = createOrionSocket({
    userId,
    onOpen: () => {
      reconnectDelay = 1200;
      showConnectionStatus("online");
      addChatMessage("system", "Canal em tempo real aberto.");
      livingAvatar.say("greeting", { state: "happy", chat: false });
      heartbeatTimer = window.setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "orion.keepalive", sentAt: new Date().toISOString() }));
        }
      }, 25000);
    },
    onMessage: (message) => handleSocketMessage(message),
    onClose: () => {
      showConnectionStatus("offline");
      showOrionBubble("Tive uma falha de conexÃ£o, Mestre. Vou tentar novamente.");
      setOrionState("error");
      window.clearInterval(heartbeatTimer);
      reconnectTimer = window.setTimeout(connectWebSocket, reconnectDelay);
      reconnectDelay = Math.min(Math.round(reconnectDelay * 1.45), 12000);
    },
    onError: () => {
      showConnectionStatus("error");
      setOrionState("error");
      if (socket?.readyState !== WebSocket.OPEN) {
        socket?.close();
      }
    },
  });
  return socket;
}

export function showConnectionStatus(status) {
  const labels = {
    online: "conectado",
    offline: "reconectando",
    error: "erro",
  };
  const label = labels[status] || status;
  elements.wsStatus.textContent = label;
  if (elements.sidebarWsStatus) {
    elements.sidebarWsStatus.textContent = label;
  }
}

function handleSocketMessage(message) {
  if (message.type === "system.ready") {
    showConnectionStatus("online");
    showOrionBubble("ConexÃ£o pronta. Estou te ouvindo.");
    return;
  }

  if (message.type === "client.message") {
    return;
  }

  if (message.type === "orion.response") {
    const payload = message.payload || {};
    applyAvatarPayload(payload);
    rememberUserName(payload);
    typeOrionMessage(payload.message || payload.text || "Estou aqui, Mestre.", {
      shouldSpeak: payload.shouldSpeak ?? payload.should_speak ?? true,
    }).then(() => handleSuggestedWebSearch(payload));
    return;
  }

  if (message.type === "orion.error") {
    const text = message.payload?.message || "Tive uma falha de conexÃ£o, Mestre. Vou tentar novamente.";
    setOrionState("error");
    showOrionBubble(text);
    addChatMessage("orion", text);
  }
}

function applyAvatarPayload(payload) {
  const mood = payload.avatar_mood || payload.avatarMood;
  const reaction = payload.avatar_reaction || payload.avatarReaction;
  const reasoningState = payload.reasoningState || payload.reasoning_state;

  if (reasoningState) {
    applyReasoningVisual(reasoningState, payload);
  }
  if (mood) {
    setOrionMood(mood);
  }
  if (reaction) {
    playOrionReaction(reaction);
  }
  if (payload.intent === "user.welcome" || payload.intent === "user.name.set" || payload.intent === "greeting") {
    playOrionReaction("wave");
    pulseOrionAura("#65ffb6");
    setBrainVaultState(payload.intent === "user.name.set" ? "learning" : "remembering", "Usuarios");
    if (payload.intent === "user.name.set") {
      showOrionBubble("Nova conexao neural criada.");
    }
  } else if (payload.intent === "teacher" || payload.intent === "study") {
    playOrionReaction("teacher");
    pulseOrionAura("#61d8ff");
    setBrainVaultState("remembering", "Programacao");
  } else if (["sales", "sales.script", "sales.message", "negotiation", "objection.price"].includes(payload.intent)) {
    playOrionReaction("hand-chin");
    pulseOrionAura("#65ffb6");
    setBrainVaultState("thinking", "Projetos");
  } else if (payload.intent === "consultant.senior") {
    playOrionReaction("teacher");
    pulseOrionAura("#61d8ff");
    setBrainVaultState("thinking", "Gestao de TI");
  } else if (payload.intent === "career.mentor") {
    playOrionReaction("attention");
    pulseOrionAura("#65ffb6");
    setBrainVaultState("thinking", "Projetos");
  } else if (payload.intent === "question.general" || payload.intent === "curiosity") {
    playOrionReaction("hand-chin");
    setBrainVaultState("thinking", "Conversas");
  } else if (payload.intent === "file" || payload.intent === "camera") {
    playOrionReaction("point-chat");
    pulseOrionAura("#61d8ff");
    setBrainVaultState("files", "Arquivos");
  } else if (payload.intent === "user.name.request") {
    playOrionReaction("direct-look");
    setBrainVaultState("remembering", "Usuarios");
  }
  if (payload.emotion === "happy") {
    pulseOrionAura("#65ffb6");
  } else if (payload.emotion === "confused") {
    pulseOrionAura("#ffd166");
  } else if (payload.emotion && payload.emotion !== "neutral") {
    pulseOrionAura("#61d8ff");
  }
}

async function sendMessageWithRestFallback(text) {
  try {
    const response = await processBrainMessage({ text, conversation_id: conversationId, user_id: userId });
    rememberUserName(response || {});
    applyAvatarPayload(response || {});
    await typeOrionMessage(response.message, {
      shouldSpeak: response?.should_speak ?? response?.shouldSpeak ?? true,
    });
    await handleSuggestedWebSearch(response || {});
  } catch {
    const errorText = "Tive uma falha de conexÃ£o, Mestre. Vou tentar novamente.";
    setOrionState("error");
    showOrionBubble(errorText);
    addChatMessage("orion", errorText);
  }
}

export function toggleVoiceCallMode() {
  if (voiceCallActive) {
    return stopVoiceCallMode();
  }
  return startVoiceCallMode();
}

export function startVoiceCallMode() {
  voiceCallActive = true;
  voiceReplyEnabled = true;
  voiceRecognitionPausedForSpeech = false;
  elements.micButton?.classList.add("is-active");
  setOrionVoiceState("listening");
  setOrionState("listening");
  showOrionBubble("Estou ouvindo.");
  addChatMessage("system", "Modo ligacao por voz iniciado.");
  return startVoiceInput({ continuous: true });
}

export function stopVoiceCallMode() {
  voiceCallActive = false;
  voiceRecognitionPausedForSpeech = false;
  window.clearTimeout(voiceRestartTimer);
  elements.micButton?.classList.remove("is-active");
  stopVoiceInput({ keepCallState: true });
  stopOrionSpeech({ keepCallState: true });
  setOrionVoiceState("encerrado");
  setOrionState("online");
  showOrionBubble("Ligacao por voz encerrada.");
  addChatMessage("system", "Modo ligacao por voz encerrado.");
  return true;
}

export function restartVoiceCallListening() {
  if (!voiceCallActive || document.hidden) {
    return;
  }
  window.clearTimeout(voiceRestartTimer);
  voiceRestartTimer = window.setTimeout(() => {
    if (voiceCallActive && !voiceInputActive && !voiceRecognitionPausedForSpeech) {
      startVoiceInput({ continuous: true });
    }
  }, 450);
}

export function startVoiceInput(options = {}) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    setOrionState("error");
    showOrionBubble("Reconhecimento de voz indisponivel neste navegador. Escreva para mim por enquanto.");
    voiceCallActive = false;
    elements.micButton?.classList.remove("is-active");
    return false;
  }

  stopVoiceInput({ keepCallState: true });
  voiceReplyEnabled = true;
  speechRecognition = new Recognition();
  speechRecognition.lang = "pt-BR";
  speechRecognition.interimResults = false;
  speechRecognition.continuous = false;

  speechRecognition.addEventListener("start", () => {
    voiceInputActive = true;
    setOrionVoiceState("listening");
    setOrionState("listening");
    showOrionBubble("Estou ouvindo.");
  });
  speechRecognition.addEventListener("result", (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join(" ")
      .trim();
    voiceInputActive = false;
    if (transcript) {
      voiceRecognitionPausedForSpeech = true;
      setOrionVoiceState("thinking");
      applyReasoningVisual("thinking");
      showOrionBubble(`Ouvi: ${transcript}. Pensando...`);
      sendMessageToOrion(transcript);
    }
  });
  speechRecognition.addEventListener("error", () => {
    voiceInputActive = false;
    setOrionVoiceState("microphone-error");
    setOrionState("error");
    showOrionBubble("Nao consegui ouvir direito. Pode tentar de novo ou escrever.");
    if (voiceCallActive) {
      restartVoiceCallListening();
    }
  });
  speechRecognition.addEventListener("end", () => {
    voiceInputActive = false;
    if (elements.orionAvatar.dataset.state === "listening") {
      setOrionVoiceState("waiting");
      setOrionState("online");
    }
    if (voiceCallActive && !voiceRecognitionPausedForSpeech) {
      restartVoiceCallListening();
    }
  });

  try {
    speechRecognition.start();
    return true;
  } catch {
    voiceInputActive = false;
    setOrionVoiceState("microphone-error");
    showOrionBubble("O microfone ja esta mudando de estado. Tente novamente em um instante.");
    return false;
  }
}

export function stopVoiceInput(options = {}) {
  if (!speechRecognition) {
    voiceInputActive = false;
    return;
  }
  try {
    speechRecognition.stop();
  } catch {
    // Browsers can throw if recognition already stopped.
  }
  voiceInputActive = false;
  speechRecognition = undefined;
  if (!options.keepCallState) {
    voiceCallActive = false;
    elements.micButton?.classList.remove("is-active");
  }
  if (elements.orionAvatar.dataset.state === "listening") {
    setOrionVoiceState("waiting");
    setOrionState("online");
  }
}

export function speakOrion(text, options = {}) {
  if (options.shouldSpeak === false || !voiceReplyEnabled) {
    return false;
  }
  if (voiceCallActive) {
    voiceRecognitionPausedForSpeech = true;
    stopVoiceInput({ keepCallState: true });
  }
  orionSpeechActive = true;
  setOrionVoiceState("responding");
  setOrionState("speaking");
  const didSpeak = voiceEngine?.speak(text, {
    mode: voiceMode,
    shouldSpeak: true,
    onStart: () => {
      orionSpeechActive = true;
      setOrionVoiceState("responding");
      setOrionState("speaking");
    },
    onEnd: () => {
      orionSpeechActive = false;
      setOrionVoiceState("waiting");
      setOrionState("online");
      voiceRecognitionPausedForSpeech = false;
      restartVoiceCallListening();
    },
  }) || false;
  if (!didSpeak) {
    orionSpeechActive = false;
  }
  return didSpeak;
}

export function stopOrionSpeech(_options = {}) {
  orionSpeechActive = false;
  voiceEngine?.stop();
}

function extractWebSearchRequest(text) {
  const normalized = normalizeCommand(text).replace(/^orion\s+/, "");
  const hasSearchIntent = WEB_SEARCH_TERMS.some((term) => normalized.includes(term));
  if (!hasSearchIntent) {
    return { query: "", searchType: "web" };
  }

  let query = text.trim();
  query = query.replace(
    /^(orion,\s*)?(pesquise|pesquisar|busque|buscar|procure|google|veja na web|compare fontes|me traga fontes)\s+/i,
    ""
  );
  query = query.replace(/^(na web|na internet|no google|sobre|por)\s+/i, "");
  return {
    query: query.trim().slice(0, 180),
    searchType: inferWebSearchType(text),
  };
}

function extractWebSearchQuery(text) {
  return extractWebSearchRequest(text).query;
}

function inferWebSearchType(text) {
  const normalized = normalizeCommand(text);
  if (["clima", "tempo", "temperatura", "previsao"].some((term) => normalized.includes(term))) {
    return "weather";
  }
  if (["noticia", "noticias", "manchete", "jornal", "saiu de novo"].some((term) => normalized.includes(term))) {
    return "news";
  }
  if (
    [
      "erro",
      "codigo",
      "api",
      "backend",
      "frontend",
      "websocket",
      "pwa",
      "python",
      "fastapi",
      "javascript",
      "docker",
      "render",
      "documentacao",
      "documentacao atual",
      "erro recente",
      "ferramenta nova",
    ].some((term) => normalized.includes(term))
  ) {
    return "technical";
  }
  return "web";
}

function searchCategoryLabel(searchType) {
  const labels = {
    news: "Noticias",
    weather: "Clima",
    technical: "Busca tecnica",
    web: "Web",
  };
  return labels[searchType] || "Web";
}

function renderWebSearchSources(response) {
  const results = response?.results || [];
  if (!elements.webSearchPanel || !elements.webSearchLink) {
    return;
  }
  if (!results.length) {
    elements.webSearchPanel.hidden = true;
    return;
  }
  const primary = results[0];
  const typeLabel = searchCategoryLabel(response.search_type || response.searchType || "web");
  elements.webSearchPanel.hidden = false;
  elements.webSearchLink.href = primary.url;
  elements.webSearchLink.textContent = `${typeLabel}: ${primary.source} + ${Math.max(results.length - 1, 0)} fontes`;
  elements.webSearchLink.title = results.map((result) => `${result.source}: ${result.title}`).join("\n");
}

function formatWebSearchAnswer(response) {
  if (!response?.searched_online) {
    return response?.message || "Nao consegui acessar fontes online agora, mas posso responder com o conhecimento disponivel.";
  }
  const sources = (response.results || [])
    .slice(0, 4)
    .map((result, index) => `${index + 1}. ${result.source} - ${result.title}`)
    .join("\n");
  const typeLabel = searchCategoryLabel(response.search_type || response.searchType || "web");
  const followups = (response.suggested_followups || [])
    .slice(0, 3)
    .map((item) => `- ${item}`)
    .join("\n");
  return [
    `Pesquisei na internet (${typeLabel}) e encontrei informacoes recentes.`,
    response.summary,
    sources ? `Fontes:\n${sources}` : "",
    followups ? `Posso continuar com:\n${followups}` : "",
  ].filter(Boolean).join("\n\n");
}

function normalizeCommand(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s,-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function readUserVisualPreferences() {
  try {
    return JSON.parse(window.localStorage.getItem(userVisualPreferenceKey()) || "{}");
  } catch {
    return {};
  }
}

function writeUserVisualPreferences(nextValues) {
  try {
    const current = readUserVisualPreferences();
    window.localStorage.setItem(userVisualPreferenceKey(), JSON.stringify({ ...current, ...nextValues }));
  } catch {
    // Visual preferences are optional when local storage is unavailable.
  }
}

function userVisualPreferenceKey() {
  return `orion:visual:${userId}`;
}

function defaultVisualMode() {
  const lowMemory = (window.navigator.deviceMemory || 4) <= 2;
  const lowCores = (window.navigator.hardwareConcurrency || 4) <= 2;
  if (lowMemory || lowCores || window.innerWidth < 420) {
    return "performance";
  }
  return window.innerWidth > 1100 ? "ultra" : "balanced";
}

function normalizeVoiceMode(mode) {
  return VOICE_MODE_ALIASES[mode] || "conversation";
}

function getOrionUserId() {
  try {
    const existing = window.localStorage.getItem(USER_ID_KEY);
    if (existing) {
      return existing;
    }
    const randomPart = window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const generated = `user-${randomPart}`;
    window.localStorage.setItem(USER_ID_KEY, generated);
    return generated;
  } catch {
    return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

function rememberUserName(payload) {
  const name = payload.userName || payload.user_name;
  if (!name) {
    return;
  }
  try {
    window.localStorage.setItem(USER_NAME_KEY, name);
  } catch {
    // User memory is optional when local storage is unavailable.
  }
}

async function loadBackendStatus() {
  try {
    const health = await getHealth();
    const status = await getStatus();

    elements.apiStatus.textContent = health.status;
    if (elements.sidebarApiStatus) {
      elements.sidebarApiStatus.textContent = health.status;
    }
    elements.backendDetail.textContent = status.backend;
    elements.databaseDetail.textContent = status.database.status;
    elements.cacheDetail.textContent = status.pwa.cache_name;
  } catch (error) {
    elements.apiStatus.textContent = "offline";
    if (elements.sidebarApiStatus) {
      elements.sidebarApiStatus.textContent = "offline";
    }
    elements.backendDetail.textContent = error.message;
  }
}

function bindChatEvents() {
  elements.messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = elements.messageInput.value;
    elements.messageInput.value = "";
    sendMessageToOrion(value);
  });
}

function stateLabel(state) {
  const labels = {
    online: "online",
    typing: "ouvindo",
    ligando: "ligando",
    thinking: "pensando",
    searching: "pesquisando",
    sleeping: "dormindo",
    speaking: "falando",
    listening: "ouvindo",
    understanding: "entendendo",
    clarifying: "perguntando",
    answering: "respondendo",
    waiting: "aguardando",
    responding: "respondendo",
    pausado: "pausado",
    encerrado: "encerrado",
    "microphone-error": "microfone",
    happy: "feliz",
    annoyed: "irritado",
    error: "preocupado",
    neutral: "neutro",
    curious: "curioso",
    professor: "professor",
    thoughtful: "pensativo",
    confident: "confiante",
    tired: "cansado",
    playful: "brincalhao",
  };
  return labels[state] || state;
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function boot() {
  setupDesignSystem();
  initOrionVisual();
  await setupOnboarding({
    app: document.querySelector("#app"),
    layer: document.querySelector("#onboarding-layer"),
    form: document.querySelector("#onboarding-form"),
    title: document.querySelector("#onboarding-title"),
    description: document.querySelector("#onboarding-description"),
    currentPasswordField: document.querySelector("#current-password-field"),
    passwordLabel: document.querySelector("#admin-password-label"),
    passwordConfirmationLabel: document.querySelector("#admin-password-confirmation-label"),
    submitButton: document.querySelector("#onboarding-submit"),
    cancelButton: document.querySelector("#onboarding-cancel"),
    settingsButton: elements.settingsButton,
    status: document.querySelector("#onboarding-status"),
  });
  bindChatEvents();
  startScene(elements.scene);
  connectWebSocket();
  await loadBackendStatus();

  const mode = window.matchMedia("(display-mode: standalone)").matches ? "standalone" : "browser";
  elements.appMode.textContent = mode;

  const swResult = await registerPwa();
  elements.pwaStatus.textContent = swResult.ok ? "registrado" : "indisponivel";

  setupInstallPrompt([elements.installButton, elements.sidebarInstallButton]);
}

boot();
