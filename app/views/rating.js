import { escapeHtml, formatRating } from "../utils/format.js";
import { isRateableRole } from "../services/firestoreReads.js";

export function renderRatingSection({
  profileUid,
  profileRole = "",
  currentUid = "",
  ratingsSummary = { average: 0, count: 0 },
  myRating = 0,
}) {
  if (!isRateableRole(profileRole)) return "";
  if (!profileUid || profileUid === currentUid) return "";

  const summary = formatRating(ratingsSummary.average, ratingsSummary.count);
  const stars = [1, 2, 3, 4, 5]
    .map((value) => {
      const active = value <= myRating ? " rating-star--active" : "";
      return `<button type="button" class="rating-star${active}" data-rating-value="${value}" data-profile-uid="${escapeHtml(profileUid)}" aria-label="${value} zvjezdica">★</button>`;
    })
    .join("");

  return `
    <section class="rating-section" id="rating-section">
      <h3 class="detail-section__title">Ocjena</h3>
      <p class="rating-section__summary" id="rating-summary">${escapeHtml(summary)}</p>
      <div class="rating-section__stars" id="rating-stars">${stars}</div>
      <p class="form-hint">Klikni zvjezdicu da ocijeniš majstora ili kreatora.</p>
    </section>`;
}
