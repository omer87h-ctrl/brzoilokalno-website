import { ALL_CITIES, KREATOR_CATEGORIES, MAJSTOR_CATEGORIES } from "../data/categories.js";
import { escapeHtml } from "../utils/format.js";

const ALL_CATEGORIES = [...MAJSTOR_CATEGORIES, ...KREATOR_CATEGORIES];

function cityOptions(selected = "") {
  return ALL_CITIES.map((city) => {
    const sel = city === selected ? " selected" : "";
    return `<option value="${escapeHtml(city)}"${sel}>${escapeHtml(city)}</option>`;
  }).join("");
}

function categoryOptions(selected = "") {
  return ALL_CATEGORIES.map((cat) => {
    const sel = cat === selected ? " selected" : "";
    return `<option value="${escapeHtml(cat)}"${sel}>${escapeHtml(cat)}</option>`;
  }).join("");
}

export function renderCreateJobForm({ defaults = {}, error = "" }) {
  return `
    <div class="modal-overlay" id="create-job-modal">
      <div class="modal-card">
        <h3 class="modal-card__title">Novi posao</h3>
        ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ""}
        <form id="create-job-form" class="stack-form">
          <input class="field" name="title" placeholder="Naslov *" maxlength="80" value="${escapeHtml(defaults.title || "")}" required>
          <textarea class="field field--area" name="description" placeholder="Opis *" maxlength="1500" required>${escapeHtml(defaults.description || "")}</textarea>
          <select class="field" name="category" required>
            <option value="">Kategorija *</option>
            ${categoryOptions(defaults.category)}
          </select>
          <select class="field" name="city" required>
            <option value="">Grad *</option>
            ${cityOptions(defaults.city)}
          </select>
          <input class="field" name="budget" placeholder="Budžet *" maxlength="40" value="${escapeHtml(defaults.budget || "")}" required>
          <input class="field" name="whenNeeded" placeholder="Kada je potrebno *" maxlength="60" value="${escapeHtml(defaults.whenNeeded || "")}" required>
          <input class="field" name="contactPhone" placeholder="Kontakt broj" maxlength="24" value="${escapeHtml(defaults.contactPhone || "")}">
          <p class="form-hint">Ako imaš uključeno „Samo chat u appu”, telefon nije obavezan.</p>
          <div class="modal-card__actions">
            <button type="button" class="btn btn--ghost" data-close-modal>Odustani</button>
            <button type="submit" class="btn btn--primary">Objavi</button>
          </div>
        </form>
      </div>
    </div>`;
}

export function renderCreateOfferForm({ defaults = {}, error = "" }) {
  return `
    <div class="modal-overlay" id="create-offer-modal">
      <div class="modal-card">
        <h3 class="modal-card__title">Nova ponuda</h3>
        ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ""}
        <form id="create-offer-form" class="stack-form">
          <input class="field" name="title" placeholder="Naslov *" maxlength="80" value="${escapeHtml(defaults.title || "")}" required>
          <textarea class="field field--area" name="description" placeholder="Opis *" maxlength="1500" required>${escapeHtml(defaults.description || "")}</textarea>
          <select class="field" name="category" required>
            <option value="">Kategorija *</option>
            ${categoryOptions(defaults.category)}
          </select>
          <select class="field" name="city" required>
            <option value="">Grad *</option>
            ${cityOptions(defaults.city)}
          </select>
          <input class="field" name="budget" placeholder="Cijena / budžet *" maxlength="40" value="${escapeHtml(defaults.budget || "")}" required>
          <input class="field" name="availableWhen" placeholder="Dostupnost *" maxlength="60" value="${escapeHtml(defaults.availableWhen || "")}" required>
          <input class="field" name="contactPhone" placeholder="Kontakt broj" maxlength="24" value="${escapeHtml(defaults.contactPhone || "")}">
          <div class="modal-card__actions">
            <button type="button" class="btn btn--ghost" data-close-modal>Odustani</button>
            <button type="submit" class="btn btn--primary">Objavi</button>
          </div>
        </form>
      </div>
    </div>`;
}

export function renderTipEditorForm({ tip = null, error = "" }) {
  return `
    <div class="modal-overlay" id="tip-editor-modal">
      <div class="modal-card modal-card--wide">
        <h3 class="modal-card__title">${tip?.id ? "Uredi savjet" : "Novi savjet za početnu"}</h3>
        <p class="form-hint">Jedan aktivan savjet po autoru, trajanje 24 sata. Na početnoj max 4 savjeta.</p>
        ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ""}
        <form id="tip-editor-form" class="stack-form">
          <input class="field" name="title" placeholder="Naslov *" maxlength="80" value="${escapeHtml(tip?.title || "")}" required>
          <textarea class="field field--area" name="teaser" placeholder="Kratki opis *" maxlength="160" required>${escapeHtml(tip?.teaser || "")}</textarea>
          <textarea class="field field--area field--tall" name="body" placeholder="Cijeli tekst *" maxlength="2200" required>${escapeHtml(tip?.body || "")}</textarea>
          <div class="modal-card__actions">
            ${tip?.id ? `<button type="button" class="btn btn--ghost btn--danger" id="delete-tip-btn">Obriši</button>` : ""}
            <button type="button" class="btn btn--ghost" data-close-modal>Odustani</button>
            <button type="submit" class="btn btn--primary">Spremi</button>
          </div>
        </form>
      </div>
    </div>`;
}
