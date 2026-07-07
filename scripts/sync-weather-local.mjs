/**
 * Generiše app/weather.local.js iz Android local.properties (WEATHER_API_KEY).
 * Fajl je gitignored — ne ide na GitHub.
 * node scripts/sync-weather-local.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = resolve(ROOT, "app/weather.local.js");

function resolveWeatherApiKey() {
  if (process.env.WEATHER_API_KEY?.trim()) {
    return String(process.env.WEATHER_API_KEY).trim();
  }
  const home = process.env.USERPROFILE || process.env.HOME || "";
  const candidates = [
    process.env.ANDROID_LOCAL_PROPERTIES,
    home ? resolve(home, "AndroidStudioProjects/BrzoiLokalno/local.properties") : "",
    "C:/Users/hp/AndroidStudioProjects/BrzoiLokalno/local.properties",
  ].filter((p) => p && existsSync(p));

  for (const filePath of candidates) {
    const text = readFileSync(filePath, "utf8");
    const match = text.match(/^WEATHER_API_KEY=(.+)$/m);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return "";
}

const key = resolveWeatherApiKey();
if (!key) {
  console.error("WEATHER_API_KEY nije pronađen u Android local.properties.");
  process.exit(1);
}

writeFileSync(
  OUT,
  `/** AUTO sync iz Android local.properties — NE commitati */\nexport const WEATHER_API_KEY_FALLBACK = ${JSON.stringify(key)};\n`,
  "utf8"
);
console.log(`Zapisano: ${OUT}`);
