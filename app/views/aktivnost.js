import { escapeHtml } from "../utils/format.js";

function rowSubtitle(row, chatEnabled) {
  const peer = escapeHtml(row.peerLabel || "");
  if (row.status === "completed") return `Završeno · ${peer}`;
  if (chatEnabled && row.jobId && row.appId) return `Pogledaj razgovor · ${peer}`;
  return `${row.isWorker ? "Prijavio/la si se" : "Tvoj oglas"} · ${peer}`;
}

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
  const visibleRows = dashboard.chatRows.filter((row) => !hidden.has(row.appId)).slice(0, 6);

  const chatRows = visibleRows
    .map((row) => {
      const rowChatEnabled = chatEnabled && row.jobId && row.appId;
      const href = rowChatEnabled ? `#/chat/${escapeHtml(row.jobId)}/${escapeHtml(row.appId)}` : `#/posao/${escapeHtml(row.jobId)}`;
      const unreadBadge =
        row.unread > 0 ? `<span class="aktivnost-row__badge">${row.unread > 9 ? "9+" : row.unread}</span>` : "";
      const main = rowChatEnabled
        ? `<a class="aktivnost-row__link" href="${href}">
            <span class="aktivnost-row__title">${escapeHtml(row.title)}</span>
            <p class="aktivnost-row__meta">${rowSubtitle(row, chatEnabled)}</p>
          </a>`
        : `<div class="aktivnost-row__link">
            <a class="aktivnost-row__title" href="${href}">${escapeHtml(row.title)}</a>
            <p class="aktivnost-row__meta">${rowSubtitle(row, chatEnabled)}</p>
          </div>`;

      return `
        <article class="aktivnost-row">
          <div class="aktivnost-row__main">
            ${main}
            ${unreadBadge}
          </div>
          <button
            type="button"
            class="aktivnost-row__remove"
            data-activity-hide="${escapeHtml(row.appId)}"
            aria-label="Ukloni s pregleda"
            title="Ukloni s pregleda">✕</button>
        </article>`;
    })
    .join("");

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
