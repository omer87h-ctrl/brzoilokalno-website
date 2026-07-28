import {
  deleteField,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getDb } from "./firebaseService.js";

/** Polja koja klijent ne smije imati na public_profiles (rules + privatnost). */
const FORBIDDEN_PUBLIC_PROFILE_FIELDS = [
  "email",
  "fcmToken",
  "acceptedTerms",
  "acceptedPrivacyPolicy",
  "policyVersion",
  "businessDeclarationVersion",
  "businessDeclarationAcceptedAt",
  "consentAcceptedAt",
];

/** Javni profil — bez emaila, tokena i privatnih polja naloga. */
export function toPublicProfile(uid, data = {}, { forClientWrite = true } = {}) {
  const id = uid || data.id || "";
  const profile = {
    id,
    displayName: String(data.displayName || "").trim(),
    role: String(data.role || "").trim(),
    city: String(data.city || "").trim(),
    status: String(data.status || "").trim(),
    category: String(data.category || "").trim(),
    occupation: String(data.occupation || "").trim(),
    description: String(data.description || "").trim(),
    contactPhone: String(data.contactPhone || "").trim(),
    photoUrl: String(data.photoUrl || "").trim(),
    profileImageUrlThumb: String(data.profileImageUrlThumb || "").trim(),
    profileImageUrlFull: String(data.profileImageUrlFull || "").trim(),
    profileImageVersionMs: Number(data.profileImageVersionMs) || 0,
    preferInAppChat: data.preferInAppChat === true,
    allowPhoneCall: data.allowPhoneCall !== false,
    allowWhatsApp: data.allowWhatsApp !== false,
  };

  const representationType = String(data.representationType || "").trim();
  if (representationType === "individual") {
    profile.representationType = "individual";
    if (forClientWrite) {
      profile.businessType = deleteField();
      profile.businessName = deleteField();
      profile.businessMunicipality = deleteField();
    }
  } else if (representationType === "business") {
    profile.representationType = "business";
    profile.businessType = String(data.businessType || "").trim();
    profile.businessName = String(data.businessName || "").trim();
    profile.businessMunicipality = String(data.businessMunicipality || "").trim();
  }

  if (!forClientWrite) {
    profile.profileVerified = data.profileVerified === true;
    profile.ratingAverage = Number(data.ratingAverage) || 0;
    profile.ratingCount = Number(data.ratingCount) || 0;
  }

  return profile;
}

export async function syncPublicProfile(uid, userData) {
  if (!uid) return;
  const payload = toPublicProfile(uid, userData, { forClientWrite: true });
  for (const key of FORBIDDEN_PUBLIC_PROFILE_FIELDS) {
    payload[key] = deleteField();
  }
  await setDoc(doc(getDb(), "public_profiles", uid), payload, { merge: true });
}

export function publicProfilesCollection() {
  return "public_profiles";
}
