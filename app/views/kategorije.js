import {
  KREATOR_CATEGORIES,
  MAJSTOR_CATEGORIES,
  slugifyCategory,
} from "../data/categories.js";
import { escapeHtml } from "../utils/format.js";
import { renderCategoryIcon } from "./categoryIcons.js";
import { renderUserList } from "./shared.js";
import { renderCityFilterChip, renderScreenTabs } from "./ponude.js";
import { renderScreenFeed } from "./screenFeed.js";

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
  const icon = renderCategoryIcon(name);
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
  const roleLabel = tab === "kreatori" ? "kreatore" : "majstore";

  return renderScreenFeed({
    tabs,
    title: "Kategorije",
    subtitleHtml: `Odaberi kategoriju i pregledaj ${roleLabel}`,
    bodyHtml: `<div class="category-list">${cards}</div>`,
    feedId: "kategorije-feed",
  });
}

export function renderKategorijeList({
  category,
  users,
  city = null,
  tab = "majstori",
  filterMyCity = false,
  userCity = "",
}) {
  const backHref = tab === "kreatori" ? "#/kreatori" : "#/kategorije";
  const roleLabel = tab === "kreatori" ? "kreatore" : "majstore";
  const cityChip = renderCityFilterChip({
    active: filterMyCity,
    city: userCity,
    id: "kategorije-city-filter",
  });

  return renderScreenFeed({
    tabs: renderKategorijeTabs({ activeTab: tab }),
    cityChip,
    backLink: `<a class="back-link" href="${backHref}">← Sve kategorije</a>`,
    title: category,
    subtitleHtml: `${city ? `Grad: ${escapeHtml(city)} · ` : ""}Dostupni ${roleLabel}`,
    bodyHtml: renderUserList(users, {
      emptyText: `Nema profila u ovoj kategoriji${city ? ` za grad ${escapeHtml(city)}` : ""}.`,
    }),
    feedId: "kategorije-feed",
  });
}
