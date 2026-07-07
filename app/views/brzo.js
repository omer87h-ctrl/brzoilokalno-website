import { escapeHtml } from "../utils/format.js";
import { renderUserList } from "./shared.js";

export function renderBrzo({ candidates, city, topCandidate = null, feedbackSent = false }) {
  const cityLabel = city ? `Grad: ${escapeHtml(city)}` : "Postavi grad u profilu";

  const feedback =
    topCandidate && !feedbackSent
      ? `
      <section class="settings-group brzo-feedback">
        <h3 class="settings-group__title">Je li ti Auto izbor pomogao?</h3>
        <p class="settings-text">Predloženo: ${escapeHtml(topCandidate.displayName || "Majstor / kreator")}</p>
        <form id="brzo-feedback-form" class="stack-form">
          <div class="brzo-feedback__choices">
            <label class="check-row"><input type="radio" name="brzoChoice" value="pomoglo" checked> Pomoglo</label>
            <label class="check-row"><input type="radio" name="brzoChoice" value="odmoglo"> Nije pomoglo</label>
          </div>
          <input class="field" name="comment" maxlength="180" placeholder="Komentar (opciono)">
          <button type="submit" class="btn btn--primary btn--sm">Pošalji povratnu informaciju</button>
        </form>
      </section>`
      : feedbackSent
        ? `<p class="form-hint">Hvala na povratnoj informaciji.</p>`
        : "";

  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/home">← Početna</a>
      <h2 class="screen-title">Brzo do majstora / kreatora</h2>
      <p class="screen-subtitle">Auto izbor · ${cityLabel}</p>
      ${renderUserList(candidates, {
        emptyText: city
          ? `Nema slobodnih majstora/kreatora u gradu ${escapeHtml(city)}.`
          : "Odaberi grad na Početnoj ili postavi grad u profilu da Auto izbor može raditi.",
      })}
      ${feedback}
    </div>`;
}
