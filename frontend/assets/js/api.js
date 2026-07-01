const API_BASE = window.location.origin;

async function request(path, options = {}) {
  const url = new URL(path, API_BASE);
  const isFormData = options.body instanceof FormData;
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorPayload = await response.json();
      if (errorPayload.detail) {
        message = errorPayload.detail;
      }
    } catch {
      message = `Request failed with status ${response.status}`;
    }
    throw new Error(message);
  }

  return response.json();
}

export function getHealth() {
  return request("/api/health");
}

export function getStatus() {
  return request("/api/status");
}

export function processBrainMessage(payload) {
  return request("/api/brain/process", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function searchWeb(payload) {
  return request("/api/web-search/query", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function uploadOrionFile({ file, userId, category = "geral", description = "" }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);
  formData.append("category", category);
  if (description) {
    formData.append("description", description);
  }
  return request("/api/files/upload", {
    method: "POST",
    body: formData,
  });
}

export function listOrionFiles(userId) {
  const query = new URLSearchParams({ user_id: userId });
  return request(`/api/files?${query.toString()}`);
}

export function getOrionFile(fileId, userId) {
  const query = new URLSearchParams({ user_id: userId });
  return request(`/api/files/${fileId}?${query.toString()}`);
}

export function deleteOrionFile(fileId, userId) {
  const query = new URLSearchParams({ user_id: userId });
  return request(`/api/files/${fileId}?${query.toString()}`, {
    method: "DELETE",
  });
}

export function analyzeOrionFile(fileId, payload) {
  return request(`/api/files/${fileId}/analyze`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function transformOrionFile(fileId, payload) {
  return request(`/api/files/${fileId}/transform`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function orionFileDownloadUrl(fileId, userId) {
  const query = new URLSearchParams({ user_id: userId });
  return `/api/files/${fileId}/download?${query.toString()}`;
}

export function uploadCameraPhoto(payload) {
  return request("/api/camera/photo", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAutomationStatus() {
  return request("/api/automation/status");
}

export function requestAutomationAction(payload) {
  return request("/api/automation/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function previewAutomationRoutine(payload) {
  return request("/api/automation/routines/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getOnboardingStatus() {
  return request("/api/onboarding/status");
}

export function completeOnboarding(payload) {
  return request("/api/onboarding/complete", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getOnboardingProfile() {
  return request("/api/onboarding/profile");
}

export function updateOnboardingProfile(payload) {
  return request("/api/onboarding/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
