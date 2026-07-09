/**
 * Web app code audit — routes, services, Firestore writes, delete account.
 * node scripts/test-phase2-web-audit.mjs
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const webRoot = path.resolve(import.meta.dirname, "..", "app");
const results = [];

function pass(name, detail = "") {
  results.push({ ok: true, name, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ ok: false, name, detail });
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function read(rel) {
  return readFile(path.join(webRoot, rel), "utf8");
}

async function main() {
  const appJs = await read("app.js");
  const routeJs = await read("utils/route.js");
  const writesJs = await read("services/firestoreWrites.js");
  const storageJs = await read("services/storageService.js");
  const postavkeJs = await read("views/postavke.js");

  const routeChecks = [
    ["login", 'route.name === "login"'],
    ["register", 'route.name === "register"'],
    ["onboarding", "renderOnboarding"],
    ["home", 'route.name === "home"'],
    ["kategorije", 'route.name === "kategorije"'],
    ["brzo", 'route.name === "brzo"'],
    ["lista", 'route.name === "lista"'],
    ["pretraga", 'route.name === "pretraga"'],
    ["kalkulator", 'route.name === "kalkulator"'],
    ["poslovi", 'route.name === "poslovi"'],
    ["ponude", 'name === "ponude"'],
    ["ponuda", 'route.name === "ponuda"'],
    ["posao", 'route.name === "posao"'],
    ["radovi", 'route.name === "radovi"'],
    ["rad", 'route.name === "rad"'],
    ["prijave", 'route.name === "prijave"'],
    ["chat", 'route.name === "chat"'],
    ["profil", 'route.name === "profil"'],
    ["pregled", 'route.name === "pregled"'],
    ["obavijesti", 'route.name === "obavijesti"'],
    ["postavke", 'route.name === "postavke"'],
    ["postavke-blokirani", 'route.name === "postavke-blokirani"'],
    ["biljeske", 'route.name === "biljeske"'],
    ["postavke-izgled", 'route.name === "postavke-izgled"'],
    ["postavke-privatnost", 'route.name === "postavke-privatnost"'],
    ["postavke-admin", 'route.name === "postavke-admin"'],
  ];

  for (const [route, needle] of routeChecks) {
    if (appJs.includes(needle) || routeJs.includes(needle)) {
      pass(`Ruta ${route} pokrivena`);
    } else {
      fail(`Ruta ${route} nije pokrivena`);
    }
  }

  const writeCollections = [
    "users", "public_profiles", "jobs", "offers", "works", "applications",
    "messages", "notifications", "reports", "blocked_users", "home_master_tips",
    "verification_requests", "fast_match_feedback", "banned_users",
  ];
  for (const col of writeCollections) {
    if (writesJs.includes(`"${col}"`) || writesJs.includes(`'${col}'`)) {
      pass(`firestoreWrites pokriva ${col}`);
    } else {
      fail(`firestoreWrites nema ${col}`);
    }
  }

  if (writesJs.includes("deleteAccountData") && appJs.includes("deleteAccountData")) {
    pass("Brisanje računa: deleteAccountData u app + firestoreWrites");
  } else {
    fail("Brisanje računa nije kompletno");
  }

  if (storageJs.includes("profiles/") && storageJs.includes("works/")) {
    pass("Storage upload: profiles + works putanje");
  } else {
    fail("Storage service nema profiles/works");
  }

  if (postavkeJs.includes("OBRIŠI") || postavkeJs.includes("Obriši")) {
    pass("Postavke: UI za brisanje računa");
  } else {
    fail("Postavke: nema delete UI");
  }

  if (appJs.includes("renderMaintenance") && appJs.includes("chatEnabled")) {
    pass("Kill switch + chatEnabled gate u app.js");
  } else {
    fail("Kill switch/chat gate");
  }

  const viewFiles = await readdir(path.join(webRoot, "views"));
  const expectedViews = [
    "login.js", "register.js", "chat.js", "poslovi.js", "posao.js", "prijave.js",
    "profil.js", "postavke.js", "blockedUsers.js", "adminModeration.js", "maintenance.js",
  ];
  for (const v of expectedViews) {
    if (viewFiles.includes(v)) pass(`View postoji: ${v}`);
    else fail(`View nedostaje: ${v}`);
  }

  if (!appJs.includes("WebView")) pass("Web app nema WebView (PWA native JS)");
  else fail("Web app sadrži WebView referencu");

  const failed = results.filter((r) => !r.ok);
  console.log(`\n---\nUkupno: ${results.length}, PASS: ${results.length - failed.length}, FAIL: ${failed.length}`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
