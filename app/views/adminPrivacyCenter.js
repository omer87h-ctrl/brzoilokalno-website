import { escapeHtml } from "../utils/format.js";

const CASE_CARDS = [
  { type: "processing_record", title: "Evidencija aktivnosti obrade", hint: "ROPA / mapa obrade" },
  { type: "security_incident", title: "Sigurnosni incidenti", hint: "72h brojač — bez auto-slanja" },
  { type: "user_data_access", title: "Zahtjevi korisnika", hint: "Pristup, ispravka, ograničenje, prigovor" },
  { type: "deletion_request", title: "Brisanje računa", hint: "Pregled prije brisanja + izvještaj" },
];

export function renderPrivacyCenterHome({ cases = [], error = "" }) {
  const cards = CASE_CARDS.map(
    (c) => `
    <article class="app-card">
      <div class="app-card__head">
        <h3 class="app-card__name">${escapeHtml(c.title)}</h3>
      </div>
      <p class="app-card__meta">${escapeHtml(c.hint)}</p>
      <div class="app-card__actions">
        <button type="button" class="btn btn--primary btn--sm" data-privacy-new="${escapeHtml(c.type)}">Novi slučaj</button>
      </div>
    </article>`,
  ).join("");

  const list = cases.length
    ? cases
        .map(
          (c) => `
      <article class="app-card">
        <div class="app-card__head">
          <h3 class="app-card__name">${escapeHtml(c.caseNumber || c.id)}</h3>
          <span class="status-badge">${escapeHtml(c.statusLabel || c.status || "")}</span>
        </div>
        <p class="app-card__meta">${escapeHtml(c.caseTypeTitle || c.caseType || "")}</p>
        <div class="app-card__actions">
          <a class="btn btn--ghost btn--sm" href="#/postavke/privatnost-centar/${escapeHtml(c.id)}">Otvori</a>
        </div>
      </article>`,
        )
        .join("")
    : `<div class="empty-state">Nema otvorenih predmeta.</div>`;

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/postavke">← Postavke</a>
      <h2 class="screen-title">Centar privatnosti</h2>
      <p class="settings-text">Dokumenti se ne šalju Agenciji automatski. Hash nije elektronski potpis.</p>
      ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ""}
      <section class="settings-group">
        <h3 class="settings-group__title">Novi predmet</h3>
        <div class="app-list">${cards}</div>
      </section>
      <section class="settings-group">
        <h3 class="settings-group__title">Predmeti</h3>
        <div class="app-list">${list}</div>
      </section>
    </div>`;
}

export function renderPrivacyCaseDetail({ caseData = null, error = "", busy = false }) {
  if (!caseData) {
    return `
      <div class="screen-scroll">
        <a class="back-link" href="#/postavke/privatnost-centar">← Centar privatnosti</a>
        <p class="form-error">${escapeHtml(error || "Slučaj nije pronađen.")}</p>
      </div>`;
  }

  const needed = caseData.needsManualConfirmation || [];
  const confirmed = caseData.confirmedManual || {};
  const manual = caseData.manualFields || {};
  const allOk = needed.every((k) => confirmed[k] === true) && !(caseData.missing || []).length;

  const neededHtml = needed.length
    ? needed
        .map((k) => {
          const on = confirmed[k] === true;
          return `
        <label class="settings-text" style="display:block;margin:8px 0">
          <input type="checkbox" data-privacy-confirm="${escapeHtml(k)}" ${on ? "checked" : ""}/>
          <strong>POTREBNA RUČNA POTVRDA:</strong> ${escapeHtml(k)}
        </label>`;
        })
        .join("")
    : `<p class="settings-text">Nema obaveznih ručnih polja za ovaj tip.</p>`;

  const missing = (caseData.missing || []).length
    ? `<p class="form-error">Nedostaje: ${escapeHtml((caseData.missing || []).join("; "))}</p>`
    : "";

  const docs = (caseData.documents || [])
    .map(
      (d) => `
      <li class="settings-text">${escapeHtml(d.status || "")} · rev ${escapeHtml(String(d.revision || ""))} · SHA ${escapeHtml(String(d.sha256Pdf || "").slice(0, 12))}…</li>`,
    )
    .join("");

  const events = (caseData.events || [])
    .slice(0, 12)
    .map(
      (e) => `
      <li class="settings-text">${escapeHtml(e.action || "")} · ${escapeHtml(e.note || "")}</li>`,
    )
    .join("");

  const isIncident = caseData.caseType === "security_incident";
  const isUser =
    String(caseData.caseType || "").startsWith("user_") ||
    caseData.caseType === "deletion_request" ||
    caseData.caseType === "restriction_request" ||
    caseData.caseType === "objection_request";

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/postavke/privatnost-centar">← Centar privatnosti</a>
      <h2 class="screen-title">${escapeHtml(caseData.caseNumber || "")}</h2>
      <p class="settings-text">${escapeHtml(caseData.caseTypeTitle || "")} · <strong>${escapeHtml(caseData.statusLabel || caseData.status || "")}</strong></p>
      ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ""}
      ${missing}

      ${
        isUser
          ? `
      <section class="settings-group">
        <h3 class="settings-group__title">Traži korisnika (tačan UID ili email)</h3>
        <input class="form-input" id="privacy-uid" placeholder="UID" value="${escapeHtml(manual.uid || caseData.autoFound?.profile?.uid || "")}"/>
        <input class="form-input" id="privacy-email" placeholder="Email" value="${escapeHtml(manual.email || "")}" style="margin-top:8px"/>
      </section>`
          : ""
      }

      ${
        isIncident
          ? `
      <section class="settings-group">
        <h3 class="settings-group__title">Incident — ručni unos</h3>
        <textarea class="form-input" id="privacy-incident-desc" rows="4" placeholder="Opis događaja">${escapeHtml(manual.opisDogadjaja || "")}</textarea>
        <p class="form-hint">Procjenu rizika i odluku o prijavi Agenciji donosiš ti — sistem ne šalje ništa.</p>
      </section>`
          : ""
      }

      <section class="settings-group">
        <h3 class="settings-group__title">Automatski pronađeno</h3>
        <pre class="settings-text" style="white-space:pre-wrap;font-size:12px">${escapeHtml(JSON.stringify(caseData.autoFound || {}, null, 2))}</pre>
      </section>

      <section class="settings-group">
        <h3 class="settings-group__title">Ručna potvrda</h3>
        ${neededHtml}
      </section>

      <section class="settings-group">
        <h3 class="settings-group__title">Dokumenti</h3>
        <ul>${docs || "<li class='settings-text'>Nema generisanih dokumenata.</li>"}</ul>
      </section>

      <section class="settings-group">
        <h3 class="settings-group__title">Historija</h3>
        <ul>${events || "<li class='settings-text'>—</li>"}</ul>
      </section>

      <section class="settings-group">
        <h3 class="settings-group__title">Radnje</h3>
        <div class="settings-links">
          <button type="button" class="btn btn--ghost btn--block" data-privacy-action="prepare" ${busy ? "disabled" : ""}>Pripremi / osvježi podatke</button>
          <button type="button" class="btn btn--ghost btn--block" data-privacy-action="save_manual" ${busy ? "disabled" : ""}>Sačuvaj nacrt / potvrde</button>
          <button type="button" class="btn btn--ghost btn--block" data-privacy-action="generate_draft" ${busy ? "disabled" : ""}>Generiši pregled (PDF)</button>
          <button type="button" class="btn btn--primary btn--block" data-privacy-action="finalize" ${busy || !allOk ? "disabled" : ""}>Zaključi dokument</button>
          <button type="button" class="btn btn--ghost btn--block" data-privacy-action="mark_sent" ${busy ? "disabled" : ""}>Označi kao poslano (ručno)</button>
          <button type="button" class="btn btn--ghost btn--block" data-privacy-action="close" ${busy ? "disabled" : ""}>Zatvori slučaj</button>
        </div>
        <p class="form-hint">Nema dugmeta za automatsko slanje Agenciji. Nema pečata ni “ovjere”.</p>
      </section>
    </div>`;
}
