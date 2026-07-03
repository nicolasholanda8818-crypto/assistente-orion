const THREE_URL = "https://esm.sh/three@0.184.0";
const GLTF_LOADER_URL = "https://esm.sh/three@0.184.0/examples/jsm/loaders/GLTFLoader.js";
const VRM_URL = "https://esm.sh/@pixiv/three-vrm@3.5.4";
const MANIFEST_URL = "/assets/models/avatar-manifest.json";
const MODEL_OVERRIDE_KEY = "orion:avatar3d:modelUrl";

const AVATAR_STATES = {
  online: { color: 0x66e7ff, speed: 0.65, gesture: "idle" },
  listening: { color: 0x50f6ff, speed: 0.88, gesture: "listening" },
  thinking: { color: 0x4da3ff, speed: 0.72, gesture: "thinking" },
  speaking: { color: 0xb58cff, speed: 1.08, gesture: "speaking" },
  responding: { color: 0xb58cff, speed: 1.08, gesture: "speaking" },
  searching: { color: 0xff5f72, speed: 1.15, gesture: "searching" },
  files: { color: 0x6effb8, speed: 0.9, gesture: "thinking" },
  learning: { color: 0xffd166, speed: 0.96, gesture: "thinking" },
  happy: { color: 0x72ffbf, speed: 1, gesture: "idle" },
  curious: { color: 0xffd166, speed: 0.82, gesture: "thinking" },
  annoyed: { color: 0xff7a90, speed: 0.8, gesture: "idle" },
  error: { color: 0xff9f43, speed: 0.78, gesture: "thinking" },
};

const ANIMATION_ALIASES = {
  idle: ["idle", "breath", "waiting", "stand"],
  listening: ["listening", "listen", "attention", "hear"],
  thinking: ["thinking", "think", "ponder", "hand_chin"],
  speaking: ["speaking", "talk", "talking", "speak", "mouth"],
  searching: ["searching", "search", "scan", "typing"],
};

export function createAvatar3DSystem({ container, fallbackAvatar, getVisualMode } = {}) {
  let engine;
  let loadPromise;
  let currentState = "online";
  let currentOutfit = "original";

  async function start() {
    if (!container) {
      return { status: "fallback", reason: "missing-container" };
    }
    if (engine) {
      engine.start();
      return { status: "ready" };
    }
    if (loadPromise) {
      return loadPromise;
    }

    container.dataset.status = "probing";
    loadPromise = resolveModelConfig()
      .then(async (modelConfig) => {
        if (!modelConfig?.url) {
          useFallback("no-model-configured");
          return { status: "fallback", reason: "no-model-configured" };
        }
        const nextEngine = await createThreeAvatarEngine(container, {
          modelConfig,
          getVisualMode,
        });
        engine = nextEngine;
        engine.setState(currentState);
        engine.setOutfit(currentOutfit);
        engine.start();
        container.hidden = false;
        container.dataset.status = "ready";
        container.dataset.modelType = modelConfig.type;
        document.documentElement.classList.add("avatar-3d-ready");
        fallbackAvatar?.setAttribute("data-avatar-3d-fallback", "standby");
        return { status: "ready", model: modelConfig };
      })
      .catch((error) => {
        useFallback(error?.message || "load-failed");
        return { status: "fallback", reason: "load-failed" };
      });
    return loadPromise;
  }

  function useFallback(reason) {
    container.hidden = true;
    container.dataset.status = "fallback";
    container.dataset.reason = reason;
    document.documentElement.classList.remove("avatar-3d-ready");
    fallbackAvatar?.removeAttribute("data-avatar-3d-fallback");
  }

  function stop() {
    engine?.stop();
  }

  function dispose() {
    engine?.dispose();
    engine = undefined;
    loadPromise = undefined;
    useFallback("disposed");
  }

  function setState(state) {
    currentState = AVATAR_STATES[state] ? state : "online";
    container?.setAttribute("data-avatar-state", currentState);
    engine?.setState(currentState);
  }

  function setVoiceState(state) {
    if (AVATAR_STATES[state]) {
      setState(state);
    }
  }

  function setVisualMode(mode) {
    engine?.setVisualMode(mode);
  }

  function setOutfit(outfit) {
    currentOutfit = outfit || "original";
    container?.setAttribute("data-outfit", currentOutfit);
    engine?.setOutfit(currentOutfit);
  }

  function speak(text = "") {
    setState("speaking");
    engine?.speak(text);
  }

  return {
    start,
    stop,
    dispose,
    setState,
    setVoiceState,
    setVisualMode,
    setOutfit,
    speak,
    get ready() {
      return Boolean(engine);
    },
  };
}

