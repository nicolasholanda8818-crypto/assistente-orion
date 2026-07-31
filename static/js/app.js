const clientId = "user_" + Math.random().toString(36).substring(7);
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(`${wsProtocol}//${window.location.host}/ws/${clientId}`);

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const micBtn = document.getElementById("mic-btn");
const saturnSystem = document.querySelector(".saturn-system");
const statusText = document.getElementById("status-text");

function setCoreState(state) {
  saturnSystem.classList.remove("listening", "speaking");
  if (state === "listening") {
    saturnSystem.classList.add("listening");
    statusText.innerText = "Ouvindo você...";
  } else if (state === "speaking") {
    saturnSystem.classList.add("speaking");
    statusText.innerText = "Orion Respondendo...";
  } else {
    statusText.innerText = "Orion Online";
  }
}

// --- SELETOR DE TEMAS FUTURISTAS ---
const themes = ['', 'theme-nebula', 'theme-solaris', 'theme-matrix'];
let currentThemeIdx = 0;

function toggleTheme() {
  currentThemeIdx = (currentThemeIdx + 1) % themes.length;
  document.body.className = themes[currentThemeIdx];
}

// --- UPLOAD E VISÃO DE IMAGENS ---
function uploadImage(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  const promptText = prompt("O que você quer que o Orion analise nesta imagem?", "Descreva o que você vê nesta imagem.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", clientId);
  formData.append("prompt", promptText || "");

  addMessage(`📸 Enviando imagem: ${file.name}...`, "user");
  setCoreState("speaking");

  fetch("/upload-image/", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      addMessage(data.response, "assistant");
      speak(data.response);
    } else {
      addMessage("Erro ao analisar imagem: " + data.message, "assistant");
      setCoreState("idle");
    }
  })
  .catch(err => {
    addMessage("Erro no envio da imagem.", "assistant");
    setCoreState("idle");
  });
}

// --- SÍNTESE DE VOZ (ORION FALA) ---
function speak(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Para falas anteriores
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0; // Velocidade natural
    window.speechSynthesis.speak(utterance);
  }
}

// --- RECONHECIMENTO DE VOZ (VOCÊ FALA) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;

  micBtn.addEventListener("click", () => {
    recognition.start();
    micBtn.style.color = "#ff0055"; // Efeito visual gravando
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
    micBtn.style.color = "#00f0ff";
  };

  recognition.onerror = () => { micBtn.style.color = "#00f0ff"; };
  recognition.onend = () => { micBtn.style.color = "#00f0ff"; };
}

// --- MENSAGENS E WEBSOCKET ---
socket.onmessage = function(event) {
  const data = JSON.parse(event.data);

  if (data.thought) {
    statusText.innerText = data.thought; // Exibe a ação do agente ativo
  }

  addMessage(data.reply, "assistant");
  speak(data.reply);
};

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  socket.send(text);
  userInput.value = "";
}

function sendQuickAction(action) {
  if (action === "Pesquisar na web") {
    const query = prompt("O que você deseja pesquisar na web?");
    if (query) {
      const fullCommand = `pesquisar: ${query}`;
      addMessage(`🔍 Pesquisando: ${query}`, "user");
      socket.send(fullCommand);
    }
  } else if (action === "Limpar conversa") {
    chatBox.innerHTML = "";
    addMessage("Memória limpa! Como posso ajudar?", "assistant");
  }
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

// --- UPLOAD DE PDF ---
function uploadPDF(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", clientId);

  addMessage(`📄 Enviando arquivo PDF: ${file.name}...`, "user");

  fetch("/upload-pdf/", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      addMessage(data.response, "assistant");
      speak(data.response);
    } else {
      addMessage("Erro ao ler o PDF: " + data.message, "assistant");
    }
  })
  .catch(err => addMessage("Erro no envio do PDF.", "assistant"));
}
