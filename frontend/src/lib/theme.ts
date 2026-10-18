export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "dewordle_visual_settings";

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): "light" | "dark" {
  if (preference === "system") return systemPrefersDark ? "dark" : "light";
  return preference;
}

export function applyTheme(resolved: "light" | "dark", root: HTMLElement = document.documentElement) {
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

/** Inline script run before hydration so the first paint uses the right theme. */
export const NO_FLASH_SCRIPT = `(function(){try{var p="system";var s=localStorage.getItem("${THEME_STORAGE_KEY}");if(s){var t=JSON.parse(s).theme;if(t==="light"||t==="dark"||t==="system")p=t}var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.dataset.theme=d?"dark":"light";r.style.colorScheme=d?"dark":"light"}catch(e){}})();`;
