import { escapeHtml } from "../utils/format.js";

export function renderVerifyEmail({ email = "", error = "", status = "" }) {
  return `
    <div class="screen screen--center screen--auth">
      <div class="status-card auth-card">
        <img class="status-card__logo" src="icons/icon-192.png" alt="" width="72" height="72">
        <h1 class="status-card__title">Potvrdi email</h1>
        <p class="status-card__text status-card__text--muted">
          Poslali smo link za potvrdu na<br>
          <strong>${escapeHtml(email || "tvoj email")}</strong>
        </p>
        <p class="status-card__text status-card__text--muted">
          Dok ne potvrdiš email, ne možeš objavljivati poslove, slati prijave ni poruke.
        </p>
        ${error ? `<p class="admin-login__error">${escapeHtml(error)}</p>` : ""}
        ${status ? `<p class="auth-status">${escapeHtml(status)}</p>` : ""}
        <button type="button" class="btn btn--primary btn--block" id="verify-email-check-btn">
          Provjeri potvrdu
        </button>
        <button type="button" class="btn btn--ghost btn--block" id="verify-email-resend-btn">
          Pošalji link ponovo
        </button>
        <button type="button" class="btn btn--ghost btn--block" id="verify-email-logout-btn">
          Odjavi se
        </button>
      </div>
    </div>`;
}
