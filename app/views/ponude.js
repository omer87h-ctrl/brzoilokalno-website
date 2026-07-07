import { escapeHtml, formatTimestamp } from "../utils/format.js";

export function renderOfferCard(offer) {
  const title = escapeHtml(offer.title || "Ponuda");
  const city = escapeHtml(offer.city || "—");
  const category = escapeHtml(offer.category || "—");
  const budget = escapeHtml(offer.budget || "Dogovor");
  const when = escapeHtml(offer.availableWhen || "");
  const date = formatTimestamp(offer.timestamp);
  const author = escapeHtml(offer.authorName || "Korisnik");

  return `
    <a class="job-card" href="#/ponuda/${escapeHtml(offer.id)}">
      <div class="job-card__head">
        <h3 class="job-card__title">${title}</h3>
        <span class="job-card__date">${escapeHtml(date)}</span>
      </div>
      <p class="job-card__meta">${category} · ${city}</p>
      <p class="job-card__desc">${escapeHtml((offer.description || "").slice(0, 160))}${(offer.description || "").length > 160 ? "…" : ""}</p>
      <div class="job-card__foot">
        <span>${author}</span>
        <span>${budget}${when ? ` · ${when}` : ""}</span>
      </div>
    </a>`;
}

export function renderPosloviTabs({ activeTab }) {
  const potraznjaClass = activeTab === "potraznja" ? " poslovi-tabs__btn--active" : "";
  const ponudaClass = activeTab === "ponuda" ? " poslovi-tabs__btn--active" : "";

  return `
    <div class="poslovi-tabs" role="tablist" aria-label="Poslovi">
      <a href="#/poslovi" class="poslovi-tabs__btn${potraznjaClass}" role="tab">Potražnja</a>
      <a href="#/ponude" class="poslovi-tabs__btn${ponudaClass}" role="tab">Ponuda</a>
    </div>`;
}

export function renderCityFilterChip({ active, city }) {
  if (!city) return "";
  return `
    <button
      type="button"
      class="chip chip--btn chip--filter${active ? " chip--active" : ""}"
      id="poslovi-city-filter"
      data-active="${active ? "1" : "0"}">
      ${active ? "Samo moj grad" : "Svi gradovi"} · ${escapeHtml(city)}
    </button>`;
}

export function renderPonudaDetail({ offer }) {
  if (!offer) {
    return `
      <div class="screen-scroll">
        <a class="back-link" href="#/ponude">← Natrag na ponude</a>
        <div class="empty-state">Ponuda nije pronađena.</div>
      </div>`;
  }

  const title = escapeHtml(offer.title || "Ponuda");
  const city = escapeHtml(offer.city || "—");
  const category = escapeHtml(offer.category || "—");
  const budget = escapeHtml(offer.budget || "Dogovor");
  const when = escapeHtml(offer.availableWhen || "");
  const date = formatTimestamp(offer.timestamp);
  const author = escapeHtml(offer.authorName || "Korisnik");
  const role = escapeHtml(offer.authorRole || "");
  const desc = escapeHtml(offer.description || "Nema opisa.");
  const phone = offer.contactPhone ? escapeHtml(offer.contactPhone) : "";
  const ownerUid = offer.userId;

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/ponude">← Natrag na ponude</a>
      <article class="detail-card">
        <h2 class="detail-card__title">${title}</h2>
        <p class="detail-card__meta">${category} · ${city} · ${escapeHtml(date)}</p>
        <p class="detail-card__meta">${author}${role ? ` · ${role}` : ""}</p>
        <p class="detail-card__budget">${budget}${when ? ` · ${when}` : ""}</p>
        <p class="detail-card__desc">${desc}</p>
        ${phone ? `<p class="detail-card__meta">Kontakt: ${phone}</p>` : ""}
        ${
          ownerUid
            ? `<a class="btn btn--ghost btn--block" href="#/pregled/${escapeHtml(ownerUid)}">Pogledaj profil</a>`
            : ""
        }
      </article>
    </div>`;
}
