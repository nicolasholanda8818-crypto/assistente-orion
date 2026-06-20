const THREE_URL = "https://unpkg.com/three@0.172.0/build/three.module.js";

function renderFallback(container) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  let frame = 0;
  let animationId;

  canvas.className = "scene-fallback-canvas";
  container.replaceChildren(canvas);

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(container.clientWidth, 160);
    const height = Math.max(container.clientHeight, 120);
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
    context.strokeStyle = "rgba(97, 216, 255, 0.46)";
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(centerX, centerY, 54 + pulse, 18, frame / 90, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.ellipse(centerX, centerY, 22, 58 + pulse, -frame / 100, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = "rgba(62, 203, 255, 0.72)";
    context.shadowColor = "#4de4ff";
    context.shadowBlur = 18;
    context.beginPath();
    context.arc(centerX, centerY, 18 + pulse / 4, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;

    frame += 1;
    if (!document.hidden && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animationId = requestAnimationFrame(draw);
    }
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && animationId) {
      cancelAnimationFrame(animationId);
    } else {
      draw();
    }
  });
  resize();
  draw();
}

export async function startScene(container) {
  try {
    const THREE = await import(THREE_URL);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const geometry = new THREE.IcosahedronGeometry(1.35, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4fd7e8,
      roughness: 0.38,
      metalness: 0.25,
    });
    const core = new THREE.Mesh(geometry, material);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.018, 16, 128),
      new THREE.MeshBasicMaterial({ color: 0x70e6a8 })
    );
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    const fillLight = new THREE.PointLight(0xf2b85b, 12, 12);

    camera.position.z = 5;
    keyLight.position.set(3, 4, 5);
    fillLight.position.set(-3, -2, 4);
    scene.add(core, ring, keyLight, fillLight);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function animate() {
      core.rotation.x += 0.003;
      core.rotation.y += 0.006;
      ring.rotation.x += 0.002;
      ring.rotation.y += 0.004;
      renderer.render(scene, camera);
      if (!document.hidden) {
        requestAnimationFrame(animate);
      }
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        animate();
      }
    });
    resize();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      renderer.render(scene, camera);
    } else {
      animate();
    }
  } catch {
    renderFallback(container);
  }
}
