import { escapeHtml } from "../utils/format.js";

export function renderMojaAktivnost({
  dashboard,
  expanded = false,
  chatEnabled = false,
  hiddenAppIds = [],
}) {
  if (!dashboard) return "";

  const expandedClass = expanded ? " aktivnost-section--expanded" : "";
  const stats = `
    <div class="aktivnost-stats">
      <div class="aktivnost-stat"><span class="aktivnost-stat__val">${dashboard.publishedJobs}</span><span class="aktivnost-stat__lbl">Objavljeni</span></div>
      <div class="aktivnost-stat"><span class="aktivnost-stat__val">${dashboard.activeApplies}</span><span class="aktivnost-stat__lbl">Aktivne prijave</span></div>
      <div class="aktivnost-stat"><span class="aktivnost-stat__val">${dashboard.agreedJobs}</span><span class="aktivnost-stat__lbl">Dogovoreni</span></div>
      <div class="aktivnost-stat"><span class="aktivnost-stat__val">${dashboard.finishedJobs}</span><span class="aktivnost-stat__lbl">Završeni</span></div>
    </div>`;

  const hidden = new Set(hiddenAppIds);
  const visibleRows = dashboard.chatRows.filter((row) => !hidden.has(row.appId));

  const chatRows = visibleRows
    .map((row) => {
      const chatLink =
        chatEnabled && row.jobId && row.appId
          ? `<a class="btn btn--ghost btn--sm" href="#/chat/${escapeHtml(row.jobId)}/${escapeHtml(row.appId)}">Chat${row.unread > 0 ? ` · ${row.unread}` : ""}</a>`
          : "";
      return `
        <article class="aktivnost-row">
          <div class="aktivnost-row__main">
            <a class="aktivnost-row__title" href="#/posao/${escapeHtml(row.jobId)}">${escapeHtml(row.title)}</a>
            <p class="aktivnost-row__meta">${row.isWorker ? "Prijavio/la si se" : "Tvoj oglas"}${row.unread > 0 ? ` · ${row.unread} nepročitano` : ""}</p>
          </div>
          <div class="aktivnost-row__actions">
            ${chatLink}
            <button
              type="button"
              class="aktivnost-row__remove"
              data-activity-hide="${escapeHtml(row.appId)}"
              aria-label="Ukloni s pregleda"
              title="Ukloni s pregleda">Ukloni</button>
          </div>
        </article>`;
    })
    .join("");

  const unreadPreview =
    dashboard.totalUnreadChat > 0
      ? `<p class="form-hint">Nova poruka — provjeri chat ispod ili obavijesti.</p>`
      : "";

  return `
    <section class="aktivnost-section${expandedClass}" id="aktivnost-section">
      <button type="button" class="aktivnost-section__toggle" id="aktivnost-toggle" aria-expanded="${expanded ? "true" : "false"}">
        <span class="aktivnost-section__title">Moja aktivnost</span>
        <span class="aktivnost-section__chev" aria-hidden="true">${expanded ? "▴" : "▾"}</span>
      </button>
      <p class="aktivnost-section__summary">${escapeHtml(dashboard.summary)}</p>
      ${
        dashboard.totalUnreadChat > 0
          ? `<a class="inline-link aktivnost-section__inbox" href="#/obavijesti">Poruke · ${dashboard.totalUnreadChat}</a>`
          : ""
      }
      <div class="aktivnost-section__body">
        ${stats}
        ${
          dashboard.lastActivityLabel
            ? `<p class="form-hint">Zadnja aktivnost: ${escapeHtml(dashboard.lastActivityLabel)}</p>`
            : ""
        }
        ${unreadPreview}
        ${
          dashboard.acceptedOpen > 0
            ? `<p class="form-hint">Imaš ${dashboard.acceptedOpen} prihvaćenih poslova — označi završene kad završiš.</p>`
            : ""
        }
        ${chatRows ? `<div class="aktivnost-chat-list">${chatRows}</div>` : ""}
        <div class="aktivnost-actions">
          <a class="btn btn--ghost btn--sm" href="#/prijave">Moje prijave</a>
          <a class="btn btn--ghost btn--sm" href="#/poslovi">Poslovi</a>
        </div>
      </div>
    </section>`;
}
