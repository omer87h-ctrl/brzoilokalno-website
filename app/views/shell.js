import { renderBottomNav } from "../components/bottomNav.js";
import { ADMIN_EMAIL } from "../firebase.js";

/** Osnovni layout kao Android app — Faza 1 placeholder sadržaj */

export function renderShell({ route, userEmail }) {
  const activeNav = routeToNav(route);
  const content = renderRouteContent(route);

  return `
    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar__brand">
          <img src="icons/icon-192.png" alt="" width="32" height="32">
          <span>Brzo i <em>Lokalno</em></span>
        </div>
        <div class="app-topbar__meta">
          <span class="app-badge app-badge--test">Test</span>
          <button type="button" class="app-topbar__logout" id="logout-btn" title="Odjava">⎋</button>
        </div>
      </header>
      <main class="app-main" id="app-main">
        ${content}
      </main>
      ${renderBottomNav(activeNav)}
      <p class="app-admin-note">Admin: ${escapeHtml(userEmail || ADMIN_EMAIL)}</p>
    </div>`;
}

function routeToNav(route) {
  if (route.startsWith("/kategorije")) return "kategorije";
  if (route.startsWith("/poslovi")) return "poslovi";
  if (route.startsWith("/profil")) return "profil";
  return "home";
}

function renderRouteContent(route) {
  if (route.startsWith("/home") || route === "/" || route === "") {
    return renderHomePlaceholder();
  }
  return `
    <div class="placeholder-screen">
      <h2>Uskoro</h2>
      <p>Ova sekcija dolazi u sljedećoj fazi.</p>
      <a class="btn btn--ghost" href="#/home">Natrag na Home</a>
    </div>`;
}

function renderHomePlaceholder() {
  return `
    <div class="home-screen">
      <p class="home-greeting">Dobrodošli u Brzo i Lokalno</p>
      <div class="search-bar">
        <span class="search-bar__icon" aria-hidden="true">⌕</span>
        <span class="search-bar__text">Pretraži</span>
        <button type="button" class="brzo-btn" disabled>
          <span class="brzo-btn__bolt" aria-hidden="true">⚡</span>
          Brzo
        </button>
      </div>
      <div class="chip-row" aria-label="Popularni gradovi">
        <span class="chip">Kladanj</span>
        <span class="chip">Tuzla</span>
        <span class="chip">Sarajevo</span>
        <span class="chip">Zenica</span>
      </div>
      <div class="home-grid">
        <article class="home-card home-card--accent">
          <span class="home-card__icon">⚡</span>
          <h3>Brzo do majstora</h3>
          <p>Pametna pretraga — uskoro</p>
        </article>
        <article class="home-card">
          <span class="home-card__icon">★</span>
          <h3>Najbolje ocijenjeni</h3>
          <p>Uskoro</p>
        </article>
        <article class="home-card">
          <span class="home-card__icon">🔧</span>
          <h3>Slobodni sada</h3>
          <p>Uskoro</p>
        </article>
        <article class="home-card">
          <span class="home-card__icon">📍</span>
          <h3>Blizu mene</h3>
          <p>Uskoro</p>
        </article>
      </div>
      <p class="home-phase-note">Faza 1 — osnovni layout. Login, kategorije i poslovi dolaze u Fazi 2.</p>
    </div>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
