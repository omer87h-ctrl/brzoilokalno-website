import {
  KREATOR_CATEGORIES,
  MAJSTOR_CATEGORIES,
  categoryIcon,
  slugifyCategory,
} from "../data/categories.js";
import { escapeHtml } from "../utils/format.js";
import { renderUserList } from "./shared.js";
import { renderScreenTabs } from "./ponude.js";

export function renderKategorijeTabs({ activeTab = "majstori" }) {
  return renderScreenTabs({
    ariaLabel: "Kategorije",
    activeId: activeTab,
    tabs: [
      { id: "majstori", label: "Majstori", href: "#/kategorije" },
      { id: "kreatori", label: "Kreatori", href: "#/kreatori" },
    ],
  });
}

function categoryCard(name, tab) {
  const slug = slugifyCategory(name);
  const icon = categoryIcon(name);
  const subtitle =
    tab === "majstori"
      ? "Pogledaj dostupne majstore u ovoj kategoriji"
      : "Pogledaj dostupne kreatore u ovoj kategoriji";

  return `
    <a class="category-card" href="#/kategorije/${slug}">
      <span class="category-card__icon" aria-hidden="true">${icon}</span>
      <div class="category-card__body">
        <h3 class="category-card__name">${escapeHtml(name)}</h3>
        <p class="category-card__sub">${escapeHtml(subtitle)}</p>
      </div>
      <span class="category-card__cta">Otvori ›</span>
    </a>`;
}

export function renderKategorijeGrid({ tab = "majstori" } = {}) {
  const categories = tab === "kreatori" ? KREATOR_CATEGORIES : MAJSTOR_CATEGORIES;
  const tabs = renderKategorijeTabs({ activeTab: tab });
  const cards = categories.map((cat) => categoryCard(cat, tab)).join("");

  return `
    <div class="screen-scroll">
      <article class="kategorije-header">
        <span class="kategorije-header__accent" aria-hidden="true"></span>
        <h2 class="screen-title">Kategorije</h2>
        <p class="screen-subtitle">Odaberi oblast i pregledaj majstore ili kreatore po kategoriji.</p>
        ${tabs}
      </article>
      <div class="category-list">${cards}</div>
    </div>`;
}

export function renderKategorijeList({ category, users, city = null, tab = "majstori" }) {
  const backHref = tab === "kreatori" ? "#/kreatori" : "#/kategorije";
  const roleLabel = tab === "kreatori" ? "kreatore" : "majstore";
  const cityLine = city ? `Grad: ${escapeHtml(city)} · ` : "";

  return `
    <div class="screen-scroll">
      <a class="back-link" href="${backHref}">← Sve kategorije</a>
      <h2 class="screen-title">${escapeHtml(category)}</h2>
      <p class="screen-subtitle">${cityLine}Dostupni ${roleLabel} u ovoj kategoriji</p>
      ${renderUserList(users, { emptyText: `Nema profila u ovoj kategoriji${city ? ` za grad ${escapeHtml(city)}` : ""}.` })}
    </div>`;
}
