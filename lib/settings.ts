export type Theme = "light" | "dark" | "system";
export type Font = "sans" | "mono" | "serif";
export type FontSize = "xs" | "s" | "m" | "l" | "xl";
export type TabLayout = "horizontal" | "vertical";

export interface Settings {
  theme: Theme;
  font: Font;
  fontSize: FontSize;
  tabLayout: TabLayout;
}

const DEFAULTS: Settings = {
  theme: "system",
  font: "sans",
  fontSize: "m",
  tabLayout: "horizontal",
};

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem("rakugaki:settings");
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(settings: Partial<Settings>): Settings {
  const current = loadSettings();
  const next = { ...current, ...settings };
  localStorage.setItem("rakugaki:settings", JSON.stringify(next));
  return next;
}

export function applySettings(settings: Settings) {
  const root = document.documentElement;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark =
    settings.theme === "dark" || (settings.theme === "system" && prefersDark);
  root.classList.toggle("dark", isDark);

  root.setAttribute("data-font", settings.font);
  root.setAttribute("data-font-size", settings.fontSize);
}
