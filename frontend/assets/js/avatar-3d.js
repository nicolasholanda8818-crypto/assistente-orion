const THREE_URL = "https://esm.sh/three@0.184.0";
const GLTF_LOADER_URL = "https://esm.sh/three@0.184.0/examples/jsm/loaders/GLTFLoader.js";
const FBX_LOADER_URL = "https://esm.sh/three@0.184.0/examples/jsm/loaders/FBXLoader.js";
const VRM_URL = "https://esm.sh/@pixiv/three-vrm@3.5.4";
const MANIFEST_URL = "/assets/models/avatar-manifest.json";
const ANIMATION_MANIFEST_URL = "/assets/animations/animation-manifest.json";
const MODEL_OVERRIDE_KEY = "orion:avatar3d:modelUrl";

const AVATAR_STATES = {
  online: { color: 0x66e7ff, speed: 0.65, gesture: "idle" },
  listening: { color: 0x50f6ff, speed: 0.88, gesture: "listening" },
  thinking: { color: 0x4da3ff, speed: 0.72, gesture: "thinking" },
  walking: { color: 0x66e7ff, speed: 1.1, gesture: "walking" },
  explaining: { color: 0xb58cff, speed: 1, gesture: "explaining" },
  professor: { color: 0x6effb8, speed: 0.92, gesture: "explaining" },
  speaking: { color: 0xb58cff, speed: 1.08, gesture: "speaking" },
  responding: { color: 0xb58cff, speed: 1.08, gesture: "speaking" },
  searching: { color: 0xff5f72, speed: 1.15, gesture: "searching" },
  files: { color: 0x6effb8, speed: 0.9, gesture: "thinking" },
  learning: { color: 0xffd166, speed: 0.96, gesture: "thinking" },
  happy: { color: 0x72ffbf, speed: 1, gesture: "idle" },
  curious: { color: 0xffd166, speed: 0.82, gesture: "thinking" },
  confident: { color: 0x72ffbf, speed: 0.92, gesture: "explaining" },
  tired: { color: 0x80a8ff, speed: 0.52, gesture: "tired" },
  animated: { color: 0xffd166, speed: 1.18, gesture: "explaining" },
  worried: { color: 0xff9f43, speed: 0.68, gesture: "thinking" },
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
    container.dataset.modelStatus = "probing";
    loadPromise = resolveModelConfig()
      .then(async (modelConfig) => {
        const nextEngine = modelConfig?.url
          ? await createThreeAvatarEngine(container, { modelConfig, getVisualMode })
          : await createProceduralAvatarEngine(container, { getVisualMode });
        engine = nextEngine;
        engine.setState(currentState);
        engine.setOutfit(currentOutfit);
        engine.start();
        container.hidden = false;
        container.dataset.status = "ready";
        container.dataset.modelStatus = "ready";
        container.dataset.modelType = modelConfig?.type || "procedural-three";
        document.documentElement.classList.add("avatar-3d-ready");
        fallbackAvatar?.setAttribute("data-avatar-3d-fallback", "standby");
        return { status: "ready", model: modelConfig || { id: "orion-procedural-three", type: "procedural-three" } };
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
    container.dataset.modelStatus = "fallback";
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
    vrmCompatible: Boolean(selected.vrmCompatible || selected.profile?.hasVrmExtension),
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

async function createProceduralAvatarEngine(container, { getVisualMode }) {
  const THREE = await import(THREE_URL);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
  const renderer = new THREE.WebGLRenderer({
    antialias: selectedVisualMode(getVisualMode) !== "performance",
    alpha: true,
    powerPreference: "high-performance",
  });
  const clock = new THREE.Clock();
  const root = new THREE.Group();
  const rig = buildProceduralRig(THREE);
  const state = {
    current: "online",
    visualMode: selectedVisualMode(getVisualMode),
    running: false,
    frameId: undefined,
    resizeObserver: undefined,
    visibilityHandler: undefined,
    outfit: "original",
    speechUntil: 0,
    speechIntensity: 0,
  };

  renderer.domElement.className = "orion-avatar-3d-canvas orion-avatar-procedural-canvas";
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(pixelRatioFor(state.visualMode));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  camera.position.set(0, 1.7, 6.7);
  scene.add(root);
  root.add(rig.group);

  const ambient = new THREE.AmbientLight(0xa8f4ff, 1.15);
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  const rim = new THREE.PointLight(0x66e7ff, 24, 18);
  const aura = new THREE.PointLight(0xb58cff, 13, 16);
  key.position.set(2.8, 4.4, 5.6);
  rim.position.set(-2.6, 1.9, 3.4);
  aura.position.set(2.1, 0.8, 3);
  root.add(ambient, key, rim, aura);
  container.replaceChildren(renderer.domElement);

  function resize() {
    const width = Math.max(container.clientWidth, 240);
    const height = Math.max(container.clientHeight, 320);
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
    const config = AVATAR_STATES[state.current] || AVATAR_STATES.online;
    const speechActive = performance.now() < state.speechUntil || ["speaking", "responding"].includes(state.current);
    const speechPulse = speechActive ? (Math.sin(elapsed * 18) + 1) / 2 : 0;

    applyProceduralPose(rig, config.gesture, elapsed, config.speed, speechPulse);
    applyProceduralExpression(rig, state.current, config.color, speechPulse);
    rim.color.setHex(config.color);
    aura.color.setHex(config.color);
    aura.intensity = 9 + speechPulse * 6;
    rig.aura.material.color.setHex(config.color);
    rig.aura.material.opacity = 0.12 + speechPulse * 0.08;
    rig.group.rotation.y += (Math.sin(elapsed * 0.34) * 0.08 - rig.group.rotation.y) * 0.035;
    rig.group.position.y = Math.sin(elapsed * 1.35 * config.speed) * 0.022;

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
  }

  function setVisualMode(mode) {
    state.visualMode = ["performance", "balanced", "ultra"].includes(mode) ? mode : selectedVisualMode(getVisualMode);
    renderer.setPixelRatio(pixelRatioFor(state.visualMode));
    rig.group.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = state.visualMode === "ultra";
        object.receiveShadow = state.visualMode !== "performance";
      }
    });
    resize();
  }

  function setOutfit(outfit) {
    state.outfit = outfit || "original";
    applyProceduralOutfit(THREE, rig, state.outfit);
  }

  function speak(text = "") {
    const duration = Math.min(Math.max(text.length * 42, 900), 6500);
    state.speechUntil = performance.now() + duration;
    state.speechIntensity = Math.min(1, Math.max(0.28, text.length / 220));
    setState("speaking");
  }

  state.resizeObserver = new ResizeObserver(resize);
  state.resizeObserver.observe(container);
  state.visibilityHandler = () => {
    if (!document.hidden && !state.running) {
      start();
    }
  };
  document.addEventListener("visibilitychange", state.visibilityHandler);
  setVisualMode(state.visualMode);
  setOutfit("original");
  resize();

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
      document.removeEventListener("visibilitychange", state.visibilityHandler);
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose?.());
        } else {
          object.material?.dispose?.();
        }
      });
      renderer.dispose();
      container.replaceChildren();
    },
  };
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
    vrmExpressionNames: [],
    animationStatus: "breathing-procedural",
    emissiveMaterials: [],
    outfit: "original",
    resizeObserver: undefined,
    visibilityHandler: undefined,
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
  if (modelConfig.type === "vrm" || modelConfig.vrmCompatible) {
    const vrmModule = await import(VRM_URL);
    if (vrmModule.VRMLoaderPlugin) {
      loader.register((parser) => new vrmModule.VRMLoaderPlugin(parser));
    }
  }

  const gltf = await loader.loadAsync(modelConfig.url);
  const vrm = gltf.userData?.vrm;
  state.vrm = vrm;
  state.vrmExpressionNames = collectVrmExpressionNames(vrm);
  const avatarScene = vrm?.scene || gltf.scene;
  normalizeModel(THREE, avatarScene);
  modelRoot.add(avatarScene);
  collectMaterials(avatarScene, state);
  setupAnimations(THREE, gltf, avatarScene, state);
  await setupExternalAnimations(THREE, avatarScene, state);
  container.dataset.animationStatus = state.animationStatus;
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
    applyVrmExpressions(state, state.current, speechPulse, elapsed);
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
  state.visibilityHandler = () => {
    if (!document.hidden && !state.running) {
      start();
    }
  };
  document.addEventListener("visibilitychange", state.visibilityHandler);
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
      document.removeEventListener("visibilitychange", state.visibilityHandler);
      renderer.dispose();
      container.replaceChildren();
    },
  };
}

