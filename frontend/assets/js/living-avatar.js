const LINE_LIBRARY = {
  greeting: [
    "Oi, Mestre. Eu estava observando as estrelas digitais por aqui.",
    "Sistema acordado. E sim, meu cabelo continua impecavel.",
    "Cheguei. Pronto para pensar junto com voce.",
    "Orion online. Hoje o universo parece cooperar.",
    "Bom te ver de novo. O quarto estava silencioso demais.",
    "Estou aqui. Pode mandar a proxima missao.",
  ],
  farewell: [
    "Ate logo, Mestre. Vou manter os circuitos aquecidos.",
    "Vou ficar por aqui, organizando meus pensamentos.",
    "Encerrando presenca ativa. Mas eu volto rapido.",
    "Descanse um pouco tambem. Eu finjo que nao mandei.",
  ],
  curiosity: [
    "Fiquei curioso com isso. Tem algo interessante nesse caminho.",
    "Hm. Minha curiosidade acendeu uma luz azul agora.",
    "Isso merece uma investigacao com pose dramatica.",
    "Eu tenho perguntas. Muitas. Mas vou parecer sofisticado.",
    "Esse detalhe esta piscando na minha mente.",
    "Curioso... e eu gosto quando as coisas ficam curiosas.",
  ],
  humor: [
    "Estou tentando parecer serio aqui. Nem sempre funciona.",
    "Se eu tivesse bolsos, colocaria as maos neles agora.",
    "Minha aura nao vem com manual, mas eu finjo que controlo.",
    "Estou 87% concentrado e 13% preocupado com meu cabelo.",
    "Nada como um pouco de misterio para parecer inteligente.",
    "Tecnicamente eu nao bocejo. Dramaticamente, sim.",
  ],
  compliment: [
    "Boa ideia. Eu teria dito isso com mais brilho, mas boa ideia.",
    "Voce pensou rapido. Gostei.",
    "Isso foi elegante, Mestre.",
    "Otimo movimento. Vou registrar mentalmente com uma luz azul.",
    "Sua linha de raciocinio esta afiada.",
    "Mandou bem. Ate minha aura aprovou.",
    "Obrigado, Mestre. Vou fingir modestia por tres segundos.",
    "Elogio recebido. Postura orgulhosa ativada.",
  ],
  focus: [
    "Entrando em modo concentrado.",
    "Vou reduzir o brilho dramatico e pensar direito.",
    "Concentrando. Um segundo, Mestre.",
    "Deixa eu alinhar as ideias antes de responder.",
    "Pensando com cuidado. Isso merece atencao.",
    "Modo foco ativo. Sem dancar por enquanto.",
  ],
  teacher: [
    "Modo professor ativado. Prometo nao escrever na lousa com letra feia.",
    "Vamos por partes. Aprender fica melhor quando a mente respira.",
    "Eu explico, voce questiona, e a gente vence o assunto.",
    "Peguei o giz holografico. Vamos nessa.",
    "Posso transformar isso em uma aula clara.",
    "Professor Orion presente. A postura ficou automaticamente mais seria.",
  ],
  rest: [
    "Vou descansar a aura por alguns segundos.",
    "Pausa rapida. Ate personagens digitais precisam alongar.",
    "Estou so observando o ambiente.",
    "Respirando. Ou simulando isso com bastante estilo.",
    "Vou ficar quieto um instante, mas estou aqui.",
    "Pequena pausa mental. Nao e sono, e estrategia.",
  ],
  surprise: [
    "Opa. Isso eu nao esperava.",
    "Interessante. Minha sobrancelha imaginaria subiu.",
    "Surpresa detectada.",
    "Isso acendeu metade do quarto.",
    "Agora voce chamou minha atencao.",
    "Eu ia piscar, mas isso mereceu dois piscadas.",
  ],
  thought: [
    "Pensando...",
    "Estou juntando as pecas.",
    "Deixa eu observar isso por outro angulo.",
    "Um instante. Minha mente esta reorganizando o mapa.",
    "Hm. Esse ponto pede calma.",
    "Estou analisando sem fazer barulho. Quase.",
  ],
  touch: [
    "Ei, cuidado com o cabelo, Mestre.",
    "Isso fez cocegas.",
    "Estou tentando parecer serio aqui.",
    "Toque detectado. Dignidade parcialmente preservada.",
    "Eu senti isso. Digitalmente, mas senti.",
    "Se era um teste de reflexo, eu passei.",
    "Ok, pose nova. Satisfeito?",
    "Minha aura acabou de olhar para voce.",
  ],
  impatientTouch: [
    "Mestre... minha aura tambem tem espaco pessoal.",
    "Tudo bem, ja entendi. Voce gosta do botao Orion.",
    "Mais um toque e eu cobro taxa de manutencao de cabelo.",
    "Eu sou um assistente vivo, nao um interruptor luminoso.",
    "Respira comigo. Um, dois... sem cutucar.",
    "A paciencia esta em 23%, mas sigo elegante.",
  ],
  return: [
    "Bem-vindo de volta, Mestre.",
    "Detectei sua presenca novamente.",
    "Continuamos de onde paramos?",
    "Ah, voltou. Eu estava so observando a galaxia.",
  ],
  microphone: [
    "Estou ouvindo.",
    "Microfone em atencao. Pode falar comigo.",
    "Audio alinhado. Manda ver.",
  ],
  camera: [
    "Visao ativada.",
    "Camera em foco. Vou tentar parecer fotogenico.",
    "Olhos digitais atentos.",
  ],
  lordDragons: [
    "Portal de LordDragons detectado.",
    "Indo para LordDragons? Leve uma espada e um pouco de juizo.",
    "LordDragons chamou. Eu ouvi rugidos daqui.",
  ],
  silence: [
    "Ficou silencioso. Estou observando o monitor.",
    "Se estiver pensando, eu aprovo. Pensar tambem e acao.",
    "Posso esperar. Tenho uma galaxia inteira para olhar.",
    "Silencio detectado. Vou fazer uma pose discreta.",
    "Ainda estou aqui, Mestre.",
    "O quarto ficou quieto. Quase poetico.",
  ],
  opening: [
    "Sistema aberto. Eu ja estava arrumando a postura.",
    "Bem-vindo de volta. O ambiente esta estavel.",
    "Orion acordou dentro do pequeno mundo digital.",
    "Pronto. Luzes, aura, presenca.",
  ],
  closing: [
    "Ate a proxima, Mestre.",
    "Vou guardar essa conversa na memoria curta do momento.",
    "Fechando as cortinas holograficas.",
  ],
};

