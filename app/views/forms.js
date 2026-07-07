import { ALL_CITIES, KREATOR_CATEGORIES, MAJSTOR_CATEGORIES } from "../data/categories.js";
import { REPORT_REASONS } from "../constants/reports.js";
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

export function renderAddWorkForm({ error = "" }) {
  return `
    <div class="modal-overlay" id="add-work-modal">
      <div class="modal-card">
        <h3 class="modal-card__title">Novi rad</h3>
        <p class="form-hint">Slika i opis su obavezni. Možete dodati najviše 3 rada.</p>
        ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ""}
        <form id="add-work-form" class="stack-form">
          <textarea class="field field--area" name="description" placeholder="Opis rada *" maxlength="600" required></textarea>
          <label class="btn btn--ghost btn--block work-image-picker">
            Odaberi sliku
            <input type="file" id="work-image-input" name="image" accept="image/*" hidden required />
          </label>
          <div id="work-image-preview" class="work-image-preview" hidden></div>
          <div class="modal-card__actions">
            <button type="button" class="btn btn--ghost" data-close-modal>Odustani</button>
            <button type="submit" class="btn btn--primary" id="add-work-submit">Sačuvaj</button>
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

export function renderActivityHideModal() {
  return `
    <div class="modal-overlay" id="activity-hide-modal">
      <div class="modal-card">
        <h3 class="modal-card__title">Ukloniti razgovor s ove kartice?</h3>
        <p class="form-hint">Ne briše se posao niti poruke u bazi — samo makne ovaj red iz „Moja aktivnost” na profilu. Razgovor i dalje možeš otvoriti pod Poslovi.</p>
        <div class="modal-card__actions">
          <button type="button" class="btn btn--ghost" data-close-modal>Odustani</button>
          <button type="button" class="btn btn--primary" id="confirm-activity-hide-btn">Ukloni</button>
        </div>
      </div>
    </div>`;
}

export function renderReportModal({
  title,
  subtitle = "",
  error = "",
  selectedReason,
  reasons = REPORT_REASONS,
}) {
  const defaultReason = selectedReason || reasons[0];
  const reasonRows = reasons.map(
    (reason) => `
      <label class="check-row">
        <input type="radio" name="reportReason" value="${escapeHtml(reason)}" ${reason === defaultReason ? "checked" : ""}>
        <span>${escapeHtml(reason)}</span>
      </label>`
  ).join("");

  return `
    <div class="modal-overlay" id="report-modal">
      <div class="modal-card modal-card--wide">
        <h3 class="modal-card__title">${escapeHtml(title)}</h3>
        ${subtitle ? `<p class="form-hint">${escapeHtml(subtitle)}</p>` : ""}
        ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ""}
        <form id="report-form" class="stack-form">
          <div class="report-reasons">${reasons}</div>
          <textarea class="field field--area" name="details" maxlength="500" placeholder="Dodatni opis (opciono)"></textarea>
          <div class="modal-card__actions">
            <button type="button" class="btn btn--ghost" data-close-modal>Odustani</button>
            <button type="submit" class="btn btn--primary">Pošalji</button>
          </div>
        </form>
      </div>
    </div>`;
}