function buildProceduralRig(THREE) {
  const group = new THREE.Group();
  group.name = "orion-procedural-humanoid";
  group.scale.setScalar(0.96);
  group.position.y = -1.58;

  const materials = {
    skin: new THREE.MeshStandardMaterial({ color: 0xd8ecff, roughness: 0.42, metalness: 0.04 }),
    hair: new THREE.MeshStandardMaterial({ color: 0xf5fbff, roughness: 0.28, metalness: 0.18 }),
    coat: new THREE.MeshStandardMaterial({ color: 0x101827, roughness: 0.3, metalness: 0.32 }),
    coatSecondary: new THREE.MeshStandardMaterial({ color: 0x182d4b, roughness: 0.34, metalness: 0.28 }),
    pants: new THREE.MeshStandardMaterial({ color: 0x16243a, roughness: 0.38, metalness: 0.2 }),
    trim: new THREE.MeshStandardMaterial({ color: 0x9bc7e8, roughness: 0.22, metalness: 0.48 }),
    accent: new THREE.MeshStandardMaterial({ color: 0x45c7ff, emissive: 0x126bff, emissiveIntensity: 0.44, roughness: 0.22, metalness: 0.5 }),
    eye: new THREE.MeshStandardMaterial({ color: 0x49d9ff, emissive: 0x49d9ff, emissiveIntensity: 1.6, roughness: 0.12, metalness: 0.22 }),
    irisRing: new THREE.MeshBasicMaterial({ color: 0xdff8ff, transparent: true, opacity: 0.84, depthWrite: false }),
    dark: new THREE.MeshStandardMaterial({ color: 0x06101d, roughness: 0.34, metalness: 0.34 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf8fdff, roughness: 0.22, metalness: 0.16 }),
    catchlight: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.94, depthWrite: false }),
    aura: new THREE.MeshBasicMaterial({ color: 0x66e7ff, transparent: true, opacity: 0.12, depthWrite: false }),
  };

  const chest = new THREE.Group();
  const hips = new THREE.Group();
  const headPivot = new THREE.Group();
  const leftArm = createArm(THREE, materials, -1);
  const rightArm = createArm(THREE, materials, 1);
  const leftLeg = createLeg(THREE, materials, -1);
  const rightLeg = createLeg(THREE, materials, 1);

  hips.position.set(0, 1.08, 0);
  chest.position.set(0, 1.84, 0);
  headPivot.position.set(0, 2.68, 0);
  leftArm.shoulder.position.set(-0.64, 2.16, 0.02);
  rightArm.shoulder.position.set(0.64, 2.16, 0.02);
  leftLeg.hip.position.set(-0.24, 1.0, 0.02);
  rightLeg.hip.position.set(0.24, 1.0, 0.02);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 0.88, 14, 28), materials.coat);
  torso.scale.set(0.86, 1.12, 0.56);
  torso.position.y = -0.1;
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.09, 18, 12), materials.accent);
  core.position.set(0, -0.1, 0.42);
  const zipper = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.82, 0.018), materials.white);
  zipper.position.set(0, -0.1, 0.45);
  const hood = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.052, 12, 48), materials.pants);
  hood.position.set(0, 0.48, -0.02);
  hood.rotation.x = Math.PI / 2;
  const jacketDetails = createLuxuryJacketDetails(THREE, materials);
  chest.add(torso, core, zipper, hood, ...jacketDetails.frontPanels, ...jacketDetails.shoulderPads, ...jacketDetails.lightStrips, jacketDetails.backSigil);

  const pelvis = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.24, 10, 18), materials.pants);
  pelvis.scale.set(0.9, 0.78, 0.54);
  hips.add(pelvis);

  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.22, 8, 16), materials.skin);
  neck.position.y = -0.22;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), materials.skin);
  head.scale.set(0.82, 1.0, 0.78);
  head.position.y = 0.16;
  const faceGlow = new THREE.Mesh(new THREE.SphereGeometry(0.424, 32, 16), new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.045,
    depthWrite: false,
  }));
  faceGlow.scale.set(0.92, 1.02, 0.88);
  faceGlow.position.copy(head.position);
  headPivot.add(neck, head, faceGlow);

  const hairPieces = [];
  for (let index = 0; index < 10; index += 1) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.16 + (index % 3) * 0.025, 0.54, 18), materials.hair);
    const angle = -1.65 + index * 0.36;
    tuft.position.set(Math.cos(angle) * 0.26, 0.46 + Math.sin(index * 0.7) * 0.035, 0.12 + Math.sin(angle) * 0.19);
    tuft.rotation.set(0.75 + Math.sin(index) * 0.2, angle, -0.2 + index * 0.035);
    tuft.scale.set(0.9, 1, 0.72);
    hairPieces.push(tuft);
    headPivot.add(tuft);
  }

  const leftEye = createEye(THREE, materials, -1);
  const rightEye = createEye(THREE, materials, 1);
  leftEye.group.position.set(-0.15, 0.19, 0.35);
  rightEye.group.position.set(0.15, 0.19, 0.35);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.028, 0.018), materials.dark);
  mouth.position.set(0, -0.08, 0.39);
  mouth.name = "orion-procedural-mouth";
  const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.025, 0.02), materials.dark);
  const rightBrow = leftBrow.clone();
  leftBrow.position.set(-0.18, 0.34, 0.37);
  rightBrow.position.set(0.18, 0.34, 0.37);
  leftBrow.rotation.z = 0.08;
  rightBrow.rotation.z = -0.08;
  headPivot.add(leftEye.group, rightEye.group, mouth, leftBrow, rightBrow);

  const aura = new THREE.Mesh(new THREE.SphereGeometry(1.55, 48, 24), materials.aura);
  aura.scale.set(0.86, 1.32, 0.5);
  aura.position.set(0, 1.8, -0.1);
  group.add(aura, hips, chest, headPivot, leftArm.shoulder, rightArm.shoulder, leftLeg.hip, rightLeg.hip);

  return {
    group,
    materials,
    chest,
    hips,
    headPivot,
    head,
    mouth,
    leftBrow,
    rightBrow,
    leftEye,
    rightEye,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    aura,
    hairPieces,
    jacketDetails,
  };
}

