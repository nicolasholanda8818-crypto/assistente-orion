const MODE_ALIASES = {
  balanced: "conversation",
  calm: "calm",
  energetic: "conversation",
  animated: "animated",
  grandma: "grandma",
  teacher: "teacher",
  conversation: "conversation",
  assistant: "assistant",
  narrator: "narrator",
  consultant: "consultant",
};

const MODE_PROFILES = {
  conversation: { rate: 0.94, pitch: 1.01, volume: 1, pause: 190 },
  teacher: { rate: 0.88, pitch: 1, volume: 1, pause: 280 },
  assistant: { rate: 0.91, pitch: 0.98, volume: 0.96, pause: 230 },
  consultant: { rate: 0.89, pitch: 0.9, volume: 1, pause: 260 },
  calm: { rate: 0.82, pitch: 0.96, volume: 0.92, pause: 320 },
  animated: { rate: 1.01, pitch: 1.07, volume: 1, pause: 150 },
  grandma: { rate: 0.78, pitch: 0.98, volume: 0.94, pause: 380 },
  narrator: { rate: 0.82, pitch: 0.92, volume: 1, pause: 360 },
};

const ADVANCED_PROVIDER_ORDER = ["azure-speech", "elevenlabs", "openai-tts", "coqui-local"];

export function createOrionVoiceEngine({ getMode } = {}) {
  let mode = normalizeMode(typeof getMode === "function" ? getMode() : "conversation");
  let speechToken = 0;
  let activeProvider = "speech-synthesis";

  function setMode(nextMode) {
    mode = normalizeMode(nextMode);
  }

  function stop() {
    speechToken += 1;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    for (const provider of customProviders()) {
      provider.stop?.();
    }
  }

  function bestProvider() {
    const custom = customProviders();
    for (const providerId of ADVANCED_PROVIDER_ORDER) {
      const provider = custom.find((candidate) => candidate.id === providerId && candidate.available);
      if (provider?.speak) {
        return provider;
      }
    }
    return browserSpeechProvider();
  }

  function speak(text, options = {}) {
    if (options.shouldSpeak === false || !text) {
      return false;
    }
    stop();
    const provider = bestProvider();
    activeProvider = provider.id;
    const currentToken = speechToken;
    const selectedMode = normalizeMode(options.mode || mode);
    const profile = MODE_PROFILES[selectedMode] || MODE_PROFILES.conversation;

    try {
      if (provider.id !== "speech-synthesis") {
        options.onStart?.();
        provider.speak(text, { mode: selectedMode, profile, language: "pt-BR" });
        options.onEnd?.();
        return true;
      }
      speakWithSpeechSynthesis(text, {
        token: currentToken,
        currentToken: () => speechToken,
        profile,
        mode: selectedMode,
        onStart: options.onStart,
        onEnd: options.onEnd,
      });
      return true;
    } catch {
      activeProvider = "speech-synthesis";
      return speakWithSpeechSynthesis(text, {
        token: currentToken,
        currentToken: () => speechToken,
        profile: MODE_PROFILES.conversation,
        mode: "conversation",
        onStart: options.onStart,
        onEnd: options.onEnd,
      });
    }
  }

  function status() {
    return {
      mode,
      activeProvider,
      fallbackProvider: "speech-synthesis",
      advancedProviders: customProviders().map((provider) => ({
        id: provider.id,
        available: Boolean(provider.available),
      })),
    };
  }

  return { speak, stop, setMode, status };
}

function browserSpeechProvider() {
  return {
    id: "speech-synthesis",
    available: "speechSynthesis" in window,
    speak: null,
  };
}

function customProviders() {
  const registry = window.OrionVoiceProviders || {};
  return ADVANCED_PROVIDER_ORDER.map((providerId) => {
    const provider = registry[providerId] || {};
    return {
      id: providerId,
      available: Boolean(provider.available && provider.speak),
      speak: provider.speak,
      stop: provider.stop,
    };
  });
}

