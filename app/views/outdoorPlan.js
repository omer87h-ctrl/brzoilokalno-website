import { escapeHtml } from "../utils/format.js";
import { outdoorDisclaimer } from "../services/weatherOutlook.js";

function defaultTitle(role) {
  if (role === "majstor") return "Plan za vanjski rad";
  if (role === "kreator") return "Plan za vanjski dio posla";
  if (role === "korisnik") return "Plan kada krenuti s poslom";
  return "Plan za vani";
}

export function renderOutdoorPlanBody({
  outlook,
  loading = false,
  missingKey = false,
  missingCity = false,
  missingRole = false,
  forecastFailed = false,
  expanded = false,
}) {
  if (!expanded) {
    return `<p class="form-hint">Proširi za detalje prognoze.</p>`;
  }
  if (missingCity) {
    return `<p class="form-hint">Dodaj grad u profilu da vidiš plan za vanjski rad.</p>`;
  }
  if (missingRole) {
    return `<p class="form-hint">Plan je dostupan za uloge majstor, kreator i korisnik.</p>`;
  }
  if (missingKey) {
    return `<p class="form-hint">Prognoza nije dostupna. Provjeri postavke aplikacije.</p>`;
  }
  if (loading) {
    return `<p class="form-hint outdoor-plan__loading">Učitavam prognozu…</p>`;
  }
  if (outlook) {
    return `
      <p class="outdoor-plan__summary">${escapeHtml(outlook.summary)}</p>
      <p class="outdoor-plan__detail">${escapeHtml(outlook.detail)}</p>
      <p class="form-hint">${escapeHtml(outdoorDisclaimer)}</p>`;
  }
  if (forecastFailed) {
    return `<p class="form-hint">Prognoza trenutno nije dostupna za ovaj grad. Provjeri naziv grada u profilu.</p>`;
  }
  return `<p class="form-hint">Nema podataka za prognozu.</p>`;
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
  const body = renderOutdoorPlanBody({
    outlook,
    loading,
    missingKey,
    missingCity,
    missingRole,
    forecastFailed,
    expanded,
  });

  return `
    <section class="outdoor-plan${expandedClass}" id="outdoor-plan-section">
      <button type="button" class="outdoor-plan__toggle" id="outdoor-plan-toggle" aria-expanded="${expanded ? "true" : "false"}">
        <span class="outdoor-plan__title">${title}</span>
        <span class="outdoor-plan__chev" aria-hidden="true">${expanded ? "▴" : "▾"}</span>
      </button>
      <div class="outdoor-plan__body">${body}</div>
    </section>`;
}
