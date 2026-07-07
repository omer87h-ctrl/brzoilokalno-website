import { renderBottomNav } from "../components/bottomNav.js";
import { routeToNav } from "../utils/route.js";
import { ADMIN_EMAIL } from "../firebase.js";
import { escapeHtml } from "../utils/format.js";

export function renderShell({ route, userEmail, contentHtml, unreadNotifications = 0, adminOnly = true }) {
  const activeNav = routeToNav(route);
  const notifBadge =
    unreadNotifications > 0
      ? `<span class="app-notif-badge">${unreadNotifications > 9 ? "9+" : unreadNotifications}</span>`
      : "";

  return `
    <div class="app-shell">
      <header class="app-topbar">
        <div class="app-topbar__brand">
          <img src="icons/icon-192.png" alt="" width="32" height="32">
          <span>Brzo i <em>Lokalno</em></span>
        </div>
        <div class="app-topbar__meta">
          <a href="#/postavke" class="app-topbar__settings" title="Postavke">⚙</a>
          <a href="#/obavijesti" class="app-notif-link" title="Obavijesti">${notifBadge}🔔</a>
          <button type="button" class="app-topbar__logout" id="logout-btn" title="Odjava">⎋</button>
        </div>
      </header>
      <main class="app-main" id="app-main">
        ${contentHtml}
      </main>
      ${renderBottomNav(activeNav)}
      ${adminOnly ? `<p class="app-admin-note">Admin: ${escapeHtml(userEmail || ADMIN_EMAIL)}</p>` : ""}
    </div>`;
}
