export function parseRoute(hash) {
  const raw = (hash || "#/home").replace(/^#/, "");
  const parts = raw.split("/").filter(Boolean);
  const name = parts[0] || "home";

  if (name === "login") return { name: "login" };
  if (name === "register") return { name: "register" };
  if (name === "onboarding") return { name: "onboarding" };
  if (name === "kategorije") {
    return { name: "kategorije", tab: "majstori", categorySlug: parts[1] || null };
  }
  if (name === "kreatori" && !parts[1]) {
    return { name: "kategorije", tab: "kreatori", categorySlug: null };
  }
  if (name === "brzo") return { name: "brzo", city: parts[1] ? decodeURIComponent(parts[1]) : null };
  if (name === "lista" && parts[1]) {
    return { name: "lista", filter: parts[1], city: parts[2] ? decodeURIComponent(parts[2]) : null };
  }
  if (name === "kalkulator") return { name: "kalkulator" };
  if (name === "poslovi") return { name: "poslovi", tab: "potraznja" };
  if (name === "ponude") return { name: "poslovi", tab: "ponuda" };
  if (name === "ponuda" && parts[1]) return { name: "ponuda", offerId: parts[1] };
  if (name === "pretraga") {
    const rawQuery = parts[1] ? decodeURIComponent(parts[1]) : "";
    return {
      name: "pretraga",
      query: rawQuery === "_" ? "" : rawQuery,
      city: parts[2] ? decodeURIComponent(parts[2]) : null,
    };
  }
  if (name === "posao" && parts[1]) return { name: "posao", jobId: parts[1] };
  if (name === "radovi") return { name: "radovi" };
  if (name === "rad" && parts[1]) return { name: "rad", workId: parts[1] };
  if (name === "prijave") return { name: "prijave" };
  if (name === "chat" && parts[1] && parts[2]) {
    return { name: "chat", jobId: parts[1], appId: parts[2] };
  }
  if (name === "profil") return { name: "profil" };
  if (name === "biljeske") return { name: "biljeske" };
  if (name === "postavke") {
    const sub = parts[1] || "";
    if (sub === "blokirani") return { name: "postavke-blokirani" };
    if (sub === "biljeske") return { name: "biljeske" };
    if (sub === "izgled") return { name: "postavke-izgled" };
    if (sub === "privatnost") return { name: "postavke-privatnost" };
    if (sub === "admin") return { name: "postavke-admin" };
    return { name: "postavke" };
  }
  if (name === "obavijesti") return { name: "obavijesti" };
  if (name === "pregled" && parts[1]) return { name: "pregled", uid: parts[1] };

  return { name: "home" };
}

export function routeToNav(route) {
  if (
    route.name === "poslovi" ||
    route.name === "posao" ||
    route.name === "prijave" ||
    route.name === "chat" ||
    route.name === "ponuda"
  ) {
    return "poslovi";
  }
  if (
    route.name === "biljeske" ||
    route.name === "profil" ||
    route.name === "postavke" ||
    route.name === "postavke-blokirani" ||
    route.name === "postavke-izgled" ||
    route.name === "postavke-privatnost" ||
    route.name === "postavke-admin" ||
    route.name === "obavijesti"
  ) {
    return "profil";
  }
  if (
    route.name === "kategorije" ||
    route.name === "pregled" ||
    route.name === "radovi" ||
    route.name === "rad" ||
    route.name === "pretraga"
  ) {
    return "kategorije";
  }
  return "home";
}
