import { escapeHtml } from "../utils/format.js";

export function renderWorkNotes({ notes = { main: "", reminder: "" }, savedLabel = "" }) {
  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/postavke">← Postavke</a>
      <h2 class="screen-title">Poslovne bilješke</h2>
      <p class="screen-subtitle">Privatno na ovom uređaju — ne ide u oblak.</p>
      <form id="work-notes-form" class="stack-form">
        <textarea class="field field--area field--tall" name="main" maxlength="12000" placeholder="Bilješke o poslu…">${escapeHtml(notes.main || "")}</textarea>
        <input class="field" name="reminder" maxlength="400" value="${escapeHtml(notes.reminder || "")}" placeholder="Brzi redak (opciono)">
        ${savedLabel ? `<p class="form-hint">${escapeHtml(savedLabel)}</p>` : ""}
        <button type="submit" class="btn btn--primary btn--block">Sačuvaj lokalno</button>
      </form>
    </div>`;
}
