import { escapeHtml } from "../utils/format.js";

export function renderBlockedUsers({ users = [] }) {
  const list = users.length
    ? users
        .map(
          (row) => `
        <article class="app-card">
          <div class="app-card__head">
            <h3 class="app-card__name">${escapeHtml(row.blockedUserName || "Korisnik")}</h3>
          </div>
          <p class="app-card__meta">${escapeHtml(row.blockedUserEmail || "")}</p>
          <button type="button" class="btn btn--ghost btn--sm" data-unblock-uid="${escapeHtml(row.blockedUid)}">Odblokiraj</button>
        </article>`
        )
        .join("")
    : `<div class="empty-state">Nema blokiranih korisnika.</div>`;

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/postavke">← Postavke</a>
      <h2 class="screen-title">Blokirani korisnici</h2>
      <div class="app-list">${list}</div>
    </div>`;
}
