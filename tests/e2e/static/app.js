let token = "";
let socket;

function jsonHeaders() {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function request(path, options = {}) {
  const response = await fetch(path, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.detail || "Falha na solicitacao");
  }

  return payload;
}

function appendText(container, text) {
  const item = document.createElement("p");
  item.textContent = text;
  container.append(item);
}

function connectSocket() {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${protocol}://${window.location.host}/ws?token=${token}`);

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "system.ready") {
      document.querySelector("[data-testid='socket-status']").textContent = "conectado";
    }

    if (message.type === "chat.message") {
      appendText(document.querySelector("[data-testid='chat-feed']"), message.text);
    }

    if (message.type === "multiplayer.position") {
      appendText(
        document.querySelector("[data-testid='position-feed']"),
        `${message.player}: ${message.x},${message.y}`,
      );
    }
  });
}

document.querySelector("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const error = document.querySelector("[data-testid='login-error']");
  error.textContent = "";

  try {
    const payload = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });
    token = payload.token;
    document.querySelector("[data-testid='user-profile']").textContent =
      `${payload.user.display_name} (${payload.user.role})`;
    document.querySelector("[data-testid='workspace']").hidden = false;
    connectSocket();
  } catch (requestError) {
    error.textContent = requestError.message;
  }
});

document.querySelector("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  socket.send(JSON.stringify({ type: "chat.message", text: form.get("message") }));
  event.currentTarget.reset();
});

document.querySelector("#upload-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = new FormData(event.currentTarget).get("file");
  const payload = await request("/api/uploads", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ filename: file.name, content: await file.text() }),
  });
  document.querySelector("[data-testid='upload-status']").textContent =
    `${payload.filename}: ${payload.status}`;
});

document.querySelector("#finance-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = await request("/api/finances", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({
      kind: form.get("kind"),
      amount: form.get("amount"),
      category: form.get("category"),
    }),
  });
  document.querySelector("[data-testid='finance-balance']").textContent = payload.balance;
  event.currentTarget.reset();
});

document.querySelector("#position-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  socket.send(
    JSON.stringify({
      type: "multiplayer.position",
      player: "Administrador",
      x: form.get("x"),
      y: form.get("y"),
    }),
  );
});
