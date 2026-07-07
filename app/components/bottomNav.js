/** Bottom navigation — Faza 2: svi tabovi aktivni */

export function renderBottomNav(activeRoute, { unreadPoslovi = 0 } = {}) {
  const items = [
    { id: "home", label: "Home", route: "#/home", icon: "⌂" },
    { id: "kategorije", label: "Kategorije", route: "#/kategorije", icon: "▦" },
    { id: "poslovi", label: "Poslovi", route: "#/poslovi", icon: "☰" },
    { id: "profil", label: "Profil", route: "#/profil", icon: "◎" },
  ];

  return `
    <nav class="bottom-nav" aria-label="Glavna navigacija">
      ${items
        .map((item) => {
          const isActive = activeRoute === item.id;
          const activeClass = isActive ? " bottom-nav__item--active" : "";
          const badge =
            item.id === "poslovi" && unreadPoslovi > 0
              ? `<span class="bottom-nav__badge">${unreadPoslovi > 9 ? "9+" : unreadPoslovi}</span>`
              : "";
          return `
            <a href="${item.route}"
               class="bottom-nav__item${activeClass}"
               data-nav="${item.id}">
              <span class="bottom-nav__icon" aria-hidden="true">${item.icon}${badge}</span>
              <span class="bottom-nav__label">${item.label}</span>
            </a>`;
        })
        .join("")}
    </nav>`;
}
