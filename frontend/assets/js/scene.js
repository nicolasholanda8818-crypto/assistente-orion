const THREE_URL = "https://esm.sh/three@0.184.0";

const SCENE_STATES = {
  online: 0x66e7ff,
  listening: 0x50f6ff,
  thinking: 0x4da3ff,
  speaking: 0xb58cff,
  responding: 0xb58cff,
  searching: 0xff5f72,
  files: 0x6effb8,
  learning: 0xffd166,
  error: 0xff9f43,
};

function renderFallback(container) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  let frame = 0;
  let animationId;
  let stateColor = "#66e7ff";

  canvas.className = "scene-fallback-canvas";
  container.replaceChildren(canvas);

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
    const width = Math.max(container.clientWidth, 180);
    const height = Math.max(container.clientHeight, 130);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const pulse = Math.sin(frame / 24) * 5;

    context.clearRect(0, 0, width, height);
    context.strokeStyle = `${stateColor}88`;
    context.lineWidth = 2;
    for (let index = 0; index < 3; index += 1) {
      context.beginPath();
      context.ellipse(centerX, centerY + index * 4, 58 + index * 18 + pulse, 16 + index * 5, frame / (90 + index * 30), 0, Math.PI * 2);
      context.stroke();
    }
    context.fillStyle = `${stateColor}66`;
    context.shadowColor = stateColor;
    context.shadowBlur = 18;
    context.beginPath();
    context.arc(centerX, centerY, 18 + pulse / 4, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;

    for (let index = 0; index < 18; index += 1) {
      const angle = frame / 80 + index * 0.9;
      context.fillStyle = index % 2 ? "rgba(181,140,255,0.55)" : "rgba(110,255,184,0.5)";
      context.fillRect(centerX + Math.cos(angle) * (72 + index * 2), centerY + Math.sin(angle) * 28, 2, 2);
    }

    frame += 1;
    if (!document.hidden && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animationId = requestAnimationFrame(draw);
    }
  }

  const visibilityHandler = () => {
    if (document.hidden && animationId) {
      cancelAnimationFrame(animationId);
    } else {
      draw();
    }
  };
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", visibilityHandler);
  resize();
  draw();

  return {
    setState(state) {
      stateColor = `#${(SCENE_STATES[state] || SCENE_STATES.online).toString(16).padStart(6, "0")}`;
    },
    setVisualMode() {},
    pulsePanel() {},
    dispose() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibilityHandler);
      container.replaceChildren();
    },
  };
}

export async function startScene(container, options = {}) {
  if (!container) {
    return undefined;
  }

  try {
    const THREE = await import(THREE_URL);
    return createSceneManager(THREE, container, options);
  } catch {
    return renderFallback(container);
  }
}

function createSceneManager(THREE, container, options) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  const clock = new THREE.Clock();
  const root = new THREE.Group();
  const platformGroup = new THREE.Group();
  const panelGroup = new THREE.Group();
  const particleGroup = new THREE.Group();
  const state = {
    visualMode: selectedVisualMode(options.getVisualMode?.()),
    color: new THREE.Color(SCENE_STATES.online),
    running: false,
    frameId: undefined,
    resizeObserver: undefined,
    panels: [],
    materials: [],
    particleGeometry: undefined,
    visibilityHandler: undefined,
  };

  renderer.domElement.className = "orion-scene-canvas";
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(pixelRatioFor(state.visualMode));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  camera.position.set(0, 1.18, 6.2);
  scene.add(root);
  root.add(platformGroup, panelGroup, particleGroup);

  const ambient = new THREE.AmbientLight(0x7ceaff, 0.8);
  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  const rim = new THREE.PointLight(0x66e7ff, 20, 18);
  const floorGlow = new THREE.PointLight(0xb58cff, 8, 12);
  key.position.set(3, 4, 5);
  rim.position.set(-2.6, 1.6, 3.4);
  floorGlow.position.set(0, -0.9, 2.2);
  root.add(ambient, key, rim, floorGlow);

  buildPlatform(THREE, platformGroup, state);
  buildPanels(THREE, panelGroup, state);
  buildParticles(THREE, particleGroup, state);
  container.replaceChildren(renderer.domElement);

  function resize() {
    const width = Math.max(container.clientWidth, 180);
    const height = Math.max(container.clientHeight, 130);
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
    const visualBoost = state.visualMode === "ultra" ? 1.3 : state.visualMode === "balanced" ? 1 : 0.7;
    platformGroup.rotation.y = elapsed * 0.16;
    panelGroup.rotation.y = Math.sin(elapsed * 0.18) * 0.12;
    particleGroup.rotation.y = elapsed * 0.035;
    particleGroup.rotation.x = Math.sin(elapsed * 0.12) * 0.04;
    state.panels.forEach((panel, index) => {
      panel.position.y = panel.userData.baseY + Math.sin(elapsed * (0.7 + index * 0.08)) * 0.08;
      panel.material.opacity = 0.34 + Math.sin(elapsed * 1.4 + index) * 0.08;
    });
    state.materials.forEach((material) => {
      if (material.color) {
        material.color.lerp(state.color, 0.012);
      }
      if (material.emissive) {
        material.emissive.lerp(state.color, 0.02);
        material.emissiveIntensity = 0.22 * visualBoost;
      }
    });
    rim.color.lerp(state.color, 0.03);
    floorGlow.color.lerp(state.color, 0.02);
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

  const manager = {
    setState(nextState) {
      state.color.setHex(SCENE_STATES[nextState] || SCENE_STATES.online);
    },
    setVisualMode(mode) {
      state.visualMode = selectedVisualMode(mode);
      rebuildParticles(THREE, particleGroup, state);
      resize();
    },
    pulsePanel(label = "panel") {
      const panel = state.panels.find((item) => item.userData.label === label) || state.panels[0];
      if (panel) {
        panel.userData.pulseUntil = performance.now() + 900;
        panel.scale.setScalar(1.08);
        window.setTimeout(() => panel.scale.setScalar(1), 180);
      }
    },
    dispose() {
      stop();
      state.resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", state.visibilityHandler);
      state.materials.forEach((material) => material.dispose?.());
      state.particleGeometry?.dispose?.();
      scene.traverse((object) => object.geometry?.dispose?.());
      renderer.dispose();
      container.replaceChildren();
    },
  };

  state.resizeObserver = new ResizeObserver(resize);
  state.resizeObserver.observe(container);
  state.visibilityHandler = () => {
    if (!document.hidden && !state.running) {
      start();
    }
  };
  document.addEventListener("visibilitychange", state.visibilityHandler);
  start();
  return manager;
}

