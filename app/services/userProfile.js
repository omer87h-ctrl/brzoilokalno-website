import { doc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getDb } from "./firebaseService.js";
import { POLICY_VERSION } from "../constants/policy.js";

export function isProfileComplete(profile) {
  if (!profile) return false;
  if ((profile.role || "").trim()) return true;
  return (
    profile.acceptedTerms === true &&
    profile.acceptedPrivacyPolicy === true &&
    (profile.city || "").trim().length > 0
  );
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
  return payload;
}
