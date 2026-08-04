const clientId = "user_" + Math.random().toString(36).substring(7);
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
let socket = null;
let reconnectDelay = 1000;
const reconnectBaseDelay = 1000;
const maxReconnectDelay = 30000;
let reconnectTimer = null;
let micActive = false;

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const micBtn = document.getElementById("mic-btn");
const saturnSystem = document.querySelector(".saturn-system");
const statusText = document.getElementById("status-text");

function updateConnectionStatus(message, isError = false) {
  statusText.innerText = message;
  statusText.style.color = isError ? "#ff6b6b" : "#00f0ff";
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectSocket();
  }, reconnectDelay);
  reconnectDelay = Math.min(maxReconnectDelay, reconnectDelay * 1.5);
}

function handleSocketMessage(event) {
  const data = JSON.parse(event.data);

  if (data.thought) {
    statusText.innerText = data.thought;
  }

  addMessage(data.reply, "assistant");
  speak(data.reply);
}

function connectSocket() {
  const socketUrl = `${wsProtocol}//${window.location.host}/ws/${clientId}`;
  socket = new WebSocket(socketUrl);

  socket.addEventListener("open", () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    reconnectDelay = reconnectBaseDelay;
    updateConnectionStatus("Orion Online");
  });

  socket.addEventListener("message", handleSocketMessage);

  socket.addEventListener("close", () => {
    updateConnectionStatus("Reconectando...", true);
    scheduleReconnect();
  });

  socket.addEventListener("error", () => {
    updateConnectionStatus("Conexão instável...", true);
  });
}

window.addEventListener("online", () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    connectSocket();
  }
});

window.addEventListener("offline", () => {
  updateConnectionStatus("Sem internet. Tentando reconectar...", true);
});

connectSocket();

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

// --- MÓDULO DE ÁUDIO OTIMIZADO PARA MOBILE (STT & TTS) ---
let recognition = null;
let isListening = false;
let ttsUnlocked = false;

// Desbloqueia áudio no mobile na primeira interação do usuário
document.addEventListener('click', function unlockAudio() {
  if (!ttsUnlocked && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const silentUtterance = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(silentUtterance);
    ttsUnlocked = true;
    document.removeEventListener('click', unlockAudio);
  }
}, { once: true });

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn("Reconhecimento de voz não suportado neste navegador.");
    return null;
  }

  const rec = new SpeechRecognition();
  rec.lang = 'pt-BR';
  rec.continuous = false;
  rec.interimResults = false;

  rec.onstart = function() {
    isListening = true;
    updateMicButtonUI(true);
    setCoreState("listening");
    if (navigator.vibrate) navigator.vibrate(50);
  };

  rec.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("user-input").value = transcript;
    sendMessage();
  };

  rec.onerror = function(event) {
    console.error("Erro no microfone:", event.error);
    stopListening();
  };

  rec.onend = function() {
    stopListening();
  };

  return rec;
}

function toggleMic() {
  if (!recognition) {
    recognition = initSpeechRecognition();
  }

  if (!recognition) {
    alert("Seu navegador não suporta entrada por voz. Tente usar o Chrome no Android ou Safari no iOS.");
    return;
  }

  if (isListening) {
    recognition.stop();
  } else {
    window.speechSynthesis.cancel();
    recognition.start();
  }
}

function stopListening() {
  isListening = false;
  updateMicButtonUI(false);
  setCoreState("idle");
}

function updateMicButtonUI(active) {
  const micBtn = document.getElementById("mic-btn");
  if (!micBtn) return;

  if (active) {
    micBtn.classList.add("listening-active");
  } else {
    micBtn.classList.remove("listening-active");
  }
}

function speak(text) {
  if (!text || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[*#_`~]/g, '').trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'pt-BR';
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR'));
  if (ptVoice) {
    utterance.voice = ptVoice;
  }

  utterance.onstart = function() {
    setCoreState("speaking");
  };

  utterance.onend = function() {
    setCoreState("idle");
  };

  utterance.onerror = function() {
    setCoreState("idle");
  };

  window.speechSynthesis.speak(utterance);
}

document.addEventListener("DOMContentLoaded", () => {
  const micBtn = document.getElementById("mic-btn");
  if (micBtn) {
    micBtn.onclick = toggleMic;
  }
});

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(text);
  } else {
    addMessage("Conexão perdida. Tentando reconectar...", "assistant");
    connectSocket();
  }
  userInput.value = "";
}

function sendThroughSocket(payload) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(payload);
    return true;
  }
  addMessage("Conexão perdida. Tentando reconectar...", "assistant");
  connectSocket();
  return false;
}

function sendQuickAction(action) {
  if (action === "Pesquisar na web") {
    const query = prompt("O que você deseja pesquisar na web?");
    if (query) {
      const fullCommand = `pesquisar: ${query}`;
      addMessage(`🔍 Pesquisando: ${query}`, "user");
      sendThroughSocket(fullCommand);
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
