const THREE_URL = "https://esm.sh/three@0.184.0";
const EFFECT_URLS = {
  composer: "https://esm.sh/three@0.184.0/examples/jsm/postprocessing/EffectComposer.js",
  renderPass: "https://esm.sh/three@0.184.0/examples/jsm/postprocessing/RenderPass.js",
  bloomPass: "https://esm.sh/three@0.184.0/examples/jsm/postprocessing/UnrealBloomPass.js",
  outputPass: "https://esm.sh/three@0.184.0/examples/jsm/postprocessing/OutputPass.js",
};

const MEMORY_CATEGORIES = [
  { id: "memories", label: "Memorias", color: 0xb58cff },
  { id: "programming", label: "Programacao", color: 0x62e8ff },
  { id: "it", label: "Gestao de TI", color: 0x7cffbd },
  { id: "users", label: "Usuarios", color: 0xffd166 },
  { id: "conversations", label: "Conversas", color: 0x9b8cff },
  { id: "projects", label: "Projetos", color: 0xff7a90 },
  { id: "documents", label: "Documentos", color: 0xf4f7ff },
  { id: "files", label: "Arquivos", color: 0x80a8ff },
  { id: "learning", label: "Aprendizado", color: 0x65ffb6 },
  { id: "dragons", label: "Lord Dragons", color: 0xffb347 },
];

const BRAIN_STATES = {
  idle: { color: 0x62e8ff, accent: 0xb58cff, speed: 0.45, particleSpeed: 0.4, bloom: 0.32 },
  listening: { color: 0x50f6ff, accent: 0xffffff, speed: 0.62, particleSpeed: 0.58, bloom: 0.42 },
  thinking: { color: 0x4da3ff, accent: 0x62e8ff, speed: 0.82, particleSpeed: 0.82, bloom: 0.46 },
  responding: { color: 0xb58cff, accent: 0xffffff, speed: 0.74, particleSpeed: 0.76, bloom: 0.44 },
  learning: { color: 0xffd166, accent: 0xffffff, speed: 1.05, particleSpeed: 1.1, bloom: 0.58 },
  searching: { color: 0xff5f72, accent: 0x62e8ff, speed: 1.15, particleSpeed: 1.2, bloom: 0.55 },
  remembering: { color: 0xb58cff, accent: 0xffd166, speed: 0.7, particleSpeed: 0.72, bloom: 0.48 },
  files: { color: 0x6effb8, accent: 0x80a8ff, speed: 0.9, particleSpeed: 0.9, bloom: 0.5 },
  ready: { color: 0xf4ffff, accent: 0x62e8ff, speed: 0.5, particleSpeed: 0.5, bloom: 0.38 },
  alert: { color: 0xff9f43, accent: 0xff5f72, speed: 0.95, particleSpeed: 0.94, bloom: 0.5 },
};

const COSMIC_BODIES = [
  { label: "Saturno neural", color: 0xd6c7ff, ring: 0x9cf6ff, radius: 4.1, y: -1.05, size: 0.23, speed: 0.12 },
  { label: "Planeta contexto", color: 0x80a8ff, ring: 0xffffff, radius: 3.45, y: 1.05, size: 0.16, speed: -0.16 },
  { label: "Lua de memoria", color: 0xf4f7ff, ring: 0x62e8ff, radius: 2.55, y: -0.2, size: 0.095, speed: 0.22 },
];

