import { ALL_CITIES, USER_ROLES } from "../data/categories.js";
import { POLICY_LINKS } from "../constants/policy.js";
import { escapeHtml } from "../utils/format.js";

export function renderOnboarding({ user, error = "", defaults = {}, isGoogleUser = false, skipPolicyConsent = false }) {
  const cityOptions = ALL_CITIES.map((city) => {
    const selected = defaults.city === city ? " selected" : "";
    return `<option value="${escapeHtml(city)}"${selected}>${escapeHtml(city)}</option>`;
  }).join("");

  const roleRadios = USER_ROLES.map((role) => {
    const checked = (defaults.role || "korisnik") === role.id ? " checked" : "";
    return `
      <label class="auth-radio">
        <input type="radio" name="role" value="${role.id}"${checked} required>
        <span>${escapeHtml(role.label)}</span>
      </label>`;
  }).join("");

  const displayName = escapeHtml(defaults.displayName || user?.displayName || "");

  return `
    <div class="screen screen--center screen--auth">
      <div class="status-card auth-card auth-card--wide">
        <h1 class="status-card__title">${isGoogleUser ? "Dovrši Google prijavu" : "Dovrši profil"}</h1>
        <p class="status-card__text status-card__text--muted">${
          isGoogleUser
            ? "Unesi podatke kao pri registraciji (ime, grad, uloga) i prihvati pravila:"
            : "Još par koraka prije korištenja aplikacije"
        }</p>
        ${error ? `<p class="admin-login__error">${escapeHtml(error)}</p>` : ""}
        <form class="auth-form" id="onboarding-form">
          <input class="field" type="text" name="displayName" placeholder="Ime / naziv profila" value="${displayName}" maxlength="60" required>
          <p class="field-label">Uloga</p>
          <div class="auth-radio-group">${roleRadios}</div>
          <label class="field-label">Grad</label>
          <select class="field" name="city" required>
            <option value="">Odaberi grad</option>
            ${cityOptions}
          </select>
          ${
            skipPolicyConsent
              ? ""
              : `
          <label class="auth-check">
            <input type="checkbox" name="acceptedTerms" required>
            <span>Prihvatam <a href="${POLICY_LINKS.terms}" target="_blank" rel="noopener noreferrer">Pravila i uslove</a></span>
          </label>
          <label class="auth-check">
            <input type="checkbox" name="acceptedPrivacy" required>
            <span>Prihvatam <a href="${POLICY_LINKS.privacy}" target="_blank" rel="noopener noreferrer">Politiku privatnosti</a></span>
          </label>`
          }
          <button class="btn btn--primary btn--block" type="submit">Nastavi</button>
        </form>
      </div>
    </div>`;
}