function createLuxuryJacketDetails(THREE, materials) {
  const frontPanels = [];
  const shoulderPads = [];
  const lightStrips = [];

  const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.022), materials.coatSecondary);
  leftPanel.position.set(-0.15, -0.12, 0.455);
  leftPanel.rotation.z = -0.08;
  const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.62, 0.022), materials.coatSecondary);
  rightPanel.position.set(0.17, -0.14, 0.455);
  rightPanel.rotation.z = 0.1;
  frontPanels.push(leftPanel, rightPanel);

  for (let side = -1; side <= 1; side += 2) {
    const shoulderPad = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.24), materials.trim);
    shoulderPad.position.set(side * 0.48, 0.28, 0.04);
    shoulderPad.rotation.set(0.08, side * 0.16, side * 0.08);
    shoulderPads.push(shoulderPad);

    const lightStrip = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.76, 0.018), materials.accent);
    lightStrip.position.set(side * 0.27, -0.1, 0.47);
    lightStrip.rotation.z = side * 0.12;
    lightStrips.push(lightStrip);
  }

  const backSigil = new THREE.Group();
  backSigil.name = "orion-original-back-sigil";
  backSigil.position.set(0, -0.05, -0.455);
  for (let index = 0; index < 3; index += 1) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.28 - index * 0.035, 0.035, 0.018), index === 1 ? materials.white : materials.accent);
    bar.position.set(0, 0.14 - index * 0.14, 0);
    bar.rotation.z = index === 1 ? 0 : (index === 0 ? 0.38 : -0.38);
    backSigil.add(bar);
  }

  return { frontPanels, shoulderPads, lightStrips, backSigil };
}