export function createBrainVault({ container, getVisualMode } = {}) {
  let engine;
  let loadPromise;
  let state = "idle";
  let started = false;
  let cleanupVisibility;

  function selectedVisualMode(preferredMode) {
    const selectedMode = typeof getVisualMode === "function" ? getVisualMode() : document.documentElement.dataset.visualMode;
    const requested = preferredMode || selectedMode || "performance";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactDevice = window.innerWidth < 720 || (navigator.deviceMemory || 4) <= 2 || (navigator.hardwareConcurrency || 4) <= 2;
    if (reducedMotion || compactDevice || requested === "performance") {
      return "performance";
    }
    return requested === "ultra" ? "ultra" : "balanced";
  }

  function lowPower() {
    return selectedVisualMode() === "performance";
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

    loadPromise = createWebGlEngine(container, { visualMode: selectedVisualMode(), lowPower: lowPower() }).catch(() =>
      createCanvasFallback(container, { visualMode: selectedVisualMode(), lowPower: lowPower() })
    );
    engine = await loadPromise;
    engine.setState(state);
    return engine;
  }

  async function start() {
    started = true;
    container?.classList.add("is-active");
    const activeEngine = await ensureEngine();
    activeEngine?.setVisualMode(selectedVisualMode());
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
    engine?.setVisualMode(selectedVisualMode(mode));
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
  const renderer = new THREE.WebGLRenderer({ antialias: options.visualMode !== "performance", alpha: true, powerPreference: "high-performance" });
  const root = new THREE.Group();
  const brainGroup = new THREE.Group();
  const graphGroup = new THREE.Group();
  const ringGroup = new THREE.Group();
  const cosmicGroup = new THREE.Group();
  const particleGroup = new THREE.Group();
  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const activeState = {
    name: "idle",
    visualMode: options.visualMode || (options.lowPower ? "performance" : "balanced"),
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
    cosmicBodies: [],
    neuralTendrils: [],
    galaxySpirals: [],
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
  root.add(cosmicGroup, brainGroup, graphGroup, ringGroup, particleGroup);

  buildCosmicEnvironment(THREE, cosmicGroup, activeState, activeState.visualMode);
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
    const visualBoost = activeState.visualMode === "ultra" ? 1.18 : activeState.visualMode === "balanced" ? 1 : 0.82;
    const pulse = 1 + Math.sin(elapsed * 2.4 * stateConfig.speed) * 0.028;

    brainGroup.rotation.y = elapsed * 0.2 * stateConfig.speed;
    brainGroup.rotation.x = Math.sin(elapsed * 0.34) * 0.12;
    brainGroup.scale.setScalar(pulse);
    graphGroup.rotation.y = -elapsed * 0.08 * stateConfig.speed;
    ringGroup.rotation.y = elapsed * 0.22 * stateConfig.speed;
    ringGroup.rotation.x = Math.sin(elapsed * 0.22) * 0.16;
    cosmicGroup.rotation.y = elapsed * 0.035;
    cosmicGroup.rotation.x = Math.sin(elapsed * 0.11) * 0.035;
    particleGroup.rotation.y = elapsed * 0.045 * stateConfig.particleSpeed;
    particleGroup.rotation.x = Math.sin(elapsed * 0.15) * 0.08;

    updateColors(THREE, activeState, stateConfig);
    updateCosmicEnvironment(elapsed, activeState, stateConfig);
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
    activeState.visualMode = ["performance", "balanced", "ultra"].includes(mode) ? mode : "performance";
    container.dataset.brainVisual = activeState.visualMode;
    renderer.setPixelRatio(pixelRatioFor(activeState.visualMode));
    if (activeState.particleMaterial) {
      activeState.particleMaterial.size = activeState.visualMode === "ultra" ? 0.038 : activeState.visualMode === "balanced" ? 0.034 : 0.03;
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
  buildBrainSulci(THREE, brainGroup, activeState);

  const stem = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.18, 0.9, 8, 18),
    glowMaterial
  );
  stem.position.set(0, -1.04, -0.05);
  stem.rotation.z = 0.08;
  brainGroup.add(stem);
}

function buildCosmicEnvironment(THREE, cosmicGroup, activeState, visualMode) {
  const starMaterial = new THREE.PointsMaterial({
    color: 0xf4fbff,
    size: visualMode === "ultra" ? 0.028 : 0.022,
    transparent: true,
    opacity: visualMode === "performance" ? 0.36 : 0.62,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const starGeometry = new THREE.BufferGeometry();
  const starCount = visualMode === "ultra" ? 420 : visualMode === "balanced" ? 260 : 120;
  const starPositions = new Float32Array(starCount * 3);
  for (let index = 0; index < starCount; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3.2 + Math.random() * 4.8;
    starPositions[index * 3] = Math.cos(angle) * radius;
    starPositions[index * 3 + 1] = (Math.random() - 0.5) * 4.6;
    starPositions[index * 3 + 2] = Math.sin(angle) * radius * 0.72 - 1.2;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  cosmicGroup.add(new THREE.Points(starGeometry, starMaterial));
  activeState.materials.push(starMaterial);

  COSMIC_BODIES.forEach((body, index) => {
    const orbit = new THREE.Group();
    const planetMaterial = new THREE.MeshStandardMaterial({
      color: body.color,
      emissive: body.color,
      emissiveIntensity: 0.34,
      roughness: 0.36,
      metalness: 0.12,
    });
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: body.ring,
      transparent: true,
      opacity: 0.36,
      side: THREE.DoubleSide,
    });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(body.size, 24, 16), planetMaterial);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(body.size * 1.8, 0.006, 8, 64), ringMaterial);
    const angle = (Math.PI * 2 * index) / COSMIC_BODIES.length + 0.5;
    orbit.userData = { ...body, angle, baseAngle: angle };
    planet.position.set(body.radius, body.y, -0.85);
    ring.position.copy(planet.position);
    ring.rotation.set(Math.PI / 2.35, 0.25, 0.34);
    orbit.add(planet, ring);
    cosmicGroup.add(orbit);
    activeState.materials.push(planetMaterial, ringMaterial);
    activeState.cosmicBodies.push({ orbit, planet, ring, config: body });
  });

  for (let index = 0; index < 2; index += 1) {
    const geometry = new THREE.BufferGeometry();
    const points = [];
    const offsetX = index === 0 ? -3.8 : 3.6;
    const offsetY = index === 0 ? 1.35 : -1.25;
    for (let step = 0; step < 150; step += 1) {
      const progress = step / 149;
      const angle = progress * Math.PI * 7;
      const radius = 0.08 + progress * 0.58;
      points.push(new THREE.Vector3(
        offsetX + Math.cos(angle) * radius,
        offsetY + Math.sin(angle) * radius * 0.62,
        -1.25 + progress * 0.32
      ));
    }
    geometry.setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: index === 0 ? 0xffd166 : 0x62e8ff,
      transparent: true,
      opacity: visualMode === "performance" ? 0.28 : 0.54,
    });
    const spiral = new THREE.Line(geometry, material);
    spiral.userData = { galaxySpiral: true, spin: index === 0 ? 1 : -1 };
    cosmicGroup.add(spiral);
    activeState.galaxySpirals.push(spiral);
    activeState.lineMaterials.push(material);
  }

  const tendrilCount = visualMode === "ultra" ? 18 : visualMode === "balanced" ? 13 : 8;
  for (let index = 0; index < tendrilCount; index += 1) {
    const angle = (Math.PI * 2 * index) / tendrilCount;
    const length = 3.4 + (index % 4) * 0.34;
    const points = [];
    for (let step = 0; step <= 32; step += 1) {
      const progress = step / 32;
      const wave = Math.sin(progress * Math.PI * 3 + index) * 0.18;
      points.push(new THREE.Vector3(
        Math.cos(angle) * (0.6 + progress * length) + Math.cos(angle + Math.PI / 2) * wave,
        Math.sin(index * 0.7) * 0.18 + Math.sin(progress * Math.PI) * (0.55 + (index % 3) * 0.08),
        Math.sin(angle) * (0.42 + progress * length * 0.55)
      ));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(72));
    const material = new THREE.LineBasicMaterial({
      color: index % 3 === 0 ? 0xffd166 : index % 3 === 1 ? 0x62e8ff : 0xb58cff,
      transparent: true,
      opacity: visualMode === "performance" ? 0.24 : 0.5,
    });
    const tendril = new THREE.Line(geometry, material);
    tendril.userData = { neuralTendril: true, phase: index * 0.37 };
    cosmicGroup.add(tendril);
    activeState.neuralTendrils.push(tendril);
    activeState.lineMaterials.push(material);
  }
}

