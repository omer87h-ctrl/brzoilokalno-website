import { POPULAR_CITIES } from "../data/categories.js";
import { escapeHtml } from "../utils/format.js";

export function renderHome({ selectedCity = "" }) {
  const chips = POPULAR_CITIES.map((city) => {
    const active = selectedCity === city ? " chip--active" : "";
    return `<button type="button" class="chip chip--btn${active}" data-city="${escapeHtml(city)}">${escapeHtml(city)}</button>`;
  }).join("");

  const cityHint = selectedCity
    ? `U gradu: ${escapeHtml(selectedCity)} (ocjene i broj recenzija)`
    : "Top majstori i kreatori (ocjene)";

  const slobodniSub = selectedCity
    ? `Dostupni u: ${escapeHtml(selectedCity)}`
    : "Hitne intervencije (status slobodan)";

  const blizuSub = selectedCity ? `U: ${escapeHtml(selectedCity)}` : "U tvom gradu";

  return `
    <div class="home-screen">
      <p class="home-greeting">Dobrodošli u Brzo i Lokalno</p>
      <div class="search-bar">
        <span class="search-bar__icon" aria-hidden="true">⌕</span>
        <span class="search-bar__text">Pretraži majstore i kreatore</span>
        <button type="button" class="brzo-btn" id="home-auto-izbor-btn" data-action="auto-izbor">
          <span class="brzo-btn__bolt" aria-hidden="true">⚡</span>
          Auto izbor
        </button>
      </div>
      <div class="city-chips-block">
        <p class="city-chips-label">Popularni gradovi</p>
        <p class="city-chips-hint">Filtar za kartice ispod (top, slobodni, blizu mene).</p>
        <div class="chip-row" aria-label="Popularni gradovi">${chips}</div>
      </div>
      <div class="home-grid">
        <button type="button" class="home-card home-card--blue home-card--btn" data-action="lista-top">
          <span class="home-card__icon">★</span>
          <h3>Najbolje ocijenjeni</h3>
          <p>${cityHint}</p>
        </button>
        <button type="button" class="home-card home-card--green home-card--btn" data-action="lista-slobodan">
          <span class="home-card__icon">🔧</span>
          <h3>Slobodni sada</h3>
          <p>${slobodniSub}</p>
        </button>
        <button type="button" class="home-card home-card--purple home-card--btn" data-action="lista-blizu">
          <span class="home-card__icon">📍</span>
          <h3>Blizu mene</h3>
          <p>${blizuSub}</p>
        </button>
        <button type="button" class="home-card home-card--neutral home-card--btn" data-action="kalkulator">
          <span class="home-card__icon">🧮</span>
          <h3>Kalkulator</h3>
          <p>Brza procjena cijene usluge</p>
        </button>
      </div>
    </div>`;
}
