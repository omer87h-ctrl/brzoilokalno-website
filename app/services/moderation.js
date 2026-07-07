import { fetchModerationConfig } from "./firestoreReads.js";

const DEFAULT_BANNED = [
  "porn",
  "porno",
  "seks",
  "kurv",
  "kurac",
  "pičk",
  "jeb",
  "picka",
  "kurva",
  "zaradi brzo",
  "brzi novac",
  "whatsapp grupa",
  "telegram grupa",
  "mlm",
  "kripto zarada",
  "investicija garant",
  "100% profit",
  "besplatni novac",
  "ubij",
  "smrt",
  "nacist",
];

let bannedWords = [...DEFAULT_BANNED];

export async function refreshModerationFromFirestore() {
  try {
    const remote = await fetchModerationConfig();
    if (remote?.length) {
      bannedWords = remote.map((w) => String(w).trim().toLowerCase()).filter(Boolean);
    }
  } catch (_) {
    /* keep defaults */
  }
}

export function findContentViolation(...fields) {
  const combined = fields
    .map((f) => String(f || "").trim())
    .join(" ")
    .toLowerCase();
  if (!combined) return null;
  for (const word of bannedWords) {
    if (word && combined.includes(word)) return word;
  }
  return null;
}

export function violationMessage(fieldLabel, matched) {
  return `${fieldLabel} sadrži neprimjereni sadržaj. Ukloni "${matched}" i pokušaj ponovo.`;
}
