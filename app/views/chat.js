import { escapeHtml, formatDateTime } from "../utils/format.js";

export function renderChat({ jobTitle, otherName, otherRole, messages, currentUid, error }) {
  const title = escapeHtml(jobTitle || "Chat");
  const subtitle = escapeHtml([otherName, otherRole].filter(Boolean).join(" · ") || "Učitavanje…");

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
        <a class="back-link" href="javascript:history.back()">← Natrag</a>
        <h2 class="chat-header__title">${title}</h2>
        <p class="chat-header__sub">${subtitle}</p>
      </div>
      <div class="chat-messages" id="chat-messages">${listHtml}</div>
      <form class="chat-composer" id="chat-form">
        <input type="text" class="field__input chat-composer__input" name="message" placeholder="Poruka…" maxlength="2000" autocomplete="off" />
        <button type="submit" class="btn btn--primary chat-composer__send">Pošalji</button>
      </form>
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
