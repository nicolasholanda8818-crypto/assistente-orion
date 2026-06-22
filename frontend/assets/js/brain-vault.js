const THREE_URL = "https://esm.sh/three@0.184.0";
const EFFECT_URLS = {
  composer: "https://esm.sh/three@0.184.0/examples/jsm/postprocessing/EffectComposer.js",
  renderPass: "https://esm.sh/three@0.184.0/examples/jsm/postprocessing/RenderPass.js",
  bloomPass: "https://esm.sh/three@0.184.0/examples/jsm/postprocessing/UnrealBloomPass.js",
  outputPass: "https://esm.sh/three@0.184.0/examples/jsm/postprocessing/OutputPass.js",
};

const MEMORY_CATEGORIES = [
  { id: "programming", label: "Programacao", color: 0x62e8ff },
  { id: "it", label: "Gestao de TI", color: 0x7cffbd },
  { id: "users", label: "Usuarios", color: 0xffd166 },
  { id: "conversations", label: "Conversas", color: 0x9b8cff },
  { id: "projects", label: "Projetos", color: 0xff7a90 },
  { id: "files", label: "Arquivos", color: 0x80a8ff },
  { id: "dragons", label: "Lord Dragons", color: 0xffb347 },
];

const BRAIN_STATES = {
  idle: { color: 0x62e8ff, accent: 0x7cffbd, speed: 0.45, particleSpeed: 0.4, bloom: 0.32 },
  thinking: { color: 0xffd166, accent: 0x62e8ff, speed: 0.82, particleSpeed: 0.82, bloom: 0.46 },
  learning: { color: 0x7cffbd, accent: 0xffffff, speed: 1.05, particleSpeed: 1.1, bloom: 0.58 },
  searching: { color: 0x9b8cff, accent: 0x62e8ff, speed: 1.15, particleSpeed: 1.2, bloom: 0.55 },
  remembering: { color: 0x80a8ff, accent: 0xffd166, speed: 0.7, particleSpeed: 0.72, bloom: 0.48 },
  files: { color: 0xff7a90, accent: 0x80a8ff, speed: 0.9, particleSpeed: 0.9, bloom: 0.5 },
};

export function createBrainVault({ container, getVisualMode } = {}) {
  let engine;
  let loadPromise;
  let state = "idle";
  let started = false;
  let cleanupVisibility;

  function lowPower() {
    const selectedMode = typeof getVisualMode === "function" ? getVisualMode() : document.documentElement.dataset.visualMode;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactDevice = window.innerWidth < 720 || (navigator.deviceMemory || 4) <= 2 || (navigator.hardwareConcurrency || 4) <= 2;
    return selectedMode !== "ultra" || reducedMotion || compactDevice;
  }

  async function ensureEngine() {
    if (!container) {
      return null;
    }
    if (engine) {
      return engine;
    }
    if (loadPromise) {
      return loadPromise;
    }

    loadPromise = createWebGlEngine(container, { lowPower: lowPower() }).catch(() =>
      createCanvasFallback(container, { lowPower: lowPower() })
    );
    engine = await loadPromise;
    engine.setState(state);
    return engine;
  }

  async function start() {
    started = true;
    container?.classList.add("is-active");
    const activeEngine = await ensureEngine();
    activeEngine?.setVisualMode(lowPower() ? "performance" : "ultra");
    activeEngine?.setState(state);
    activeEngine?.start();

    if (!cleanupVisibility) {
      const onVisibility = () => {
        if (!engine) {
          return;
        }
        if (document.hidden) {
          engine.stop();
        } else if (started) {
          engine.start();
        }
      };
      document.addEventListener("visibilitychange", onVisibility);
      cleanupVisibility = () => document.removeEventListener("visibilitychange", onVisibility);
    }
  }

  function stop() {
    started = false;
    container?.classList.remove("is-active");
    engine?.stop();
  }

  function setState(nextState) {
    state = BRAIN_STATES[nextState] ? nextState : "idle";
    container?.setAttribute("data-brain-state", state);
    engine?.setState(state);
  }

  function setVisualMode(mode) {
    engine?.setVisualMode(mode === "ultra" && !lowPower() ? "ultra" : "performance");
  }

  function pulseMemory(label) {
    engine?.pulseMemory(label);
  }

  function dispose() {
    stop();
    cleanupVisibility?.();
    cleanupVisibility = undefined;
    engine?.dispose();
    engine = undefined;
    loadPromise = undefined;
  }

  return {
    start,
    stop,
    dispose,
    setState,
    setVisualMode,
    pulseMemory,
    get state() {
      return state;
    },
  };
}

