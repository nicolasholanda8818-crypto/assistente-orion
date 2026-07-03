export const GSAP_URL = "https://esm.sh/gsap@3.15.0";

let gsapRef;
let loadPromise;

export async function loadGsapEngine() {
  if (gsapRef || loadPromise) {
    return gsapRef || loadPromise;
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

export async function animateWithOrionEngine(target, vars, options = {}) {
  const targets = Array.isArray(target) ? target.filter(Boolean) : target ? [target] : [];
  if (!targets.length) {
    return;
  }

  const gsap = await loadGsapEngine();
  if (gsap) {
    targets.forEach((item) => {
      gsap.fromTo(item, fromVars(vars), {
        ...toVars(vars),
        duration: options.duration || 0.4,
        ease: options.ease || "power2.out",
        stagger: options.stagger,
      });
    });
    return;
  }

  targets.forEach((item, index) => {
    item.animate(keyframesFrom(vars), {
      delay: Math.round((options.stagger || 0) * 1000 * index),
      duration: Math.round((options.duration || 0.4) * 1000),
      easing: "cubic-bezier(.2,.8,.2,1)",
      fill: "both",
    });
  });
}

export async function createOrionTimeline(options = {}) {
  const gsap = await loadGsapEngine();
  return gsap?.timeline(options);
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
    if (key === "x") {
      startTransform.push(`translateX(${first}px)`);
      endTransform.push(`translateX(${last}px)`);
      return;
    }
    if (key === "scale") {
      startTransform.push(`scale(${first})`);
      endTransform.push(`scale(${last})`);
      return;
    }
    if (key === "rotate") {
      startTransform.push(`rotate(${first}deg)`);
      endTransform.push(`rotate(${last}deg)`);
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
