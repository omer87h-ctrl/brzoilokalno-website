import { escapeHtml } from "../utils/format.js";
import { renderUserList } from "./shared.js";

export function renderPretraga({ query, users, city = null }) {
  const q = escapeHtml(query || "");
  const cityLabel = city ? ` · ${escapeHtml(city)}` : "";

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/home">← Početna</a>
      <h2 class="screen-title">Pretraga</h2>
      <p class="screen-subtitle">Rezultati za „${q || "—"}”${cityLabel}</p>
      <form class="search-form search-form--page" id="pretraga-form">
        <span class="search-form__icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          class="search-form__input"
          name="q"
          value="${q}"
          placeholder="Pretraži majstore i kreatore"
          autocomplete="off"
        />
        <button type="submit" class="search-form__submit" aria-label="Traži">→</button>
      </form>
      ${renderUserList(users, {
        emptyText: query
          ? "Nema rezultata za ovu pretragu."
          : "Upiši ime, kategoriju ili grad.",
      })}
    </div>`;
}
