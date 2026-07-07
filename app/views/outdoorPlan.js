import { escapeHtml } from "../utils/format.js";
import { outdoorDisclaimer } from "../services/weatherOutlook.js";

function defaultTitle(role) {
  if (role === "majstor") return "Plan za vanjski rad";
  if (role === "kreator") return "Plan za vanjski dio posla";
  if (role === "korisnik") return "Plan kada krenuti s poslom";
  return "Plan za vani";
}

export function renderOutdoorPlan({
  outlook,
  loading = false,
  missingKey = false,
  missingCity = false,
  missingRole = false,
  forecastFailed = false,
  role = "",
  expanded = false,
}) {
  const title = escapeHtml(outlook?.title || defaultTitle(role));
  const expandedClass = expanded ? " outdoor-plan--expanded" : "";

  let body = "";
  if (!expanded) {
    body = `<p class="form-hint">Proširi za detalje prognoze.</p>`;
  } else if (missingCity) {
    body = `<p class="form-hint">Dodaj grad u profilu da vidiš plan za vanjski rad.</p>`;
  } else if (missingRole) {
    body = `<p class="form-hint">Plan je dostupan za uloge majstor, kreator i korisnik.</p>`;
  } else if (missingKey) {
    body = `<p class="form-hint">Vremenska prognoza nije konfigurirana na webu (postavi <code>weatherApiKey</code> u Firestore dokumentu <code>app_public/web</code>).</p>`;
  } else if (loading) {
    body = `<p class="form-hint">Učitavam prognozu…</p>`;
  } else if (outlook) {
    body = `
      <p class="outdoor-plan__summary">${escapeHtml(outlook.summary)}</p>
      <p class="outdoor-plan__detail">${escapeHtml(outlook.detail)}</p>
      <p class="form-hint">${escapeHtml(outdoorDisclaimer)}</p>`;
  } else if (forecastFailed) {
    body = `<p class="form-hint">Prognoza trenutno nije dostupna za ovaj grad. Provjeri naziv grada u profilu.</p>`;
  } else {
    body = `<p class="form-hint">Nema podataka za prognozu.</p>`;
  }

  return `
    <section class="outdoor-plan${expandedClass}" id="outdoor-plan-section">
      <button type="button" class="outdoor-plan__toggle" id="outdoor-plan-toggle" aria-expanded="${expanded ? "true" : "false"}">
        <span class="outdoor-plan__title">${title}</span>
        <span class="outdoor-plan__chev" aria-hidden="true">${expanded ? "▴" : "▾"}</span>
      </button>
      <div class="outdoor-plan__body">${body}</div>
    </section>`;
}
