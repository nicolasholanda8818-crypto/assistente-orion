const THEME_STORAGE_KEY = "orion.theme";
const THEMES = new Set(["dark", "light", "high-contrast"]);
const THEME_COLORS = {
  dark: "#0b1118",
  light: "#edf3f6",
  "high-contrast": "#000000",
};

function readStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function preferredTheme() {
  const storedTheme = readStoredTheme();
  if (THEMES.has(storedTheme)) {
    return storedTheme;
  }

  if (window.matchMedia("(prefers-contrast: more)").matches) {
    return "high-contrast";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyTheme(theme) {
  const safeTheme = THEMES.has(theme) ? theme : "dark";
  document.documentElement.dataset.theme = safeTheme;

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", THEME_COLORS[safeTheme]);
  }

  return safeTheme;
}

export function setTheme(theme) {
  const safeTheme = applyTheme(theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, safeTheme);
  } catch {
    return safeTheme;
  }
  return safeTheme;
}

export function setupDesignSystem() {
  applyTheme(preferredTheme());

  const refreshSystemTheme = () => {
    if (!readStoredTheme()) {
      applyTheme(preferredTheme());
    }
  };

  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", refreshSystemTheme);
  window.matchMedia("(prefers-contrast: more)").addEventListener("change", refreshSystemTheme);
}