function createEye(THREE, materials, side) {
  const group = new THREE.Group();
  const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.082, 24, 14), materials.white);
  const iris = new THREE.Mesh(new THREE.SphereGeometry(0.047, 24, 14), materials.eye);
  const irisRing = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.004, 6, 28), materials.irisRing);
  const catchlight = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), materials.catchlight);
  sclera.scale.set(1.22, 0.78, 0.3);
  iris.scale.set(1, 1, 0.3);
  iris.position.z = 0.03;
  irisRing.position.z = 0.035;
  catchlight.position.set(side * -0.016, 0.018, 0.062);
  group.add(sclera, iris, irisRing, catchlight);
  group.userData.side = side;
  return { group, sclera, iris, irisRing, catchlight };
}

function createArm(THREE, materials, side) {
  const shoulder = new THREE.Group();
  const elbow = new THREE.Group();
  const wrist = new THREE.Group();
  const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.48, 8, 16), materials.coat);
  const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.083, 0.45, 8, 16), materials.coat);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), materials.skin);
  const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.086, 0.014, 8, 24), materials.trim);
  const sleeveLight = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.3, 0.015), materials.accent);
  upper.position.y = -0.28;
  elbow.position.y = -0.56;
  lower.position.y = -0.24;
  wrist.position.y = -0.48;
  hand.scale.set(0.88, 0.72, 0.72);
  hand.position.y = -0.02;
  cuff.rotation.x = Math.PI / 2;
  cuff.position.y = 0.02;
  sleeveLight.position.set(side * 0.055, -0.22, 0.07);
  for (let index = 0; index < 4; index += 1) {
    const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.11, 5, 8), materials.skin);
    finger.position.set((index - 1.5) * 0.035, -0.085, 0.02);
    finger.rotation.z = (index - 1.5) * 0.06;
    wrist.add(finger);
  }
  shoulder.rotation.z = side * 0.14;
  lower.add(sleeveLight);
  elbow.add(lower, wrist);
  wrist.add(hand);
  wrist.add(cuff);
  shoulder.add(upper, elbow);
  return { shoulder, elbow, wrist, hand, upper, lower, cuff, sleeveLight };
}

