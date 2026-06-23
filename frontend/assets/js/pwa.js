export async function registerPwa() {
  if (!("serviceWorker" in navigator)) {
    return { ok: false, reason: "unsupported" };
  }

  try {
    await navigator.serviceWorker.register("/service-worker.js");
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
