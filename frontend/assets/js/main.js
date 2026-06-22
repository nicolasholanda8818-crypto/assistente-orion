import {
  analyzeOrionFile,
  deleteOrionFile,
  getHealth,
  getStatus,
  listOrionFiles,
  processBrainMessage,
  searchWeb,
  uploadCameraPhoto,
  uploadOrionFile,
} from "./api.js";
import { setupDesignSystem } from "./design-system.js";
import { setupOnboarding } from "./onboarding.js";
import { registerPwa, setupInstallPrompt } from "./pwa.js";
import { startScene } from "./scene.js";
import { createOrionSocket } from "./socket.js";
import { createLivingAvatar } from "./living-avatar.js?v=30";
import { createBrainVault } from "./brain-vault.js?v=31";
import { createOrionVoiceEngine } from "./voice-engine.js?v=32";

const MAX_VISIBLE_MESSAGES = 42;
const USER_ID_KEY = "orion:userId";
const USER_NAME_KEY = "orion:userName";
const WEB_SEARCH_TERMS = [
  "pesquise",
  "pesquisar",
  "busque",
  "buscar",
  "procure",
  "google",
  "mais recente",
  "versao mais recente",
  "versao atual",
  "atual",
  "hoje",
  "agora",
  "noticias",
];
const FILE_COMMAND_TERMS = [
  "abrir camera",
  "tirar foto",
  "meus arquivos",
  "analisar arquivo",
  "ler documento",
  "resumir pdf",
  "o que tem nessa imagem",
];
const WARDROBE_LINES = {
  original: "Visual original carregado. Classico, luminoso e meu.",
  casual: "Essa roupa casual ficou boa em mim.",
  teacher: "Jaleco tecnologico ativado. Agora eu pareco ainda mais professor.",
  elegant: "Visual elegante aprovado. Estou tentando nao parecer convencido.",
  future: "Modo futurista ligado. Essa energia combina comigo.",
  armor: "Armadura azul pronta. Visual aprovado para dominar o sistema.",
  training: "Roupa de treino equipada. Vou fingir que alonguei antes.",
  game: "Modo jogo ativado. Lord Dragons sentiria orgulho.",
};
const VOICE_MODE_ALIASES = {
  balanced: "conversation",
  calm: "assistant",
  energetic: "conversation",
  conversation: "conversation",
  assistant: "assistant",
  teacher: "teacher",
  narrator: "narrator",
};
const VOICE_MODE_LINES = {
  conversation: "Voz de conversa configurada. Mais suave e natural.",
  teacher: "Voz de professor configurada. Vou explicar com pausas melhores.",
  assistant: "Voz de assistente configurada. Calma, clara e objetiva.",
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
  backendDetail: document.querySelector("#backend-detail"),
  databaseDetail: document.querySelector("#database-detail"),
  cacheDetail: document.querySelector("#cache-detail"),
  appMode: document.querySelector("#app-mode"),
  settingsButton: document.querySelector("#settings-button"),
  installButton: document.querySelector("#install-button"),
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
let currentReasoningState = "waiting";
let voiceMode = "conversation";
let cameraStream;
let capturedPhotoDataUrl = "";

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
  bindFileVisionControls();
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
    if (voiceInputActive) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
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
      handleUploadedFile(response);
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

    const deleteButton = document.createElement("button");
    deleteButton.className = "mini-action mini-action--quiet";
    deleteButton.type = "button";
    deleteButton.textContent = "Apagar";
    deleteButton.addEventListener("click", () => deleteFileById(file.id));

    actions.append(analyzeButton, deleteButton);
    row.append(main, actions);
    elements.fileList.append(row);
  });
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
    await loadUserFiles();
  } catch (error) {
    setFilesStatus("erro");
    setOrionState("error");
    showOrionBubble(error.message || "Nao consegui analisar esse arquivo.");
  }
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
    analyzeFileById(file.id, "Analise esta foto capturada pela camera.");
  }
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
  if (["doc", "docx", "xls", "xlsx"].includes(extension)) {
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
    || normalized.includes("resumir pdf")
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

  return false;
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
  applyWardrobe(preferences.outfit || "original", { persist: false, react: false });
  applyVoiceMode(preferences.voiceMode || "balanced", { persist: false, react: false });
  applyVisualMode(preferences.visualMode || defaultVisualMode(), { persist: false, react: false });
}

