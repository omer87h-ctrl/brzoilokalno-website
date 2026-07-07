import { isProfileVerified } from "../utils/verified.js";

const CHECK_ICON = `<svg class="provjereno-badge__icon" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;

export function renderProvjerenoBadge() {
  return `<span class="provjereno-badge">${CHECK_ICON}<span>PROVJERENO</span></span>`;
}

export function renderBusyBadge() {
  return `<span class="busy-badge">ZAUZETO</span>`;
}

export function renderProfileMetaBadges(entity) {
  const verified = isProfileVerified(entity);
  const busy = entity?.status === "zauzet";
  if (!verified && !busy) return "";
  const parts = [];
  if (verified) parts.push(renderProvjerenoBadge());
  if (busy) parts.push(renderBusyBadge());
  return `<div class="profile-meta-badges">${parts.join("")}</div>`;
}

export function renderVerifiedSuffix(entity) {
  return isProfileVerified(entity) ? ` ${renderProvjerenoBadge()}` : "";
}