function buildBrainSulci(THREE, brainGroup, activeState) {
  for (let side = -1; side <= 1; side += 2) {
    for (let track = 0; track < 9; track += 1) {
      const points = [];
      const y = 0.58 - track * 0.17;
      for (let step = 0; step <= 42; step += 1) {
        const progress = step / 42;
        const arc = -1.15 + progress * 2.3;
        const wave = Math.sin(progress * Math.PI * 3 + track * 0.8) * 0.08;
        points.push(new THREE.Vector3(
          side * (0.16 + Math.cos(arc) * (0.78 + wave)),
          y + Math.sin(arc * 1.3) * 0.08,
          Math.sin(arc) * 0.42 + Math.cos(track + progress * 4) * 0.05
        ));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
      const material = new THREE.LineBasicMaterial({
        color: track % 2 === 0 ? 0x9cf6ff : 0xb58cff,
        transparent: true,
        opacity: 0.46,
      });
      const line = new THREE.Line(geometry, material);
      line.userData = { premiumSulcus: true, side, track };
      activeState.lineMaterials.push(material);
      brainGroup.add(line);
    }
  }
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

  for (let index = 0; index < 18; index += 1) {
    const angle = (Math.PI * 2 * index) / 18;
    const codeShard = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 0.035),
      index % 2 === 0 ? ringMaterial : accentMaterial
    );
    codeShard.position.set(Math.cos(angle) * 3.2, Math.sin(index * 0.9) * 1.25, Math.sin(angle) * 2.2);
    codeShard.rotation.y = -angle;
    codeShard.rotation.z = angle * 0.35;
    codeShard.userData = { premiumCodeShard: true };
    ringGroup.add(codeShard);
  }
}

