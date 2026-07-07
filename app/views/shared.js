import { displayName, escapeHtml, formatRating } from "../utils/format.js";
import { profileAvatarUrl } from "../services/storageService.js";

function renderUserAvatar(user) {
  const avatarUrl = profileAvatarUrl(user);
  const initial = escapeHtml(displayName(user).charAt(0).toUpperCase());
  if (avatarUrl) {
    return `<img class="user-card__avatar user-card__avatar--img" src="${escapeHtml(avatarUrl)}" alt="" loading="lazy" />`;
  }
  return `<div class="user-card__avatar">${initial}</div>`;
}

export function renderUserList(users, { emptyText = "Nema rezultata." } = {}) {
  if (!users?.length) {
    return `<div class="empty-state">${escapeHtml(emptyText)}</div>`;
  }

  const cards = users
    .map((user) => {
      const name = escapeHtml(displayName(user));
      const role = escapeHtml(user.role || "—");
      const city = escapeHtml(user.city || "—");
      const category = escapeHtml(user.category || user.occupation || "—");
      const status = escapeHtml(user.status || "—");
      const rating = escapeHtml(formatRating(user.ratingAverage, user.ratingCount));
      const verified = user.profileVerified ? `<span class="user-card__verified" title="Verifikovan">✓</span>` : "";

      return `
        <a class="user-card" href="#/pregled/${user.id}">
          ${renderUserAvatar(user)}
          <div class="user-card__body">
            <h3 class="user-card__name">${name}${verified}</h3>
            <p class="user-card__meta">${role} · ${category}</p>
            <p class="user-card__meta">${city} · ${status}</p>
            <p class="user-card__rating">${rating}</p>
          </div>
        </a>`;
    })
    .join("");

  return `<div class="user-list">${cards}</div>`;
}

export function renderScreenLoading(message = "Učitavanje…") {
  return `
    <div class="screen-loading">
      <div class="loader" aria-label="Učitavanje"></div>
      <p class="loader-text">${escapeHtml(message)}</p>
    </div>`;
}

export function renderScreenError(message) {
  return `
    <div class="screen-scroll">
      <div class="empty-state empty-state--error">${escapeHtml(message)}</div>
      <a class="btn btn--ghost btn--block" href="#/home">Natrag na početnu</a>
    </div>`;
}
