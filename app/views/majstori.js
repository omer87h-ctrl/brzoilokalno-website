import { escapeHtml } from "../utils/format.js";
import { renderUserList } from "./shared.js";

const LIST_META = {
  top: {
    title: "Najbolje ocijenjeni",
    subtitle: (city) =>
      city ? `Najbolje ocijenjeni · ${city}` : "Najbolje ocijenjeni",
    empty: "Nema profila s ocjenama.",
  },
  slobodan: {
    title: "Slobodni sada",
    subtitle: (city) => (city ? `Slobodni sada · ${city}` : "Slobodni sada"),
    empty: "Nema slobodnih majstora/kreatora.",
  },
  blizu: {
    title: "Blizu mene",
    subtitle: (city) => (city ? `Blizu mene · ${city}` : "Blizu mene"),
    empty: (city) =>
      city
        ? `Nema profila u gradu ${city}.`
        : "Odaberi grad na početnoj ili postavi grad u profilu.",
  },
};

export function renderMajstoriList({ filter, users, city = null }) {
  const meta = LIST_META[filter] || LIST_META.blizu;

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/home">← Početna</a>
      <h2 class="screen-title">${escapeHtml(meta.title)}</h2>
      <p class="screen-subtitle">${escapeHtml(meta.subtitle(city))}</p>
      ${renderUserList(users, {
        emptyText: typeof meta.empty === "function" ? meta.empty(city) : meta.empty,
      })}
    </div>`;
}
