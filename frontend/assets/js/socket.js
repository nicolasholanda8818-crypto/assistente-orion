export function getSocketUrl({ userId } = {}) {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const url = new URL(`${protocol}://${window.location.host}/ws`);
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
