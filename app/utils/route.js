export function parseRoute(hash) {
  const raw = (hash || "#/home").replace(/^#/, "");
  const parts = raw.split("/").filter(Boolean);
  const name = parts[0] || "home";

  if (name === "login") return { name: "login" };
  if (name === "register") return { name: "register" };
  if (name === "onboarding") return { name: "onboarding" };
  if (name === "kategorije") {
    return { name: "kategorije", categorySlug: parts[1] || null };
  }
  if (name === "brzo") return { name: "brzo", city: parts[1] ? decodeURIComponent(parts[1]) : null };
  if (name === "lista" && parts[1]) {
    return { name: "lista", filter: parts[1], city: parts[2] ? decodeURIComponent(parts[2]) : null };
  }
  if (name === "kalkulator") return { name: "kalkulator" };
  if (name === "poslovi") return { name: "poslovi" };
  if (name === "profil") return { name: "profil" };
  if (name === "pregled" && parts[1]) return { name: "pregled", uid: parts[1] };

  return { name: "home" };
}

export function routeToNav(route) {
  if (route.name === "poslovi") return "poslovi";
  if (route.name === "profil") return "profil";
  if (route.name === "kategorije" || route.name === "pregled") return "kategorije";
  return "home";
}