async function resolveModelConfig() {
  const overrideUrl = window.localStorage.getItem(MODEL_OVERRIDE_KEY);
  if (overrideUrl && isAllowedModelUrl(overrideUrl)) {
    return {
      id: "local-override",
      label: "Modelo local configurado",
      type: overrideUrl.toLowerCase().endsWith(".vrm") ? "vrm" : "glb",
      url: overrideUrl,
    };
  }

  const response = await fetch(MANIFEST_URL, { cache: "no-store" });
  if (!response.ok) {
    return undefined;
  }
  const manifest = await response.json();
  if (!manifest?.enabled || !Array.isArray(manifest.models)) {
    return undefined;
  }
  const preferred = manifest.models.find((model) => model.id === manifest.defaultModelId && model.enabled);
  const firstEnabled = manifest.models.find((model) => model.enabled);
  const selected = preferred || firstEnabled;
  if (!selected?.url || !isAllowedModelUrl(selected.url)) {
    return undefined;
  }
  return {
    id: selected.id,
    label: selected.label || selected.id,
    type: selected.type === "vrm" || selected.url.toLowerCase().endsWith(".vrm") ? "vrm" : "glb",
    url: selected.url,
  };
}

function isAllowedModelUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    const sameOrigin = parsed.origin === window.location.origin;
    const allowedExtension = [".glb", ".gltf", ".vrm"].some((extension) => parsed.pathname.toLowerCase().endsWith(extension));
    return sameOrigin && allowedExtension;
  } catch {
    return false;
  }
}