async function createWebGlEngine(container, options) {
  const THREE = await import(THREE_URL);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
  const renderer = new THREE.WebGLRenderer({ antialias: !options.lowPower, alpha: true, powerPreference: "high-performance" });
  const root = new THREE.Group();
  const brainGroup = new THREE.Group();
  const graphGroup = new THREE.Group();
  const ringGroup = new THREE.Group();
  const particleGroup = new THREE.Group();
  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const activeState = {
    name: "idle",
    visualMode: options.lowPower ? "performance" : "ultra",
    frameId: undefined,
    running: false,
    composer: undefined,
    bloomPass: undefined,
    resizeObserver: undefined,
    memoryNodes: [],
    materials: [],
    particleMaterial: undefined,
    particleGeometry: undefined,
    lineMaterials: [],
    baseParticlePositions: undefined,
  };

  camera.position.set(0, 0.45, 8.6);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(pixelRatioFor(activeState.visualMode));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.className = "brain-vault-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");

  container.replaceChildren();
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0x5bc8ff, 0.75);
  const keyLight = new THREE.PointLight(0x74ecff, 24, 24);
  const warmLight = new THREE.PointLight(0xff7a90, 8, 16);
  const backLight = new THREE.DirectionalLight(0x91f5ff, 2.2);
  keyLight.position.set(0, 1.8, 4.8);
  warmLight.position.set(-3, -1.6, 3);
  backLight.position.set(3, 4, -4);
  scene.add(ambient, keyLight, warmLight, backLight, root);
  root.add(brainGroup, graphGroup, ringGroup, particleGroup);

  buildBrainCore(THREE, brainGroup, activeState);
  buildMemoryGraph(THREE, graphGroup, activeState);
  buildHolograms(THREE, ringGroup, activeState);
  buildParticles(THREE, particleGroup, activeState, activeState.visualMode);

  await configureComposer(THREE, scene, camera, renderer, activeState);

  function resize() {
    const width = Math.max(container.clientWidth, 260);
    const height = Math.max(container.clientHeight, 260);
    renderer.setPixelRatio(pixelRatioFor(activeState.visualMode));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    activeState.composer?.setSize(width, height);
    activeState.bloomPass?.resolution?.set(width, height);
  }

  function animate() {
    if (!activeState.running) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    const stateConfig = BRAIN_STATES[activeState.name] || BRAIN_STATES.idle;
    const visualBoost = activeState.visualMode === "ultra" ? 1.18 : 0.82;
    const pulse = 1 + Math.sin(elapsed * 2.4 * stateConfig.speed) * 0.028;

    brainGroup.rotation.y = elapsed * 0.2 * stateConfig.speed;
    brainGroup.rotation.x = Math.sin(elapsed * 0.34) * 0.12;
    brainGroup.scale.setScalar(pulse);
    graphGroup.rotation.y = -elapsed * 0.08 * stateConfig.speed;
    ringGroup.rotation.y = elapsed * 0.22 * stateConfig.speed;
    ringGroup.rotation.x = Math.sin(elapsed * 0.22) * 0.16;
    particleGroup.rotation.y = elapsed * 0.045 * stateConfig.particleSpeed;
    particleGroup.rotation.x = Math.sin(elapsed * 0.15) * 0.08;

    updateColors(THREE, activeState, stateConfig);
    updateMemoryNodes(elapsed, activeState);
    updateParticles(elapsed, activeState, stateConfig);

    if (activeState.bloomPass) {
      activeState.bloomPass.strength = stateConfig.bloom * visualBoost;
    }

    if (activeState.composer && activeState.visualMode === "ultra") {
      activeState.composer.render();
    } else {
      renderer.render(scene, camera);
    }

    if (!document.hidden) {
      activeState.frameId = window.requestAnimationFrame(animate);
    } else {
      activeState.running = false;
    }
  }

  function start() {
    if (activeState.running) {
      return;
    }
    activeState.running = true;
    clock.start();
    resize();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      renderer.render(scene, camera);
      return;
    }
    animate();
  }

  function stop() {
    activeState.running = false;
    if (activeState.frameId) {
      window.cancelAnimationFrame(activeState.frameId);
      activeState.frameId = undefined;
    }
  }

  function setState(nextState) {
    activeState.name = BRAIN_STATES[nextState] ? nextState : "idle";
    container.dataset.brainState = activeState.name;
  }

  function setVisualMode(mode) {
    activeState.visualMode = mode === "ultra" ? "ultra" : "performance";
    container.dataset.brainVisual = activeState.visualMode;
    renderer.setPixelRatio(pixelRatioFor(activeState.visualMode));
    if (activeState.particleMaterial) {
      activeState.particleMaterial.size = activeState.visualMode === "ultra" ? 0.038 : 0.03;
    }
    resize();
  }

  function pulseMemory(label) {
    const normalized = normalizeLabel(label);
    const selected = activeState.memoryNodes.find((node) => normalizeLabel(node.userData.label).includes(normalized))
      || activeState.memoryNodes[Math.floor(Math.random() * activeState.memoryNodes.length)];
    if (selected) {
      selected.userData.pulseUntil = performance.now() + 1600;
      selected.userData.accessCount = (selected.userData.accessCount || 0) + 1;
    }
  }

  function onPointerMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    root.rotation.x = pointer.y * 0.08;
    root.rotation.y = pointer.x * 0.1;
  }

  function onPointerDown(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(activeState.memoryNodes, false)[0];
    if (hit?.object) {
      pulseMemory(hit.object.userData.label);
      container.dispatchEvent(new CustomEvent("orion:brain-node", { detail: { label: hit.object.userData.label } }));
    }
  }

  activeState.resizeObserver = new ResizeObserver(resize);
  activeState.resizeObserver.observe(container);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  setVisualMode(activeState.visualMode);
  setState("idle");
  resize();

  return {
    start,
    stop,
    setState,
    setVisualMode,
    pulseMemory,
    dispose() {
      stop();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      activeState.resizeObserver?.disconnect();
      activeState.materials.forEach((material) => material.dispose());
      activeState.lineMaterials.forEach((material) => material.dispose());
      activeState.particleGeometry?.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose?.();
      });
      renderer.dispose();
      container.replaceChildren();
    },
  };
}