function createLeg(THREE, materials, side) {
  const hip = new THREE.Group();
  const knee = new THREE.Group();
  const ankle = new THREE.Group();
  const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.58, 8, 16), materials.pants);
  const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.56, 8, 16), materials.pants);
  const boot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.34), materials.dark);
  const sole = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.035, 0.38), materials.white);
  const sneakerAccent = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.026, 0.026), materials.accent);
  upper.position.y = -0.34;
  knee.position.y = -0.68;
  lower.position.y = -0.31;
  ankle.position.y = -0.62;
  boot.position.set(side * 0.03, -0.08, 0.08);
  boot.rotation.x = 0.08;
  sole.position.set(side * 0.03, -0.15, 0.09);
  sneakerAccent.position.set(side * 0.03, -0.05, 0.26);
  knee.add(lower, ankle);
  ankle.add(boot, sole, sneakerAccent);
  hip.add(upper, knee);
  return { hip, knee, ankle, boot, sole, sneakerAccent, upper, lower };
}

function applyProceduralPose(rig, gesture, elapsed, speed, speechPulse) {
  const breath = Math.sin(elapsed * 1.6 * speed);
  const walk = Math.sin(elapsed * 5.2 * speed);
  const talk = Math.sin(elapsed * 6.6) * (0.16 + speechPulse * 0.08);
  const isWalking = gesture === "walking";
  const isSpeaking = gesture === "speaking" || gesture === "explaining";
  const isThinking = gesture === "thinking";
  const isListening = gesture === "listening";
  const isSearching = gesture === "searching";
  const isTired = gesture === "tired";

  rig.chest.scale.y = 1 + breath * 0.014;
  setRotation(rig.chest, isTired ? 0.14 : isSearching ? -0.08 : 0.02 + breath * 0.018, 0, isSpeaking ? talk * 0.22 : breath * 0.01);
  setRotation(rig.hips, 0, isWalking ? walk * 0.08 : 0, isWalking ? -walk * 0.04 : 0);
  setRotation(rig.headPivot, isThinking ? -0.2 : isListening ? 0.1 : isTired ? -0.16 : breath * 0.016, isSearching ? Math.sin(elapsed * 1.8) * 0.22 : Math.sin(elapsed * 0.7) * 0.055, isListening ? -0.12 : 0);

  const armSwing = isWalking ? walk * 0.44 : 0;
  const legSwing = isWalking ? walk * 0.5 : 0;
  setRotation(rig.leftArm.shoulder, isThinking ? -0.6 : isSpeaking ? -0.48 + talk : -0.1 - armSwing, 0.02, isThinking ? -0.42 : -0.16);
  setRotation(rig.rightArm.shoulder, isThinking ? -1.02 : isSpeaking ? -0.5 - talk : -0.1 + armSwing, 0.02, isThinking ? 0.34 : 0.16);
  setRotation(rig.leftArm.elbow, isThinking ? -0.24 : isSpeaking ? -0.7 : -0.18, 0, isSpeaking ? -0.22 : 0);
  setRotation(rig.rightArm.elbow, isThinking ? -1.22 : isSpeaking ? -0.74 : -0.18, 0, isThinking ? 0.45 : 0.18);
  setRotation(rig.leftArm.wrist, 0, 0, isSpeaking ? -0.2 + talk : 0);
  setRotation(rig.rightArm.wrist, 0, 0, isSpeaking ? 0.2 - talk : 0);

  setRotation(rig.leftLeg.hip, legSwing, 0, 0.03);
  setRotation(rig.rightLeg.hip, -legSwing, 0, -0.03);
  setRotation(rig.leftLeg.knee, isWalking ? Math.max(0, -walk) * 0.7 : 0.08, 0, 0);
  setRotation(rig.rightLeg.knee, isWalking ? Math.max(0, walk) * 0.7 : 0.08, 0, 0);
}

