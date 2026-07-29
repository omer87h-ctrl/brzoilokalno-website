/**
 * Own-profile „Napredak profila“ — same checks as Android ProfilScreen
 * (OtherScreens.kt missingForVerification / verificationPoints).
 */
import { profileAvatarUrl } from "../services/storageService.js";
import { hasDialablePhone, resolveContactPrefs } from "./contactPreferences.js";
import { isProfileVerified } from "./verified.js";

function isWorker(role) {
  return role === "majstor" || role === "kreator";
}

export function buildOwnProfileProgress(user, { dashboard = null, works = [] } = {}) {
  const role = String(user?.role || "korisnik");
  const isKorisnik = role === "korisnik";
  const worker = isWorker(role);
  const verified = isProfileVerified(user);
  const city = String(user?.city || "").trim();
  const description = String(user?.description || "").trim();
  const hasCity = city.length > 0;
  const hasDescription = description.length >= 10;
  const hasImage = Boolean(profileAvatarUrl(user));
  const prefs = resolveContactPrefs(user);
  const preferInAppChat = prefs.preferInAppChat === true;
  const hasContactOk = prefs.hasPhone || preferInAppChat;
  const hasRepresentation =
    user?.representationType === "individual" || user?.representationType === "business";

  const published = Number(dashboard?.publishedJobs) || 0;
  const accepted = Number(dashboard?.acceptedOpen) || 0;
  const finished = Number(dashboard?.finishedJobs) || 0;
  const dashReady = dashboard != null;

  let points = 0;
  if (isKorisnik) {
    points =
      (hasImage ? 30 : 0) +
      (hasDescription ? 25 : 0) +
      (hasCity ? 20 : 0) +
      (hasContactOk ? 25 : 0);
  } else if (worker) {
    points =
      Math.min(published, 4) * 15 +
      Math.min(accepted, 3) * 20 +
      Math.min(finished, 2) * 20 +
      (hasImage ? 15 : 0) +
      (hasDescription ? 5 : 0);
  }
  points = Math.max(0, Math.min(100, points));

  const missing = [];
  if (isKorisnik) {
    if (!hasCity) missing.push("Dodaj grad");
    if (!hasDescription) missing.push("Upiši kratku napomenu");
    if (!hasImage) missing.push("Dodaj profilnu sliku");
    if (!preferInAppChat && !hasDialablePhone(prefs.phone)) {
      missing.push("Dodaj kontakt broj ili uključi samo chat");
    }
    if (!hasRepresentation) missing.push("Dopunite način predstavljanja");
  } else if (worker && dashReady) {
    if (published < 4) missing.push(`Još ${4 - published} objavljena posla`);
    if (accepted < 3) missing.push(`Još ${3 - accepted} prihvaćena posla`);
    if (finished < 2) missing.push(`Još ${2 - finished} završena posla`);
    if (!hasImage) missing.push("Dodaj profilnu sliku");
    if (!hasDescription) missing.push("Upiši kratak opis o sebi");
    if (!hasRepresentation) missing.push("Dopunite način predstavljanja");
  } else if (worker && !dashReady) {
    if (!hasImage) missing.push("Dodaj profilnu sliku");
    if (!hasDescription) missing.push("Upiši kratak opis o sebi");
    if (!hasRepresentation) missing.push("Dopunite način predstavljanja");
  }

  const worksEmpty = worker && (!Array.isArray(works) || works.length === 0);

  let headline = "Napredak profila";
  if (verified) headline = "Profil je provjeren";

  let hint;
  if (!dashReady && worker) {
    hint = "Učitavam aktivnost profila…";
  } else if (verified) {
    hint = "Nastavi s radovima i brzim odgovorima.";
  } else if (worksEmpty) {
    hint = "Dodaj radove za veću vidljivost.";
  } else if (missing.length > 0) {
    hint = missing[0];
  } else if (worker) {
    hint = "Pošalji zahtjev za provjeru u Postavkama kad bude spremno.";
  } else if (isKorisnik) {
    hint = "Profil je spreman — pošalji zahtjev za provjeru u Postavkama.";
  } else {
    hint = "Održavaj aktivnost i komunikaciju s korisnicima.";
  }

  return {
    headline,
    hint,
    missing,
    progress: points / 100,
    points,
    verified,
    showProgress: !verified && (isKorisnik || dashReady),
  };
}