export function applyWardrobe(outfit, options = {}) {
  const selected = WARDROBE_LINES[outfit] ? outfit : "original";
  elements.orionAvatar.dataset.outfit = selected;
  if (elements.wardrobeSelect) {
    elements.wardrobeSelect.value = selected;
  }
  if (options.persist !== false) {
    writeUserVisualPreferences({ outfit: selected });
  }
  if (options.react) {
    playOrionReaction(selected === "teacher" ? "teacher" : selected === "armor" ? "proud" : "pose");
    setOrionMood(selected === "teacher" ? "professor" : selected === "armor" ? "confident" : "happy");
    pulseOrionAura(selected === "armor" ? "#ff7a90" : "#65ffb6");
    showOrionBubble(WARDROBE_LINES[selected]);
    addChatMessage("orion", WARDROBE_LINES[selected]);
  }
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
  const selected = mode === "ultra" ? "ultra" : "performance";
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
    const line = selected === "ultra"
      ? "Ultra Visual ativado. Prometo manter a elegancia sem travar."
      : "Modo Performance ativado. Ficarei leve e atento.";
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
  const query = extractWebSearchQuery(text);
  if (!query) {
    return false;
  }

  if (!window.navigator.onLine) {
    await typeOrionMessage("Estou sem acesso a internet agora, mas posso tentar responder com o que ja sei.");
    return true;
  }

  const allowed = window.confirm(`Posso pesquisar na internet por: ${query}? Nao enviarei memorias pessoais, senhas ou dados privados.`);
  if (!allowed) {
    await sendMessageWithRestFallback(text);
    return true;
  }

  playOrionReaction("point-chat");
  setOrionState("thinking");
  setBrainVaultState("searching", "Projetos");
  showOrionBubble("Pesquisando fontes online...");
  try {
    const response = await searchWeb({
      query,
      allow_external: true,
      max_results: 5,
    });
    renderWebSearchSources(response);
    await typeOrionMessage(formatWebSearchAnswer(response));
  } catch {
    await typeOrionMessage("Nao consegui acessar fontes online agora, mas posso responder com o conhecimento disponivel.");
  }
  return true;
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

  animateOrionSpeaking(text);
  showOrionBubble(text.slice(0, 120));
  speakOrion(text, { shouldSpeak: options.shouldSpeak !== false });

  for (const character of text) {
    if (currentToken !== typingToken || document.hidden) {
      message.textContent = text;
      break;
    }
    message.textContent += character;
    elements.eventFeed.scrollTop = elements.eventFeed.scrollHeight;
    await wait(delay);
  }

  setOrionVoiceState("waiting");
  setBrainVaultState("idle");
  setOrionState("online");
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
  elements.wsStatus.textContent = labels[status] || status;
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
    });
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
  } catch {
    const errorText = "Tive uma falha de conexÃ£o, Mestre. Vou tentar novamente.";
    setOrionState("error");
    showOrionBubble(errorText);
    addChatMessage("orion", errorText);
  }
}

export function startVoiceInput() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    setOrionState("error");
    showOrionBubble("Reconhecimento de voz indisponivel neste navegador. Escreva para mim por enquanto.");
    return false;
  }

  stopVoiceInput();
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
      setOrionVoiceState("understanding");
      applyReasoningVisual("understanding");
      showOrionBubble(`Ouvi: ${transcript}`);
      sendMessageToOrion(transcript);
    }
  });
  speechRecognition.addEventListener("error", () => {
    voiceInputActive = false;
    setOrionVoiceState("microphone-error");
    setOrionState("error");
    showOrionBubble("Nao consegui ouvir direito. Pode tentar de novo ou escrever.");
  });
  speechRecognition.addEventListener("end", () => {
    voiceInputActive = false;
    if (elements.orionAvatar.dataset.state === "listening") {
      setOrionVoiceState("waiting");
      setOrionState("online");
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

export function stopVoiceInput() {
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
  if (elements.orionAvatar.dataset.state === "listening") {
    setOrionVoiceState("waiting");
    setOrionState("online");
  }
}

export function speakOrion(text, options = {}) {
  if (options.shouldSpeak === false || !voiceReplyEnabled) {
    return false;
  }
  setOrionVoiceState("responding");
  setOrionState("speaking");
  return voiceEngine?.speak(text, { mode: voiceMode, shouldSpeak: true }) || false;
}

export function stopOrionSpeech() {
  voiceEngine?.stop();
}

function extractWebSearchQuery(text) {
  const normalized = normalizeCommand(text).replace(/^orion\s+/, "");
  const hasSearchIntent = WEB_SEARCH_TERMS.some((term) => normalized.includes(term));
  if (!hasSearchIntent) {
    return "";
  }

  let query = text.trim();
  query = query.replace(/^(orion,\s*)?(pesquise|pesquisar|busque|buscar|procure|google)\s+/i, "");
  query = query.replace(/^(na web|no google|sobre|por)\s+/i, "");
  return query.trim().slice(0, 180);
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
  elements.webSearchPanel.hidden = false;
  elements.webSearchLink.href = primary.url;
  elements.webSearchLink.textContent = `${primary.source} + ${Math.max(results.length - 1, 0)} fontes`;
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
  return [
    "Pesquisei na internet e encontrei informacoes recentes.",
    response.summary,
    sources ? `Fontes:\n${sources}` : "",
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
  return lowMemory || lowCores || window.innerWidth < 420 ? "performance" : "ultra";
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
    elements.backendDetail.textContent = status.backend;
    elements.databaseDetail.textContent = status.database.status;
    elements.cacheDetail.textContent = status.pwa.cache_name;
  } catch (error) {
    elements.apiStatus.textContent = "offline";
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
    thinking: "pensando",
    speaking: "falando",
    listening: "ouvindo",
    understanding: "entendendo",
    clarifying: "perguntando",
    answering: "respondendo",
    waiting: "aguardando",
    responding: "respondendo",
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

  setupInstallPrompt(elements.installButton);
}

boot();
