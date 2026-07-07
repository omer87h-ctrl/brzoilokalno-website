const KEY = "bil_display_settings";

const DEFAULTS = {
  fontScale: 1,
  reduceMotion: false,
  hapticsEnabled: true,
  rememberLastTab: true,
};

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch (_) {
    return { ...DEFAULTS };
  }
}

function writeAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getDisplaySettings() {
  return readAll();
}

export function setDisplaySetting(name, value) {
  const data = readAll();
  data[name] = value;
  writeAll(data);
  applyDisplaySettings();
}

export function applyDisplaySettings() {
  const s = readAll();
  const root = document.documentElement;
  root.style.setProperty("--app-font-scale", String(s.fontScale || 1));
  root.classList.toggle("reduce-motion", !!s.reduceMotion);
}
