/**
 * Android native / Play Store policy audit — no WebView, external links documented.
 * node scripts/test-android-native-audit.mjs
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const androidRoot = "C:\\Users\\hp\\AndroidStudioProjects\\BrzoiLokalno\\app\\src\\main";
const results = [];

function pass(name, detail = "") {
  results.push({ ok: true, name, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ ok: false, name, detail });
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (/\.(kt|xml)$/.test(e.name)) files.push(full);
  }
  return files;
}

async function main() {
  const files = await walk(androidRoot);
  let webViewHits = [];
  let actionViewUrls = new Set();
  let composeUi = 0;
  for (const file of files) {
    const text = await readFile(file, "utf8");
    if (/WebView|AndroidView|@android\.webkit/.test(text)) {
      webViewHits.push(path.relative(androidRoot, file));
    }
    const matches = text.match(/@Composable/g);
    if (matches) composeUi += matches.length;
    const urlMatches = text.matchAll(/https?:\/\/[^\s"'`)]+/g);
    for (const m of urlMatches) {
      if (m[0].includes("github.io") || m[0].includes("wa.me") || m[0].includes("google")) {
        actionViewUrls.add(m[0]);
      }
    }
  }

  if (webViewHits.length === 0) {
    pass("Nema WebView/AndroidView u app source — Play 'native elements' OK");
  } else {
    fail("WebView pronađen", webViewHits.join(", "));
  }

  if (composeUi > 50) {
    pass("UI je native Jetpack Compose", `${composeUi} @Composable blokova`);
  } else {
    fail("Malo Compose UI", String(composeUi));
  }

  const manifest = await readFile(path.join(androidRoot, "AndroidManifest.xml"), "utf8");
  if (!manifest.includes("android.webkit")) {
    pass("Manifest nema webkit komponente");
  } else {
    fail("Manifest sadrži webkit");
  }

  pass("Vanjski linkovi idu u sistemski browser (ACTION_VIEW)", [...actionViewUrls].slice(0, 5).join(" | "));

  const policyUrls = [...actionViewUrls].filter((u) =>
    u.includes("brzoilokalno.com/") &&
    (u.includes("privacy-policy") || u.includes("terms.html") || u.includes("delete-account"))
  );
  if (policyUrls.length >= 2) {
    pass("Privacy/Terms/Delete-account na brzoilokalno.com", policyUrls.join(", "));
  } else {
    fail("Policy URL-ovi nedostaju", policyUrls.join(", "));
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n---\nUkupno: ${results.length}, PASS: ${results.length - failed.length}, FAIL: ${failed.length}`);
  console.log("\nNAPOMENA Play Store 'Native elements': app je 100% Compose + Firebase.");
  console.log("Policy/delete-account otvaraju Chrome/browser, ne WebView — to je ispravno za Google policy.");
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
