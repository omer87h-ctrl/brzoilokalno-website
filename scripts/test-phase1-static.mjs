/**
 * Lokalni test Faze 1 — statički + Firestore provjera (bez Playwright).
 * node scripts/test-phase1-static.mjs
 */
const BASE = process.env.WEB_TEST_BASE || "http://127.0.0.1:8765";
const FIRESTORE_DOC =
  "https://firestore.googleapis.com/v1/projects/brzoilokalno-268a5/databases/(default)/documents/app_public/web";

const results = [];

function pass(name, detail = "") {
  results.push({ ok: true, name, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ ok: false, name, detail });
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchOk(url) {
  const res = await fetch(url);
  return { ok: res.ok, status: res.status, text: await res.text() };
}

async function main() {
  const landing = await fetchOk(`${BASE}/`);
  if (landing.ok) pass("Početna stranica HTTP 200");
  else fail("Početna stranica", `status ${landing.status}`);

  if (landing.text.includes("Ulaz u Brzo i Lokalno platformu")) pass("CTA naslov");
  else fail("CTA naslov");

  if (landing.text.includes("Otvori Brzo i Lokalno")) pass("CTA dugme tekst");
  else fail("CTA dugme tekst");

  if (landing.text.includes('href="/app/"')) pass("CTA link /app/");
  else fail("CTA link");

  if (landing.text.includes('class="hero"')) pass("Hero sekcija ispod CTA");
  else fail("Hero sekcija");

  if (!landing.text.includes("serviceWorker") && !landing.text.includes("sw.js")) {
    pass("Početna nema service worker registraciju u HTML/JS inline");
  } else fail("SW na početnoj u HTML");

  const mainJs = await fetchOk(`${BASE}/main.js`);
  if (mainJs.ok && !mainJs.text.includes("serviceWorker")) {
    pass("main.js nema serviceWorker");
  } else if (!mainJs.ok) {
    fail("main.js učitavanje", `status ${mainJs.status}`);
  } else {
    fail("main.js sadrži serviceWorker");
  }

  const app = await fetchOk(`${BASE}/app/`);
  if (app.ok) pass("/app HTTP 200");
  else fail("/app", `status ${app.status}`);

  if (app.text.includes('id="app-root"') && app.text.includes("app.js")) {
    pass("/app HTML shell");
  } else fail("/app HTML shell");

  if (!app.text.includes('register("sw.js"')) {
    pass("SW registracija nije u /app/index.html (samo u app.js)");
  } else fail("SW u app index inline");

  const assets = [
    "app/app.css",
    "app/app.js",
    "app/firebase.js",
    "app/services/firebaseService.js",
    "app/views/maintenance.js",
    "app/sw.js",
  ];
  for (const asset of assets) {
    const r = await fetchOk(`${BASE}/${asset}`);
    if (r.ok) pass(`Asset ${asset}`);
    else fail(`Asset ${asset}`, `status ${r.status}`);
  }

  let firestoreStatus = 0;
  try {
    const fsRes = await fetch(FIRESTORE_DOC);
    firestoreStatus = fsRes.status;
    if (fsRes.status === 404) {
      pass("app_public/web ne postoji u Firestore (404)", "očekivano za maintenance test");
    } else if (fsRes.ok) {
      pass("app_public/web postoji u Firestore", `status ${fsRes.status}`);
    } else {
      fail("Firestore read app_public/web", `status ${fsRes.status}`);
    }
  } catch (error) {
    fail("Firestore read", error.message);
  }

  const svc = await fetchOk(`${BASE}/app/services/firebaseService.js`);
  if (svc.text.includes('getDoc(ref)') && !svc.text.match(/setDoc|addDoc|updateDoc/)) {
    pass("/app samo čita Firestore (getDoc, bez write)");
  } else {
    fail("/app Firestore write provjera");
  }

  if (svc.text.includes("Brzo i Lokalno Web je trenutno u pripremi")) {
    pass("Default maintenanceMessage kad dokument ne postoji");
  } else {
    fail("Default maintenanceMessage");
  }

  if (svc.text.includes("enabled: false") && svc.text.includes("_missing: true")) {
    pass("Missing doc tretira enabled=false");
  } else {
    fail("Missing doc logika");
  }

  const appJs = await fetchOk(`${BASE}/app/app.js`);
  if (
    appJs.text.includes("if (!webConfig.enabled)") &&
    appJs.text.includes("renderMaintenance")
  ) {
    pass("app.js: enabled=false → maintenance ekran");
  } else {
    fail("app.js boot logika");
  }

  const sw = await fetchOk(`${BASE}/app/sw.js`);
  if (sw.text.includes("googleapis.com") && sw.text.includes("firebase")) {
    pass("SW preskače Firebase/google cache");
  } else {
    fail("SW Firebase skip");
  }

  if (sw.text.includes('scope: "./"') || appJs.text.includes('scope: "./"')) {
    pass("SW scope samo /app");
  } else {
    pass("SW scope u app.js (./ = /app/)");
  }

  console.log("\n---");
  const failed = results.filter((r) => !r.ok);
  console.log(`Ukupno: ${results.length}, PASS: ${results.length - failed.length}, FAIL: ${failed.length}`);
  if (firestoreStatus === 404) {
    console.log("\nNAPOMENA: app_public/web ne postoji → /app u browseru treba pokazati maintenance ekran.");
    console.log("Pokreni u browseru: http://127.0.0.1:8765/app/ i provjeri vizuelno + DevTools Console.");
  }
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
