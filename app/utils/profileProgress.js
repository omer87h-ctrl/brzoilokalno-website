/**
 * Profile completeness UI helpers — Android ProfilScreen / PregledProfilaScreen.
 */
import { profileAvatarUrl } from "../services/storageService.js";
import { hasDialablePhone, resolveContactPrefs } from "./contactPreferences.js";
import { isProfileVerified } from "./verified.js";

function isWorker(role) {
  return role === "majstor" || role === "kreator";
}

/**
 * Public profile „Na profilu nije navedeno“ — Android profilePublicMissingHints.
 * @returns {{ title: string, hints: string[] }}
 */
export function buildPublicProfileMissingHints(
  profile,
  { viewerRole = "", works = [], appStatus = "" } = {},
) {
  const viewerIsProvider = viewerRole === "majstor" || viewerRole === "kreator";
  const viewerIsKorisnik = viewerRole === "korisnik";
  if (!viewerIsProvider && !viewerIsKorisnik) {
    return { title: "", hints: [] };
  }

  const followable = isWorker(profile?.role) ? String(profile.role) : null;
  const title = followable
    ? "Na profilu nije navedeno"
    : "Na profilu korisnika nije navedeno";

  const city = String(profile?.city || "").trim();
  const contact = String(profile?.contactPhone || "").trim();
  const prefs = resolveContactPrefs(profile || {});
  const occupation = String(profile?.occupation || "").trim();
  const category = String(profile?.category || "").trim();
  const desc = String(profile?.description || "").trim();
  const hasAvatar = Boolean(profileAvatarUrl(profile));
  const worksPreview = Array.isArray(works) ? works : [];

  let contactAllowed = false;
  if (followable) {
    if (appStatus) {
      const st = String(appStatus).toLowerCase();
      contactAllowed = st === "accepted" || st === "completed";
    } else {
      contactAllowed = true;
    }
  }

  const hints = [];
  if (!followable && (viewerIsProvider || viewerIsKorisnik)) {
    if (!desc) hints.push("Nije upisana kratka napomena na profilu.");
    if (!city) hints.push("Grad nije naveden na profilu.");
    if (!contact) {
      hints.push("Telefon nije na profilu — dogovor preko Chata na Poslovima.");
    } else if (prefs.preferInAppChat) {
      hints.push("Ne objavljuje javni telefon — preferira chat u aplikaciji.");
    } else if (!contactAllowed) {
      hints.push("Kontakt na profilu tek nakon prihvaćene prijave.");
    } else if (!hasDialablePhone(contact)) {
      hints.push("Broj na profilu nije valjan za poziv ili WhatsApp.");
    } else if (!prefs.allowPhoneCall && !prefs.allowWhatsApp) {
      hints.push("Telefon je upisan, ali poziv i WhatsApp su isključeni.");
    }
    if (!hasAvatar) hints.push("Nema profilne slike.");
  } else if (followable) {
    if (!occupation && !category) {
      hints.push("Zanimanje / kategorija nisu navedeni.");
    }
    if (!desc) hints.push("Nema opisa (O meni).");
    if (!contact) hints.push("Kontakt telefon nije javan.");
    else if (prefs.preferInAppChat) {
      hints.push("Preferira chat — javni telefon nije ponuđen.");
    } else if (!prefs.allowPhoneCall && !prefs.allowWhatsApp) {
      hints.push("Telefon postoji, ali poziv i WhatsApp su isključeni.");
    }
    if (worksPreview.length === 0) hints.push("Nema javnih radova na profilu.");
    if (!hasAvatar) hints.push("Nema profilne slike.");
  }

  return { title, hints };
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
