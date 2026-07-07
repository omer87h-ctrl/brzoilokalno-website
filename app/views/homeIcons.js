function wrapIcon(svg, tone) {
  return `<span class="home-card__icon-wrap home-card__icon-wrap--${tone}">${svg}</span>`;
}

const SVG = {
  star: `<svg class="home-card__icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  build: `<svg class="home-card__icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22.7 19-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>`,
  place: `<svg class="home-card__icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  calculate: `<svg class="home-card__icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-2h4v2zm0-4H7v-2h4v2zm0-4H7V7h4v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>`,
};

export const HOME_CARD_ICONS = {
  top: wrapIcon(SVG.star, "blue"),
  slobodan: wrapIcon(SVG.build, "green"),
  blizu: wrapIcon(SVG.place, "purple"),
  kalkulator: wrapIcon(SVG.calculate, "amber"),
};
