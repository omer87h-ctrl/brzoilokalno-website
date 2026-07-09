import { ALL_CITIES, USER_ROLES } from "../data/categories.js";
import { POLICY_LINKS } from "../constants/policy.js";
import { escapeHtml } from "../utils/format.js";

export function renderRegister({ error = "" }) {
  const cityOptions = ALL_CITIES.map(
    (city) => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`
  ).join("");

  const roleOptions = USER_ROLES.map(
    (role) => `<option value="${role.id}">${escapeHtml(role.label)}</option>`
  ).join("");

  return `
    <div class="screen screen--center screen--auth">
      <div class="status-card auth-card auth-card--wide">
        <h1 class="status-card__title">Registracija</h1>
        ${error ? `<p class="admin-login__error">${escapeHtml(error)}</p>` : ""}
        <form class="auth-form" id="register-form">
          <input class="field" type="text" name="displayName" placeholder="Ime / naziv profila" maxlength="60" required>
          <input class="field" type="email" name="email" placeholder="Email (ne @gmail.com)" autocomplete="username" required>
          <p class="auth-hint">Za Gmail koristi <a href="#/login">Google prijavu</a>, ne registraciju lozinkom.</p>
          <input class="field" type="password" name="password" placeholder="Lozinka (min. 6)" minlength="6" required>
          <input class="field" type="password" name="confirmPassword" placeholder="Potvrdi lozinku" minlength="6" required>
          <label class="field-label">Uloga</label>
          <select class="field" name="role" required>${roleOptions}</select>
          <label class="field-label">Grad</label>
          <select class="field" name="city" required>
            <option value="">Odaberi grad</option>
            ${cityOptions}
          </select>
          <label class="auth-check">
            <input type="checkbox" name="acceptedTerms" required>
            <span>Prihvatam <a href="${POLICY_LINKS.terms}" target="_blank" rel="noopener noreferrer">Pravila i uslove</a></span>
          </label>
          <label class="auth-check">
            <input type="checkbox" name="acceptedPrivacy" required>
            <span>Prihvatam <a href="${POLICY_LINKS.privacy}" target="_blank" rel="noopener noreferrer">Politiku privatnosti</a></span>
          </label>
          <button class="btn btn--primary btn--block" type="submit">Registruj se</button>
        </form>
        <p class="auth-switch">Već imaš nalog? <a href="#/login">Prijava</a></p>
      </div>
    </div>`;
}
