/**
 * Generiše javne HTML stranice iz app/utils/legalTexts.js (isti sadržaj kao Android).
 * Pokretanje: node scripts/generate-legal-pages.mjs
 */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  CONTROLLER_CONTACT,
  CONTROLLER_NAME,
  deleteAccountText,
  privacyText,
  termsText,
} from "../app/utils/legalTexts.js";
import { POLICY_VERSION } from "../app/constants/policy.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function paras(text) {
  return text
    .trim()
    .split(/\n\n+/)
    .map((block) => {
      const t = escapeHtml(block);
      if (/^\d+\.\s/.test(block) || block === "Kontrolor ličnih podataka") {
        const lines = t.split("\n");
        const heading = lines[0];
        const rest = lines.slice(1).join("\n");
        return `<h2>${heading}</h2>${rest ? `<p>${rest.replace(/\n/g, "<br>")}</p>` : ""}`;
      }
      return `<p>${t.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}

function page(title, current, bodyHtml) {
  const link = (href, key, label) =>
    `<a href="${href}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<!DOCTYPE html>
<html lang="bs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} — Brzo i Lokalno</title>
  <meta name="description" content="${escapeHtml(title)} aplikacije Brzo i Lokalno.">
  <link rel="stylesheet" href="legal.css">
</head>
<body>
  <div class="wrap">
    <div class="top">
      <a class="brand" href="/">Brzo i Lokalno</a>
      <nav class="nav" aria-label="Pravni dokumenti">
        ${link("privacy-policy.html", "privacy", "Privatnost")}
        ${link("terms.html", "terms", "Pravila")}
        ${link("delete-account.html", "delete", "Brisanje naloga")}
      </nav>
    </div>
    ${bodyHtml}
    <footer>
      Kontrolor: ${escapeHtml(CONTROLLER_NAME)} · <a href="mailto:${CONTROLLER_CONTACT}">${CONTROLLER_CONTACT}</a><br>
      <a href="/">Početna</a> · <a href="/app/">Otvori aplikaciju</a>
    </footer>
  </div>
</body>
</html>
`;
}

const terms = termsText(POLICY_VERSION);
const privacy = privacyText(POLICY_VERSION);
const del = deleteAccountText();

writeFileSync(
  join(ROOT, "terms.html"),
  page(
    "Pravila i uslovi",
    "terms",
    `<h1>Pravila i uslovi</h1><p class="meta">Aplikacija Brzo i Lokalno · Važi od 28. 7. 2026. · Verzija ${POLICY_VERSION}</p><div class="legal">${paras(terms)}</div>`,
  ),
  "utf8",
);
writeFileSync(
  join(ROOT, "privacy-policy.html"),
  page(
    "Politika privatnosti",
    "privacy",
    `<h1>Politika privatnosti</h1><p class="meta">Aplikacija Brzo i Lokalno · Važi od 28. 7. 2026. · Verzija ${POLICY_VERSION}</p><div class="legal">${paras(privacy)}</div>`,
  ),
  "utf8",
);
writeFileSync(
  join(ROOT, "delete-account.html"),
  page(
    "Brisanje naloga",
    "delete",
    `<h1>Brisanje naloga i podataka</h1><p class="meta">Aplikacija Brzo i Lokalno · Kontakt: ${escapeHtml(CONTROLLER_CONTACT)}</p><div class="legal">${paras(del)}</div>`,
  ),
  "utf8",
);

console.log("OK: terms.html, privacy-policy.html, delete-account.html");