function buildBrainCore(THREE, brainGroup, activeState) {
  const lobeGeometry = new THREE.SphereGeometry(0.24, 18, 14);
  const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0x62e8ff,
    emissive: 0x1f8fff,
    emissiveIntensity: 1.15,
    metalness: 0.18,
    roughness: 0.28,
    transparent: true,
    opacity: 0.94,
  });
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xa8f8ff,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
  });
  activeState.materials.push(glowMaterial, wireMaterial);

  for (let side = -1; side <= 1; side += 2) {
    for (let index = 0; index < 26; index += 1) {
      const theta = index * 1.52;
      const layer = Math.floor(index / 9);
      const mesh = new THREE.Mesh(lobeGeometry, glowMaterial);
      mesh.position.set(
        side * (0.35 + Math.sin(theta) * 0.34 + layer * 0.09),
        Math.cos(theta * 0.72) * 0.54 + 0.2 - layer * 0.18,
        Math.sin(theta * 0.86) * 0.44
      );
      mesh.scale.setScalar(0.86 + (index % 5) * 0.035);
      brainGroup.add(mesh);
    }
  }

  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 3), wireMaterial);
  shell.scale.set(1.18, 0.84, 0.76);
  shell.position.y = 0.08;
  brainGroup.add(shell);

  const stem = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.18, 0.9, 8, 18),
    glowMaterial
  );
  stem.position.set(0, -1.04, -0.05);
  stem.rotation.z = 0.08;
  brainGroup.add(stem);
}

function buildMemoryGraph(THREE, graphGroup, activeState) {
  const nodeGeometry = new THREE.SphereGeometry(0.12, 18, 14);
  const center = new THREE.Vector3(0, 0, 0);

  MEMORY_CATEGORIES.forEach((category, index) => {
    const angle = (Math.PI * 2 * index) / MEMORY_CATEGORIES.length;
    const radius = index % 2 === 0 ? 2.85 : 2.45;
    const y = Math.sin(angle * 2.1) * 0.72;
    const position = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.72);
    const material = new THREE.MeshStandardMaterial({
      color: category.color,
      emissive: category.color,
      emissiveIntensity: 1.6,
      metalness: 0.22,
      roughness: 0.24,
    });
    const node = new THREE.Mesh(nodeGeometry, material);
    node.position.copy(position);
    node.userData = { label: category.label, baseScale: 1 + index * 0.03, pulseUntil: 0, accessCount: 0 };
    node.scale.setScalar(node.userData.baseScale);
    activeState.memoryNodes.push(node);
    activeState.materials.push(material);
    graphGroup.add(node);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: category.color,
      transparent: true,
      opacity: 0.34,
    });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([center, position]);
    graphGroup.add(new THREE.Line(lineGeometry, lineMaterial));
    activeState.lineMaterials.push(lineMaterial);
  });
}

