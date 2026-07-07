import { escapeHtml } from "../utils/format.js";

export function renderSecurityCenter({ dataSaver = false }) {
  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/postavke">← Postavke</a>
      <h2 class="screen-title">Optimizacija aplikacije</h2>
      <section class="settings-group">
        <label class="check-row">
          <input type="checkbox" id="security-data-saver" ${dataSaver ? "checked" : ""}>
          <span>Manje agresivno učitavanje slika</span>
        </label>
        <button type="button" class="btn btn--ghost btn--block" id="clear-sw-cache-btn">Očisti keš aplikacije</button>
        <p class="form-hint">Keš se čuva lokalno u pregledniku radi bržeg učitavanja.</p>
      </section>
    </div>`;
}
