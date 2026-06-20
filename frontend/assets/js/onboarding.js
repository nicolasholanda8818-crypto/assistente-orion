import { completeOnboarding, getOnboardingProfile, getOnboardingStatus, updateOnboardingProfile } from "./api.js";
import { applyTheme, setTheme } from "./design-system.js";

function profilePayload(form) {
  const fields = new FormData(form);
  return {
    name: fields.get("name"),
    response_style: fields.get("response_style"),
    profile: fields.get("profile"),
    voice: fields.get("voice"),
    appearance: fields.get("appearance"),
  };
}

function completePayload(form) {
  const fields = new FormData(form);
  return {
    ...profilePayload(form),
    admin_password: fields.get("admin_password"),
    admin_password_confirmation: fields.get("admin_password_confirmation"),
  };
}

function updatePayload(form) {
  const fields = new FormData(form);
  const payload = {
    ...profilePayload(form),
    current_admin_password: fields.get("current_admin_password"),
  };
  const newPassword = fields.get("admin_password");
  const confirmation = fields.get("admin_password_confirmation");
  if (newPassword || confirmation) {
    payload.new_admin_password = newPassword;
    payload.new_admin_password_confirmation = confirmation;
  }
  return payload;
}

function setRadioValue(form, name, value) {
  form.querySelectorAll(`input[name="${name}"]`).forEach((control) => {
    control.checked = control.value === value;
  });
}

function fillProfile(form, profile) {
  form.elements.name.value = profile.name;
  form.elements.voice.value = profile.voice;
  setRadioValue(form, "response_style", profile.response_style);
  setRadioValue(form, "profile", profile.profile);
  setRadioValue(form, "appearance", profile.appearance);
}

function setPasswordMode(elements, mode) {
  const setupMode = mode === "setup";
  elements.currentPasswordField.hidden = setupMode;
  elements.form.elements.current_admin_password.required = !setupMode;
  elements.form.elements.admin_password.required = setupMode;
  elements.form.elements.admin_password_confirmation.required = setupMode;
  elements.passwordLabel.textContent = setupMode ? "Senha administrativa" : "Nova senha administrativa";
  elements.passwordConfirmationLabel.textContent = setupMode ? "Confirmar senha" : "Confirmar nova senha";
}

function resetPasswordFields(form) {
  form.elements.current_admin_password.value = "";
  form.elements.admin_password.value = "";
  form.elements.admin_password_confirmation.value = "";
}

function showOnboarding(elements, mode) {
  const { app, layer, form } = elements;
  elements.mode = mode;
  setPasswordMode(elements, mode);
  elements.title.textContent = mode === "setup" ? "Configure seu Orion" : "Editar configuracao inicial";
  elements.description.textContent =
    mode === "setup"
      ? "Escolha como o assistente deve se apresentar neste dispositivo."
      : "Atualize seu perfil local usando a senha administrativa.";
  elements.submitButton.textContent = mode === "setup" ? "Concluir configuracao" : "Salvar configuracao";
  elements.cancelButton.hidden = mode === "setup";
  layer.hidden = false;
  app.inert = true;
  window.setTimeout(() => {
    const target = mode === "setup" ? form.elements.name : form.elements.current_admin_password;
    target.focus();
  }, 0);
}

function hideOnboarding({ app, layer }) {
  layer.hidden = true;
  app.inert = false;
}

export async function setupOnboarding(elements) {
  const { form, status } = elements;
  elements.mode = "setup";
  let setupRequired = false;

  form.elements.appearance.forEach((control) => {
    control.addEventListener("change", () => applyTheme(control.value));
  });

  form.elements.profile.forEach((control) => {
    control.addEventListener("change", () => {
      document.documentElement.dataset.profile = control.value;
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    elements.submitButton.disabled = true;

    try {
      const payload = elements.mode === "setup" ? completePayload(form) : updatePayload(form);
      const result =
        elements.mode === "setup" ? await completeOnboarding(payload) : await updateOnboardingProfile(payload);
      setTheme(payload.appearance);
      document.documentElement.dataset.profile = payload.profile;
      resetPasswordFields(form);
      hideOnboarding(elements);
      elements.settingsButton.hidden = false;
      setupRequired = false;
      if (result.completed || result.updated_at) {
        status.textContent = "";
      }
    } catch (error) {
      status.textContent = error.message;
    } finally {
      elements.submitButton.disabled = false;
    }
  });

  elements.settingsButton.addEventListener("click", async () => {
    status.textContent = "";
    if (setupRequired) {
      resetPasswordFields(form);
      showOnboarding(elements, "setup");
      return;
    }
    try {
      const profile = await getOnboardingProfile();
      fillProfile(form, profile);
      resetPasswordFields(form);
      showOnboarding(elements, "edit");
    } catch (error) {
      status.textContent = error.message;
      showOnboarding(elements, "edit");
    }
  });

  elements.cancelButton.addEventListener("click", () => {
    status.textContent = "";
    resetPasswordFields(form);
    hideOnboarding(elements);
  });

  try {
    const onboarding = await getOnboardingStatus();
    if (onboarding.required) {
      setupRequired = true;
      status.textContent = "Configuracao inicial disponivel no botao Configuracoes.";
    }
    elements.settingsButton.hidden = false;
  } catch (error) {
    status.textContent = error.message;
  }
}
