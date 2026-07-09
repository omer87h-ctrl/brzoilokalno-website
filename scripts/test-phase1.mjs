/**
 * Lokalni test Faze 1 — pokrenuti uz aktivan http.server na portu 8765.
 * node scripts/test-phase1.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.WEB_TEST_BASE || "http://127.0.0.1:8765";
const results = [];

function pass(name, detail = "") {
  results.push({ ok: true, name, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ ok: false, name, detail });
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function testLanding(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  });

  const res = await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  if (!res || !res.ok()) {
    fail("Početna stranica se učitava", `status ${res?.status()}`);
    return errors;
  }
  pass("Početna stranica se učitava", `status ${res.status()}`);

  const title = await page.locator(".platform-entry-title").textContent();
  if (title?.includes("Ulaz u Brzo i Lokalno platformu")) {
    pass("CTA naslov na vrhu");
  } else {
    fail("CTA naslov na vrhu", `dobijeno: ${title}`);
  }

  const btn = page.locator(".platform-entry-btn");
  const btnText = await btn.textContent();
  const href = await btn.getAttribute("href");
  if (btnText?.includes("Otvori Brzo i Lokalno")) {
    pass("CTA dugme tekst");
  } else {
    fail("CTA dugme tekst", btnText || "");
  }
  if (href === "/app/") {
    pass("CTA dugme vodi na /app/");
  } else {
    fail("CTA dugme href", href || "");
  }

  const swRegs = await page.evaluate(() =>
    navigator.serviceWorker?.getRegistrations?.().then((r) => r.length) ?? 0
  );
  if (swRegs === 0) {
    pass("Service worker ne registriran na početnoj");
  } else {
    fail("Service worker na početnoj", `${swRegs} registracija`);
  }

  const hero = await page.locator(".hero h1").count();
  if (hero > 0) {
    pass("Hero sekcija postoji ispod CTA");
  } else {
    fail("Hero sekcija");
  }

  const crashErrors = errors.filter(
    (e) => !e.includes("404") && !e.includes("favicon")
  );
  if (crashErrors.length === 0) {
    pass("Nema crash grešaka na početnoj");
  } else {
    fail("Console greške na početnoj", crashErrors.join("; "));
  }

  return errors;
}

async function testApp(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  });

  const res = await page.goto(`${BASE}/app/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  if (!res || !res.ok()) {
    fail("/app se učitava", `status ${res?.status()}`);
    return errors;
  }
  pass("/app se učitava", `status ${res.status()}`);

  await page.waitForSelector("#app-root .status-card, #app-root .app-shell", {
    timeout: 15000,
  });

  const maintenance = await page.locator(".status-card__title").textContent();
  const shell = await page.locator(".app-shell").count();

  if (shell === 0 && maintenance?.includes("Brzo i Lokalno")) {
    pass("/app prikazuje status ekran (maintenance ili prep)");
  } else if (shell > 0) {
    pass("/app prikazuje shell (app_public/web postoji i adminOnly)");
  } else {
    fail("/app UI", `maintenance=${maintenance}, shell=${shell}`);
  }

  const bodyText = await page.locator("#app-root").innerText();
  const hasMaintenanceMsg =
    bodyText.includes("Brzo i Lokalno Web je trenutno u pripremi") ||
    bodyText.includes("u pripremi") ||
    bodyText.includes("Konfiguracija platforme");

  if (shell === 0 && hasMaintenanceMsg) {
    pass("Maintenance/prep poruka vidljiva");
  } else if (shell > 0) {
    pass("Admin shell (dokument vjerovatno postoji u Firestore)");
  } else {
    fail("Očekivana maintenance/prep poruka");
  }

  const hasUsersFetch = errors.some((e) => e.includes("users"));
  if (!hasUsersFetch) {
    pass("Nema očiglednih users/works/jobs read grešaka");
  } else {
    fail("Neočekivani users read", errors.join("; "));
  }

  const crashErrors = errors.filter(
    (e) =>
      !e.includes("favicon") &&
      !e.includes("appId") &&
      !e.message?.includes("404")
  );
  const fatal = crashErrors.filter((e) => e.includes("pageerror"));
  if (fatal.length === 0) {
    pass("Nema pageerror crash na /app");
  } else {
    fail("Pageerror na /app", fatal.join("; "));
  }

  return errors;
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await testLanding(page);
    await testApp(page);
  } catch (error) {
    fail("Test runner", error.message);
  } finally {
    if (browser) await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log("\n---");
  console.log(`Ukupno: ${results.length}, PASS: ${results.length - failed.length}, FAIL: ${failed.length}`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main();