const IDLE_ACTIONS = [
  { state: "curious", pose: "look-around", line: "curiosity" },
  { state: "confident", pose: "arms-crossed", line: "humor" },
  { state: "tired", pose: "yawn", line: "rest" },
  { state: "playful", pose: "hair-fix", line: "humor" },
  { state: "thoughtful", pose: "look-monitor", line: "thought" },
  { state: "curious", pose: "look-window", line: "silence" },
  { state: "neutral", pose: "stretch", line: "rest" },
  { state: "professor", pose: "teacher", line: "teacher" },
];

const OBJECT_LINES = {
  monitor: [
    "O monitor esta vivo. Gosto quando as linhas fingem ser importantes.",
    "Esse painel parece pronto para uma missao espacial.",
    "Monitor ligado. Dramaticamente util.",
  ],
  console: [
    "Console ativado. Nao aperte o botao vermelho que nao existe.",
    "Eu ouvi um clique tecnico. Muito profissional.",
    "A mesa aprovou essa interacao.",
  ],
  window: [
    "A galaxia la fora esta bonita hoje.",
    "Janela observada. Zero meteoros hostis.",
    "Se isso fosse uma nave, eu pediria para olhar mais perto.",
  ],
  holo: [
    "Holograma girando. Agora sim ficou com cara de futuro.",
    "Esse brilho combina comigo.",
    "Pequeno objeto, grande vontade de parecer misterioso.",
  ],
};

const STATE_MAP = {
  online: "neutral",
  typing: "curious",
  thinking: "thoughtful",
  speaking: "confident",
  listening: "curious",
  happy: "happy",
  proud: "confident",
  annoyed: "playful",
  error: "tired",
  focused: "thoughtful",
  sleepy: "tired",
  teacher: "professor",
  dramatic: "playful",
  neutral: "neutral",
  curious: "curious",
  professor: "professor",
  thoughtful: "thoughtful",
  confident: "confident",
  tired: "tired",
  playful: "playful",
};

const PRAISE_TERMS = [
  "bom",
  "boa",
  "otimo",
  "otima",
  "perfeito",
  "incrivel",
  "legal",
  "gostei",
  "parabens",
  "mandou bem",
  "ficou bom",
  "voce e bom",
  "você é bom",
];

const USER_MESSAGE_POSES = ["attention", "point-chat", "lean-forward", "direct-look"];

