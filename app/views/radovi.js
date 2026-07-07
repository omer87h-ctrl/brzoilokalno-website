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
  const head = `
    <a class="back-link" href="#/home">← Natrag</a>
    <h2 class="screen-title">Svi javni radovi</h2>
    <p class="screen-subtitle">Radovi majstora i kreatora</p>`;

  if (!works.length) {
    return `
      <div class="screen-scroll">
        ${head}
        <div class="home-works__frame home-works__frame--empty">Još nema javno podijeljenih radova</div>
      </div>`;
  }

  const cards = works
    .map((work) => {
      const img = workImageUrl(work);
      const desc = escapeHtml((work.description || "").slice(0, 140) || "Javni rad");
      const owner = escapeHtml(workOwnerName(work));
      const date = formatTimestamp(work.timestamp);
      const imgHtml = img
        ? `<img class="work-grid-card__img" src="${escapeHtml(img)}" alt="" loading="lazy" />`
        : `<div class="work-grid-card__img work-grid-card__img--placeholder">🖼</div>`;

      return `
        <a class="work-grid-card" href="#/rad/${escapeHtml(work.id)}">
          ${imgHtml}
          <div class="work-grid-card__body">
            <p class="work-grid-card__desc">${desc}</p>
            <p class="work-grid-card__meta">${owner} · ${escapeHtml(date)}</p>
          </div>
        </a>`;
    })
    .join("");

  return `
    <div class="screen-scroll">
      ${head}
      <div class="work-grid">${cards}</div>
    </div>`;
}

export function renderRadPreview({ works, slideIndex = 0 }) {
  const safeIndex = Math.max(0, Math.min(slideIndex, Math.max(works.length - 1, 0)));

  if (!works.length) {
    return `
      <section class="home-works">
        <div class="home-works__head">
          <div>
            <h3 class="home-works__title">Radovi majstora i kreatora</h3>
            <p class="home-works__sub">Najnoviji javni radovi</p>
          </div>
          <a class="home-works__link" href="#/radovi">Vidi sve →</a>
        </div>
        <div class="home-works__frame home-works__frame--empty">
          <p>Još nema javno podijeljenih radova</p>
        </div>
      </section>`;
  }

  const slides = works
    .slice(0, 3)
    .map((work, index) => {
      const img = workImageUrl(work);
      const desc = escapeHtml((work.description || "").slice(0, 120) || "Javni rad");
      const owner = escapeHtml(workOwnerName(work));
      const hidden = index === safeIndex ? "" : " home-works__slide--hidden";
      const imgHtml = img
        ? `<img class="home-works__image" src="${escapeHtml(img)}" alt="" loading="lazy" />`
        : `<div class="home-works__image home-works__image--placeholder">🖼</div>`;

      return `
        <a class="home-works__slide${hidden}" href="#/rad/${escapeHtml(work.id)}" data-work-slide="${index}">
          ${imgHtml}
          <div class="home-works__overlay">
            <p class="home-works__desc">${desc}</p>
            <p class="home-works__owner">${owner}</p>
          </div>
        </a>`;
    })
    .join("");

  const dots =
    works.length > 1
      ? `<div class="home-works__dots" aria-hidden="true">
          ${works
            .slice(0, 3)
            .map((_, index) => {
              const active = index === safeIndex ? " home-works__dot--active" : "";
              return `<button type="button" class="home-works__dot${active}" data-work-dot="${index}"></button>`;
            })
            .join("")}
        </div>`
      : "";

  return `
    <section class="home-works">
      <div class="home-works__head">
        <div>
          <h3 class="home-works__title">Radovi majstora i kreatora</h3>
          <p class="home-works__sub">Najnoviji javni radovi</p>
        </div>
        <a class="home-works__link" href="#/radovi">Vidi sve →</a>
      </div>
      <div class="home-works__frame" id="home-works-carousel">
        ${slides}
        ${works.length > 1 ? `<p class="home-works__hint">← prevuci / klikni tačke →</p>` : ""}
      </div>
      ${dots}
    </section>`;
}

export function renderRad({ work, currentUid = "" }) {
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
  const isOwner = ownerUid && ownerUid === currentUid;
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
        ${
          !isOwner && currentUid
            ? `<button type="button" class="btn btn--ghost btn--block" id="report-work-btn" data-work-id="${escapeHtml(work.id)}">Prijavi rad</button>`
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
