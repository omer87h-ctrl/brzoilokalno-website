import { escapeHtml, displayName } from "../utils/format.js";
import { profileAvatarUrl } from "../services/storageService.js";
import { isProfileVerified } from "../utils/verified.js";
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
  const name =
    String(item?.authorName || item?.displayName || item?.ownerDisplayName || "").trim() ||
    (ownerProfile ? displayName(ownerProfile) : "") ||
    String(item?.userEmail || "").trim() ||
    "Nepoznat korisnik";

  const role = String(item?.authorRole || ownerProfile?.role || "").trim();

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

/** Detalj ekran — avatar + objavio blok. */
export function renderListingAuthorDetail({ item, ownerProfile = null }) {
  const { name, roleLabel, avatarUrl, verifiedEntity } = resolveListingAuthor(item, ownerProfile);
  const roleLine = roleLabel
    ? `<p class="listing-author__role">${escapeHtml(roleLabel)}</p>`
    : "";
  const ownerUid = item?.userId || "";
  const profileLink = ownerUid
    ? `<a class="btn btn--ghost btn--block" href="#/pregled/${escapeHtml(ownerUid)}">Pogledaj profil</a>`
    : "";

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
