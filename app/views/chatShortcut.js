import { escapeHtml } from "../utils/format.js";

const CHAT_ICON = `<svg class="chat-shortcut__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>`;

export function renderChatShortcut({ href, unread = 0, label = "Chat" }) {
  const badge =
    unread > 0
      ? `<span class="chat-shortcut__badge">${unread > 9 ? "9+" : escapeHtml(String(unread))}</span>`
      : "";
  return `<a class="chat-shortcut" href="${href}" aria-label="Chat">${CHAT_ICON}<span class="chat-shortcut__label">${escapeHtml(label)}</span>${badge}</a>`;
}

export function chatUnreadForUser(app, uid) {
  if (!app || !uid) return 0;
  const counts = app.unreadCounts;
  if (!counts || typeof counts !== "object") return 0;
  const n = Number(counts[uid]);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
