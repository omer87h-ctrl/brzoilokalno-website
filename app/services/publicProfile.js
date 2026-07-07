import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getDb } from "./firebaseService.js";

/** Javni profil — bez emaila, tokena i privatnih polja naloga. */
export function toPublicProfile(uid, data = {}) {
  const id = uid || data.id || "";
  return {
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
    profileVerified: data.profileVerified === true,
    preferInAppChat: data.preferInAppChat === true,
    allowPhoneCall: data.allowPhoneCall !== false,
    allowWhatsApp: data.allowWhatsApp !== false,
    ratingAverage: Number(data.ratingAverage) || 0,
    ratingCount: Number(data.ratingCount) || 0,
  };
}

export async function syncPublicProfile(uid, userData) {
  if (!uid) return;
  const payload = toPublicProfile(uid, userData);
  await setDoc(doc(getDb(), "public_profiles", uid), payload, { merge: true });
}

export function publicProfilesCollection() {
  return "public_profiles";
}
