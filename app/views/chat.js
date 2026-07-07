import { escapeHtml, formatDateTime } from "../utils/format.js";

function messageAuthorLabel(msg, currentUid, otherName = "") {
  if (msg.senderId === currentUid) return "Ti";
  return msg.senderName || otherName || "Korisnik";
}

function renderReplySnippet(msg) {
  const text = String(msg.replyToText || "").trim();
  if (!text) return "";
  const author = escapeHtml(msg.replyToSenderLabel || "");
  return `
    <div class="chat-bubble__reply">
      ${author ? `<span class="chat-bubble__reply-author">${author}</span>` : ""}
      <span class="chat-bubble__reply-text">${escapeHtml(text)}</span>
    </div>`;
}

export function renderChatBubble(msg, currentUid, otherName = "") {
  const mine = msg.senderId === currentUid;
  const cls = mine ? "chat-bubble chat-bubble--mine" : "chat-bubble chat-bubble--theirs";
  const sender = escapeHtml(msg.senderName || "");
  const text = escapeHtml(msg.text || "");
  const time = escapeHtml(formatDateTime(msg.timestamp) || formatDateTime(msg.clientCreatedAt));
  const msgId = escapeHtml(msg.id || "");
  return `
    <div class="${cls}" data-msg-id="${msgId}" data-msg-mine="${mine ? "1" : "0"}" data-msg-author="${escapeHtml(messageAuthorLabel(msg, currentUid, otherName))}">
      ${!mine && sender ? `<span class="chat-bubble__sender">${sender}</span>` : ""}
      ${renderReplySnippet(msg)}
      <p class="chat-bubble__text">${text}</p>
      <span class="chat-bubble__time">${time}</span>
    </div>`;
}

export function renderChat({
  jobTitle,
  otherName,
  otherRole,
  messages,
  currentUid,
  error,
  blockStatus = { iBlocked: false, theyBlocked: false },
  replyDraft = null,
}) {
  const title = escapeHtml(jobTitle || "Chat");
  const subtitle = escapeHtml([otherName, otherRole].filter(Boolean).join(" · ") || "Učitavanje…");
  const blocked = blockStatus.iBlocked || blockStatus.theyBlocked;
  const blockHint = blockStatus.theyBlocked
    ? `<p class="form-hint form-hint--warn">Korisnik vas je blokirao.</p>`
    : blockStatus.iBlocked
      ? `<p class="form-hint">Blokirali ste ovog korisnika.</p>`
      : "";

  const listHtml = error
    ? `<div class="empty-state empty-state--error">${escapeHtml(error)}</div>`
    : !messages.length
      ? `<div class="chat-empty">Još nema poruka. Pošalji prvu.</div>`
      : messages.map((msg) => renderChatBubble(msg, currentUid, otherName)).join("");

  return `
    <div class="chat-screen">
      <div class="chat-header">
        <div class="chat-header__row">
          <a class="back-link" href="javascript:history.back()">← Natrag</a>
          <button type="button" class="chat-menu-btn" id="chat-menu-btn" aria-label="Opcije">⋮</button>
        </div>
        <h2 class="chat-header__title">${title}</h2>
        <p class="chat-header__sub">${subtitle}</p>
        ${blockHint}
      </div>
      <div class="chat-messages" id="chat-messages">${listHtml}</div>
      ${renderChatReplyBar(replyDraft)}
      <form class="chat-composer" id="chat-form">
        <input type="text" class="field__input chat-composer__input" name="message" placeholder="Poruka…" maxlength="2000" autocomplete="off" ${blocked ? "disabled" : ""} />
        <button type="submit" class="btn btn--primary chat-composer__send" ${blocked ? "disabled" : ""}>Pošalji</button>
      </form>
      ${renderChatMenu({ blockStatus })}
      <div class="chat-msg-sheet" id="chat-msg-sheet" hidden>
        <button type="button" class="chat-msg-sheet__backdrop" id="chat-msg-sheet-backdrop" aria-label="Zatvori"></button>
        <div class="chat-msg-sheet__panel" id="chat-msg-sheet-panel" role="dialog" aria-modal="true" aria-label="Akcije poruke"></div>
      </div>
      <div class="chat-msg-details" id="chat-msg-details" hidden>
        <div class="chat-msg-details__card" id="chat-msg-details-card" role="dialog" aria-modal="true" aria-label="Detalji poruke"></div>
      </div>
    </div>`;
}

