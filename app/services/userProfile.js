import { doc, getDoc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getDb } from "./firebaseService.js";
import { POLICY_VERSION } from "../constants/policy.js";
import { syncPublicProfile } from "./publicProfile.js";

export function isProfileComplete(profile) {
  if (!profile) return false;
  const role = (profile.role || "").trim();
  const city = (profile.city || "").trim();
  if (!role || !city) return false;
  return profile.acceptedTerms === true && profile.acceptedPrivacyPolicy === true;
}

export async function createUserProfile(uid, data) {
  const role = data.role || "korisnik";
  const payload = {
    id: uid,
    email: (data.email || "").trim(),
    displayName: (data.displayName || "").trim(),
    role,
    city: (data.city || "").trim(),
    status: role === "majstor" || role === "kreator" ? "slobodan" : "",
    description: "",
    category: (data.category || "").trim(),
    occupation: "",
    contactPhone: "",
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
    policyVersion: POLICY_VERSION,
    ratingAverage: 0,
    ratingCount: 0,
    consentAcceptedAt: serverTimestamp(),
  };

  await setDoc(doc(getDb(), "users", uid), payload);
  try {
    await syncPublicProfile(uid, payload);
  } catch (error) {
    console.warn("public_profiles sync failed after profile create:", error);
  }
  return payload;
}