async function createThreeAvatarEngine(container, { modelConfig, getVisualMode }) {
  const THREE = await import(THREE_URL);
  const { GLTFLoader } = await import(GLTF_LOADER_URL);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  const renderer = new THREE.WebGLRenderer({
    antialias: selectedVisualMode(getVisualMode) !== "performance",
    alpha: true,
    powerPreference: "high-performance",
  });
  const root = new THREE.Group();
  const modelRoot = new THREE.Group();
  const clock = new THREE.Clock();
  const state = {
    current: "online",
    visualMode: selectedVisualMode(getVisualMode),
    running: false,
    frameId: undefined,
    mixer: undefined,
    actions: {},
    activeAction: undefined,
    vrm: undefined,
    morphTargets: [],
    emissiveMaterials: [],
    outfit: "original",
    resizeObserver: undefined,
    speechUntil: 0,
    speechIntensity: 0,
  };

  renderer.domElement.className = "orion-avatar-3d-canvas";
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(pixelRatioFor(state.visualMode));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  camera.position.set(0, 1.55, 5.6);
  scene.add(root);
  root.add(modelRoot);

  const ambient = new THREE.AmbientLight(0x8fefff, 1.35);
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  const rim = new THREE.PointLight(0x66e7ff, 22, 18);
  const aura = new THREE.PointLight(0xb58cff, 11, 14);
  key.position.set(2.8, 4.2, 5);
  rim.position.set(-2.4, 1.8, 3.2);
  aura.position.set(2.2, 0.7, 2.6);
  root.add(ambient, key, rim, aura);

  const loader = new GLTFLoader();
  if (modelConfig.type === "vrm") {
    const vrmModule = await import(VRM_URL);
    if (vrmModule.VRMLoaderPlugin) {
      loader.register((parser) => new vrmModule.VRMLoaderPlugin(parser));
    }
  }

  const gltf = await loader.loadAsync(modelConfig.url);
  const vrm = gltf.userData?.vrm;
  state.vrm = vrm;
  const avatarScene = vrm?.scene || gltf.scene;
  normalizeModel(THREE, avatarScene);
  modelRoot.add(avatarScene);
  collectMaterials(avatarScene, state);
  setupAnimations(THREE, gltf, avatarScene, state);
  container.replaceChildren(renderer.domElement);

  function resize() {
    const width = Math.max(container.clientWidth, 220);
    const height = Math.max(container.clientHeight, 300);
    renderer.setPixelRatio(pixelRatioFor(state.visualMode));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function animate() {
    if (!state.running) {
      return;
    }
    const elapsed = clock.getElapsedTime();
    const delta = Math.min(clock.getDelta(), 0.045);
    const config = AVATAR_STATES[state.current] || AVATAR_STATES.online;
    const speechActive = performance.now() < state.speechUntil || ["speaking", "responding"].includes(state.current);
    const speechPulse = speechActive ? (Math.sin(elapsed * 18) + 1) / 2 : 0;

    state.mixer?.update(delta * config.speed);
    state.vrm?.update?.(delta);

    if (!state.activeAction) {
      modelRoot.position.y = Math.sin(elapsed * 1.45 * config.speed) * 0.018;
      modelRoot.rotation.y = Math.sin(elapsed * 0.55) * 0.035;
      modelRoot.rotation.x = gesturePitch(config.gesture, elapsed);
    }

    rim.color.setHex(config.color);
    aura.color.setHex(config.color);
    aura.intensity = 9 + speechPulse * 5;
    applyEmissiveColor(THREE, state, config.color, speechPulse);
    applyBasicLipSync(state, speechActive ? Math.max(speechPulse, state.speechIntensity) : 0);

    renderer.render(scene, camera);
    if (!document.hidden) {
      state.frameId = window.requestAnimationFrame(animate);
    } else {
      state.running = false;
    }
  }

  function start() {
    if (state.running) {
      return;
    }
    state.running = true;
    clock.start();
    resize();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      renderer.render(scene, camera);
      return;
    }
    animate();
  }

  function stop() {
    state.running = false;
    if (state.frameId) {
      window.cancelAnimationFrame(state.frameId);
      state.frameId = undefined;
    }
  }

  function setState(nextState) {
    state.current = AVATAR_STATES[nextState] ? nextState : "online";
    playAnimationForState(state.current);
  }

  function setVisualMode(mode) {
    state.visualMode = ["performance", "balanced", "ultra"].includes(mode) ? mode : selectedVisualMode(getVisualMode);
    renderer.setPixelRatio(pixelRatioFor(state.visualMode));
    resize();
  }

  function setOutfit(outfit) {
    state.outfit = outfit || "original";
    const tint = outfitTint(state.outfit);
    state.emissiveMaterials.forEach((material) => {
      if (material.color && tint) {
        material.color.lerp(new THREE.Color(tint), 0.08);
      }
    });
  }

  function speak(text = "") {
    const duration = Math.min(Math.max(text.length * 42, 900), 6500);
    state.speechUntil = performance.now() + duration;
    state.speechIntensity = Math.min(1, Math.max(0.28, text.length / 220));
    playAnimationForState("speaking");
  }

  function playAnimationForState(nextState) {
    const gesture = (AVATAR_STATES[nextState] || AVATAR_STATES.online).gesture;
    const action = state.actions[gesture] || state.actions.idle;
    if (!action || action === state.activeAction) {
      return;
    }
    action.reset().fadeIn(0.18).play();
    state.activeAction?.fadeOut(0.18);
    state.activeAction = action;
  }

  state.resizeObserver = new ResizeObserver(resize);
  state.resizeObserver.observe(container);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !state.running) {
      start();
    }
  });
  resize();
  playAnimationForState("online");

  return {
    start,
    stop,
    setState,
    setVisualMode,
    setOutfit,
    speak,
    dispose() {
      stop();
      state.resizeObserver?.disconnect();
      renderer.dispose();
      container.replaceChildren();
    },
  };
}

