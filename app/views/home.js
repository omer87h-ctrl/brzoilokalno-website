import { POPULAR_CITIES } from "../data/categories.js";
import { escapeHtml } from "../utils/format.js";
import { renderRadPreview } from "./radovi.js";
import { renderMojKrug } from "./follow.js";
import { HOME_CARD_ICONS } from "./homeIcons.js";

const AUTO_IZBOR_BOLT = `<span class="brzo-btn__bolt-glyph" aria-hidden="true">⚡</span>`;

export function renderHomeTips({ tips = [], loading = false, myHomeTip = null, userRole = "", currentUid = "" }) {
  if (loading) {
    return `
      <section class="home-tips">
        <h3 class="home-tips__title">Savjeti majstora i kreatora</h3>
        <p class="home-tips__sub">učitavanje…</p>
      </section>`;
  }

  const worker = userRole === "majstor" || userRole === "kreator";
  const ownTipBanner =
    worker && myHomeTip
      ? `<p class="home-tips__own">✓ Tvoj savjet je aktivan na početnoj. Uredi ga na Profilu.</p>`
      : worker
        ? `<p class="home-tips__own home-tips__own--muted">Dodaj savjet na Profilu — prikazuje se ovdje 24 sata.</p>`
        : "";

  if (!tips.length) {
    return `
      <section class="home-tips">
        <h3 class="home-tips__title">Savjeti majstora i kreatora</h3>
        <p class="home-tips__sub">Profil → savjet za početnu</p>
        ${ownTipBanner}
        <p class="home-tips__empty">Trenutno nema aktivnih savjeta.</p>
      </section>`;
  }

  const cards = tips
    .map((tip) => {
      const fresh = tip.isFresh ? `<span class="tip-card__badge">NOVO</span>` : "";
      const canReport =
        currentUid && tip.authorUid && tip.authorUid !== currentUid && tip.id && !tip.id.startsWith("placeholder");
      return `
        <article class="tip-card">
          <div class="tip-card__head">
            <h4 class="tip-card__title">${escapeHtml(tip.title)}</h4>
            ${fresh}
          </div>
          <p class="tip-card__teaser">${escapeHtml(tip.teaser)}</p>
          ${tip.authorDisplayName ? `<p class="tip-card__author">${escapeHtml(tip.authorDisplayName)}</p>` : ""}
          ${tip.body ? `<details class="tip-card__details"><summary>Pročitaj više</summary><p>${escapeHtml(tip.body)}</p></details>` : ""}
          ${
            canReport
              ? `<button type="button" class="btn btn--ghost btn--sm btn--danger tip-card__report" data-report-tip="${escapeHtml(tip.id)}">Prijavi savjet</button>`
              : ""
          }
        </article>`;
    })
    .join("");

  return `
    <section class="home-tips">
      <h3 class="home-tips__title">Savjeti majstora i kreatora</h3>
      <p class="home-tips__sub">Profil → savjet za početnu</p>
      ${ownTipBanner}
      <div class="tip-list">${cards}</div>
    </section>`;
}

export function renderHome({
  selectedCity = "",
  worksPreview = [],
  workSlideIndex = 0,
  tips = [],
  tipsLoading = false,
  myHomeTip = null,
  userName = "",
  userRole = "",
  userCity = "",
  following = [],
  followedWorks = [],
  currentUid = "",
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
          <span class="brzo-btn__bolt" aria-hidden="true">${AUTO_IZBOR_BOLT}</span>
          <span class="brzo-btn__label">Auto izbor</span>
        </button>
      </form>
      <div class="city-chips-block">
        <p class="city-chips-label">Popularni gradovi</p>
        <p class="city-chips-hint">Filtar za kartice ispod (top, slobodni, blizu mene).</p>
        <div class="chip-row" aria-label="Popularni gradovi">${chips}</div>
      </div>
      <div class="home-grid">
        <button type="button" class="home-card home-card--blue home-card--btn" data-action="lista-top">
          ${HOME_CARD_ICONS.top}
          <h3>Najbolje ocijenjeni</h3>
          <p>${cityHint}</p>
        </button>
        <button type="button" class="home-card home-card--green home-card--btn" data-action="lista-slobodan">
          ${HOME_CARD_ICONS.slobodan}
          <h3>Slobodni sada</h3>
          <p>${slobodniSub}</p>
        </button>
        <button type="button" class="home-card home-card--purple home-card--btn" data-action="lista-blizu">
          ${HOME_CARD_ICONS.blizu}
          <h3>Blizu mene</h3>
          <p>${blizuSub}</p>
        </button>
        <button type="button" class="home-card home-card--neutral home-card--btn" data-action="kalkulator">
          ${HOME_CARD_ICONS.kalkulator}
          <h3>Kalkulator</h3>
          <p>Brza procjena cijene usluge</p>
        </button>
      </div>
      ${renderMojKrug({ following, followedWorks })}
      ${renderRadPreview({ works: worksPreview, slideIndex: workSlideIndex })}
      ${renderHomeTips({ tips, loading: tipsLoading, myHomeTip, userRole, currentUid })}
    </div>`;
}
