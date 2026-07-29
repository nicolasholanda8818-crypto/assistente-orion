import { GSAP_URL, animateWithOrionEngine, loadGsapEngine } from "./gsap-orion.js";

const STATE_ACCENTS = {
  online: "#66e7ff",
  listening: "#50f6ff",
  thinking: "#4da3ff",
  speaking: "#b58cff",
  searching: "#ff5f72",
  files: "#6effb8",
  learning: "#ffd166",
  curious: "#ffd166",
  happy: "#72ffbf",
  annoyed: "#ff7a90",
  error: "#ff8a5c",
};

export function createPremiumVisualSystem({ elements, getVisualMode } = {}) {
  let gsapRef;
  let loadPromise;
  let running = false;
  let reducedMotion = false;
  let cleanupVisibility;
  let idleTweens = [];

  function visualMode() {
    return typeof getVisualMode === "function" ? getVisualMode() : document.documentElement.dataset.visualMode || "performance";
  }

  function isPerformanceMode() {
    return reducedMotion || visualMode() === "performance";
  }

  async function loadGsap() {
    if (gsapRef) {
      return gsapRef;
    }
    if (loadPromise) {
      return loadPromise;
    }
    loadPromise = loadGsapEngine().then((gsap) => {
      gsapRef = gsap;
      return gsapRef;
    });
    return loadPromise;
  }

  async function start() {
    if (running) {
      return;
    }
    running = true;
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("premium-visuals-ready");
    applyMode(visualMode());

    if (isPerformanceMode()) {
      return;
    }

    await loadGsap();
    startIdleLoops();
    animateEntrance();

    if (!cleanupVisibility) {
      const onVisibility = () => {
        document.documentElement.classList.toggle("is-paused", document.hidden);
        if (!document.hidden && running) {
          animateEntrance({ subtle: true });
        }
      };
      document.addEventListener("visibilitychange", onVisibility);
      cleanupVisibility = () => document.removeEventListener("visibilitychange", onVisibility);
    }
  }

  function dispose() {
    running = false;
    idleTweens.forEach((tween) => tween?.kill?.());
    idleTweens = [];
    cleanupVisibility?.();
    cleanupVisibility = undefined;
  }

  function applyMode(mode) {
    const selected = ["performance", "balanced", "ultra"].includes(mode) ? mode : "performance";
    document.documentElement.dataset.visualMode = selected;
    document.documentElement.classList.toggle("premium-ultra", selected === "ultra");
    document.documentElement.classList.toggle("premium-balanced", selected === "balanced");
    document.documentElement.classList.toggle("premium-performance", selected === "performance");
  }

  function setState(state) {
    const accent = STATE_ACCENTS[state] || STATE_ACCENTS.online;
    document.documentElement.style.setProperty("--premium-state-color", accent);
    elements?.orionAvatar?.style.setProperty("--orion-eye-color", accent);
    elements?.orionAvatar?.style.setProperty("--orion-aura-color", accent);
    elements?.brainVault?.style.setProperty("--brain-state-color", accent);

    if (isPerformanceMode() || document.hidden) {
      return;
    }

    const targets = [elements?.orionAvatar, elements?.orionBubble].filter(Boolean);
    animate(targets, { filter: "drop-shadow(0 0 18px color-mix(in srgb, var(--premium-state-color) 44%, transparent))" }, { duration: 0.28 });

    if (state === "thinking" || state === "searching") {
      pulse(elements?.brainVault || elements?.orionAvatar, state === "searching" ? 1.035 : 1.022);
    }
    if (state === "speaking") {
      speakPulse();
    }
  }

  function animateEntrance(options = {}) {
    if (isPerformanceMode() || document.hidden) {
      return;
    }
    const offset = options.subtle ? 8 : 24;
    animate(elements?.orionAvatar, { y: [offset, 0], opacity: [0.82, 1], scale: [0.98, 1] }, { duration: 0.72 });
    animate(elements?.orionBubble, { y: [-8, 0], opacity: [0.72, 1] }, { duration: 0.52 });
    animate(elements?.eventFeed, { y: [10, 0], opacity: [0.82, 1] }, { duration: 0.5 });
  }

  function animateMessage(message) {
    if (!message || isPerformanceMode() || document.hidden) {
      return;
    }
    animate(message, { y: [12, 0], opacity: [0, 1], scale: [0.97, 1] }, { duration: 0.32 });
  }

  function animatePanel(panel) {
    if (!panel || document.hidden) {
      return;
    }
    animate(panel, { y: [18, 0], opacity: [0, 1], scale: [0.98, 1] }, { duration: 0.44 });
  }

  function animatePortfolio(panel, options = {}) {
    if (!panel || document.hidden) {
      return;
    }
    animatePanel(panel);
    animate(Array.from(options.cards || []), { y: [28, 0], opacity: [0, 1], scale: [0.96, 1] }, { duration: 0.48, stagger: 0.05 });
    animate(Array.from(options.skills || []), { x: [-14, 0], opacity: [0, 1] }, { duration: 0.42, stagger: 0.04 });
  }

  function transitionToBrain() {
    if (isPerformanceMode() || document.hidden) {
      return;
    }
    animate(elements?.brainMode, { opacity: [0, 1], scale: [0.96, 1] }, { duration: 0.54 });
    pulse(elements?.brainVault, 1.018);
  }

  function transitionToAvatar() {
    if (isPerformanceMode() || document.hidden) {
      return;
    }
    animate(elements?.orionAvatar, { opacity: [0.74, 1], scale: [0.94, 1] }, { duration: 0.5 });
  }

  function speakPulse() {
    if (isPerformanceMode() || document.hidden) {
      return;
    }
    animate(elements?.orionAvatar, { scale: [1, 1.012, 1] }, { duration: 0.42 });
  }

  function pulse(target, scale = 1.02) {
    if (!target) {
      return;
    }
    animate(target, { scale: [1, scale, 1] }, { duration: 0.56 });
  }

  async function animate(target, vars, options = {}) {
    const targets = Array.isArray(target) ? target.filter(Boolean) : target ? [target] : [];
    if (!targets.length) {
      return;
    }
    await animateWithOrionEngine(targets, vars, options);
  }

  async function startIdleLoops() {
    if (idleTweens.length || isPerformanceMode() || document.hidden) {
      return;
    }
    const gsap = gsapRef || (await loadGsap());
    if (!gsap) {
      return;
    }
    const avatar = elements?.orionAvatar;
    const head = avatar?.querySelector(".orion-head");
    const shoulders = avatar ? Array.from(avatar.querySelectorAll(".orion-shoulder")) : [];
    const aura = avatar?.querySelector(".orion-aura");
    if (avatar) {
      idleTweens.push(gsap.to(avatar, { y: -5, rotate: -0.45, duration: 3.8, yoyo: true, repeat: -1, ease: "sine.inOut" }));
    }
    if (head) {
      idleTweens.push(gsap.to(head, { y: -2, rotate: 1.1, duration: 4.6, yoyo: true, repeat: -1, ease: "sine.inOut" }));
    }
    if (shoulders.length) {
      idleTweens.push(gsap.to(shoulders, { y: 2, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 0.08 }));
    }
    if (aura) {
      idleTweens.push(gsap.to(aura, { opacity: 0.96, scale: 1.025, duration: 2.8, yoyo: true, repeat: -1, ease: "sine.inOut" }));
    }
  }

  return {
    start,
    dispose,
    setState,
    applyMode,
    animateMessage,
    animatePanel,
    animatePortfolio,
    transitionToBrain,
    transitionToAvatar,
  };
}
