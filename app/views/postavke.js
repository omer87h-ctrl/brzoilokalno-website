import { POLICY_LINKS } from "../constants/policy.js";
import { escapeHtml } from "../utils/format.js";

export function renderPostavke({ userEmail = "", deleteError = "" }) {
  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/profil">← Profil</a>
      <h2 class="screen-title">Postavke</h2>
      <p class="screen-subtitle">Privatnost, pravila i nalog</p>

      <section class="settings-group">
        <h3 class="settings-group__title">Privatnost i pravila</h3>
        <p class="settings-text">
          Brzo i Lokalno dijeli samo podatke koje uneseš u profil, oglase i poruke u chatu nakon prihvaćene prijave.
          Kontakt telefon na oglasu vidiš tek kad imaš prihvaćenu prijavu ili si vlasnik posla.
        </p>
        <div class="settings-links">
          <a class="btn btn--ghost btn--block" href="${POLICY_LINKS.privacy}" target="_blank" rel="noopener noreferrer">Politika privatnosti</a>
          <a class="btn btn--ghost btn--block" href="${POLICY_LINKS.terms}" target="_blank" rel="noopener noreferrer">Pravila korištenja</a>
        </div>
      </section>

      <section class="settings-group">
        <h3 class="settings-group__title">Nalog</h3>
        <p class="settings-text settings-text--muted">Prijavljen: ${escapeHtml(userEmail)}</p>
        <p class="settings-text">
          Brisanje naloga uklanja profil, tvoje oglase, ponude, radove i prijave iz baze. Ova radnja je trajna.
        </p>
        ${deleteError ? `<p class="form-error">${escapeHtml(deleteError)}</p>` : ""}
        <button type="button" class="btn btn--danger btn--block" id="delete-account-btn">Obriši nalog</button>
      </section>
    </div>`;
}