function buildPlatform(THREE, group, state) {
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x66e7ff, transparent: true, opacity: 0.44, side: THREE.DoubleSide });
  const gridMaterial = new THREE.MeshBasicMaterial({ color: 0xb58cff, transparent: true, opacity: 0.2, wireframe: true });
  state.materials.push(ringMaterial, gridMaterial);

  for (let index = 0; index < 4; index += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1 + index * 0.38, 0.008, 8, 96), index % 2 ? gridMaterial : ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.8 + index * 0.015;
    group.add(ring);
  }

  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.95, 0.025, 96, 1, true), ringMaterial);
  disc.position.y = -0.82;
  group.add(disc);
}

function buildPanels(THREE, group, state) {
  const labels = ["memory", "files", "voice", "web", "portfolio"];
  labels.forEach((label, index) => {
    const angle = (Math.PI * 2 * index) / labels.length + 0.25;
    const material = new THREE.MeshBasicMaterial({
      color: index % 2 ? 0xb58cff : 0x66e7ff,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
    });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.36, 1, 1), material);
    panel.position.set(Math.cos(angle) * 2.2, 0.12 + Math.sin(index) * 0.22, Math.sin(angle) * 0.72);
    panel.rotation.y = -angle + Math.PI;
    panel.userData = { label, baseY: panel.position.y };
    state.panels.push(panel);
    state.materials.push(material);
    group.add(panel);
  });
}

function buildParticles(THREE, group, state) {
  const count = particleCountFor(state.visualMode);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const radius = 1.5 + Math.random() * 3.4;
    const angle = Math.random() * Math.PI * 2;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = -1.1 + Math.random() * 2.6;
    positions[index * 3 + 2] = Math.sin(angle) * radius * 0.42;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0x9cf6ff,
    size: state.visualMode === "ultra" ? 0.032 : 0.026,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  state.particleGeometry = geometry;
  state.materials.push(material);
  group.add(new THREE.Points(geometry, material));
}

function rebuildParticles(THREE, group, state) {
  group.clear();
  state.particleGeometry?.dispose?.();
  buildParticles(THREE, group, state);
}

function selectedVisualMode(mode) {
  const compact = window.innerWidth < 720 || (navigator.deviceMemory || 4) <= 2 || (navigator.hardwareConcurrency || 4) <= 2;
  if (compact || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "performance";
  }
  return ["performance", "balanced", "ultra"].includes(mode) ? mode : "balanced";
}

function pixelRatioFor(mode) {
  if (mode === "ultra") {
    return Math.min(window.devicePixelRatio || 1, 1.8);
  }
  if (mode === "balanced") {
    return Math.min(window.devicePixelRatio || 1, 1.4);
  }
  return 1;
}

function particleCountFor(mode) {
  if (mode === "ultra") {
    return 260;
  }
  if (mode === "balanced") {
    return 150;
  }
  return 72;
}