function buildHolograms(THREE, ringGroup, activeState) {
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x62e8ff,
    transparent: true,
    opacity: 0.34,
    side: THREE.DoubleSide,
  });
  const accentMaterial = new THREE.MeshBasicMaterial({
    color: 0x7cffbd,
    transparent: true,
    opacity: 0.22,
    wireframe: true,
  });
  activeState.materials.push(ringMaterial, accentMaterial);

  for (let index = 0; index < 4; index += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.05 + index * 0.5, 0.009, 8, 128),
      index % 2 === 0 ? ringMaterial : accentMaterial
    );
    ring.rotation.x = Math.PI / 2 + index * 0.22;
    ring.rotation.y = index * 0.36;
    ringGroup.add(ring);
  }

  const holoPanel = new THREE.Mesh(
    new THREE.RingGeometry(3.45, 3.52, 96),
    accentMaterial
  );
  holoPanel.rotation.x = Math.PI / 2;
  ringGroup.add(holoPanel);
}

function buildParticles(THREE, particleGroup, activeState, visualMode) {
  const count = visualMode === "ultra" ? 420 : 180;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const radius = 1.8 + Math.random() * 3.4;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 3.2;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = height;
    positions[index * 3 + 2] = Math.sin(angle) * radius * 0.78;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0x9cf6ff,
    size: visualMode === "ultra" ? 0.038 : 0.03,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  activeState.particleGeometry = geometry;
  activeState.baseParticlePositions = positions.slice();
  activeState.particleMaterial = material;
  activeState.materials.push(material);
  particleGroup.add(new THREE.Points(geometry, material));
}

async function configureComposer(THREE, scene, camera, renderer, activeState) {
  try {
    const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
      import(EFFECT_URLS.composer),
      import(EFFECT_URLS.renderPass),
      import(EFFECT_URLS.bloomPass),
      import(EFFECT_URLS.outputPass),
    ]);
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(320, 320), 0.4, 0.62, 0.82);
    const outputPass = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);
    activeState.composer = composer;
    activeState.bloomPass = bloomPass;
  } catch {
    activeState.composer = undefined;
    activeState.bloomPass = undefined;
  }
}

function updateColors(THREE, activeState, stateConfig) {
  const color = new THREE.Color(stateConfig.color);
  const accent = new THREE.Color(stateConfig.accent);
  activeState.materials.forEach((material) => {
    if (material.color) {
      material.color.lerp(color, 0.018);
    }
    if (material.emissive) {
      material.emissive.lerp(accent, 0.024);
      material.emissiveIntensity = activeState.name === "learning" ? 1.9 : 1.35;
    }
  });
  activeState.lineMaterials.forEach((material) => {
    material.color.lerp(accent, 0.02);
    material.opacity = activeState.visualMode === "ultra" ? 0.42 : 0.28;
  });
}

function updateMemoryNodes(elapsed, activeState) {
  const now = performance.now();
  activeState.memoryNodes.forEach((node, index) => {
    const base = node.userData.baseScale;
    const pulse = Math.sin(elapsed * 2.6 + index) * 0.08;
    const accessed = now < node.userData.pulseUntil;
    const growth = Math.min((node.userData.accessCount || 0) * 0.06, 0.32);
    const selectedBoost = accessed ? 0.42 + Math.sin(elapsed * 10) * 0.1 : 0;
    node.scale.setScalar(base + growth + pulse + selectedBoost);
  });
}

function updateParticles(elapsed, activeState, stateConfig) {
  if (!activeState.particleGeometry || !activeState.baseParticlePositions) {
    return;
  }
  const positionAttribute = activeState.particleGeometry.getAttribute("position");
  const base = activeState.baseParticlePositions;
  const drift = 0.035 * stateConfig.particleSpeed;
  for (let index = 0; index < positionAttribute.count; index += 1) {
    const baseIndex = index * 3;
    positionAttribute.array[baseIndex + 1] = base[baseIndex + 1] + Math.sin(elapsed * 0.9 + index * 0.37) * drift;
  }
  positionAttribute.needsUpdate = true;
}

