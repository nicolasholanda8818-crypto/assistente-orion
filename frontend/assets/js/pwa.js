function requestSkipWaiting(worker) {
  if (worker) {
    worker.postMessage({ type: "SKIP_WAITING" });
  }
}

function bindServiceWorkerReload() {
  if (window.__orionServiceWorkerReloadBound) {
    return;
  }

  window.__orionServiceWorkerReloadBound = true;
  let refreshing = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) {
      return;
    }

    refreshing = true;
    window.location.reload();
  });
}

function bindImmediateServiceWorkerUpdate(registration) {
  if (registration.waiting && navigator.serviceWorker.controller) {
    requestSkipWaiting(registration.waiting);
  }

  registration.addEventListener("updatefound", () => {
    const installingWorker = registration.installing;

    if (!installingWorker) {
      return;
    }

    installingWorker.addEventListener("statechange", () => {
      if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
        requestSkipWaiting(installingWorker);
      }
    });
  });
}

export async function registerPwa() {
  if (!("serviceWorker" in navigator)) {
    return { ok: false, reason: "unsupported" };
  }

  try {
    const hadController = Boolean(navigator.serviceWorker.controller);
    const registration = await navigator.serviceWorker.register("/service-worker.js");

    if (hadController) {
      bindServiceWorkerReload();
    }

    bindImmediateServiceWorkerUpdate(registration);
    await registration.update();

    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
}

export function setupInstallPrompt(targets) {
  const buttons = Array.isArray(targets) ? targets.filter(Boolean) : [targets].filter(Boolean);
  let deferredPrompt = null;

  function setButtonsHidden(hidden) {
    buttons.forEach((button) => {
      button.hidden = hidden;
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    setButtonsHidden(false);
  });

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (!deferredPrompt) {
        return;
      }

      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      setButtonsHidden(true);
    });
  });

  window.addEventListener("appinstalled", () => {
    setButtonsHidden(true);
  });
}
