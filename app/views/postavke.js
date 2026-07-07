import { POLICY_LINKS, SUPPORT_EMAIL } from "../constants/policy.js";
import { escapeHtml } from "../utils/format.js";

function verificationStatusLabel(status) {
  if (status === "pending") return "Zahtjev na čekanju";
  if (status === "approved") return "Profil je potvrđen";
  if (status === "rejected") return "Zahtjev odbijen";
  return "Nije poslan zahtjev";
}

export function renderPostavke({
  user = null,
  userEmail = "",
  verification = null,
  isAdmin = false,
  deleteError = "",
}) {
  const name = escapeHtml(user?.displayName || "—");
  const email = escapeHtml(user?.email || userEmail || "—");
  const role = escapeHtml(user?.role || "—");
  const city = escapeHtml(user?.city || "—");
  const verStatus = verification?.status || "none";
  const verLabel = escapeHtml(verificationStatusLabel(verStatus));
  const canRequestVerify = user && verStatus !== "pending" && verStatus !== "approved";
  const supportMailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Brzo i Lokalno - Prijava problema")}`;

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/profil">← Profil</a>
      <h2 class="screen-title">Postavke</h2>

      <section class="settings-group">
        <h3 class="settings-group__title">Račun</h3>
        <p class="settings-text"><strong>${name}</strong></p>
        <p class="settings-text settings-text--muted">${email}</p>
        <p class="settings-text settings-text--muted">${role} · ${city}</p>
      </section>

      <section class="settings-group">
        <h3 class="settings-group__title">Prilagodba aplikacije</h3>
        <div class="settings-links">
          <a class="btn btn--ghost btn--block" href="#/postavke/izgled">Izgled i ponašanje</a>
        </div>
      </section>

      <section class="settings-group">
        <h3 class="settings-group__title">Privatnost i sigurnost</h3>
        <p class="settings-text">${verLabel}</p>
        <div class="settings-links">
          <a class="btn btn--ghost btn--block" href="#/postavke/privatnost">Što aplikacija dijeli</a>
          ${
            canRequestVerify
              ? `<button type="button" class="btn btn--ghost btn--block" id="request-verification-btn">Zatraži potvrđeni profil</button>`
              : ""
          }
          <a class="btn btn--ghost btn--block" href="${POLICY_LINKS.privacy}" target="_blank" rel="noopener noreferrer">Politika privatnosti</a>
          <a class="btn btn--ghost btn--block" href="${POLICY_LINKS.terms}" target="_blank" rel="noopener noreferrer">Pravila i uslovi</a>
          <a class="btn btn--ghost btn--block" href="#/postavke/blokirani">Blokirani korisnici</a>
        </div>
      </section>

      ${
        isAdmin
          ? `
      <section class="settings-group">
        <h3 class="settings-group__title">Admin</h3>
        <a class="btn btn--ghost btn--block" href="#/postavke/admin">Moderacija prijava</a>
      </section>`
          : ""
      }

      <section class="settings-group">
        <h3 class="settings-group__title">Brisanje računa</h3>
        <p class="settings-text">Brisanje uklanja profil, oglase, ponude, radove i prijave iz baze.</p>
        <div class="settings-links">
          <a class="btn btn--ghost btn--block" href="${POLICY_LINKS.deleteAccount}" target="_blank" rel="noopener noreferrer">Web zahtjev za brisanje</a>
          ${deleteError ? `<p class="form-error">${escapeHtml(deleteError)}</p>` : ""}
          <button type="button" class="btn btn--danger btn--block" id="delete-account-btn">Obriši nalog u aplikaciji</button>
        </div>
      </section>

      <section class="settings-group">
        <h3 class="settings-group__title">Podrška</h3>
        <div class="settings-links">
          <a class="btn btn--ghost btn--block" href="${supportMailto}">Prijavi problem</a>
          <a class="btn btn--ghost btn--block" href="#/obavijesti">Obavijesti</a>
        </div>
        <p class="form-hint">Brzo i Lokalno Web — ista baza kao Android aplikacija.</p>
      </section>
    </div>`;
}
