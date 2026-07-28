/**
 * Contact display rules — same fields/logic as Android ContactPreferences.kt.
 * users/{uid}: contactPhone, allowPhoneCall, allowWhatsApp, preferInAppChat.
 */

export function hasDialablePhone(phone = "") {
  return String(phone || "").replace(/\D/g, "").length >= 6;
}

export function dialablePhone(phone = "") {
  return String(phone || "").replace(/[^\d+]/g, "");
}

/** WhatsApp wa.me number (Balkan-friendly), same idea as Android normalizeForWhatsApp. */
export function normalizeForWhatsApp(phone = "") {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  const codes = ["387", "385", "381", "382", "386", "389"];
  for (const code of codes) {
    if (digits.startsWith(code)) {
      let rest = digits.slice(code.length);
      if (rest.startsWith("0")) rest = rest.slice(1);
      return code + rest;
    }
  }
  if (digits.startsWith("0")) {
    const local = digits.slice(1);
    const country = digits.startsWith("09") || digits.startsWith("08") ? "385" : "387";
    return country + local;
  }
  return digits;
}

export function resolveContactPrefs(user = {}) {
  const phone = String(user?.contactPhone || "").trim();
  const preferInAppChat = user?.preferInAppChat === true;
  const allowCallRaw =
    typeof user?.allowPhoneCall === "boolean" ? user.allowPhoneCall : phone.length > 0 && !preferInAppChat;
  const allowWaRaw =
    typeof user?.allowWhatsApp === "boolean" ? user.allowWhatsApp : phone.length > 0 && !preferInAppChat;
  const dialable = hasDialablePhone(phone);
  return {
    phone,
    preferInAppChat,
    hasPhone: phone.length > 0 && dialable,
    allowPhoneCall: allowCallRaw && dialable && !preferInAppChat,
    allowWhatsApp: allowWaRaw && dialable && !preferInAppChat,
  };
}

export function ownProfileContactSummary(prefs) {
  if (!prefs.hasPhone && prefs.preferInAppChat) {
    return "Bez broja na profilu — dogovor preko Chata na Poslovima.";
  }
  if (prefs.preferInAppChat) {
    return "Broj je na profilu, ali javno ne nudiš poziv ni WhatsApp — samo Chat u appu.";
  }
  if (prefs.hasPhone && prefs.allowPhoneCall && prefs.allowWhatsApp) {
    return "Javno: poziv i WhatsApp (kad smiješ vidjeti profil).";
  }
  if (prefs.hasPhone && prefs.allowPhoneCall) {
    return "Javno: samo poziv (WhatsApp isključen).";
  }
  if (prefs.hasPhone && prefs.allowWhatsApp) {
    return "Javno: samo WhatsApp (poziv isključen).";
  }
  if (prefs.hasPhone) {
    return "Broj upisan, ali poziv i WhatsApp su isključeni — koristi Chat.";
  }
  return "Nema broja — majstori te kontaktiraju preko Chata nakon prijave.";
}

/**
 * Android publicContactVisible + viewerMaySeePhone:
 * - target korisnik → never
 * - majstor/kreator browse → yes if prefs allow
 * - from job → only when application accepted/completed (optional appStatus)
 */
export function publicContactVisible(prefs, { viewerRole = "", targetRole = "", appStatus = "" } = {}) {
  const targetIsWorker = targetRole === "majstor" || targetRole === "kreator";
  if (!targetIsWorker) return false;
  if (!prefs.hasPhone || prefs.preferInAppChat) return false;
  if (appStatus) {
    const st = String(appStatus).toLowerCase();
    if (st !== "accepted" && st !== "completed") return false;
  }
  // Same as Android free browse for workers/clients viewing provider profiles.
  void viewerRole;
  return true;
}
