import { escapeHtml, formatRating, workImageUrl } from "../utils/format.js";
import { profileAvatarUrl } from "../services/storageService.js";
import { renderProfileWorks } from "./radovi.js";
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

export function renderProfil({
  user,
  authEmail,
  editing = false,
  formError = "",
  myTip = null,
  myWorks = [],
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
          ${avatarHtml}
          <label class="btn btn--ghost btn--sm profile-upload-btn">
            Promijeni sliku
            <input type="file" id="profile-image-input" accept="image/*" hidden />
          </label>
          <h3 class="profile-card__name">${escapeHtml(user.displayName || "Korisnik")}</h3>
          <p class="profile-card__meta">${escapeHtml(role)} · ${escapeHtml(user.category || user.occupation || "—")}</p>
          <p class="profile-card__meta">${escapeHtml(user.city || "—")} · ${escapeHtml(user.status || "—")}</p>
          <p class="profile-card__rating">${rating}</p>
          <p class="profile-card__desc">${escapeHtml(user.description || "Nema opisa.")}</p>
          <p class="profile-card__email">${escapeHtml(user.email || authEmail || "")}</p>
          ${user.contactPhone ? `<p class="profile-card__meta">Tel: ${escapeHtml(user.contactPhone)}</p>` : ""}
          ${user.preferInAppChat ? `<p class="profile-card__meta">Samo chat u aplikaciji</p>` : ""}
        </article>
        <div class="profile-actions">
          <button type="button" class="btn btn--primary btn--block" id="edit-profile-btn">Uredi profil</button>
          ${worker ? `<button type="button" class="btn btn--ghost btn--block" id="edit-tip-btn">${myTip ? "Uredi savjet" : "Dodaj savjet za početnu"}</button>` : ""}
          ${avatarUrl ? `<button type="button" class="btn btn--ghost btn--block btn--danger" id="delete-profile-image-btn">Ukloni sliku</button>` : ""}
        </div>
        ${worker ? renderMyWorksSection({ works: myWorks, canAdd: true }) : ""}
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
        <div class="modal-card__actions">
          <button type="button" class="btn btn--ghost" id="cancel-profile-edit">Odustani</button>
          <button type="submit" class="btn btn--primary">Sačuvaj</button>
        </div>
      </form>
    </div>`;
}

export function renderPregledProfila({ user, works = [] }) {
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
  const rating = formatRating(user.ratingAverage, user.ratingCount);
  const desc = escapeHtml(user.description || "Nema opisa.");
  const avatarHtml = renderAvatar(user);

  return `
    <div class="screen-scroll">
      <a class="back-link" href="javascript:history.back()">← Natrag</a>
      <article class="profile-card">
        ${avatarHtml}
        <h3 class="profile-card__name">${name}</h3>
        <p class="profile-card__meta">${role} · ${category}</p>
        <p class="profile-card__meta">${city} · ${status}</p>
        <p class="profile-card__rating">${escapeHtml(rating)}</p>
        <p class="profile-card__desc">${desc}</p>
      </article>
      ${renderProfileWorks({ works, uid: user.id })}
    </div>`;
}
