import { escapeHtml, formatApplicationStatus, formatTimestamp } from "../utils/format.js";
import { renderChatShortcut } from "./chatShortcut.js";
import { renderVerifiedSuffix } from "./verifiedBadge.js";
import { renderListingAuthorDetail } from "./listingAuthor.js";

function statusClass(status) {
  return `status-badge status-badge--${escapeHtml(status || "unknown")}`;
}

function canApply(role) {
  return role === "majstor" || role === "kreator";
}

function isChatOpen(status) {
  return status === "accepted" || status === "completed";
}

function contactHint({ jobOwnerProfile, myApplication, chatEnabled }) {
  if (!myApplication || !isChatOpen(myApplication.status)) return "";
  if (jobOwnerProfile?.preferInAppChat && chatEnabled) {
    return `<p class="form-hint">Vlasnik preferira dogovor preko chata u aplikaciji.</p>`;
  }
  const phone = jobOwnerProfile?.contactPhone || "";
  if (phone && jobOwnerProfile?.preferInAppChat !== true) {
    return `<p class="form-hint">Kontakt: ${escapeHtml(phone)}</p>`;
  }
  return "";
}

export function renderPosao({
  job,
  myApplication,
  applications,
  currentUid,
  myRole,
  chatEnabled,
  jobOwnerProfile = null,
}) {
  if (!job) {
    return `
      <div class="screen-scroll">
        <a class="back-link" href="#/poslovi">← Natrag na poslove</a>
        <div class="empty-state">Posao nije pronađen.</div>
      </div>`;
  }

  const title = escapeHtml(job.title || "Bez naslova");
  const city = escapeHtml(job.city || "—");
  const category = escapeHtml(job.category || "—");
  const budget = escapeHtml(job.budget || "Dogovor");
  const when = escapeHtml(job.whenNeeded || job.neededWhen || "");
  const date = formatTimestamp(job.timestamp);
  const desc = escapeHtml(job.description || "Nema opisa.");
  const isOwner =
    job.userId === currentUid || job.ownerId === currentUid || job.jobOwnerId === currentUid;
  const ownerApps = isOwner ? applications : [];

  let actionHtml = "";
  if (!isOwner && canApply(myRole)) {
    if (myApplication) {
      const st = myApplication.status;
      actionHtml = `
        <div class="detail-actions">
          <span class="${statusClass(st)}">${escapeHtml(formatApplicationStatus(st))}</span>
          ${
            st === "accepted"
              ? `<button type="button" class="btn btn--primary" data-app-action="complete" data-app-id="${escapeHtml(myApplication.id)}">Završeno</button>`
              : ""
          }
          ${
            chatEnabled && isChatOpen(st)
              ? renderChatShortcut({ href: `#/chat/${job.id}/${myApplication.id}` })
              : ""
          }
        </div>
        ${contactHint({ jobOwnerProfile, myApplication, chatEnabled })}`;
    } else {
      actionHtml = `
        <div class="detail-actions">
          <button type="button" class="btn btn--primary" id="apply-job-btn" data-job-id="${escapeHtml(job.id)}">
            Prijavi se na posao
          </button>
        </div>`;
    }
  } else if (!isOwner && myRole === "korisnik") {
    actionHtml = `<p class="phase-note">Samo majstori i kreatori mogu aplicirati na poslove.</p>`;
  }

  const reportBtn =
    !isOwner && currentUid
      ? `<button type="button" class="btn btn--ghost btn--sm" id="report-job-btn" data-job-id="${escapeHtml(job.id)}">Prijavi oglas</button>`
      : "";

  const appsHtml = ownerApps.length
    ? `
      <section class="detail-section">
        <h3 class="detail-section__title">Prijave (${ownerApps.length})</h3>
        <div class="app-list">
          ${ownerApps
            .map((app) => {
              const name = `${escapeHtml(app.workerName || "Korisnik")}${renderVerifiedSuffix(app)}`;
              const st = app.status || "pending";
              const meta = escapeHtml(
                [app.workerRole, app.workerCity, app.workerCategory || app.workerOccupation]
                  .filter(Boolean)
                  .join(" · ")
              );
              const profileLink = app.workerId
                ? `<a class="btn btn--ghost btn--sm" href="#/pregled/${escapeHtml(app.workerId)}">Pogledaj profil</a>`
                : "";
              const actions =
                st === "pending"
                  ? `
                <div class="app-card__actions">
                  ${profileLink}
                  <button type="button" class="btn btn--ghost btn--sm" data-app-action="accept" data-app-id="${escapeHtml(app.id)}">Prihvati</button>
                  <button type="button" class="btn btn--ghost btn--sm btn--danger" data-app-action="reject" data-app-id="${escapeHtml(app.id)}">Odbij</button>
                </div>`
                  : st === "accepted"
                    ? `
                <div class="app-card__actions">
                  ${profileLink}
                  <button type="button" class="btn btn--ghost btn--sm" data-app-action="complete" data-app-id="${escapeHtml(app.id)}">Završeno</button>
                  ${
                    chatEnabled
                      ? renderChatShortcut({ href: `#/chat/${job.id}/${app.id}` })
                      : ""
                  }
                </div>`
                    : `
                <div class="app-card__actions">
                  ${profileLink}
                  ${
                    chatEnabled && isChatOpen(st)
                      ? renderChatShortcut({ href: `#/chat/${job.id}/${app.id}` })
                      : `<span class="${statusClass(st)}">${escapeHtml(formatApplicationStatus(st))}</span>`
                  }
                </div>`;

              return `
                <article class="app-card">
                  <div class="app-card__head">
                    <h4 class="app-card__name">${name}</h4>
                    <span class="${statusClass(st)}">${escapeHtml(formatApplicationStatus(st))}</span>
                  </div>
                  <p class="app-card__meta">${meta}</p>
                  ${actions}
                </article>`;
            })
            .join("")}
        </div>
      </section>`
    : "";

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/poslovi">← Natrag na poslove</a>
      <article class="detail-card">
        <h2 class="detail-card__title">${title}</h2>
        ${renderListingAuthorDetail({ item: job, ownerProfile: jobOwnerProfile })}
        <p class="detail-card__meta">${category} · ${city} · ${escapeHtml(date)}</p>
        <p class="detail-card__budget">${budget}${when ? ` · ${when}` : ""}</p>
        <p class="detail-card__desc">${desc}</p>
        ${actionHtml}
        <div class="detail-actions">
          ${reportBtn}
          ${
            isOwner
              ? `<button type="button" class="btn btn--ghost btn--danger" id="delete-job-btn" data-job-id="${escapeHtml(job.id)}">Obriši posao</button>`
              : ""
          }
        </div>
      </article>
      ${appsHtml}
    </div>`;
}
