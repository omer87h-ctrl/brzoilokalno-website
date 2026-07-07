import { escapeHtml, formatTimestamp } from "../utils/format.js";
import { renderCityFilterChip, renderOfferCard, renderPosloviTabs } from "./ponude.js";
import { renderScreenFeed } from "./screenFeed.js";

export function renderPoslovi({
  jobs,
  offers = [],
  tab = "potraznja",
  filterMyCity = false,
  userCity = "",
  canCreateJob = false,
  canCreateOffer = false,
}) {
  const tabs = renderPosloviTabs({ activeTab: tab });
  const cityChip = renderCityFilterChip({ active: filterMyCity, city: userCity });

  const fab =
    (tab === "potraznja" && canCreateJob) || (tab === "ponuda" && canCreateOffer)
      ? `<button type="button" class="fab" id="poslovi-fab" data-fab-tab="${escapeHtml(tab)}" aria-label="Dodaj">+</button>`
      : "";

  if (tab === "ponuda") {
    const bodyHtml = offers.length
      ? `<div class="job-list">${offers.map((offer) => renderOfferCard(offer)).join("")}</div>`
      : `<div class="empty-state">Trenutno nema objavljenih ponuda.</div>`;

    return renderScreenFeed({
      tabs,
      cityChip,
      title: "Ponuda",
      subtitleHtml: offers.length
        ? `Ponude majstora i kreatora (${offers.length})`
        : "Ponude majstora i kreatora",
      bodyHtml,
      fab,
      feedId: "poslovi-feed",
    });
  }

  const bodyHtml = jobs.length
    ? `<div class="job-list">${renderJobCards(jobs)}</div>`
    : `<div class="empty-state">Trenutno nema objavljenih poslova.</div>`;

  const subtitleHtml = jobs.length
    ? `Oglasi korisnika (${jobs.length}) · <a class="inline-link" href="#/prijave">Moje prijave</a>`
    : `Oglasi korisnika · <a class="inline-link" href="#/prijave">Moje prijave</a>`;

  return renderScreenFeed({
    tabs,
    cityChip,
    title: "Potražnja",
    subtitleHtml,
    bodyHtml,
    fab,
    feedId: "poslovi-feed",
  });
}

function renderJobCards(jobs) {
  return jobs
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
}
