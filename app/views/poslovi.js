import { escapeHtml, formatApplicationStatus, formatTimestamp } from "../utils/format.js";
import { renderCityFilterChip, renderMyJobsFilterChip, renderOfferCard, renderPosloviTabs } from "./ponude.js";
import { renderScreenFeed } from "./screenFeed.js";
import { chatUnreadForUser, renderChatShortcut } from "./chatShortcut.js";
import { renderVerifiedSuffix } from "./verifiedBadge.js";

function canApply(role) {
  return role === "majstor" || role === "kreator";
}

function isChatOpen(status) {
  return status === "accepted" || status === "completed";
}

export function renderPoslovi({
  jobs,
  offers = [],
  tab = "potraznja",
  filterMyCity = false,
  filterMyJobs = false,
  userCity = "",
  canCreateJob = false,
  canCreateOffer = false,
  myRole = "",
  applicationsByJobId = {},
  chatEnabled = false,
  currentUid = "",
}) {
  const tabs = renderPosloviTabs({ activeTab: tab });
  const myJobsChip = tab === "potraznja" ? renderMyJobsFilterChip({ active: filterMyJobs }) : "";
  const cityChip = renderCityFilterChip({ active: filterMyCity, city: userCity });
  const filterChips = [myJobsChip, cityChip].filter(Boolean).join("");

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
      cityChip: filterChips,
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
    ? `<div class="job-list">${renderJobCards(jobs, { myRole, applicationsByJobId, chatEnabled, currentUid })}</div>`
    : `<div class="empty-state">Trenutno nema objavljenih poslova.</div>`;

  const subtitleHtml = jobs.length
    ? `Oglasi korisnika (${jobs.length}) · <a class="inline-link" href="#/prijave">Moje prijave</a>`
    : `Oglasi korisnika · <a class="inline-link" href="#/prijave">Moje prijave</a>`;

  return renderScreenFeed({
    tabs,
    cityChip: filterChips,
    title: "Potražnja",
    subtitleHtml,
    bodyHtml,
    fab,
    feedId: "poslovi-feed",
  });
}

function renderJobCards(jobs, { myRole, applicationsByJobId, chatEnabled, currentUid }) {
  const worker = canApply(myRole);

  return jobs
    .map((job) => {
      const title = escapeHtml(job.title || "Bez naslova");
      const city = escapeHtml(job.city || "—");
      const category = escapeHtml(job.category || "—");
      const budget = escapeHtml(job.budget || "Dogovor");
      const when = escapeHtml(job.whenNeeded || job.neededWhen || "");
      const date = formatTimestamp(job.timestamp);
      const author = escapeHtml(job.authorName || "Korisnik");
      const authorLine = `${author}${renderVerifiedSuffix(job)}`;
      const isOwner = job.userId === currentUid;
      const myApp = applicationsByJobId[job.id] || null;

      let strip = "";
      if (!isOwner && worker) {
        if (!myApp) {
          strip = `<button type="button" class="btn btn--primary btn--sm job-card__apply" data-job-apply="${escapeHtml(job.id)}">Prijavi se na posao</button>`;
        } else {
          const st = myApp.status || "pending";
          strip = `<span class="status-badge status-badge--${escapeHtml(st)}">${escapeHtml(formatApplicationStatus(st))}</span>`;
          if (st === "accepted") {
            strip += `<button type="button" class="btn btn--ghost btn--sm" data-app-action="complete" data-app-id="${escapeHtml(myApp.id)}">Završeno</button>`;
          }
          if (chatEnabled && isChatOpen(st)) {
            const unread = chatUnreadForUser(myApp, currentUid);
            strip += renderChatShortcut({
              href: `#/chat/${escapeHtml(job.id)}/${escapeHtml(myApp.id)}`,
              unread,
            });
          }
        }
      }

      return `
        <article class="job-card job-card--with-actions">
          <a class="job-card__body" href="#/posao/${escapeHtml(job.id)}">
            <div class="job-card__head">
              <h3 class="job-card__title">${title}</h3>
              <span class="job-card__date">${escapeHtml(date)}</span>
            </div>
            <p class="job-card__meta">${category} · ${city}</p>
            <p class="job-card__desc">${escapeHtml((job.description || "").slice(0, 160))}${(job.description || "").length > 160 ? "…" : ""}</p>
            <div class="job-card__foot">
              <span>${authorLine}</span>
              <span>${budget}${when ? ` · ${when}` : ""}</span>
            </div>
          </a>
          ${strip ? `<div class="job-card__strip">${strip}</div>` : ""}
        </article>`;
    })
    .join("");
}
