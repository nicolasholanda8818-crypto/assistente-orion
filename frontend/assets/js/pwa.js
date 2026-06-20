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

export function setupInstallPrompt(button) {
  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    button.hidden = false;
  });

  button.addEventListener("click", async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    button.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    button.hidden = true;
  });
}
