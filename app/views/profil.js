import { escapeHtml, formatRating, workImageUrl } from "../utils/format.js";
import { profileAvatarUrl } from "../services/storageService.js";
import { renderProfileWorks } from "./radovi.js";
import { renderRatingSection } from "./rating.js";
import { renderFollowButton, renderFollowerCount } from "./follow.js";
import { renderMojaAktivnost } from "./aktivnost.js";
import { renderOutdoorPlan } from "./outdoorPlan.js";
import { renderProfileMetaBadges } from "./verifiedBadge.js";
import {
  renderRepresentationFields,
  renderRepresentationSummary,
} from "../utils/representation.js";
import { ALL_CITIES, KREATOR_CATEGORIES, MAJSTOR_CATEGORIES } from "../data/categories.js";

function isWorker(role) {
  return role === "majstor" || role === "kreator";
}

function renderAvatar(user, className = "profile-card__avatar") {
  const avatarUrl = profileAvatarUrl(user);
  const initial = escapeHtml((user.displayName || "K").charAt(0).toUpperCase());
  if (avatarUrl) {
    return `<img class="${className} ${className}--img" src="${escapeHtml(avatarUrl)}" alt="" />`;
  }
  return `<div class="${className}">${initial}</div>`;
}

function dialablePhone(phone = "") {
  return String(phone || "").replace(/[^\d+]/g, "");
}

