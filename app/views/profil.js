import { escapeHtml, formatRating } from "../utils/format.js";
import { renderProfileWorks } from "./radovi.js";

export function renderProfil({ user, authEmail }) {
  if (!user) {
    return `
      <div class="screen-scroll">
        <h2 class="screen-title">Profil</h2>
        <div class="empty-state">Profil nije pronađen u bazi za ovaj nalog.</div>
        <p class="screen-subtitle">Prijavljen: ${escapeHtml(authEmail || "")}</p>
      </div>`;
  }

  const name = escapeHtml(user.displayName || "Korisnik");
  const role = escapeHtml(user.role || "—");
  const city = escapeHtml(user.city || "—");
  const category = escapeHtml(user.category || user.occupation || "—");
  const status = escapeHtml(user.status || "—");
  const rating = formatRating(user.ratingAverage, user.ratingCount);
  const desc = escapeHtml(user.description || "Nema opisa.");

  return `
    <div class="screen-scroll">
      <h2 class="screen-title">Profil</h2>
      <p class="screen-subtitle">Read-only pregled tvog naloga</p>
      <article class="profile-card">
        <div class="profile-card__avatar">${name.charAt(0).toUpperCase()}</div>
        <h3 class="profile-card__name">${name}</h3>
        <p class="profile-card__meta">${role} · ${category}</p>
        <p class="profile-card__meta">${city} · ${status}</p>
        <p class="profile-card__rating">${escapeHtml(rating)}</p>
        <p class="profile-card__desc">${desc}</p>
        <p class="profile-card__email">${escapeHtml(user.email || authEmail || "")}</p>
      </article>
      <p class="phase-note">Uređivanje profila dolazi u sljedećoj fazi.</p>
    </div>`;
}

export function renderPregledProfila({ user, works = [] }) {
  if (!user) {
    return `
      <div class="screen-scroll">
        <a class="back-link" href="#/home">← Natrag</a>
        <div class="empty-state">Profil nije pronađen.</div>
      </div>`;
  }

  const name = escapeHtml(user.displayName || "Korisnik");
  const role = escapeHtml(user.role || "—");
  const city = escapeHtml(user.city || "—");
  const category = escapeHtml(user.category || user.occupation || "—");
  const status = escapeHtml(user.status || "—");
  const rating = formatRating(user.ratingAverage, user.ratingCount);
  const desc = escapeHtml(user.description || "Nema opisa.");

  return `
    <div class="screen-scroll">
      <a class="back-link" href="javascript:history.back()">← Natrag</a>
      <article class="profile-card">
        <div class="profile-card__avatar">${name.charAt(0).toUpperCase()}</div>
        <h3 class="profile-card__name">${name}</h3>
        <p class="profile-card__meta">${role} · ${category}</p>
        <p class="profile-card__meta">${city} · ${status}</p>
        <p class="profile-card__rating">${escapeHtml(rating)}</p>
        <p class="profile-card__desc">${desc}</p>
      </article>
      ${renderProfileWorks({ works, uid: user.id })}
    </div>`;
}