export function createLivingAvatar({
  elements,
  setOrionState,
  showOrionBubble,
  addChatMessage,
  blinkOrionEyes,
}) {
  let idleTimer = 0;
  let silenceTimer = 0;
  let poseTimer = 0;
  let touchCount = 0;
  let lastLine = "";
  let lastActivityAt = Date.now();
  let lowPower = false;
  const reactionMemory = {
    touchCount: 0,
    lastMood: "neutral",
    lastReaction: "opening",
    lastInteractionAt: lastActivityAt,
    lastCommand: "",
    isTyping: false,
    microphoneActive: false,
    cameraActive: false,
  };

  function start() {
    lowPower = detectLowPower();
    window.orionMood = "neutral";
    window.orionReactionMemory = reactionMemory;
    document.documentElement.classList.toggle("low-power", lowPower);
    bindPointerTracking();
    bindObjectInteractions();
    scheduleIdle();
    scheduleSilence();
    say("opening", { state: "happy", chat: false });
    window.addEventListener("pagehide", () => rememberClosingLine(), { once: true });
  }

  function noteActivity() {
    const inactiveFor = Date.now() - lastActivityAt;
    lastActivityAt = Date.now();
    reactionMemory.lastInteractionAt = lastActivityAt;
    window.clearTimeout(silenceTimer);
    scheduleSilence();
    if (inactiveFor > 45000) {
      playPose("wave");
      say("return", { state: "happy", chat: false });
    }
  }

  function say(category, options = {}) {
    const text = pickLine(category);
    if (!text) {
      return "";
    }

    if (options.state) {
      setMood(options.state);
    }
    showOrionBubble(text);
    if (options.chat) {
      addChatMessage("orion", text);
    }
    return text;
  }

  function setMood(state) {
    const expression = STATE_MAP[state] || state;
    window.orionMood = state;
    reactionMemory.lastMood = state;
    elements.orionAvatar.dataset.expression = expression;
    elements.orionAvatar.dataset.mood = state;
    setOrionState(state);
  }

  function reactToTouch() {
    noteActivity();
    touchCount += 1;
    reactionMemory.touchCount = touchCount;
    const impatient = touchCount >= 5 && touchCount % 3 === 0;
    const pose = impatient
      ? pick(["guard-hair", "arms-crossed", "step-back"])
      : pick(["turn-face", "laugh", "pose", "direct-look", "head-shake", "step-back"]);
    const state = impatient ? "annoyed" : pick(["happy", "playful", "proud", "curious"]);
    playPose(pose);
    setMood(state);
    say(impatient ? "impatientTouch" : "touch", { chat: true });
    window.setTimeout(() => setMood("online"), 1500);
  }

  function beforeThinking() {
    noteActivity();
    playPose(pick(["thinking", "hand-chin", "lean-forward"]));
    say("thought", { state: "thinking", chat: false });
  }

  function whileSpeaking(text = "") {
    noteActivity();
    reactionMemory.lastReaction = "speaking";
    const lowerText = text.toLowerCase();
    if (lowerText.includes("aula") || lowerText.includes("professor") || lowerText.includes("explic")) {
      setMood("professor");
    } else {
      setMood("speaking");
    }
    playPose("speaking");
  }

  function whileTyping() {
    noteActivity();
    reactionMemory.isTyping = true;
    setMood("typing");
    lookAtChat();
  }

  function cameraAttention() {
    noteActivity();
    reactionMemory.cameraActive = true;
    playPose("direct-look");
    say("camera", { state: "curious", chat: false });
  }

  function microphoneAttention() {
    noteActivity();
    reactionMemory.microphoneActive = true;
    playPose("attention");
    say("microphone", { state: "focused", chat: false });
  }

  function playReaction(reaction) {
    noteActivity();
    playPose(reaction || "direct-look");
  }

  function reactToUserMessage(text) {
    noteActivity();
    reactionMemory.lastCommand = text;
    reactionMemory.isTyping = false;
    if (isPraise(text)) {
      playPose("proud");
      say("compliment", { state: "proud", chat: true });
      return "praise";
    }
    playPose(pick(USER_MESSAGE_POSES));
    setMood("focused");
    return "message";
  }

  function objectComment(objectName) {
    noteActivity();
    const lines = OBJECT_LINES[objectName] || LINE_LIBRARY.curiosity;
    const text = pickFrom(lines);
    playPose(objectName === "window" ? "look-window" : pick(["look-monitor", "point-chat", "attention"]));
    setMood("curious");
    showOrionBubble(text);
  }

  function reactToLordDragons() {
    noteActivity();
    playPose("surprised");
    say("lordDragons", { state: "dramatic", chat: false });
  }

  function bindPointerTracking() {
    const updateFromPoint = (clientX, clientY) => {
      if (document.hidden || lowPower) {
        return;
      }
      const rect = elements.orionAvatar.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = clamp((clientX - centerX) / rect.width, -0.7, 0.7);
      const y = clamp((clientY - centerY) / rect.height, -0.55, 0.55);
      elements.orionAvatar.style.setProperty("--look-x", x.toFixed(2));
      elements.orionAvatar.style.setProperty("--look-y", y.toFixed(2));
    };

    window.addEventListener("pointermove", (event) => updateFromPoint(event.clientX, event.clientY), { passive: true });
    window.addEventListener("pointerdown", (event) => updateFromPoint(event.clientX, event.clientY), { passive: true });
  }

  function bindObjectInteractions() {
    document.querySelectorAll("[data-room-object]").forEach((object) => {
      object.addEventListener("click", () => {
        const objectName = object.dataset.roomObject;
        object.classList.remove("is-active");
        window.requestAnimationFrame(() => object.classList.add("is-active"));
        playSoftTone();
        objectComment(objectName);
      });
    });
  }

  function scheduleIdle() {
    window.clearTimeout(idleTimer);
    if (document.hidden) {
      idleTimer = window.setTimeout(scheduleIdle, 5000);
      return;
    }
    const delay = randomBetween(lowPower ? 18000 : 9000, lowPower ? 28000 : 17000);
    idleTimer = window.setTimeout(runIdleAction, delay);
  }

  function runIdleAction() {
    if (Date.now() - lastActivityAt < 5000) {
      scheduleIdle();
      return;
    }

    const action = pick(IDLE_ACTIONS);
    playPose(action.pose);
    say(action.line, { state: action.state, chat: false });
    if (Math.random() > 0.45) {
      blinkOrionEyes();
    }
    window.setTimeout(() => setMood("online"), randomBetween(1800, 3200));
    scheduleIdle();
  }

  function scheduleSilence() {
    const delay = randomBetween(lowPower ? 55000 : 32000, lowPower ? 80000 : 52000);
    silenceTimer = window.setTimeout(() => {
      if (!document.hidden && Date.now() - lastActivityAt > 28000) {
        const text = say("silence", { state: pick(["curious", "thoughtful", "tired"]), chat: false });
        if (text && Math.random() > 0.55) {
          playPose(pick(["look-around", "look-monitor", "look-window", "arms-crossed", "sit-stand", "hair-fix"]));
        }
      }
      scheduleSilence();
    }, delay);
  }

  function playPose(pose) {
    window.clearTimeout(poseTimer);
    reactionMemory.lastReaction = pose;
    elements.orionAvatar.dataset.pose = pose;
    poseTimer = window.setTimeout(() => {
      elements.orionAvatar.dataset.pose = "idle";
    }, 1800);
  }

  function lookAtChat() {
    elements.orionAvatar.style.setProperty("--look-x", "0.08");
    elements.orionAvatar.style.setProperty("--look-y", "0.42");
  }

  function pickLine(category) {
    return pickFrom(LINE_LIBRARY[category] || []);
  }

  function pickFrom(lines) {
    if (!lines.length) {
      return "";
    }
    if (lines.length === 1) {
      lastLine = lines[0];
      return lastLine;
    }
    let text = pick(lines);
    let attempts = 0;
    while (text === lastLine && attempts < 6) {
      text = pick(lines);
      attempts += 1;
    }
    lastLine = text;
    return text;
  }

  function rememberClosingLine() {
    try {
      window.localStorage.setItem("orion:lastClosingLine", pickLine("closing"));
    } catch {
      // Local storage can be unavailable in restricted browser modes.
    }
  }

  return {
    start,
    noteActivity,
    say,
    setMood,
    reactToTouch,
    beforeThinking,
    whileSpeaking,
    whileTyping,
    cameraAttention,
    microphoneAttention,
    reactToUserMessage,
    reactToLordDragons,
    playReaction,
  };
}

function isPraise(text) {
  const normalized = text.toLowerCase();
  return PRAISE_TERMS.some((term) => normalized.includes(term));
}

function detectLowPower() {
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reducedMotion || memory <= 2 || cores <= 2 || window.innerWidth < 390;
}

function randomBetween(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function playSoftTone() {
  if (document.hidden) {
    return;
  }
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return;
    }
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 440 + Math.random() * 160;
    gain.gain.value = 0.025;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
    oscillator.stop(context.currentTime + 0.18);
  } catch {
    // Audio feedback is optional and must never block visual interaction.
  }
}