function applyProceduralExpression(rig, state, color, speechPulse) {
  rig.materials.eye.color.setHex(color);
  rig.materials.eye.emissive.setHex(color);
  rig.materials.eye.emissiveIntensity = state === "listening" ? 1.8 : 1.25 + speechPulse * 0.55;
  const eyeScale = 1 + speechPulse * 0.12 + (state === "curious" ? 0.08 : 0);
  rig.leftEye.iris.scale.setScalar(eyeScale);
  rig.rightEye.iris.scale.setScalar(eyeScale);
  rig.leftEye.catchlight.scale.setScalar(state === "thinking" ? 1.24 : 1 + speechPulse * 0.18);
  rig.rightEye.catchlight.scale.setScalar(state === "thinking" ? 1.24 : 1 + speechPulse * 0.18);
  rig.leftEye.irisRing.material.opacity = state === "listening" ? 0.98 : 0.74 + speechPulse * 0.18;
  rig.rightEye.irisRing.material.opacity = state === "listening" ? 0.98 : 0.74 + speechPulse * 0.18;
  rig.mouth.scale.set(1, state === "speaking" || state === "responding" ? 1 + speechPulse * 2.2 : 0.72, 1);
  rig.mouth.material.color.setHex(state === "happy" ? 0x24485f : 0x06101d);
  rig.leftBrow.rotation.z = state === "curious" ? 0.26 : state === "annoyed" ? -0.14 : 0.08;
  rig.rightBrow.rotation.z = state === "curious" ? -0.06 : state === "annoyed" ? 0.14 : -0.08;
}

function applyProceduralOutfit(THREE, rig, outfit) {
  const tint = outfitTint(outfit) || 0x45c7ff;
  const color = new THREE.Color(tint);
  rig.materials.accent.color.lerp(color, 0.8);
  rig.materials.accent.emissive.lerp(color, 0.8);
  rig.materials.trim.color.lerp(new THREE.Color(0xd7f6ff).lerp(color, 0.34), 0.65);
  if (["executive", "formal"].includes(outfit)) {
    rig.materials.coat.color.setHex(0x060b14);
    rig.materials.coatSecondary.color.setHex(0x152238);
    rig.materials.pants.color.setHex(0x111827);
  } else if (["teacher", "professor"].includes(outfit)) {
    rig.materials.coat.color.setHex(0xdfefff);
    rig.materials.coatSecondary.color.setHex(0xb8d8ff);
    rig.materials.pants.color.setHex(0x152438);
  } else if (["lord-dragons"].includes(outfit)) {
    rig.materials.coat.color.setHex(0x221324);
    rig.materials.coatSecondary.color.setHex(0x3b172c);
    rig.materials.pants.color.setHex(0x2b1019);
  } else if (["cyber", "hacker"].includes(outfit)) {
    rig.materials.coat.color.setHex(0x070d19);
    rig.materials.coatSecondary.color.setHex(0x102f55);
    rig.materials.pants.color.setHex(0x0a243d);
  } else {
    rig.materials.coat.color.setHex(0x101827);
    rig.materials.coatSecondary.color.setHex(0x182d4b);
    rig.materials.pants.color.setHex(0x1a2e45);
  }
}

