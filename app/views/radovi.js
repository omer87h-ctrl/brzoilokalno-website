import {
  escapeHtml,
  formatTimestamp,
  workImageUrl,
  workOwnerName,
} from "../utils/format.js";

export function renderWorkCard(work, { linkPrefix = "#/rad" } = {}) {
  const id = escapeHtml(work.id);
  const img = workImageUrl(work);
  const desc = escapeHtml((work.description || "").slice(0, 100));
  const owner = escapeHtml(workOwnerName(work));
  const date = formatTimestamp(work.timestamp);
  const thumb = img
    ? `<img class="work-card__img" src="${escapeHtml(img)}" alt="" loading="lazy" />`
    : `<div class="work-card__img work-card__img--placeholder" aria-hidden="true">🖼</div>`;

  return `
    <a class="work-card" href="${linkPrefix}/${id}">
      ${thumb}
      <div class="work-card__body">
        <p class="work-card__desc">${desc || "Javni rad"}</p>
        <p class="work-card__meta">${owner} · ${escapeHtml(date)}</p>
      </div>
    </a>`;
}

export function renderRadovi({ works }) {
  if (!works.length) {
    return `
      <div class="screen-scroll">
        <a class="back-link" href="#/home">← Natrag</a>
        <h2 class="screen-title">Radovi</h2>
        <p class="screen-subtitle">Javni radovi majstora i kreatora</p>
        <div class="empty-state">Trenutno nema javnih radova.</div>
      </div>`;
  }

  const cards = works.map((w) => renderWorkCard(w)).join("");

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/home">← Natrag</a>
      <h2 class="screen-title">Radovi</h2>
      <p class="screen-subtitle">Javni radovi (${works.length})</p>
      <div class="work-list">${cards}</div>
    </div>`;
}

export function renderRadPreview({ works }) {
  if (!works.length) return "";
  const cards = works.slice(0, 3).map((w) => renderWorkCard(w)).join("");
  return `
    <section class="home-works">
      <div class="home-works__head">
        <div>
          <h3 class="home-works__title">Radovi majstora i kreatora</h3>
          <p class="home-works__sub">Najnoviji javni radovi</p>
        </div>
        <a class="home-works__link" href="#/radovi">Vidi sve →</a>
      </div>
      <div class="work-list work-list--compact">${cards}</div>
    </section>`;
}

export function renderRad({ work }) {
  if (!work) {
    return `
      <div class="screen-scroll">
        <a class="back-link" href="#/radovi">← Natrag na radove</a>
        <div class="empty-state">Rad nije pronađen.</div>
      </div>`;
  }

  const img = workImageUrl(work);
  const owner = escapeHtml(workOwnerName(work));
  const role = escapeHtml(work.ownerRole || "");
  const date = formatTimestamp(work.timestamp);
  const desc = escapeHtml(work.description || "Nema opisa.");
  const ownerUid = work.userId || work.ownerId;
  const imgHtml = img
    ? `<img class="work-detail__img" src="${escapeHtml(img)}" alt="Rad" />`
    : "";

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/radovi">← Natrag na radove</a>
      <article class="detail-card work-detail">
        ${imgHtml}
        <p class="detail-card__meta">${owner}${role ? ` · ${role}` : ""} · ${escapeHtml(date)}</p>
        <p class="detail-card__desc">${desc}</p>
        ${
          ownerUid
            ? `<a class="btn btn--ghost btn--block" href="#/pregled/${escapeHtml(ownerUid)}">Pogledaj profil</a>`
            : ""
        }
      </article>
    </div>`;
}

export function renderProfileWorks({ works, uid }) {
  if (!works.length) return "";
  const cards = works
    .slice(0, 6)
    .map((w) => renderWorkCard(w, { linkPrefix: "#/rad" }))
    .join("");
  return `
    <section class="detail-section">
      <h3 class="detail-section__title">Javni radovi</h3>
      <div class="work-list work-list--compact">${cards}</div>
      ${
        works.length > 6
          ? `<a class="btn btn--ghost btn--block" href="#/radovi">Svi javni radovi</a>`
          : ""
      }
    </section>`;
}
