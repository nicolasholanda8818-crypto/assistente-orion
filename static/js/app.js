const clientId = "user_" + Math.random().toString(36).substring(7);
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(`${wsProtocol}//${window.location.host}/ws/${clientId}`);

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

socket.onmessage = function(event) {
  addMessage(event.data, "assistant");
};

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  socket.send(text);
  userInput.value = "";
}

function sendQuickAction(action) {
  addMessage(action, "user");
  socket.send(action);
}

function handleKeyPress(e) {
  if (e.key === "Enter") sendMessage();
}

function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  msgDiv.innerText = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}