function setRotation(object, x = 0, y = 0, z = 0, amount = 0.14) {
  object.rotation.x += (x - object.rotation.x) * amount;
  object.rotation.y += (y - object.rotation.y) * amount;
  object.rotation.z += (z - object.rotation.z) * amount;
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

async function setupExternalAnimations(THREE, avatarScene, state) {
  try {
    const animationConfig = await resolveIdleAnimationConfig();
    if (!animationConfig) {
      state.animationStatus = "breathing-procedural";
      return;
    }

    const { FBXLoader } = await import(FBX_LOADER_URL);
    const loader = new FBXLoader();
    const fbx = await loader.loadAsync(animationConfig.url);
    const sourceClip = fbx.animations?.[0];
    if (!sourceClip) {
      state.animationStatus = "breathing-procedural";
      return;
    }

    const clip = retargetMixamoClipToVrm(THREE, sourceClip, avatarScene);
    if (!clip) {
      state.animationStatus = "breathing-procedural";
      return;
    }

    state.mixer ||= new THREE.AnimationMixer(avatarScene);
    const action = state.mixer.clipAction(clip);
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = false;
    state.actions.idle = action;
    state.animationStatus = animationConfig.kind === "breathing" ? "breathing-idle-ready" : "idle-ready";
  } catch {
    state.animationStatus = "breathing-procedural";
  }
}

async function resolveIdleAnimationConfig() {
  const response = await fetch(ANIMATION_MANIFEST_URL, { cache: "no-store" });
  if (!response.ok) {
    return undefined;
  }
  const manifest = await response.json();
  if (!manifest?.enabled || !Array.isArray(manifest.animations)) {
    return undefined;
  }

  const enabled = manifest.animations.filter((animation) => animation.enabled && isAllowedAnimationUrl(animation.url));
  const preferred = enabled.find((animation) => animation.id === manifest.defaultIdleId);
  const idle = preferred || enabled.find((animation) => animation.kind === "idle");
  const breathing = enabled.find((animation) => animation.kind === "breathing");
  return idle || breathing;
}

function isAllowedAnimationUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin && parsed.pathname.toLowerCase().endsWith(".fbx");
  } catch {
    return false;
  }
}

function retargetMixamoClipToVrm(THREE, clip, avatarScene) {
  const targetNames = new Set();
  avatarScene.traverse((node) => {
    if (node.name) {
      targetNames.add(node.name);
    }
  });

  const tracks = [];
  clip.tracks.forEach((track) => {
    const nextName = retargetMixamoTrackName(track.name, targetNames);
    if (!nextName) {
      return;
    }
    const nextTrack = track.clone();
    nextTrack.name = nextName;
    tracks.push(nextTrack);
  });

  if (tracks.length < 8) {
    return undefined;
  }

  const retargeted = new THREE.AnimationClip("Orion Idle FBX", clip.duration, tracks);
  retargeted.optimize();
  return retargeted;
}

function retargetMixamoTrackName(trackName, targetNames) {
  const separatorIndex = trackName.indexOf(".");
  if (separatorIndex < 1) {
    return undefined;
  }
  const rawBoneName = trackName.slice(0, separatorIndex);
  const propertyName = trackName.slice(separatorIndex + 1);
  if (!["quaternion", "rotation"].includes(propertyName)) {
    return undefined;
  }

  const mixamoName = rawBoneName.replace(/^mixamorig[:_]?/i, "").replace(/\u0000.*$/, "");
  const targetName = MIXAMO_TO_VROID_BONES[mixamoName];
  if (!targetName || !targetNames.has(targetName)) {
    return undefined;
  }
  return `${targetName}.${propertyName}`;
}

