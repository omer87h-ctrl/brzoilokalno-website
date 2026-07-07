import { escapeHtml, formatApplicationStatus, formatTimestamp } from "../utils/format.js";

export function renderPrijave({ applications, jobsById, currentUid, chatEnabled = false }) {
  if (!applications.length) {
    return `
      <div class="screen-scroll">
        <a class="back-link" href="#/poslovi">← Natrag na poslove</a>
        <h2 class="screen-title">Moje prijave</h2>
        <div class="empty-state">Nemaš aktivnih prijava.</div>
      </div>`;
  }

  const cards = applications
    .map((app) => {
      const job = jobsById[app.jobId] || {};
      const title = escapeHtml(job.title || "Posao");
      const st = app.status || "pending";
      const isWorker = app.workerId === currentUid;
      const roleLabel = isWorker ? "Prijavio/la si se" : "Tvoj oglas";
      const date = formatTimestamp(app.timestamp);
      const chatLink =
        chatEnabled && (st === "accepted" || st === "completed") && app.jobId && app.id
          ? `<a class="btn btn--ghost btn--sm" href="#/chat/${escapeHtml(app.jobId)}/${escapeHtml(app.id)}">Chat</a>`
          : "";

      return `
        <article class="app-card">
          <div class="app-card__head">
            <h3 class="app-card__name">
              <a href="#/posao/${escapeHtml(app.jobId)}">${title}</a>
            </h3>
            <span class="status-badge status-badge--${escapeHtml(st)}">${escapeHtml(formatApplicationStatus(st))}</span>
          </div>
          <p class="app-card__meta">${escapeHtml(roleLabel)} · ${escapeHtml(date)}</p>
          <div class="app-card__actions">
            <a class="btn btn--ghost btn--sm" href="#/posao/${escapeHtml(app.jobId)}">Detalji posla</a>
            ${chatLink}
          </div>
        </article>`;
    })
    .join("");

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/poslovi">← Natrag na poslove</a>
      <h2 class="screen-title">Moje prijave</h2>
      <p class="screen-subtitle">Prijave na poslove i prijave na tvoje oglase</p>
      <div class="app-list">${cards}</div>
    </div>`;
}