function renderProfileContactActions(user) {
  if (!isWorker(user?.role)) return "";
  const rawPhone = String(user?.contactPhone || "").trim();
  const phone = dialablePhone(rawPhone);
  const showPhone = Boolean(phone) && user?.allowPhoneCall !== false && user?.preferInAppChat !== true;
  const showWhatsApp = Boolean(phone) && user?.allowWhatsApp !== false && user?.preferInAppChat !== true;
  if (!showPhone && !showWhatsApp) return "";

  return `
    <div class="detail-actions">
      ${showPhone ? `<a class="btn btn--primary" href="tel:${escapeHtml(phone)}">Pozovi</a>` : ""}
      ${showWhatsApp ? `<a class="btn btn--ghost" href="https://wa.me/${escapeHtml(phone.replace(/^\+/, ""))}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : ""}
    </div>`;
}

const ICON_NOTES = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
const ICON_EDIT = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
const ICON_BELL = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>`;
const ICON_SETTINGS = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>`;

function normalizedStatus(status) {
  return status === "zauzet" ? "zauzet" : "slobodan";
}

function renderProfileQuickActions(unreadBellNotifications = 0) {
  const badge =
    unreadBellNotifications > 0
      ? `<span class="profile-quick-action__badge">${unreadBellNotifications > 9 ? "9+" : unreadBellNotifications}</span>`
      : "";
  return `
    <div class="profile-card__quick-actions">
      <a class="profile-quick-action" href="#/biljeske">
        <span class="profile-quick-action__icon">${ICON_NOTES}</span>
        <span class="profile-quick-action__label">Bilješke</span>
      </a>
      <a class="profile-quick-action" href="#/obavijesti" title="Obavijesti">
        <span class="profile-quick-action__icon">${ICON_BELL}${badge}</span>
        <span class="profile-quick-action__label">Obavijesti</span>
      </a>
      <a class="profile-quick-action" href="#/postavke">
        <span class="profile-quick-action__icon">${ICON_SETTINGS}</span>
        <span class="profile-quick-action__label">Postavke</span>
      </a>
      <button type="button" class="profile-quick-action" id="edit-profile-btn">
        <span class="profile-quick-action__icon">${ICON_EDIT}</span>
        <span class="profile-quick-action__label">Uredi profil</span>
      </button>
    </div>`;
}

function renderProfileStatusToggle(user) {
  if (!isWorker(user?.role)) return "";
  const status = normalizedStatus(user?.status);
  const isFree = status === "slobodan";
  return `
    <button
      type="button"
      class="profile-status-toggle${isFree ? " profile-status-toggle--free" : " profile-status-toggle--busy"}"
      id="profile-status-toggle"
      data-status="${status}"
      title="Dodirni za promjenu statusa"
    >
      <span class="profile-status-toggle__dot" aria-hidden="true"></span>
      <span class="profile-status-toggle__label">${isFree ? "SLOBODAN" : "ZAUZET"}</span>
    </button>`;
}

function renderMyWorksSection({ works = [], canAdd = false }) {
  const cards = works
    .map((work) => {
      const img = workImageUrl(work);
      const desc = escapeHtml((work.description || "").slice(0, 120));
      const isPublic = work.isPublic === true;
      const imgHtml = img
        ? `<img class="my-work-card__img" src="${escapeHtml(img)}" alt="" loading="lazy" />`
        : `<div class="my-work-card__img my-work-card__img--placeholder">🖼</div>`;

      return `
        <article class="my-work-card" data-work-id="${escapeHtml(work.id)}">
          ${imgHtml}
          <div class="my-work-card__body">
            <p class="my-work-card__desc">${desc || "Rad"}</p>
            <label class="my-work-card__public">
              <input type="checkbox" class="work-public-toggle" data-work-id="${escapeHtml(work.id)}" ${isPublic ? "checked" : ""}>
              <span>Javno</span>
            </label>
            <button type="button" class="my-work-card__delete work-delete-btn" data-work-id="${escapeHtml(work.id)}" aria-label="Obriši rad">Obriši</button>
          </div>
        </article>`;
    })
    .join("");

  const empty = works.length
    ? ""
    : `<div class="my-works-empty">Nema još dodanih radova. Dodajte radove za veću vidljivost.</div>`;

  const addBtn =
    canAdd && works.length < 3
      ? `<button type="button" class="btn btn--primary btn--sm" id="add-work-btn">Dodaj rad</button>`
      : "";
  const limitHint =
    works.length >= 3 ? `<p class="form-hint">Možete imati najviše 3 rada.</p>` : "";

  return `
    <section class="detail-section my-works-section">
      <div class="my-works-section__head">
        <h3 class="detail-section__title">Moji radovi</h3>
        ${addBtn}
      </div>
      ${limitHint}
      ${empty}
      ${works.length ? `<div class="my-works-row">${cards}</div>` : ""}
    </section>`;
}

function cityOptions(selected = "") {
  return ALL_CITIES.map((city) => {
    const sel = city === selected ? " selected" : "";
    return `<option value="${escapeHtml(city)}"${sel}>${escapeHtml(city)}</option>`;
  }).join("");
}

function categoryOptions(role, selected = "") {
  const list = role === "kreator" ? KREATOR_CATEGORIES : MAJSTOR_CATEGORIES;
  return list.map((cat) => {
    const sel = cat === selected ? " selected" : "";
    return `<option value="${escapeHtml(cat)}"${sel}>${escapeHtml(cat)}</option>`;
  }).join("");
}

function tipExpiryLabel(myTip) {
  const ms = Number(myTip?.expiresAtMs) || 0;
  if (!ms) return "";
  return new Date(ms).toLocaleString("bs-BA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function renderProfil({
  user,
  authEmail,
  editing = false,
  formError = "",
  myTip = null,
  myWorks = [],
  activityDashboard = null,
  aktivnostExpanded = false,
  hiddenActivityAppIds = [],
  outdoorOutlook = null,
  outdoorLoading = false,
  outdoorMissingKey = false,
  outdoorForecastFailed = false,
  outdoorExpanded = false,
  followerCount = 0,
  chatEnabled = false,
  unreadBellNotifications = 0,
}) {
  if (!user) {
    return `
      <div class="screen-scroll">
        <h2 class="screen-title">Profil</h2>
        <div class="empty-state">Profil nije pronađen u bazi za ovaj nalog.</div>
        <p class="screen-subtitle">Prijavljen: ${escapeHtml(authEmail || "")}</p>
      </div>`;
  }

  const role = user.role || "korisnik";
  const worker = isWorker(role);
  const avatarHtml = renderAvatar(user);

  if (!editing) {
    const rating = escapeHtml(
      user.ratingCount > 0 ? `${Number(user.ratingAverage || 0).toFixed(1)} ★ (${user.ratingCount})` : "Nema ocjena"
    );
    const avatarUrl = profileAvatarUrl(user);
    return `
      <div class="screen-scroll">
        <h2 class="screen-title">Profil</h2>
        <article class="profile-card">
          <div class="profile-card__head">
            <div class="profile-card__avatar-wrap">
              ${avatarHtml}
              <label class="profile-avatar-upload" title="Promijeni sliku">
                <input type="file" id="profile-image-input" accept="image/*" hidden />
                <span aria-hidden="true">+</span>
              </label>
            </div>
            ${renderProfileQuickActions(unreadBellNotifications)}
          </div>
          <h3 class="profile-card__name">${escapeHtml(user.displayName || "Korisnik")}</h3>
          ${renderProfileMetaBadges(user)}
          ${renderProfileStatusToggle(user)}
          <p class="profile-card__meta">${escapeHtml(role)} · ${escapeHtml(user.category || user.occupation || "—")}</p>
          <p class="profile-card__meta">${escapeHtml(user.city || "—")}</p>
          ${renderRepresentationSummary(user)}
          <p class="profile-card__rating">${rating}</p>
          ${worker ? renderFollowerCount(followerCount) : ""}
          <p class="profile-card__desc">${escapeHtml(user.description || "Nema opisa.")}</p>
          <p class="profile-card__email">${escapeHtml(user.email || authEmail || "")}</p>
          ${user.contactPhone ? `<p class="profile-card__meta">Tel: ${escapeHtml(user.contactPhone)}</p>` : ""}
          ${user.preferInAppChat ? `<p class="profile-card__meta">Samo chat u aplikaciji</p>` : ""}
          ${
            worker && myTip
              ? `<p class="profile-card__tip-status">✓ Savjet aktivan na početnoj · ističe ${escapeHtml(tipExpiryLabel(myTip))}</p>`
              : worker
                ? `<p class="profile-card__tip-status profile-card__tip-status--muted">Nema aktivnog savjeta na početnoj</p>`
                : ""
          }
          ${avatarUrl ? `<button type="button" class="btn btn--ghost btn--sm btn--danger profile-remove-photo" id="delete-profile-image-btn">Ukloni sliku</button>` : ""}
        </article>
        <div class="profile-actions">
          ${worker ? `<button type="button" class="btn btn--ghost btn--block" id="edit-tip-btn">${myTip ? "Uredi savjet" : "Dodaj savjet za početnu"}</button>` : ""}
          ${worker && myTip ? `<button type="button" class="btn btn--ghost btn--block btn--danger" id="delete-tip-profile-btn">Obriši savjet</button>` : ""}
        </div>
        ${renderMojaAktivnost({
          dashboard: activityDashboard,
          expanded: aktivnostExpanded,
          chatEnabled,
          hiddenAppIds: hiddenActivityAppIds,
        })}
        ${worker ? renderMyWorksSection({ works: myWorks, canAdd: true }) : ""}
        ${renderOutdoorPlan({
          outlook: outdoorOutlook,
          loading: outdoorLoading,
          missingKey: outdoorMissingKey,
          missingCity: !user?.city,
          missingRole: !["majstor", "kreator", "korisnik"].includes(role),
          forecastFailed: outdoorForecastFailed,
          role,
          expanded: outdoorExpanded,
        })}
      </div>`;
  }

  return `
    <div class="screen-scroll">
      <h2 class="screen-title">Uredi profil</h2>
      ${formError ? `<p class="form-error">${escapeHtml(formError)}</p>` : ""}
      <form id="profile-edit-form" class="stack-form">
        <input class="field" name="displayName" value="${escapeHtml(user.displayName || "")}" maxlength="60" placeholder="Ime / naziv *" required>
        <select class="field" name="city" required>
          <option value="">Grad *</option>
          ${cityOptions(user.city)}
        </select>
        <textarea class="field field--area" name="description" maxlength="420" placeholder="Opis">${escapeHtml(user.description || "")}</textarea>
        <input class="field" name="contactPhone" value="${escapeHtml(user.contactPhone || "")}" maxlength="24" placeholder="Kontakt broj">
        <label class="check-row">
          <input type="checkbox" name="preferInAppChat" ${user.preferInAppChat ? "checked" : ""}>
          <span>Samo chat u aplikaciji</span>
        </label>
        <label class="check-row">
          <input type="checkbox" name="allowPhoneCall" ${user.allowPhoneCall !== false ? "checked" : ""}>
          <span>Dozvoli poziv</span>
        </label>
        <label class="check-row">
          <input type="checkbox" name="allowWhatsApp" ${user.allowWhatsApp !== false ? "checked" : ""}>
          <span>Dozvoli WhatsApp</span>
        </label>
        ${
          worker
            ? `
          <select class="field" name="status">
            <option value="slobodan" ${user.status === "slobodan" ? "selected" : ""}>Slobodan</option>
            <option value="zauzet" ${user.status === "zauzet" ? "selected" : ""}>Zauzet</option>
          </select>
          <select class="field" name="category">
            <option value="">Kategorija</option>
            ${categoryOptions(role, user.category)}
          </select>
          <input class="field" name="occupation" value="${escapeHtml(user.occupation || "")}" maxlength="48" placeholder="Zanimanje / usluga">`
            : ""
        }
        ${renderRepresentationFields({
          representationType: user.representationType || "",
          businessType: user.businessType || "",
          businessName: user.businessName || "",
          businessMunicipality: user.businessMunicipality || "",
        })}
        <div class="modal-card__actions">
          <button type="button" class="btn btn--ghost" id="cancel-profile-edit">Odustani</button>
          <button type="submit" class="btn btn--primary">Sačuvaj</button>
        </div>
      </form>
    </div>`;
}

export function renderPregledProfila({
  user,
  works = [],
  ratingsSummary = null,
  myRating = 0,
  currentUid = "",
  isFollowing = false,
  viewerRole = "",
  followerCount = 0,
}) {
  if (!user) {
    return `
      <div class="screen-scroll">
        <a class="back-link" href="#/home">← Natrag</a>
        <div class="empty-state">Profil nije pronađen.</div>
      </div>`;
  }

  const name = escapeHtml(user.displayName || "Korisnik");
  const role = escapeHtml(user.role || "—");
  const city = escapeHtml(user.city || "—");
  const category = escapeHtml(user.category || user.occupation || "—");
  const status = escapeHtml(user.status || "—");
  const summary = ratingsSummary || { average: user.ratingAverage, count: user.ratingCount };
  const rating = formatRating(summary.average, summary.count);
  const desc = escapeHtml(user.description || "Nema opisa.");
  const avatarHtml = renderAvatar(user);

  return `
    <div class="screen-scroll">
      <a class="back-link" href="javascript:history.back()">← Natrag</a>
      <article class="profile-card">
        ${avatarHtml}
        <h3 class="profile-card__name">${name}</h3>
        ${renderProfileMetaBadges(user)}
        <p class="profile-card__meta">${role} · ${category}</p>
        <p class="profile-card__meta">${city} · ${status}</p>
        ${renderRepresentationSummary(user)}
        <p class="profile-card__rating">${escapeHtml(rating)}</p>
        ${renderFollowerCount(followerCount)}
        <p class="profile-card__desc">${desc}</p>
        ${renderProfileContactActions(user)}
        <div class="profile-card__actions">
          ${renderFollowButton({
            profileUid: user.id,
            profileRole: user.role,
            viewerRole,
            isFollowing,
          })}
        </div>
      </article>
      ${renderRatingSection({
        profileUid: user.id,
        profileRole: user.role,
        currentUid,
        ratingsSummary: summary,
        myRating,
      })}
      ${renderProfileWorks({ works, uid: user.id })}
    </div>`;
}