export function renderChatMenu({ blockStatus = { iBlocked: false, theyBlocked: false } }) {
  const blockLabel = blockStatus.iBlocked
    ? "Korisnik je blokiran"
    : blockStatus.theyBlocked
      ? "Korisnik vas je blokirao"
      : "Blokiraj korisnika";
  const blockDisabled = blockStatus.iBlocked || blockStatus.theyBlocked;

  return `
    <div class="chat-menu" id="chat-menu">
      <button type="button" class="chat-menu__item" id="chat-report-user-btn">Prijavi korisnika</button>
      <button type="button" class="chat-menu__item${blockDisabled ? " chat-menu__item--disabled" : ""}" id="chat-block-user-btn" ${blockDisabled ? "disabled" : ""}>${escapeHtml(blockLabel)}</button>
    </div>`;
}

export function renderChatReplyBar(replyDraft) {
  if (!replyDraft?.previewText) {
    return `<div class="chat-reply-bar" id="chat-reply-bar" hidden></div>`;
  }
  const author = escapeHtml(replyDraft.authorLabel || "");
  const preview = escapeHtml(String(replyDraft.previewText).slice(0, 160));
  return `
    <div class="chat-reply-bar" id="chat-reply-bar">
      <div class="chat-reply-bar__body">
        <span class="chat-reply-bar__label">Odgovor${author ? ` · ${author}` : ""}</span>
        <span class="chat-reply-bar__preview">${preview}</span>
      </div>
      <button type="button" class="chat-reply-bar__cancel" id="chat-reply-cancel" aria-label="Otkaži odgovor">×</button>
    </div>`;
}

export function renderChatMessageSheet(msg, { communicationBlocked = false } = {}) {
  const text = escapeHtml(String(msg?.text || "").slice(0, 160));
  const mine = msg?.senderId != null && msg?.mine === true;
  const canReply = !communicationBlocked;
  const canDelete = mine && msg?.id;

  return `
    <p class="chat-msg-sheet__kicker">Poslovni chat · akcije</p>
    <p class="chat-msg-sheet__preview">${text}${String(msg?.text || "").length > 160 ? "…" : ""}</p>
    <div class="chat-msg-sheet__actions">
      ${
        canReply
          ? `<button type="button" class="chat-msg-sheet__action" data-chat-action="reply">Odgovori</button>`
          : ""
      }
      <button type="button" class="chat-msg-sheet__action" data-chat-action="copy">Kopiraj tekst</button>
      <button type="button" class="chat-msg-sheet__action" data-chat-action="details">Detalji poruke</button>
      ${
        canDelete
          ? `<button type="button" class="chat-msg-sheet__action chat-msg-sheet__action--danger" data-chat-action="delete">Obriši poruku</button>`
          : ""
      }
    </div>`;
}

export function renderChatMessageDetails(msg, currentUid, otherName = "") {
  const mine = msg?.senderId === currentUid;
  const who = escapeHtml((mine ? "Ti" : messageAuthorLabel(msg, currentUid, otherName)).toUpperCase());
  const when = escapeHtml(formatDateTime(msg?.timestamp) || formatDateTime(msg?.clientCreatedAt) || "Nepoznato");
  const text = escapeHtml(msg?.text || "");
  const idPart = escapeHtml(String(msg?.id || "").slice(0, 10));
  return `
    <h3 class="chat-msg-details__title">Detalji poruke</h3>
    <p class="chat-msg-details__hint">Brzi pristup: dvostruki dodir na balun.</p>
    <p class="chat-msg-details__row"><strong>Od:</strong> ${who}</p>
    <p class="chat-msg-details__row"><strong>Kada:</strong> ${when}</p>
    ${idPart ? `<p class="chat-msg-details__row"><strong>ID:</strong> ${idPart}</p>` : ""}
    <p class="chat-msg-details__text">${text}</p>
    <button type="button" class="btn btn--ghost btn--block" id="chat-msg-details-close">Zatvori</button>`;
}

export function renderChatMessages(messages, currentUid, otherName = "") {
  if (!messages.length) {
    return `<div class="chat-empty">Još nema poruka. Pošalji prvu.</div>`;
  }

  return messages.map((msg) => renderChatBubble(msg, currentUid, otherName)).join("");
}
