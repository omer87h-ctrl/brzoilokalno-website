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

export function renderScreenTabs({ tabs, activeId, ariaLabel }) {
  const items = tabs
    .map((tab) => {
      const active = tab.id === activeId ? " poslovi-tabs__btn--active" : "";
      return `<a href="${tab.href}" class="poslovi-tabs__btn${active}" role="tab">${escapeHtml(tab.label)}</a>`;
    })
    .join("");

  return `
    <div class="poslovi-tabs" role="tablist" aria-label="${escapeHtml(ariaLabel)}">
      ${items}
    </div>`;
}

export function renderPosloviTabs({ activeTab }) {
  return renderScreenTabs({
    ariaLabel: "Poslovi",
    activeId: activeTab,
    tabs: [
      { id: "potraznja", label: "Potražnja", href: "#/poslovi" },
      { id: "ponuda", label: "Ponuda", href: "#/ponude" },
    ],
  });
}

export function renderCityFilterChip({ active, city, id = "poslovi-city-filter" }) {
  if (!city) return "";
  return `
    <button
      type="button"
      class="chip chip--btn chip--filter${active ? " chip--active" : ""}"
      id="${escapeHtml(id)}"
      data-active="${active ? "1" : "0"}">
      ${active ? "Samo moj grad" : "Svi gradovi"} · ${escapeHtml(city)}
    </button>`;
}

export function renderPonudaDetail({ offer, currentUid = "" }) {
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
  const isOwner = ownerUid && ownerUid === currentUid;

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
        ${
          isOwner
            ? `<div class="detail-actions">
                <button type="button" class="btn btn--ghost btn--danger" id="delete-offer-btn" data-offer-id="${escapeHtml(offer.id)}">Obriši ponudu</button>
              </div>`
            : ""
        }
      </article>
    </div>`;
}
