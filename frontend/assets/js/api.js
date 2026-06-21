const API_BASE = window.location.origin;

async function request(path, options = {}) {
  const url = new URL(path, API_BASE);
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
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
