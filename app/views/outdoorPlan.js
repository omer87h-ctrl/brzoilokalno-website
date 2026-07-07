import { escapeHtml } from "../utils/format.js";
import { outdoorDisclaimer } from "../services/weatherOutlook.js";

export function renderOutdoorPlan({ outlook, loading = false, missingKey = false, expanded = false, forceShow = true }) {
  if (!forceShow && !outlook && !missingKey && !loading) return "";

  const title = escapeHtml(outlook?.title || "Plan za vani");
  const expandedClass = expanded ? " outdoor-plan--expanded" : "";

  let body = "";
  if (missingKey) {
    body = `<p class="form-hint">Vremenska prognoza nije konfigurirana na webu (weatherApiKey u app_public/web).</p>`;
  } else if (loading) {
    body = `<p class="form-hint">Učitavam prognozu…</p>`;
  } else if (outlook) {
    body = `
      <p class="outdoor-plan__summary">${escapeHtml(outlook.summary)}</p>
      <p class="outdoor-plan__detail">${escapeHtml(outlook.detail)}</p>
      <p class="form-hint">${escapeHtml(outdoorDisclaimer)}</p>`;
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
