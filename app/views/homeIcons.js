import { renderHomeConstructionIcon } from "./categoryIcons.js";

function wrapIcon(svg, tone, { circleFill = "", iconColor = "" } = {}) {
  const style =
    circleFill || iconColor
      ? ` style="${circleFill ? `--icon-circle-fill:${circleFill};` : ""}${iconColor ? `--icon-circle-color:${iconColor};` : ""}"`
      : "";
  return `<span class="home-card__icon-wrap home-card__icon-wrap--${tone}"${style}>${svg}</span>`;
}

const SVG = {
  star: `<svg class="home-card__icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  place: `<svg class="home-card__icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  calculate: `<svg class="home-card__icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-2h4v2zm0-4H7v-2h4v2zm0-4H7V7h4v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>`,
};

export const HOME_CARD_ICONS = {
  top: wrapIcon(SVG.star, "top"),
  slobodan: wrapIcon(renderHomeConstructionIcon(), "slobodan", {
    circleFill: "#E8884A",
    iconColor: "#23262C",
  }),
  blizu: wrapIcon(SVG.place, "blizu"),
  kalkulator: wrapIcon(SVG.calculate, "kalkulator"),
};
