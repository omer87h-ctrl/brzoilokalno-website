import { renderBottomNav } from "../components/bottomNav.js";
import { routeToNav } from "../utils/route.js";
import { ADMIN_EMAIL } from "../firebase.js";
import { escapeHtml } from "../utils/format.js";

export function renderShell({
  route,
  userEmail,
  contentHtml,
  unreadPosloviNotifications = 0,
  adminOnly = true,
  loading = false,
}) {
  const activeNav = routeToNav(route);

  return `
    <div class="app-shell${loading ? " app-shell--loading" : ""}">
      <header class="app-topbar">
        <div class="app-topbar__brand">
          <img src="icons/icon-192.png" alt="" width="32" height="32">
          <span>Brzo i <em>Lokalno</em></span>
        </div>
        <div class="app-topbar__meta">
          <button type="button" class="app-topbar__logout" id="logout-btn" title="Odjava">⎋</button>
        </div>
      </header>
      <main class="app-main" id="app-main">
        ${contentHtml}
      </main>
      ${renderBottomNav(activeNav, { unreadPoslovi: unreadPosloviNotifications })}
      ${adminOnly ? `<p class="app-admin-note">Admin: ${escapeHtml(userEmail || ADMIN_EMAIL)}</p>` : ""}
    </div>`;
}
