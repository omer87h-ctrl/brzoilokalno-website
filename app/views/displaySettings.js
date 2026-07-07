import { escapeHtml } from "../utils/format.js";
import { getDisplaySettings } from "../utils/displaySettings.js";

export function renderDisplaySettings() {
  const s = getDisplaySettings();
  const scale = Number(s.fontScale) || 1;

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/postavke">← Postavke</a>
      <h2 class="screen-title">Izgled i ponašanje</h2>
      <section class="settings-group">
        <label class="settings-row">
          <span>Veličina teksta</span>
          <select class="field field--compact" id="display-font-scale">
            <option value="1" ${scale === 1 ? "selected" : ""}>Standard</option>
            <option value="1.12" ${scale === 1.12 ? "selected" : ""}>Veće</option>
            <option value="1.24" ${scale === 1.24 ? "selected" : ""}>Najveće</option>
          </select>
        </label>
        <label class="check-row">
          <input type="checkbox" id="display-reduce-motion" ${s.reduceMotion ? "checked" : ""}>
          <span>Smanji animacije</span>
        </label>
        <label class="check-row">
          <input type="checkbox" id="display-remember-tab" ${s.rememberLastTab !== false ? "checked" : ""}>
          <span>Zapamti zadnju karticu</span>
        </label>
        <p class="form-hint">Postavke se čuvaju lokalno u pregledniku.</p>
      </section>
    </div>`;
}
