import { escapeHtml, formatDateTime, formatNotificationType } from "../utils/format.js";

function notificationHref(notif, chatEnabled) {
  const chatTypes = new Set(["new_message", "application_accepted"]);
  if (
    chatEnabled &&
    notif.jobId &&
    notif.applicationId &&
    (chatTypes.has(notif.type) || notif.type === "job_completed")
  ) {
    return `#/chat/${escapeHtml(notif.jobId)}/${escapeHtml(notif.applicationId)}`;
  }
  if (notif.jobId) return `#/posao/${escapeHtml(notif.jobId)}`;
  return "#/poslovi";
}

export function renderObavijesti({ notifications = [], chatEnabled = false }) {
  if (!notifications.length) {
    return `
      <div class="screen-scroll">
        <a class="back-link" href="#/home">← Početna</a>
        <h2 class="screen-title">Obavijesti</h2>
        <div class="empty-state">Nema obavijesti.</div>
      </div>`;
  }

  const items = notifications
    .map((notif) => {
      const type = formatNotificationType(notif.type);
      const actor = escapeHtml(notif.actorName || "");
      const when = escapeHtml(formatDateTime(notif.timestamp));
      const unread = notif.isRead === false ? " notif-card--unread" : "";
      const href = notificationHref(notif, chatEnabled);

      return `
        <a class="notif-card${unread}" href="${href}">
          <div class="notif-card__head">
            <h3 class="notif-card__title">${escapeHtml(type)}</h3>
            <span class="notif-card__date">${when}</span>
          </div>
          ${actor ? `<p class="notif-card__meta">${actor}</p>` : ""}
        </a>`;
    })
    .join("");

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/home">← Početna</a>
      <h2 class="screen-title">Obavijesti</h2>
      <p class="screen-subtitle">Prijave, poruke, prihvaćanja i završetci poslova</p>
      <div class="notif-list">${items}</div>
    </div>`;
}
