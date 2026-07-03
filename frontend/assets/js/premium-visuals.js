const GSAP_URL = "https://esm.sh/gsap@3.15.0";

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

  function visualMode() {
    return typeof getVisualMode === "function" ? getVisualMode() : document.documentElement.dataset.visualMode || "performance";
  }

  function isPerformanceMode() {
    return reducedMotion || visualMode() === "performance";
  }

  async function loadGsap() {
    if (gsapRef || loadPromise) {
      return gsapRef;
    }
    loadPromise = import(GSAP_URL)
      .then((module) => {
        gsapRef = module.gsap || module.default?.gsap || module.default;
        document.documentElement.dataset.animationEngine = gsapRef ? "gsap" : "web-animations";
        return gsapRef;
      })
      .catch(() => {
        document.documentElement.dataset.animationEngine = "web-animations";
        return undefined;
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
    await loadGsap();
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
    const gsap = gsapRef || (await loadGsap());
    if (gsap) {
      targets.forEach((item) => {
        gsap.fromTo(item, fromVars(vars), { ...toVars(vars), duration: options.duration || 0.4, ease: options.ease || "power2.out" });
      });
      return;
    }
    targets.forEach((item) => {
      item.animate(keyframesFrom(vars), {
        duration: Math.round((options.duration || 0.4) * 1000),
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "both",
      });
    });
  }

  return {
    start,
    dispose,
    setState,
    applyMode,
    animateMessage,
    transitionToBrain,
    transitionToAvatar,
  };
}

function fromVars(vars) {
  return Object.fromEntries(Object.entries(vars).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
}

function toVars(vars) {
  return Object.fromEntries(Object.entries(vars).map(([key, value]) => [key, Array.isArray(value) ? value[value.length - 1] : value]));
}

function keyframesFrom(vars) {
  const start = {};
  const end = {};
  const startTransform = [];
  const endTransform = [];
  Object.entries(vars).forEach(([key, value]) => {
    const first = Array.isArray(value) ? value[0] : value;
    const last = Array.isArray(value) ? value[value.length - 1] : value;
    if (key === "y") {
      startTransform.push(`translateY(${first}px)`);
      endTransform.push(`translateY(${last}px)`);
      return;
    }
    if (key === "scale") {
      startTransform.push(`scale(${first})`);
      endTransform.push(`scale(${last})`);
      return;
    }
    start[key] = first;
    end[key] = last;
  });
  if (startTransform.length) {
    start.transform = startTransform.join(" ");
    end.transform = endTransform.join(" ");
  }
  return [start, end];
}
