import { POPULAR_CITIES } from "../data/categories.js";
import { escapeHtml } from "../utils/format.js";
import { renderRadPreview } from "./radovi.js";

export function renderHome({
  selectedCity = "",
  worksPreview = [],
  workSlideIndex = 0,
  userName = "",
  userRole = "",
  userCity = "",
}) {
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

  const greeting = userName
    ? `Dobrodošli, ${escapeHtml(userName)}`
    : "Dobrodošli u Brzo i Lokalno";

  const profileLine = [userRole, userCity]
    .filter(Boolean)
    .map((v) => escapeHtml(v))
    .join(" · ");

  return `
    <div class="home-screen">
      <div class="home-hero">
        <p class="home-greeting">${greeting}</p>
        ${profileLine ? `<p class="home-profile-line">${profileLine}</p>` : ""}
      </div>
      <form class="search-form" id="home-search-form">
        <span class="search-form__icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          class="search-form__input"
          name="q"
          placeholder="Pretraži"
          autocomplete="off"
        />
        <button type="submit" class="search-form__submit" aria-label="Traži">→</button>
        <button type="button" class="brzo-btn" id="home-auto-izbor-btn" data-action="auto-izbor">
          <span class="brzo-btn__bolt" aria-hidden="true">⚡</span>
          Auto izbor
        </button>
      </form>
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
      ${renderRadPreview({ works: worksPreview, slideIndex: workSlideIndex })}
    </div>`;
}