function speakWithSpeechSynthesis(text, { token, currentToken, profile, mode, onStart, onEnd }) {
  if (!("speechSynthesis" in window)) {
    return false;
  }
  const segments = splitSpeechSegments(text);
  const voice = selectBestVoice(window.speechSynthesis.getVoices());
  emitVoiceLog("selected_voice", {
    provider: "speech-synthesis",
    voice: safeVoiceName(voice),
    lang: voice?.lang || "unknown",
    mode,
  });
  let started = false;
  let speechStarted = false;

  function speakSegment(index) {
    if (token !== currentToken() || index >= segments.length) {
      if (index >= segments.length) {
        onEnd?.();
      }
      return;
    }
    const utterance = new SpeechSynthesisUtterance(segments[index].text);
    utterance.lang = "pt-BR";
    utterance.rate = naturalRate(profile.rate, index, mode);
    utterance.pitch = naturalPitch(profile.pitch, index, mode);
    utterance.volume = profile.volume;
    if (voice) {
      utterance.voice = voice;
    }
    utterance.addEventListener("start", () => {
      if (!speechStarted) {
        speechStarted = true;
        emitVoiceLog("voice_start", { provider: "speech-synthesis", mode, segmentCount: segments.length });
        onStart?.();
      }
    });
    utterance.addEventListener("boundary", () => {
      window.dispatchEvent(new CustomEvent("orion:voice-boundary", { detail: { mode, index } }));
    });
    utterance.addEventListener("end", () => {
      const pause = segments[index].pause + profile.pause;
      if (index >= segments.length - 1) {
        emitVoiceLog("voice_end", { provider: "speech-synthesis", mode });
      }
      window.setTimeout(() => speakSegment(index + 1), pause);
    });
    utterance.addEventListener("error", () => {
      emitVoiceLog("speech_error", { provider: "speech-synthesis", mode });
      window.setTimeout(() => speakSegment(index + 1), profile.pause);
    });
    window.speechSynthesis.speak(utterance);
  }

  if (!segments.length) {
    return false;
  }

  function startOnce() {
    if (started) {
      return;
    }
    started = true;
    speakSegment(0);
  }

  if (voice) {
    startOnce();
  } else {
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      startOnce,
      { once: true }
    );
    window.setTimeout(startOnce, 250);
  }
  return true;
}

function splitSpeechSegments(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?;:])\s+/)
    .flatMap((segment) => splitLongSegment(segment.trim()))
    .filter(Boolean)
    .map((segment) => ({
      text: segment,
      pause: pauseFor(segment),
    }));
}

function splitLongSegment(segment) {
  if (segment.length <= 190) {
    return [segment];
  }
  const parts = [];
  let remaining = segment;
  while (remaining.length > 190) {
    const slice = remaining.slice(0, 190);
    const splitAt = Math.max(slice.lastIndexOf(","), slice.lastIndexOf(" "));
    const index = splitAt > 80 ? splitAt : 190;
    parts.push(remaining.slice(0, index).trim());
    remaining = remaining.slice(index).trim();
  }
  if (remaining) {
    parts.push(remaining);
  }
  return parts;
}

function pauseFor(segment) {
  if (/[!?]$/.test(segment)) {
    return 320;
  }
  if (/[.:;]$/.test(segment)) {
    return 260;
  }
  if (/,$/.test(segment)) {
    return 160;
  }
  return 100;
}

function selectBestVoice(voices) {
  return voices
    .filter((voice) => voice.lang?.toLowerCase().startsWith("pt"))
    .sort((left, right) => scoreVoice(right) - scoreVoice(left))[0]
    || voices.sort((left, right) => scoreVoice(right) - scoreVoice(left))[0]
    || null;
}

function scoreVoice(voice) {
  const name = `${voice.name || ""} ${voice.voiceURI || ""}`.toLowerCase();
  let score = 0;
  if (voice.lang === "pt-BR") score += 80;
  if (voice.lang?.startsWith("pt")) score += 35;
  if (name.includes("antonio") || name.includes("daniel") || name.includes("ricardo")) score += 34;
  if (name.includes("male") || name.includes("masculin")) score += 26;
  if (name.includes("brasil") || name.includes("brazil")) score += 24;
  if (name.includes("natural") || name.includes("neural")) score += 30;
  if (name.includes("brazil") || name.includes("brasil") || name.includes("portuguese brazil")) score += 24;
  if (name.includes("microsoft") || name.includes("google")) score += 18;
  if (
    name.includes("maria")
    || name.includes("francisca")
    || name.includes("antonio")
    || name.includes("daniel")
    || name.includes("helena")
  ) score += 12;
  if (voice.localService) score += 6;
  return score;
}

function safeVoiceName(voice) {
  if (!voice) {
    return "unavailable";
  }
  return `${voice.name || "unknown"}`.slice(0, 80);
}

function emitVoiceLog(event, detail = {}) {
  const payload = {
    event,
    ...detail,
    at: new Date().toISOString(),
  };
  window.dispatchEvent(new CustomEvent("orion:voice-log", { detail: payload }));
  if (window.console?.info) {
    window.console.info(`[orion_voice] ${event}`, payload);
  }
}

function naturalRate(baseRate, index, mode) {
  const wave = Math.sin(index * 1.7) * 0.025;
  const narratorDrop = mode === "narrator" ? -0.02 : 0;
  const animatedLift = mode === "animated" ? 0.02 : 0;
  return clamp(baseRate + wave + narratorDrop + animatedLift, 0.72, 1.16);
}

function naturalPitch(basePitch, index, mode) {
  const wave = Math.cos(index * 1.3) * 0.035;
  const teacherLift = mode === "teacher" ? 0.02 : 0;
  const animatedLift = mode === "animated" ? 0.03 : 0;
  const calmDrop = mode === "calm" || mode === "grandma" ? -0.02 : 0;
  return clamp(basePitch + wave + teacherLift + animatedLift + calmDrop, 0.78, 1.22);
}

function normalizeMode(value) {
  return MODE_ALIASES[value] || "conversation";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
