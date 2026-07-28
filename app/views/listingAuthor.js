import { escapeHtml, displayName } from "../utils/format.js";
import { profileAvatarUrl } from "../services/storageService.js";
import { isProfileVerified } from "../utils/verified.js";
import { resolveFollowableRole } from "../utils/follow.js";
import { renderVerifiedSuffix } from "./verifiedBadge.js";

function formatRoleLabel(role) {
  const r = String(role || "").trim().toLowerCase();
  if (!r) return "";
  if (r === "majstor") return "Majstor";
  if (r === "kreator") return "Kreator";
  if (r === "korisnik") return "Korisnik";
  return r.charAt(0).toUpperCase() + r.slice(1);
}

/** Ista logika kao Android listingOwnerAvatarUrl / resolveJobOwnerAvatarUrl. */
export function resolveListingAuthor(item, ownerProfile = null) {
  // Preferiraj živo ime s public_profiles (kao Android PublicProfileCache).
  const liveName = ownerProfile ? displayName(ownerProfile) : "";
  const name =
    (liveName && liveName !== "Korisnik" ? liveName : "") ||
    String(item?.authorName || item?.displayName || item?.ownerDisplayName || "").trim() ||
    liveName ||
    "Nepoznat korisnik";

  const role = String(ownerProfile?.role || item?.authorRole || item?.ownerRole || "").trim();

  const avatarSource = {
    profileImageUrlThumb:
      item?.profileImageUrlThumb ||
      item?.ownerProfileImageUrlThumb ||
      item?.userProfileImageUrlThumb ||
      ownerProfile?.profileImageUrlThumb ||
      "",
    profileImageUrlFull: ownerProfile?.profileImageUrlFull || "",
    profileImageVersionMs:
      item?.profileImageVersionMs ||
      item?.ownerProfileImageVersionMs ||
      item?.userProfileImageVersionMs ||
      ownerProfile?.profileImageVersionMs ||
      0,
  };

  const verifiedEntity = {
    profileVerified: item?.profileVerified,
    ownerProfileVerified: item?.ownerProfileVerified,
    authorProfileVerified: item?.authorProfileVerified,
    workerProfileVerified: item?.workerProfileVerified,
    ...(ownerProfile || {}),
  };

  return {
    name,
    role,
    roleLabel: formatRoleLabel(role),
    avatarUrl: profileAvatarUrl(avatarSource),
    verifiedEntity,
    verified: isProfileVerified(verifiedEntity),
  };
}

export function renderMiniAvatar(name, imageUrl) {
  const initial = escapeHtml(String(name || "K").trim().charAt(0).toUpperCase() || "K");
  const img = imageUrl
    ? `<img class="listing-avatar__img" src="${escapeHtml(imageUrl)}" alt="" loading="lazy" />`
    : "";
  return `<div class="listing-avatar" aria-hidden="true">${img}<span class="listing-avatar__initial">${initial}</span></div>`;
}

export function renderListingAuthorLine(name, verifiedEntity) {
  return `<p class="listing-author__line">Objavio: <span class="listing-author__name">${escapeHtml(name)}</span>${renderVerifiedSuffix(verifiedEntity)}</p>`;
}

/** Zaglavlje kartice — avatar, naslov, objavio, uloga (kao Android JobCard). */
export function renderListingAuthorHeader({ title, item, ownerProfile = null, city = "" }) {
  const { name, roleLabel, avatarUrl, verifiedEntity } = resolveListingAuthor(item, ownerProfile);
  const cityChip = city
    ? `<span class="job-card__city-chip">${escapeHtml(city)}</span>`
    : "";
  const roleLine = roleLabel
    ? `<p class="listing-author__role">${escapeHtml(roleLabel)}</p>`
    : "";

  return `
    <div class="job-card__author-row">
      ${renderMiniAvatar(name, avatarUrl)}
      <div class="job-card__author-main">
        <h3 class="job-card__title">${escapeHtml(title)}</h3>
        ${renderListingAuthorLine(name, verifiedEntity)}
        ${roleLine}
      </div>
      ${cityChip}
    </div>`;
}

/**
 * Ko smije otvoriti profil autora oglasa — ista logika kao Android JobCard:
 * - majstor/kreator vlasnik → "Pogledaj profil" (svima)
 * - korisnik vlasnik → "Profil korisnika" samo majstoru/kreatoru
 * - korisnik → korisnik → bez dugmeta
 * - vlastiti oglas → bez dugmeta
 */
export function listingOwnerProfileCta({
  item = null,
  ownerProfile = null,
  currentUid = "",
  viewerRole = "",
  context = "job",
} = {}) {
  const ownerUid = String(item?.userId || item?.ownerId || item?.authorUid || "").trim();
  if (!ownerUid) return "";
  if (currentUid && ownerUid === currentUid) return "";

  const ownerRoleSource = ownerProfile || {
    role: item?.authorRole || item?.ownerRole || item?.role || "",
  };
  const ownerFollowable = resolveFollowableRole(ownerRoleSource);
  const viewerIsWorker =
    String(viewerRole || "").trim().toLowerCase() === "majstor" ||
    String(viewerRole || "").trim().toLowerCase() === "kreator";

  // Ponude su showcase majstora/kreatora — uvijek profil (kao Android).
  if (context === "offer") {
    return `<a class="btn btn--ghost btn--block" href="#/pregled/${escapeHtml(ownerUid)}">Pogledaj profil</a>`;
  }

  if (ownerFollowable) {
    return `<a class="btn btn--ghost btn--block" href="#/pregled/${escapeHtml(ownerUid)}">Pogledaj profil</a>`;
  }

  // Vlasnik je korisnik (nije majstor/kreator).
  if (viewerIsWorker) {
    return `<a class="btn btn--ghost btn--block" href="#/pregled/${escapeHtml(ownerUid)}">Profil korisnika</a>`;
  }

  // Korisnik ne gleda profil drugog korisnika s posla.
  return "";
}

/** Detalj ekran — avatar + objavio blok. */
export function renderListingAuthorDetail({
  item,
  ownerProfile = null,
  currentUid = "",
  viewerRole = "",
  context = "job",
} = {}) {
  const { name, roleLabel, avatarUrl, verifiedEntity } = resolveListingAuthor(item, ownerProfile);
  const roleLine = roleLabel
    ? `<p class="listing-author__role">${escapeHtml(roleLabel)}</p>`
    : "";
  const profileLink = listingOwnerProfileCta({
    item,
    ownerProfile,
    currentUid,
    viewerRole,
    context,
  });

  return `
    <div class="listing-author-detail">
      ${renderMiniAvatar(name, avatarUrl)}
      <div class="listing-author-detail__body">
        ${renderListingAuthorLine(name, verifiedEntity)}
        ${roleLine}
        ${profileLink}
      </div>
    </div>`;
}

/** Soft gate za direktan #/pregled — korisnik ne otvara tuđi korisnički profil. */
export function canOpenPublicProfile({ viewerUid = "", viewerRole = "", targetProfile = null } = {}) {
  if (!targetProfile) return false;
  const targetUid = String(targetProfile.id || targetProfile.uid || "").trim();
  if (!targetUid) return false;
  if (viewerUid && targetUid === viewerUid) return true;
  const followable = resolveFollowableRole(targetProfile);
  if (followable) return true;
  const viewerIsWorker =
    String(viewerRole || "").trim().toLowerCase() === "majstor" ||
    String(viewerRole || "").trim().toLowerCase() === "kreator";
  return viewerIsWorker;
}
