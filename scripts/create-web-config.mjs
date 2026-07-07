/**
 * Lokalni admin setup — kreira ili ažurira app_public/web u Firestoreu.
 * NE pokretati iz /app klijenta. NE commitati serviceAccountKey.json.
 *
 * Prije pokretanja:
 *   npm install
 *   Preuzmi service account JSON iz Firebase Console i spremi kao serviceAccountKey.json (repo root)
 *   ili postavi GOOGLE_APPLICATION_CREDENTIALS na putanju do ključa.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PROJECT_ID = "brzoilokalno-268a5";

const WEB_CONFIG = {
  enabled: true,
  adminOnly: false,
  chatEnabled: false,
  maintenanceMessage: "Brzo i Lokalno Web je trenutno u pripremi.",
  ...(process.env.WEATHER_API_KEY
    ? { weatherApiKey: String(process.env.WEATHER_API_KEY).trim() }
    : {}),
};

function resolveCredentialsPath() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  }

  const localKey = resolve(ROOT, "serviceAccountKey.json");
  if (existsSync(localKey)) {
    return localKey;
  }

  throw new Error(
    [
      "Service account key nije pronađen.",
      "Opcija 1: spremi Firebase service account JSON kao serviceAccountKey.json u root repoa.",
      "Opcija 2: postavi env GOOGLE_APPLICATION_CREDENTIALS na putanju do JSON fajla.",
      "NE commitaj ključ u git.",
    ].join("\n")
  );
}

function loadServiceAccount(filePath) {
  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const credentialsPath = resolveCredentialsPath();
  const serviceAccount = loadServiceAccount(credentialsPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id || PROJECT_ID,
  });

  const db = admin.firestore();
  const ref = db.collection("app_public").doc("web");

  await ref.set(WEB_CONFIG, { merge: true });

  const snap = await ref.get();
  console.log("app_public/web kreiran ili ažuriran:");
  console.log(JSON.stringify(snap.data(), null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
