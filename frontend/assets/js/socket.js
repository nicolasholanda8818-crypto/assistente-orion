const runtimeConfig = window.__ORION_RUNTIME__ || {};

export function getSocketUrl({ userId } = {}) {
  const socketBase = resolveSocketBase();
  const url = new URL("/ws", socketBase);
  if (userId) {
    url.searchParams.set("userId", userId);
  }
  return url.toString();
}

export function createOrionSocket({ userId, onOpen, onMessage, onClose, onError } = {}) {
  const socket = new WebSocket(getSocketUrl({ userId }));

  socket.addEventListener("open", () => onOpen?.(socket));
  socket.addEventListener("message", (event) => {
    let data;

    try {
      data = JSON.parse(event.data);
    } catch {
      data = { type: "raw.message", payload: { message: event.data } };
    }

    onMessage?.(data);
  });
  socket.addEventListener("close", () => onClose?.());
  socket.addEventListener("error", (event) => onError?.(event));

  return socket;
}

function resolveSocketBase() {
  const explicitWsBase = normalizeWsBase(runtimeConfig.wsBase);
  if (explicitWsBase) {
    return explicitWsBase;
  }

  const apiBase = normalizeHttpOrigin(runtimeConfig.apiBase);
  if (apiBase) {
    const httpBase = new URL(apiBase);
    httpBase.protocol = httpBase.protocol === "https:" ? "wss:" : "ws:";
    return httpBase.toString();
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}`;
}

function normalizeHttpOrigin(value) {
  if (!value) {
    return "";
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.origin;
  } catch {
    return "";
  }
}

function normalizeWsBase(value) {
  if (!value) {
    return "";
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
      return "";
    }
    return parsed.origin;
  } catch {
    return "";
  }
}
