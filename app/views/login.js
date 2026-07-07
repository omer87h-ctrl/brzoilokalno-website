import { APP_LINKS } from "../firebase.js";
import { POLICY_LINKS } from "../constants/policy.js";
import { escapeHtml } from "../utils/format.js";

export function renderLogin({ error = "", showRegisterLink = true }) {
  return `
    <div class="screen screen--center screen--auth">
      <div class="status-card auth-card">
        <img class="status-card__logo" src="icons/icon-192.png" alt="" width="72" height="72">
        <h1 class="status-card__title">Prijava</h1>
        <p class="status-card__text status-card__text--muted">Prijavi se na svoj nalog</p>
        ${error ? `<p class="admin-login__error">${escapeHtml(error)}</p>` : ""}
        <div class="auth-consent" id="google-consent">
          <label class="auth-check">
            <input type="checkbox" id="google-accepted-terms" name="acceptedTerms">
            <span>Prihvatam <a href="${POLICY_LINKS.terms}" target="_blank" rel="noopener noreferrer">Pravila i uslove</a></span>
          </label>
          <label class="auth-check">
            <input type="checkbox" id="google-accepted-privacy" name="acceptedPrivacy">
            <span>Prihvatam <a href="${POLICY_LINKS.privacy}" target="_blank" rel="noopener noreferrer">Politiku privatnosti</a></span>
          </label>
        </div>
        <button type="button" class="btn btn--google btn--block" id="google-signin-btn">
          <span class="btn--google__icon" aria-hidden="true">${googleIconSvg()}</span>
          Prijavi se s Googleom
        </button>
        <form class="auth-form" id="login-form">
          <input class="field" type="email" name="email" placeholder="Email" autocomplete="username" required>
          <input class="field" type="password" name="password" placeholder="Lozinka" autocomplete="current-password" required>
          <button class="btn btn--primary btn--block" type="submit">Prijavi se</button>
        </form>
        ${
          showRegisterLink
            ? `<p class="auth-switch">Nemaš nalog? <a href="#/register">Registracija</a></p>`
            : ""
        }
        <a class="btn btn--ghost btn--block" href="${APP_LINKS.landing}">Natrag na početnu</a>
      </div>
    </div>`;
}

function googleIconSvg() {
  return `<svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>`;
}
