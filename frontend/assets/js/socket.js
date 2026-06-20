export function getSocketUrl() {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws`;
}

export function createOrionSocket({ onOpen, onMessage, onClose, onError } = {}) {
  const socket = new WebSocket(getSocketUrl());

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
