import {
  KREATOR_CATEGORIES,
  MAJSTOR_CATEGORIES,
  slugifyCategory,
} from "../data/categories.js";
import { escapeHtml } from "../utils/format.js";
import { renderUserList } from "./shared.js";

export function renderKategorijeGrid() {
  return `
    <div class="screen-scroll">
      <h2 class="screen-title">Kategorije</h2>
      <p class="screen-subtitle">Odaberi kategoriju majstora ili kreatora</p>
      <h3 class="section-label">Majstori</h3>
      <div class="category-grid">
        ${MAJSTOR_CATEGORIES.map((cat) => categoryTile(cat)).join("")}
      </div>
      <h3 class="section-label">Kreatori</h3>
      <div class="category-grid">
        ${KREATOR_CATEGORIES.map((cat) => categoryTile(cat)).join("")}
      </div>
    </div>`;
}

function categoryTile(name) {
  const slug = slugifyCategory(name);
  return `
    <a class="category-tile" href="#/kategorije/${slug}">
      <span class="category-tile__name">${escapeHtml(name)}</span>
    </a>`;
}

export function renderKategorijeList({ category, users, city = null }) {
  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/kategorije">← Sve kategorije</a>
      <h2 class="screen-title">${escapeHtml(category)}</h2>
      <p class="screen-subtitle">${city ? `Grad: ${escapeHtml(city)} · ` : ""}Read-only pregled profila</p>
      ${renderUserList(users, { emptyText: "Nema profila u ovoj kategoriji." })}
    </div>`;
}
