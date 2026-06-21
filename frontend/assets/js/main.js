import { getHealth, getStatus, processBrainMessage } from "./api.js";
import { setupDesignSystem } from "./design-system.js";
import { setupOnboarding } from "./onboarding.js";
import { registerPwa, setupInstallPrompt } from "./pwa.js";
import { startScene } from "./scene.js";
import { createOrionSocket } from "./socket.js";
import { createLivingAvatar } from "./living-avatar.js?v=26";

const MAX_VISIBLE_MESSAGES = 42;
const USER_ID_KEY = "orion:userId";
const USER_NAME_KEY = "orion:userName";
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
  orionStateIndicator: document.querySelector("#orion-state-indicator"),
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
    setOrionState("listening");
    showOrionBubble("Microfone ainda está em preparação. Por enquanto, escreva para mim.");
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

export async function typeOrionMessage(text) {
  typingToken += 1;
  const currentToken = typingToken;
  const message = addChatMessage("orion", "");
  const delay = Math.max(10, Math.min(24, 700 / Math.max(text.length, 1)));

  animateOrionSpeaking(text);
  showOrionBubble(text.slice(0, 120));

  for (const character of text) {
    if (currentToken !== typingToken || document.hidden) {
      message.textContent = text;
      break;
    }
    message.textContent += character;
    elements.eventFeed.scrollTop = elements.eventFeed.scrollHeight;
    await wait(delay);
  }

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
  livingAvatar.reactToUserMessage(cleanText);
  animateOrionThinking();
  livingAvatar.noteActivity();

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
    applyAvatarPayload(message.payload || {});
    rememberUserName(message.payload || {});
    typeOrionMessage(message.payload?.message || message.payload?.text || "Estou aqui, Mestre.");
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
  if (payload.avatar_mood) {
    setOrionMood(payload.avatar_mood);
  }
  if (payload.avatar_reaction) {
    playOrionReaction(payload.avatar_reaction);
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
    await typeOrionMessage(response.message);
  } catch {
    const errorText = "Tive uma falha de conexão, Mestre. Vou tentar novamente.";
    setOrionState("error");
    showOrionBubble(errorText);
    addChatMessage("orion", errorText);
  }
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
