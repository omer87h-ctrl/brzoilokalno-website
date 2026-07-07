import { escapeHtml, formatDateTime } from "../utils/format.js";

export function renderChat({
  jobTitle,
  otherName,
  otherRole,
  messages,
  currentUid,
  error,
  blockStatus = { iBlocked: false, theyBlocked: false },
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
      : messages
          .map((msg) => {
            const mine = msg.senderId === currentUid;
            const cls = mine ? "chat-bubble chat-bubble--mine" : "chat-bubble chat-bubble--theirs";
            const sender = escapeHtml(msg.senderName || "");
            const text = escapeHtml(msg.text || "");
            const time = escapeHtml(formatDateTime(msg.timestamp) || formatDateTime(msg.clientCreatedAt));
            return `
              <div class="${cls}">
                ${!mine && sender ? `<span class="chat-bubble__sender">${sender}</span>` : ""}
                <p class="chat-bubble__text">${text}</p>
                <span class="chat-bubble__time">${time}</span>
              </div>`;
          })
          .join("");

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
      <form class="chat-composer" id="chat-form">
        <input type="text" class="field__input chat-composer__input" name="message" placeholder="Poruka…" maxlength="2000" autocomplete="off" ${blocked ? "disabled" : ""} />
        <button type="submit" class="btn btn--primary chat-composer__send" ${blocked ? "disabled" : ""}>Pošalji</button>
      </form>
      ${renderChatMenu({ blockStatus })}
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

export function renderChatMessages(messages, currentUid) {
  if (!messages.length) {
    return `<div class="chat-empty">Još nema poruka. Pošalji prvu.</div>`;
  }

  return messages
    .map((msg) => {
      const mine = msg.senderId === currentUid;
      const cls = mine ? "chat-bubble chat-bubble--mine" : "chat-bubble chat-bubble--theirs";
      const sender = escapeHtml(msg.senderName || "");
      const text = escapeHtml(msg.text || "");
      const time = escapeHtml(formatDateTime(msg.timestamp) || formatDateTime(msg.clientCreatedAt));
      return `
        <div class="${cls}">
          ${!mine && sender ? `<span class="chat-bubble__sender">${sender}</span>` : ""}
          <p class="chat-bubble__text">${text}</p>
          <span class="chat-bubble__time">${time}</span>
        </div>`;
    })
    .join("");
}
