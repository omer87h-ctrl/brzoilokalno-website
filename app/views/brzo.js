import { escapeHtml } from "../utils/format.js";
import { renderUserList } from "./shared.js";

export function renderBrzo({ candidates, city }) {
  const cityLabel = city ? `Grad: ${escapeHtml(city)}` : "Postavi grad u profilu";

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/home">← Početna</a>
      <h2 class="screen-title">Brzo do majstora / kreatora</h2>
      <p class="screen-subtitle">Auto izbor · ${cityLabel} · read-only</p>
      ${renderUserList(candidates, {
        emptyText: city
          ? `Nema slobodnih majstora/kreatora u gradu ${escapeHtml(city)}.`
          : "Odaberi grad na Početnoj ili postavi grad u profilu da Auto izbor može raditi.",
      })}
    </div>`;
}
