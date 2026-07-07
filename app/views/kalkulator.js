import { escapeHtml } from "../utils/format.js";

export function renderKalkulator() {
  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/home">← Početna</a>
      <h2 class="screen-title">Kalkulator</h2>
      <p class="screen-subtitle">Brza procjena cijene usluge</p>
      <div class="kalkulator-card">
        <p class="kalkulator-card__text">
          Kalkulator cijene uskoro dolazi na web verziju.
        </p>
        <p class="kalkulator-card__hint">
          Za sada koristi kalkulator u Android aplikaciji na AppGallery.
        </p>
      </div>
    </div>`;
}