const MIXAMO_TO_VROID_BONES = {
  Hips: "J_Bip_C_Hips",
  Spine: "J_Bip_C_Spine",
  Spine1: "J_Bip_C_Chest",
  Spine2: "J_Bip_C_UpperChest",
  Neck: "J_Bip_C_Neck",
  Head: "J_Bip_C_Head",
  LeftShoulder: "J_Bip_L_Shoulder",
  LeftArm: "J_Bip_L_UpperArm",
  LeftForeArm: "J_Bip_L_LowerArm",
  LeftHand: "J_Bip_L_Hand",
  LeftHandThumb1: "J_Bip_L_Thumb1",
  LeftHandThumb2: "J_Bip_L_Thumb2",
  LeftHandThumb3: "J_Bip_L_Thumb3",
  LeftHandIndex1: "J_Bip_L_Index1",
  LeftHandIndex2: "J_Bip_L_Index2",
  LeftHandIndex3: "J_Bip_L_Index3",
  LeftHandMiddle1: "J_Bip_L_Middle1",
  LeftHandMiddle2: "J_Bip_L_Middle2",
  LeftHandMiddle3: "J_Bip_L_Middle3",
  LeftHandRing1: "J_Bip_L_Ring1",
  LeftHandRing2: "J_Bip_L_Ring2",
  LeftHandRing3: "J_Bip_L_Ring3",
  LeftHandPinky1: "J_Bip_L_Little1",
  LeftHandPinky2: "J_Bip_L_Little2",
  LeftHandPinky3: "J_Bip_L_Little3",
  LeftUpLeg: "J_Bip_L_UpperLeg",
  LeftLeg: "J_Bip_L_LowerLeg",
  LeftFoot: "J_Bip_L_Foot",
  LeftToeBase: "J_Bip_L_ToeBase",
  RightShoulder: "J_Bip_R_Shoulder",
  RightArm: "J_Bip_R_UpperArm",
  RightForeArm: "J_Bip_R_LowerArm",
  RightHand: "J_Bip_R_Hand",
  RightHandThumb1: "J_Bip_R_Thumb1",
  RightHandThumb2: "J_Bip_R_Thumb2",
  RightHandThumb3: "J_Bip_R_Thumb3",
  RightHandIndex1: "J_Bip_R_Index1",
  RightHandIndex2: "J_Bip_R_Index2",
  RightHandIndex3: "J_Bip_R_Index3",
  RightHandMiddle1: "J_Bip_R_Middle1",
  RightHandMiddle2: "J_Bip_R_Middle2",
  RightHandMiddle3: "J_Bip_R_Middle3",
  RightHandRing1: "J_Bip_R_Ring1",
  RightHandRing2: "J_Bip_R_Ring2",
  RightHandRing3: "J_Bip_R_Ring3",
  RightHandPinky1: "J_Bip_R_Little1",
  RightHandPinky2: "J_Bip_R_Little2",
  RightHandPinky3: "J_Bip_R_Little3",
  RightUpLeg: "J_Bip_R_UpperLeg",
  RightLeg: "J_Bip_R_LowerLeg",
  RightFoot: "J_Bip_R_Foot",
  RightToeBase: "J_Bip_R_ToeBase",
};

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
    const names = ["jawOpen", "mouthOpen", "aa", "A", "viseme_aa", "v_aa", "Fcl_MTH_A", "Fcl_MTH_Large"];
    names.forEach((name) => {
      const index = dictionary[name];
      if (typeof index === "number") {
        influences[index] = intensity * 0.72;
      }
    });
  });
}

function collectVrmExpressionNames(vrm) {
  const manager = vrm?.expressionManager;
  if (!manager) {
    return [];
  }
  if (Array.isArray(manager.expressions)) {
    return manager.expressions.map((expression) => expression.expressionName || expression.presetName || expression.name).filter(Boolean);
  }
  if (manager._expressionsMap instanceof Map) {
    return [...manager._expressionsMap.keys()];
  }
  return ["neutral", "aa", "ih", "ou", "ee", "oh", "blink", "happy", "angry", "sad", "surprised", "relaxed"];
}

function applyVrmExpressions(state, currentState, speechPulse, elapsed) {
  const manager = state.vrm?.expressionManager;
  if (!manager?.setValue) {
    return;
  }

  const speechActive = performance.now() < state.speechUntil || ["speaking", "responding"].includes(currentState);
  const mouthValue = speechActive ? Math.max(0.12, speechPulse * 0.86 * Math.max(state.speechIntensity, 0.35)) : 0;
  const blinkValue = Math.sin(elapsed * 2.4) > 0.985 ? 1 : 0;
  const expressionValues = {
    aa: mouthValue,
    ih: speechActive ? mouthValue * 0.22 : 0,
    ou: speechActive ? mouthValue * 0.16 : 0,
    ee: speechActive ? mouthValue * 0.12 : 0,
    oh: speechActive ? mouthValue * 0.18 : 0,
    blink: blinkValue,
    happy: ["happy", "animated", "confident"].includes(currentState) ? 0.58 : 0,
    angry: currentState === "annoyed" ? 0.44 : 0,
    sad: ["tired", "worried"].includes(currentState) ? 0.34 : 0,
    surprised: currentState === "curious" ? 0.32 : 0,
    relaxed: currentState === "online" ? 0.16 : 0,
    neutral: currentState === "online" ? 0.18 : 0,
  };

  const names = state.vrmExpressionNames.length ? state.vrmExpressionNames : Object.keys(expressionValues);
  names.forEach((name) => {
    try {
      manager.setValue(name, expressionValues[name] || 0);
    } catch {
      // Some aliases can be absent depending on the exported VRM profile.
    }
  });
  manager.update?.();
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
