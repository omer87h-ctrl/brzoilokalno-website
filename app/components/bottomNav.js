/** Bottom navigation — Faza 1: samo Home aktivan, ostalo uskoro */

export function renderBottomNav(activeRoute) {
  const items = [
    { id: "home", label: "Home", route: "#/home", icon: "⌂" },
    { id: "kategorije", label: "Kategorije", route: "#/kategorije", icon: "▦", soon: true },
    { id: "poslovi", label: "Poslovi", route: "#/poslovi", icon: "☰", soon: true },
    { id: "profil", label: "Profil", route: "#/profil", icon: "◎", soon: true },
  ];

  return `
    <nav class="bottom-nav" aria-label="Glavna navigacija">
      ${items
        .map((item) => {
          const isActive = activeRoute === item.id;
          const soonClass = item.soon ? " bottom-nav__item--soon" : "";
          const activeClass = isActive ? " bottom-nav__item--active" : "";
          return `
            <a href="${item.soon ? "#" : item.route}"
               class="bottom-nav__item${activeClass}${soonClass}"
               ${item.soon ? 'aria-disabled="true"' : ""}
               data-nav="${item.id}">
              <span class="bottom-nav__icon" aria-hidden="true">${item.icon}</span>
              <span class="bottom-nav__label">${item.label}</span>
            </a>`;
        })
        .join("")}
    </nav>`;
}
