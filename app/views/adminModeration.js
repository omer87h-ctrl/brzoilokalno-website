import { escapeHtml, formatTimestamp } from "../utils/format.js";

function reportLabel(report) {
  if (report.targetType === "fast_feedback" || String(report.sourceScreen || "").startsWith("fast")) {
    return "Povratna informacija — Auto izbor";
  }
  return report.targetType || report.sourceScreen || "Prijava";
}

export function renderAdminModeration({ reports = [], banned = [], error = "" }) {
  const reportCards = reports.length
    ? reports
        .map((r) => {
          const title = escapeHtml(reportLabel(r));
          const reason = escapeHtml(r.reason || "—");
          const reporter = escapeHtml(r.reporterName || r.reporterUid || "—");
          const target = escapeHtml(r.targetUserName || r.targetId || "—");
          const when = escapeHtml(formatTimestamp(r.createdAt));
          const content = escapeHtml((r.reportedContent || "").slice(0, 200));
          const canDelete =
            r.contentCollection && r.contentId && r.contentCollection !== "users"
              ? `<button type="button" class="btn btn--ghost btn--sm btn--danger" data-admin-delete-content="${escapeHtml(r.id)}" data-collection="${escapeHtml(r.contentCollection)}" data-content-id="${escapeHtml(r.contentId)}">Obriši sadržaj</button>`
              : "";
          return `
        <article class="app-card" data-report-id="${escapeHtml(r.id)}">
          <div class="app-card__head">
            <h3 class="app-card__name">${title}</h3>
            <span class="status-badge status-badge--pending">Otvoreno</span>
          </div>
          <p class="app-card__meta">${reason} · ${when}</p>
          <p class="app-card__meta">Prijavio: ${reporter} · Cilj: ${target}</p>
          ${content ? `<p class="settings-text">${content}</p>` : ""}
          <div class="app-card__actions">
            ${canDelete}
            <button type="button" class="btn btn--ghost btn--sm" data-admin-ban="${escapeHtml(r.id)}" data-target-uid="${escapeHtml(r.targetUserId || r.targetId || "")}" data-target-name="${escapeHtml(r.targetUserName || "")}" data-target-email="${escapeHtml(r.targetUserEmail || "")}">Ban korisnika</button>
            <button type="button" class="btn btn--primary btn--sm" data-admin-resolve="${escapeHtml(r.id)}">Riješeno</button>
          </div>
        </article>`;
        })
        .join("")
    : `<div class="empty-state">Nema otvorenih prijava.</div>`;

  const bannedCards = banned.length
    ? banned
        .map(
          (b) => `
        <article class="app-card">
          <div class="app-card__head">
            <h3 class="app-card__name">${escapeHtml(b.name || b.uid || "Korisnik")}</h3>
          </div>
          <p class="app-card__meta">${escapeHtml(b.email || "")}</p>
          <button type="button" class="btn btn--ghost btn--sm" data-admin-unban="${escapeHtml(b.uid || b.id)}">Vrati korisnika</button>
        </article>`
        )
        .join("")
    : `<div class="empty-state">Nema globalno banovanih.</div>`;

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/postavke">← Postavke</a>
      <h2 class="screen-title">Moderacija prijava</h2>
      ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ""}
      <section class="settings-group">
        <h3 class="settings-group__title">Otvorene prijave</h3>
        <div class="app-list">${reportCards}</div>
      </section>
      <section class="settings-group">
        <h3 class="settings-group__title">Banovani korisnici</h3>
        <div class="app-list">${bannedCards}</div>
      </section>
    </div>`;
}
