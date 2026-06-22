import { getHealth, getStatus, processBrainMessage } from "./api.js";
import { setupDesignSystem } from "./design-system.js";
import { setupOnboarding } from "./onboarding.js";
import { registerPwa, setupInstallPrompt } from "./pwa.js";
import { startScene } from "./scene.js";
import { createOrionSocket } from "./socket.js";
import { createLivingAvatar } from "./living-avatar.js?v=30";

const MAX_VISIBLE_MESSAGES = 42;
const USER_ID_KEY = "orion:userId";
const USER_NAME_KEY = "orion:userName";
const WEB_SEARCH_TERMS = ["pesquise", "pesquisar", "busque", "buscar", "procure", "google"];
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
const VOICE_MODES = {
  calm: { rate: 0.88, pitch: 0.96, volume: 0.92 },
  balanced: { rate: 1, pitch: 1.02, volume: 1 },
  energetic: { rate: 1.08, pitch: 1.08, volume: 1 },
  teacher: { rate: 0.94, pitch: 1, volume: 1 },
};
const TOUCH_REACTIONS = [
  "Ei, cuidado com o cabelo, Mestre.",
  "Isso fez cócegas.",
  "Estou tentando parecer sério aqui.",
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
  brainModeButton: document.querySelector("#brain-mode-button"),
  bodyModeButton: document.querySelector("#body-mode-button"),
  wardrobeSelect: document.querySelector("#wardrobe-select"),
  voiceModeSelect: document.querySelector("#voice-mode-select"),
  visualModeSelect: document.querySelector("#visual-mode-select"),
  webSearchPanel: document.querySelector("#web-search-panel"),
  webSearchLink: document.querySelector("#web-search-link"),
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
let speechRecognition;
let voiceInputActive = false;
let voiceReplyEnabled = false;
let currentReasoningState = "waiting";
let voiceSettings = VOICE_MODES.balanced;

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
  loadVisualPreferences();
  bindOrionControls();
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
    setOrionState("thinking");
    showOrionBubble("Câmera ainda está em preparação. Eu aviso quando meus olhos digitais abrirem.");
    window.setTimeout(() => setOrionState("online"), 1200);
  });
  document.addEventListener("visibilitychange", () => {
    document.documentElement.classList.toggle("is-paused", document.hidden);
  });
  document.querySelector('a[href="/game.html"]')?.addEventListener("click", () => {
    livingAvatar.reactToLordDragons();
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
  const selected = VOICE_MODES[mode] ? mode : "balanced";
  voiceSettings = VOICE_MODES[selected];
  if (elements.voiceModeSelect) {
    elements.voiceModeSelect.value = selected;
  }
  if (options.persist !== false) {
    writeUserVisualPreferences({ voiceMode: selected });
  }
  if (options.react) {
    const line = selected === "teacher"
      ? "Voz de professor configurada. Vou explicar com mais calma."
      : selected === "calm"
        ? "Voz calma configurada. Menos pressa, mais presenca."
        : selected === "energetic"
          ? "Voz animada configurada. Minha aura aprovou."
          : "Voz equilibrada configurada.";
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
  setOrionState("thinking");
  pulseOrionAura("#61d8ff");
  showOrionBubble("Modo cerebro ativado. Meu nucleo neural esta flutuando.");
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
  setOrionState("online");
  showOrionBubble("Voltando ao meu corpo digital.");
  addChatMessage("orion", "Voltando ao meu corpo digital.");
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

  const allowed = window.confirm(`Posso abrir uma busca no navegador por: ${query}?`);
  if (!allowed) {
    await typeOrionMessage("Tudo bem. Eu fico no modo local e respondo com o que ja sei.");
    return true;
  }

  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  elements.webSearchPanel.hidden = false;
  elements.webSearchLink.href = url;
  elements.webSearchLink.textContent = query;
  playOrionReaction("point-chat");
  setOrionState("thinking");
  showOrionBubble("Abrindo busca web no monitor.");
  window.open(url, "_blank", "noopener,noreferrer");
  await typeOrionMessage(`Abri uma busca por "${query}". Se quiser, cole aqui o resultado e eu resumo para voce.`);
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
  const reaction = irritated ? "Mestre... minha aura também tem espaço pessoal." : TOUCH_REACTIONS[touchCount % TOUCH_REACTIONS.length];

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
  elements.eventCount.textContent = `${visibleMessages} mensagens visíveis`;
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
  livingAvatar.noteActivity();

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
      showOrionBubble("Tive uma falha de conexão, Mestre. Vou tentar novamente.");
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
    showOrionBubble("Conexão pronta. Estou te ouvindo.");
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
    const text = message.payload?.message || "Tive uma falha de conexão, Mestre. Vou tentar novamente.";
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
  } else if (payload.intent === "teacher" || payload.intent === "study") {
    playOrionReaction("teacher");
    pulseOrionAura("#61d8ff");
  } else if (payload.intent === "question.general" || payload.intent === "curiosity") {
    playOrionReaction("hand-chin");
  } else if (payload.intent === "user.name.request") {
    playOrionReaction("direct-look");
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
    const errorText = "Tive uma falha de conexão, Mestre. Vou tentar novamente.";
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
  if (options.shouldSpeak === false || !voiceReplyEnabled || !("speechSynthesis" in window)) {
    return false;
  }
  stopOrionSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = voiceSettings.rate;
  utterance.pitch = voiceSettings.pitch;
  utterance.volume = voiceSettings.volume;
  const preferredVoice = selectPreferredVoice();
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  utterance.addEventListener("start", () => {
    setOrionVoiceState("responding");
    setOrionState("speaking");
  });
  utterance.addEventListener("end", () => {
    setOrionVoiceState("waiting");
    setOrionState("online");
  });
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopOrionSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function extractWebSearchQuery(text) {
  const normalized = normalizeCommand(text).replace(/^orion\s+/, "");
  const startsWithSearchTerm = WEB_SEARCH_TERMS.some((term) => normalized.startsWith(`${term} `));
  if (!startsWithSearchTerm) {
    return "";
  }

  let query = text.trim();
  query = query.replace(/^(orion,\s*)?(pesquise|pesquisar|busque|buscar|procure|google)\s+/i, "");
  query = query.replace(/^(na web|no google|sobre|por)\s+/i, "");
  return query.trim().slice(0, 180);
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

function selectPreferredVoice() {
  if (!("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang === "pt-BR") || voices.find((voice) => voice.lang.startsWith("pt"));
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
