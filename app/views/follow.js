import { escapeHtml, workImageUrl } from "../utils/format.js";
import { resolveFollowableRole, viewerCanFollow } from "../utils/follow.js";

export function renderFollowButton({ profileUid, profileRole, viewerRole, isFollowing }) {
  if (!profileUid || !viewerCanFollow(viewerRole) || !resolveFollowableRole({ role: profileRole })) {
    return "";
  }
  const label = isFollowing ? "Pratiš" : "Zaprati";
  const cls = isFollowing ? "btn btn--ghost btn--sm follow-btn follow-btn--active" : "btn btn--primary btn--sm follow-btn";
  return `
    <button
      type="button"
      class="${cls}"
      id="follow-profile-btn"
      data-profile-uid="${escapeHtml(profileUid)}"
      data-following="${isFollowing ? "1" : "0"}">
      ${escapeHtml(label)}
    </button>`;
}

export function renderMojKrug({ following = [], followedWorks = [] }) {
  if (!following.length) return "";

  const people = following
    .map((entry) => {
      const name = escapeHtml(entry.displayName || "Korisnik");
      const meta = escapeHtml(
        [entry.category || entry.occupation, entry.city, entry.status].filter(Boolean).join(" · ")
      );
      const thumb = entry.profileImageUrlThumb
        ? `<img class="moj-krug-card__img" src="${escapeHtml(entry.profileImageUrlThumb)}" alt="" loading="lazy" />`
        : `<div class="moj-krug-card__img moj-krug-card__img--placeholder">${name.charAt(0)}</div>`;
      return `
        <a class="moj-krug-card" href="#/pregled/${escapeHtml(entry.targetUid)}">
          ${thumb}
          <div class="moj-krug-card__body">
            <h4 class="moj-krug-card__name">${name}</h4>
            <p class="moj-krug-card__meta">${meta}</p>
          </div>
        </a>`;
    })
    .join("");

  const works = followedWorks
    .slice(0, 3)
    .map((work) => {
      const img = workImageUrl(work);
      const owner = escapeHtml(work.ownerDisplayName || work.userDisplayName || "Rad");
      const imgHtml = img
        ? `<img class="moj-krug-work__img" src="${escapeHtml(img)}" alt="" loading="lazy" />`
        : `<div class="moj-krug-work__img moj-krug-work__img--placeholder">🖼</div>`;
      return `
        <a class="moj-krug-work" href="#/rad/${escapeHtml(work.id)}">
          ${imgHtml}
          <span class="moj-krug-work__label">${owner}</span>
        </a>`;
    })
    .join("");

  return `
    <section class="moj-krug-section">
      <div class="moj-krug-section__head">
        <h3 class="detail-section__title">Moj krug · ${following.length}</h3>
      </div>
      <div class="moj-krug-row">${people}</div>
      ${works ? `<div class="moj-krug-works">${works}</div>` : ""}
    </section>`;
}

export function renderFollowerCount(count) {
  if (!count) return "";
  return `<p class="profile-card__meta">Pratioci · ${count}</p>`;
}
