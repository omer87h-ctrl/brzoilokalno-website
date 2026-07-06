import { APP_LINKS } from "../firebase.js";

/** Web u pripremi — adminOnly blokira obične korisnike. Admin može ući za test (Faza 1). */

export function renderPrepScreen({ showAdminLogin = false, loginError = "" }) {
  return `
    <div class="screen screen--center">
      <div class="status-card">
        <img class="status-card__logo" src="icons/icon-192.png" alt="" width="72" height="72">
        <h1 class="status-card__title">Brzo i Lokalno</h1>
        <p class="status-card__text">Web verzija je trenutno u pripremi.</p>
        <p class="status-card__text status-card__text--muted">
          Koristite aplikaciju na AppGallery dok ne otvorimo pristup svima.
        </p>
        <div class="status-card__actions">
          <a class="btn btn--primary" href="${APP_LINKS.appGallery}" target="_blank" rel="noopener noreferrer">Huawei AppGallery</a>
          <a class="btn btn--ghost" href="${APP_LINKS.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a class="btn btn--ghost" href="${APP_LINKS.landing}">Natrag na početnu</a>
        </div>
        ${
          showAdminLogin
            ? `
        <form class="admin-login" id="admin-login-form">
          <p class="admin-login__label">Admin prijava (test)</p>
          ${loginError ? `<p class="admin-login__error">${escapeHtml(loginError)}</p>` : ""}
          <input class="field" type="email" name="email" placeholder="Email" autocomplete="username" required>
          <input class="field" type="password" name="password" placeholder="Lozinka" autocomplete="current-password" required>
          <button class="btn btn--primary btn--block" type="submit">Prijavi se</button>
        </form>`
            : ""
        }
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
