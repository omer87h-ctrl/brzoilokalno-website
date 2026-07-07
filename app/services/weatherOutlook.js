const forecastCache = new Map();
const CACHE_TTL_MS = 20 * 60 * 1000;

function parseHour(timeIso) {
  const m = String(timeIso).match(/T(\d{2}):/);
  return m ? Number(m[1]) : null;
}

function isBadForOutdoor(chanceRain, windKph, code) {
  if (chanceRain >= 55) return true;
  if (windKph >= 45) return true;
  if ([1069, 1072, 1087, 1114, 1117, 1135, 1147, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1201, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1240, 1243, 1246, 1249, 1252, 1255, 1258, 1261, 1264, 1273, 1276, 1279, 1282].includes(code)) {
    return true;
  }
  return chanceRain >= 40 && windKph >= 30;
}

export async function fetchOutdoorForecast(apiKey, city) {
  const key = String(apiKey || "").trim();
  const qCity = String(city || "").trim();
  if (!key || !qCity) return null;

  const cacheKey = qCity.toLowerCase();
  const cached = forecastCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(key)}&q=${encodeURIComponent(qCity)}&days=2&aqi=no&alerts=no`;
  const res = await fetch(url);
  if (!res.ok) return cached?.data || null;
  const root = await res.json();
  const days = root?.forecast?.forecastday;
  if (!Array.isArray(days) || !days.length) return cached?.data || null;

  const timeIso = [];
  const bad = [];
  let todayPrecipMax = 0;
  let todayWindMax = 0;

  const day0 = days[0]?.day;
  if (day0) {
    todayPrecipMax = Number(day0.daily_chance_of_rain) || 0;
    todayWindMax = Number(day0.maxwind_kph) || 0;
  }

  for (const day of days.slice(0, 2)) {
    const hours = day?.hour || [];
    for (const h of hours) {
      const t = h?.time;
      if (!t) continue;
      const chance = Number(h.chance_of_rain) || 0;
      const wind = Math.max(Number(h.wind_kph) || 0, Number(h.gust_kph) || 0);
      const code = Number(h?.condition?.code) || 0;
      timeIso.push(t);
      bad.push(isBadForOutdoor(chance, wind, code));
    }
  }

  if (timeIso.length < 6) return cached?.data || null;

  const data = {
    cityLabel: root?.location?.name || qCity,
    timeIso,
    bad,
    todayPrecipMax,
    todayWindMax,
  };
  forecastCache.set(cacheKey, { data, fetchedAt: Date.now() });
  return data;
}

export function buildOutdoorOutlook(role, forecast) {
  if (!forecast) return null;
  const persona = role === "majstor" ? "majstor" : role === "kreator" ? "kreator" : role === "korisnik" ? "korisnik" : null;
  if (!persona) return null;

  const horizon = Math.min(24, forecast.timeIso.length, forecast.bad.length);
  let goodHours = 0;
  let firstCalm = -1;
  for (let i = 0; i < horizon; i++) {
    if (!forecast.bad[i]) {
      goodHours += 1;
      if (firstCalm < 0) firstCalm = i;
    }
  }

  const title =
    persona === "majstor"
      ? "Plan za vanjski rad"
      : persona === "kreator"
        ? "Plan za vanjski dio posla"
        : "Plan kada krenuti s poslom";

  const h0 = firstCalm >= 0 ? parseHour(forecast.timeIso[firstCalm]) : null;
  const calmLabel = h0 != null ? `oko ${String(h0).padStart(2, "0")}:00` : null;

  let summary;
  if (firstCalm < 0) {
    summary =
      persona === "majstor"
        ? "Danas nema dužeg mirnog prozora"
        : persona === "kreator"
          ? "Danas je promjenjivo za vani"
          : "Danas je malo pogodnih sati za vanjski posao";
  } else {
    summary =
      persona === "korisnik"
        ? `Danas je dobro za vanjski posao od ${calmLabel}`
        : `Najbolje je krenuti od ${calmLabel}`;
  }

  const detail = `Za ${forecast.cityLabel} u naredna 24h ima oko ${goodHours} od ${horizon} pogodnih sati. Kiša do ${Math.round(forecast.todayPrecipMax)}%, vjetar do ${Math.round(forecast.todayWindMax)} km/h.`;

  return { title, summary, detail };
}

export const outdoorDisclaimer =
  "Informativno — prognoza može biti netočna. Provjeri stanje na terenu prije rada.";
