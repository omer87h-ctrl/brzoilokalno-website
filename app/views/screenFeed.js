import { escapeHtml } from "../utils/format.js";

export function renderScreenFeed({
  tabs = "",
  cityChip = "",
  title = "",
  subtitleHtml = "",
  bodyHtml = "",
  fab = "",
  backLink = "",
  feedId = "",
}) {
  const idAttr = feedId ? ` id="${escapeHtml(feedId)}"` : "";

  return `
    <div class="screen-feed screen-feed--scroll"${idAttr}>
      <div class="screen-feed__head">
        ${tabs}
        ${cityChip ? `<div class="chip-row chip-row--filters">${cityChip}</div>` : ""}
        ${backLink}
        ${title ? `<h2 class="screen-title">${escapeHtml(title)}</h2>` : ""}
        ${subtitleHtml ? `<p class="screen-subtitle">${subtitleHtml}</p>` : ""}
      </div>
      <div class="screen-feed__body">
        ${bodyHtml}
      </div>
      ${fab}
    </div>`;
}
