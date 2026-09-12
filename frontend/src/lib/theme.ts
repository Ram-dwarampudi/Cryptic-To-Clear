export const THEME_STORAGE_KEY = "codementor:theme";
export type Theme = "dark" | "light";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore quota / privacy-mode errors
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }
}

/**
 * Inline script text, executed before hydration (see layout.tsx), that
 * applies the stored theme synchronously so there's no flash of the wrong
 * theme on load.
 */
export const THEME_INIT_SCRIPT = `
try {
  var t = localStorage.getItem('${THEME_STORAGE_KEY}');
  var root = document.documentElement;
  if (t === 'light') { root.classList.add('light'); root.classList.remove('dark'); root.setAttribute('data-theme', 'light'); }
  else { root.classList.add('dark'); root.classList.remove('light'); root.setAttribute('data-theme', 'dark'); }
} catch (e) {}
`;
