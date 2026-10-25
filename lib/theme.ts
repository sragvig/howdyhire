// Light/dark theme: stored choice in localStorage, otherwise the OS preference. The resolved theme
// lives on <html data-theme="…">, which the CSS in globals.css keys off.

export type Theme = "light" | "dark";

const STORAGE_KEY = "howdyhire.theme";
const CHANGE_EVENT = "howdyhire:theme";

// Runs in <head> before first paint so the page never flashes the wrong theme.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})();`;

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// useSyncExternalStore plumbing.
export const getThemeSnapshot = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
export const getServerThemeSnapshot = (): Theme => "light";

export function subscribeTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  // Follow OS changes only until the user picks a theme themselves.
  const onSystemChange = () => {
    if (!storedTheme()) apply(media.matches ? "dark" : "light");
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  media.addEventListener("change", onSystemChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    media.removeEventListener("change", onSystemChange);
  };
}

export function setTheme(theme: Theme) {
  apply(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage unavailable: the theme still applies for this page view
  }
}
