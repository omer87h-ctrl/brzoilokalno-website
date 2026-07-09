import { doc, getDoc, serverTimestamp, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuthInstance, getDb } from "./firebaseService.js";
import { POLICY_VERSION } from "../constants/policy.js";
import { syncPublicProfile } from "./publicProfile.js";

const FIELD_LIMITS = {
  id: 128,
  email: 320,
  displayName: 60,
  role: 20,
  city: 40,
  status: 32,
  description: 420,
  category: 64,
  occupation: 48,
  contactPhone: 24,
  photoUrl: 2048,
  policyVersion: 64,
};

function truncate(value, max) {
  return String(value || "").trim().slice(0, max);
}

export function isGmailEmail(email) {
  const domain = String(email || "").split("@")[1]?.toLowerCase() || "";
  return domain === "gmail.com" || domain === "googlemail.com";
}

export function isProfileComplete(profile) {
  if (!profile) return false;
  const role = (profile.role || "").trim();
  const city = (profile.city || "").trim();
  if (!role || !city) return false;
  return profile.acceptedTerms === true && profile.acceptedPrivacyPolicy === true;
}

function isTransientFirestoreError(error) {
  const msg = String(error?.message || error?.code || "");
  return /permission|credential|insufficient|unauthenticated|network|unavailable/i.test(msg);
}

function formatProfileSaveError(error) {
  const msg = String(error?.message || "");
  if (/app attestation|app check/i.test(msg)) {
    return new Error(
      "App Check nije podešen za web. U Firebase Console dodaj reCAPTCHA site key i debug token (localhost)."
    );
  }
  if (/permission/i.test(msg)) {
    return new Error("Server je odbio profil (Firestore pravila). Pokušaj ponovo.");
  }
  if (/credential|insufficient|unauthenticated/i.test(msg)) {
    return new Error(
      "Sesija nije spremna. Osvježi stranicu i pokušaj ponovo. Za @gmail.com koristi «Prijavi se s Googleom»."
    );
  }
  return error instanceof Error ? error : new Error(msg || "Spremanje profila nije uspjelo.");
}

export function buildRegistrationPayload(uid, data) {
  const role = data.role || "korisnik";
  return {
    id: truncate(uid, FIELD_LIMITS.id),
    email: truncate(data.email, FIELD_LIMITS.email),
    displayName: truncate(data.displayName, FIELD_LIMITS.displayName),
    role: truncate(role, FIELD_LIMITS.role),
    city: truncate(data.city, FIELD_LIMITS.city),
    status: role === "majstor" || role === "kreator" ? "slobodan" : "",
    description: "",
    category: truncate(data.category, FIELD_LIMITS.category),
    occupation: "",
    contactPhone: "",
    photoUrl: truncate(data.photoUrl, FIELD_LIMITS.photoUrl),
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
    policyVersion: POLICY_VERSION,
    ratingAverage: 0,
    ratingCount: 0,
    consentAcceptedAt: serverTimestamp(),
  };
}

async function verifyProfileOnServer(uid, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
    }
    const snap = await getDoc(doc(getDb(), "users", uid));
    if (isProfileComplete(snap.data())) return snap.data();
  }
  throw new Error("Profil nije potvrđen na serveru. Provjeri internet i pokušaj ponovo.");
}

export async function createUserProfile(uid, data) {
  const user = getAuthInstance().currentUser;
  if (!user || user.uid !== uid) {
    throw new Error("Korisnik nije prijavljen.");
  }

  const payload = buildRegistrationPayload(uid, data);
  const userRef = doc(getDb(), "users", uid);
  let lastError = null;

  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 450 * attempt));
    }
    try {
      await user.getIdToken(true);
      const existing = await getDoc(userRef);
      if (existing.exists() && !isProfileComplete(existing.data())) {
        await deleteDoc(userRef);
      }
      await setDoc(userRef, payload);
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      if (attempt + 1 >= 4 || !isTransientFirestoreError(error)) {
        throw formatProfileSaveError(error);
      }
    }
  }

  if (lastError) throw formatProfileSaveError(lastError);

  await verifyProfileOnServer(uid);

  try {
    await syncPublicProfile(uid, payload);
  } catch (error) {
    console.warn("public_profiles sync failed after profile create:", error);
  }
  return payload;
}