function selectedVisualMode(getVisualMode) {
  const requested = typeof getVisualMode === "function" ? getVisualMode() : document.documentElement.dataset.visualMode;
  const compact = window.innerWidth < 720 || (navigator.deviceMemory || 4) <= 2 || (navigator.hardwareConcurrency || 4) <= 2;
  if (compact || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "performance";
  }
  return ["performance", "balanced", "ultra"].includes(requested) ? requested : "balanced";
}

function pixelRatioFor(mode) {
  if (mode === "ultra") {
    return Math.min(window.devicePixelRatio || 1, 2);
  }
  if (mode === "balanced") {
    return Math.min(window.devicePixelRatio || 1, 1.5);
  }
  return 1;
}

function normalizeModel(THREE, model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const height = Math.max(size.y, 0.001);
  const scale = 3.15 / height;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -box.min.y * scale - 1.52, -center.z * scale);
}

function collectMaterials(model, state) {
  model.traverse((node) => {
    if (node.isMesh) {
      node.frustumCulled = false;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.filter(Boolean).forEach((material) => {
        if ("emissive" in material || "color" in material) {
          state.emissiveMaterials.push(material);
        }
      });
      if (node.morphTargetDictionary && node.morphTargetInfluences) {
        state.morphTargets.push(node);
      }
    }
  });
}

function setupAnimations(THREE, gltf, avatarScene, state) {
  if (!gltf.animations?.length) {
    return;
  }
  state.mixer = new THREE.AnimationMixer(avatarScene);
  Object.entries(ANIMATION_ALIASES).forEach(([gesture, aliases]) => {
    const clip = gltf.animations.find((animation) => aliases.some((alias) => animation.name.toLowerCase().includes(alias)));
    if (clip) {
      const action = state.mixer.clipAction(clip);
      action.enabled = true;
      state.actions[gesture] = action;
    }
  });
}

function gesturePitch(gesture, elapsed) {
  if (gesture === "thinking") {
    return -0.035 + Math.sin(elapsed * 0.9) * 0.014;
  }
  if (gesture === "listening") {
    return 0.025 + Math.sin(elapsed * 1.1) * 0.012;
  }
  if (gesture === "searching") {
    return Math.sin(elapsed * 1.9) * 0.024;
  }
  if (gesture === "speaking") {
    return Math.sin(elapsed * 2.8) * 0.018;
  }
  return Math.sin(elapsed * 0.65) * 0.012;
}

function applyEmissiveColor(THREE, state, color, speechPulse) {
  const nextColor = new THREE.Color(color);
  state.emissiveMaterials.forEach((material) => {
    if (material.emissive) {
      material.emissive.lerp(nextColor, 0.08);
      material.emissiveIntensity = Math.min(0.85, 0.18 + speechPulse * 0.28);
    }
  });
}

function applyBasicLipSync(state, intensity) {
  state.morphTargets.forEach((mesh) => {
    const dictionary = mesh.morphTargetDictionary || {};
    const influences = mesh.morphTargetInfluences || [];
    const names = ["jawOpen", "mouthOpen", "aa", "A", "viseme_aa", "v_aa"];
    names.forEach((name) => {
      const index = dictionary[name];
      if (typeof index === "number") {
        influences[index] = intensity * 0.72;
      }
    });
  });
}

function outfitTint(outfit) {
  const tints = {
    hacker: 0x50f6ff,
    cyber: 0xb58cff,
    executive: 0xf4ffff,
    teacher: 0x6effb8,
    "lord-dragons": 0xffb347,
    future: 0x66e7ff,
    armor: 0x4da3ff,
  };
  return tints[outfit];
}
