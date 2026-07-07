import { escapeHtml, formatTimestamp } from "../utils/format.js";
import { renderCityFilterChip, renderOfferCard, renderPosloviTabs } from "./ponude.js";

export function renderPoslovi({
  jobs,
  offers = [],
  tab = "potraznja",
  filterMyCity = false,
  userCity = "",
}) {
  const tabs = renderPosloviTabs({ activeTab: tab });
  const cityChip = renderCityFilterChip({ active: filterMyCity, city: userCity });

  if (tab === "ponuda") {
    if (!offers.length) {
      return `
        <div class="screen-scroll">
          ${tabs}
          ${cityChip ? `<div class="chip-row chip-row--filters">${cityChip}</div>` : ""}
          <h2 class="screen-title">Ponuda</h2>
          <p class="screen-subtitle">Ponude majstora i kreatora</p>
          <div class="empty-state">Trenutno nema objavljenih ponuda.</div>
        </div>`;
    }

    const cards = offers.map((offer) => renderOfferCard(offer)).join("");
    return `
      <div class="screen-scroll">
        ${tabs}
        ${cityChip ? `<div class="chip-row chip-row--filters">${cityChip}</div>` : ""}
        <h2 class="screen-title">Ponuda</h2>
        <p class="screen-subtitle">Ponude majstora i kreatora (${offers.length})</p>
        <div class="job-list">${cards}</div>
      </div>`;
  }

  if (!jobs.length) {
    return `
      <div class="screen-scroll">
        ${tabs}
        ${cityChip ? `<div class="chip-row chip-row--filters">${cityChip}</div>` : ""}
        <h2 class="screen-title">Potražnja</h2>
        <p class="screen-subtitle">Oglasi korisnika · <a class="inline-link" href="#/prijave">Moje prijave</a></p>
        <div class="empty-state">Trenutno nema objavljenih poslova.</div>
      </div>`;
  }

  const cards = jobs
    .map((job) => {
      const title = escapeHtml(job.title || "Bez naslova");
      const city = escapeHtml(job.city || "—");
      const category = escapeHtml(job.category || "—");
      const budget = escapeHtml(job.budget || "Dogovor");
      const when = escapeHtml(job.whenNeeded || job.neededWhen || "");
      const date = formatTimestamp(job.timestamp);
      const author = escapeHtml(job.authorName || "Korisnik");

      return `
        <a class="job-card" href="#/posao/${escapeHtml(job.id)}">
          <div class="job-card__head">
            <h3 class="job-card__title">${title}</h3>
            <span class="job-card__date">${escapeHtml(date)}</span>
          </div>
          <p class="job-card__meta">${category} · ${city}</p>
          <p class="job-card__desc">${escapeHtml((job.description || "").slice(0, 160))}${(job.description || "").length > 160 ? "…" : ""}</p>
          <div class="job-card__foot">
            <span>${author}</span>
            <span>${budget}${when ? ` · ${when}` : ""}</span>
          </div>
        </a>`;
    })
    .join("");

  return `
    <div class="screen-scroll">
      ${tabs}
      ${cityChip ? `<div class="chip-row chip-row--filters">${cityChip}</div>` : ""}
      <h2 class="screen-title">Potražnja</h2>
      <p class="screen-subtitle">Oglasi korisnika (${jobs.length}) · <a class="inline-link" href="#/prijave">Moje prijave</a></p>
      <div class="job-list">${cards}</div>
    </div>`;
}
