import { escapeHtml, formatDateTime, formatNotificationType } from "../utils/format.js";

export function renderObavijesti({ notifications = [] }) {
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
      const href =
        notif.jobId && notif.applicationId
          ? `#/posao/${escapeHtml(notif.jobId)}`
          : notif.jobId
            ? `#/posao/${escapeHtml(notif.jobId)}`
            : "#/poslovi";

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
      <p class="screen-subtitle">Prijave, prihvaćanja i završetci poslova</p>
      <div class="notif-list">${items}</div>
    </div>`;
}
