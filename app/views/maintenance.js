import { APP_LINKS } from "../firebase.js";

export function renderMaintenance(config) {
  const customMessage = config.maintenanceMessage?.trim();
  const message =
    customMessage ||
    (config._missing
      ? "Konfiguracija platforme još nije postavljena."
      : "Brzo i Lokalno Web je trenutno u pripremi.");

  return `
    <div class="screen screen--center">
      <div class="status-card">
        <img class="status-card__logo" src="icons/icon-192.png" alt="" width="72" height="72">
        <h1 class="status-card__title">Brzo i Lokalno</h1>
        <p class="status-card__text">${escapeHtml(message)}</p>
        <p class="status-card__text status-card__text--muted">
          Aplikacija je dostupna na AppGallery.<br>
          Novosti pratite na Instagramu.
        </p>
        <div class="status-card__actions">
          <a class="btn btn--primary" href="${APP_LINKS.appGallery}" target="_blank" rel="noopener noreferrer">Huawei AppGallery</a>
          <a class="btn btn--ghost" href="${APP_LINKS.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a class="btn btn--ghost" href="${APP_LINKS.landing}">Natrag na početnu</a>
        </div>
      </div>
    </div>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