function pixelRatioFor(mode) {
  const cap = mode === "ultra" ? 1.75 : 1.2;
  return Math.min(window.devicePixelRatio || 1, cap);
}

function createCanvasFallback(container, options) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const categories = MEMORY_CATEGORIES.map((category, index) => ({ ...category, index, pulseUntil: 0, accessCount: 0 }));
  let state = "idle";
  let running = false;
  let frameId;
  let frame = 0;
  let visualMode = options.lowPower ? "performance" : "ultra";

  canvas.className = "brain-vault-fallback-canvas";
  canvas.setAttribute("aria-hidden", "true");
  container.replaceChildren(canvas);

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, visualMode === "ultra" ? 1.75 : 1.2);
    const width = Math.max(container.clientWidth, 260);
    const height = Math.max(container.clientHeight, 260);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw() {
    if (!running) {
      return;
    }
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const stateConfig = BRAIN_STATES[state] || BRAIN_STATES.idle;
    const pulse = Math.sin(frame / 24) * 8;

    context.clearRect(0, 0, width, height);
    drawCanvasBackground(context, width, height, stateConfig);
    drawCanvasBrain(context, centerX, centerY, pulse, stateConfig);
    drawCanvasGraph(context, centerX, centerY, frame, categories);

    frame += 1;
    if (!document.hidden && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frameId = requestAnimationFrame(draw);
    }
  }

  function start() {
    if (running) {
      return;
    }
    running = true;
    resize();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw();
      running = false;
      return;
    }
    draw();
  }

  function stop() {
    running = false;
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = undefined;
    }
  }

  function setState(nextState) {
    state = BRAIN_STATES[nextState] ? nextState : "idle";
    container.dataset.brainState = state;
  }

  function setVisualMode(mode) {
    visualMode = mode === "ultra" ? "ultra" : "performance";
    container.dataset.brainVisual = visualMode;
    resize();
  }

  function pulseMemory(label) {
    const normalized = normalizeLabel(label);
    const selected = categories.find((category) => normalizeLabel(category.label).includes(normalized))
      || categories[Math.floor(Math.random() * categories.length)];
    selected.pulseUntil = performance.now() + 1600;
    selected.accessCount += 1;
  }

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  setState("idle");
  setVisualMode(visualMode);

  return {
    start,
    stop,
    setState,
    setVisualMode,
    pulseMemory,
    dispose() {
      stop();
      observer.disconnect();
      container.replaceChildren();
    },
  };
}

function drawCanvasBackground(context, width, height, stateConfig) {
  const gradient = context.createRadialGradient(width / 2, height / 2, 12, width / 2, height / 2, width * 0.62);
  gradient.addColorStop(0, `#${stateConfig.color.toString(16).padStart(6, "0")}44`);
  gradient.addColorStop(1, "rgba(2, 9, 20, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawCanvasBrain(context, centerX, centerY, pulse, stateConfig) {
  context.save();
  context.shadowColor = `#${stateConfig.color.toString(16).padStart(6, "0")}`;
  context.shadowBlur = 28;
  context.strokeStyle = "rgba(156, 246, 255, 0.74)";
  context.lineWidth = 2;
  context.beginPath();
  context.ellipse(centerX - 32, centerY - 10, 58 + pulse, 44, -0.2, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.ellipse(centerX + 32, centerY - 10, 58 - pulse * 0.35, 44, 0.2, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = `#${stateConfig.color.toString(16).padStart(6, "0")}66`;
  context.beginPath();
  context.arc(centerX, centerY - 4, 40 + pulse * 0.2, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawCanvasGraph(context, centerX, centerY, frame, categories) {
  const now = performance.now();
  categories.forEach((category) => {
    const angle = (Math.PI * 2 * category.index) / categories.length + frame / 220;
    const radius = category.index % 2 === 0 ? 144 : 118;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.58;
    const color = `#${category.color.toString(16).padStart(6, "0")}`;
    const accessed = now < category.pulseUntil;
    const size = 6 + Math.min(category.accessCount, 6) + (accessed ? 6 + Math.sin(frame / 2) * 2 : 0);

    context.strokeStyle = `${color}66`;
    context.lineWidth = accessed ? 2.4 : 1.2;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(x, y);
    context.stroke();
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = accessed ? 22 : 12;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  });
}

function normalizeLabel(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