function buildParticles(THREE, particleGroup, activeState, visualMode) {
  const count = visualMode === "ultra" ? 560 : visualMode === "balanced" ? 320 : 160;
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
    size: visualMode === "ultra" ? 0.038 : visualMode === "balanced" ? 0.034 : 0.03,
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

function updateCosmicEnvironment(elapsed, activeState, stateConfig) {
  activeState.cosmicBodies.forEach(({ orbit, planet, ring, config }, index) => {
    orbit.rotation.y = elapsed * config.speed;
    orbit.rotation.x = Math.sin(elapsed * 0.18 + index) * 0.08;
    const glow = 1 + Math.sin(elapsed * 1.5 + index) * 0.08;
    planet.scale.setScalar(glow);
    ring.rotation.z = elapsed * (0.12 + index * 0.03);
  });

  activeState.galaxySpirals.forEach((spiral, index) => {
    spiral.rotation.z = elapsed * 0.08 * spiral.userData.spin;
    spiral.material.opacity = (activeState.visualMode === "performance" ? 0.22 : 0.46) + Math.sin(elapsed * 0.9 + index) * 0.08;
  });

  activeState.neuralTendrils.forEach((tendril) => {
    const pulse = (Math.sin(elapsed * 1.8 * stateConfig.speed + tendril.userData.phase) + 1) / 2;
    tendril.material.opacity = (activeState.visualMode === "performance" ? 0.18 : 0.34) + pulse * 0.22;
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
  const cap = mode === "ultra" ? 1.75 : mode === "balanced" ? 1.45 : 1.2;
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
  let visualMode = options.visualMode || (options.lowPower ? "performance" : "balanced");

  canvas.className = "brain-vault-fallback-canvas";
  canvas.setAttribute("aria-hidden", "true");
  container.replaceChildren(canvas);

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, visualMode === "ultra" ? 1.75 : visualMode === "balanced" ? 1.45 : 1.2);
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
    drawCanvasCosmos(context, width, height, frame, stateConfig, visualMode);
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
    visualMode = ["performance", "balanced", "ultra"].includes(mode) ? mode : "performance";
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

function drawCanvasCosmos(context, width, height, frame, stateConfig, visualMode) {
  const starCount = visualMode === "ultra" ? 72 : visualMode === "balanced" ? 48 : 28;
  context.save();
  for (let index = 0; index < starCount; index += 1) {
    const x = (index * 73 + frame * 0.22) % width;
    const y = (index * 41 + Math.sin(frame / 80 + index) * 12 + height) % height;
    const size = index % 7 === 0 ? 1.8 : 1;
    context.fillStyle = index % 5 === 0 ? "rgba(255, 209, 102, 0.72)" : "rgba(232, 252, 255, 0.7)";
    context.fillRect(x, y, size, size);
  }

  const planetColor = `#${stateConfig.color.toString(16).padStart(6, "0")}`;
  const planets = [
    { x: width * 0.18, y: height * 0.74, r: 22, ring: 46 },
    { x: width * 0.82, y: height * 0.25, r: 16, ring: 35 },
  ];
  planets.forEach((planet, index) => {
    context.strokeStyle = index === 0 ? "rgba(255, 209, 102, 0.46)" : "rgba(156, 246, 255, 0.48)";
    context.lineWidth = 1.4;
    context.beginPath();
    context.ellipse(planet.x, planet.y, planet.ring, planet.ring * 0.22, frame / 240 + index, 0, Math.PI * 2);
    context.stroke();
    const gradient = context.createRadialGradient(planet.x - 6, planet.y - 7, 2, planet.x, planet.y, planet.r);
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(1, `${planetColor}88`);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(planet.x, planet.y, planet.r, 0, Math.PI * 2);
    context.fill();
  });

  context.strokeStyle = "rgba(156, 246, 255, 0.28)";
  context.lineWidth = 1.2;
  for (let index = 0; index < 12; index += 1) {
    const angle = (Math.PI * 2 * index) / 12 + frame / 260;
    context.beginPath();
    context.moveTo(width / 2, height / 2);
    context.bezierCurveTo(
      width / 2 + Math.cos(angle) * 90,
      height / 2 + Math.sin(angle) * 60,
      width / 2 + Math.cos(angle) * width * 0.28,
      height / 2 + Math.sin(angle) * height * 0.28,
      width / 2 + Math.cos(angle) * width * 0.48,
      height / 2 + Math.sin(angle) * height * 0.38
    );
    context.stroke();
  }
  context.restore();
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
  context.strokeStyle = "rgba(224, 252, 255, 0.58)";
  context.lineWidth = 1.2;
  for (let index = 0; index < 11; index += 1) {
    const offsetY = -46 + index * 9;
    context.beginPath();
    context.bezierCurveTo(
      centerX - 88,
      centerY + offsetY,
      centerX - 34,
      centerY + offsetY + Math.sin(index) * 18,
      centerX - 8,
      centerY + offsetY + Math.cos(index) * 10
    );
    context.stroke();
    context.beginPath();
    context.bezierCurveTo(
      centerX + 88,
      centerY + offsetY,
      centerX + 34,
      centerY + offsetY - Math.sin(index) * 18,
      centerX + 8,
      centerY + offsetY - Math.cos(index) * 10
    );
    context.stroke();
  }
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
