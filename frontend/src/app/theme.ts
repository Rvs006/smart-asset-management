// Light/dark theme, mirroring the Smart Commissioning Tool: stored in
// localStorage under sam.theme, applied via data-theme on <html>.
const KEY = "sam.theme";
export type ThemeMode = "light" | "dark";

export function getTheme(): ThemeMode {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}
export function applyTheme(mode: ThemeMode): void {
  if (mode === "dark") document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
}
export function toggleTheme(): ThemeMode {
  const next: ThemeMode = getTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
  return next;
}
export function initTheme(): void {
  let stored: string | null = null;
  try { stored = localStorage.getItem(KEY); } catch { /* ignore */ }
  applyTheme(stored === "dark" ? "dark" : "light");
}
