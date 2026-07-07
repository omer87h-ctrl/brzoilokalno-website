/** Kategorije — iste kao Android app (hardcoded, nema Firestore kolekcije). */

export const MAJSTOR_CATEGORIES = [
  "Građevina",
  "Završni radovi",
  "Elektrika",
  "Voda i grijanje",
  "Stolarija i namještaj",
  "Dvorište i bašta",
  "Čišćenje i održavanje",
  "Selidbe i prevoz",
  "Servis i montaža",
];

export const KREATOR_CATEGORIES = [
  "Fotografija i video",
  "Dizajn i print",
  "Dekoracije i događaji",
  "Torte i kolači",
  "Ručni radovi",
  "Ljepota i šminka",
  "Muzika i zabava",
  "Marketing i društvene mreže",
  "Kreativne usluge",
];

export const POPULAR_CITIES = ["Kladanj", "Tuzla", "Sarajevo", "Zenica", "Mostar", "Banja Luka"];

const CITIES_RAW = [
  "Kladanj",
  "Tuzla",
  "Sarajevo",
  "Zenica",
  "Žepče",
  "Mostar",
  "Banovići",
  "Lukavac",
  "Živinice",
  "Kalesija",
  "Srebrenik",
  "Gračanica",
  "Olovo",
  "Tešanj",
  "Visoko",
  "Bugojno",
  "Travnik",
  "Bihać",
  "Cazin",
  "Banja Luka",
  "Doboj",
  "Gradačac",
  "Brčko",
  "Trebinje",
];

/** Svi gradovi — abecedno (bs), za padajuće liste i „Više gradova”. */
export const ALL_CITIES = [...CITIES_RAW].sort((a, b) => a.localeCompare(b, "bs"));

export const USER_ROLES = [
  { id: "korisnik", label: "Korisnik" },
  { id: "majstor", label: "Majstor" },
  { id: "kreator", label: "Slobodni kreator" },
];

export function slugifyCategory(name) {
  return encodeURIComponent(name.trim());
}

export function findCategoryBySlug(slug) {
  const decoded = decodeURIComponent(slug);
  const all = [...MAJSTOR_CATEGORIES, ...KREATOR_CATEGORIES];
  return all.find((c) => c === decoded) || null;
}

export function categoryRole(category) {
  if (MAJSTOR_CATEGORIES.includes(category)) return "majstor";
  if (KREATOR_CATEGORIES.includes(category)) return "kreator";
  return null;
}

export function categoryTabForCategory(category) {
  return categoryRole(category) === "kreator" ? "kreatori" : "majstori";
}

/** Emoji ikone — mapirane na Android categoryIcon. */
export const CATEGORY_ICONS = {
  "Građevina": "🏗",
  "Završni radovi": "🎨",
  "Elektrika": "⚡",
  "Voda i grijanje": "💧",
  "Stolarija i namještaj": "🪑",
  "Dvorište i bašta": "🌳",
  "Čišćenje i održavanje": "🧹",
  "Selidbe i prevoz": "🚚",
  "Servis i montaža": "🔧",
  "Fotografija i video": "📷",
  "Dizajn i print": "🎨",
  "Dekoracije i događaji": "🎉",
  "Torte i kolači": "🎂",
  "Ručni radovi": "✂️",
  "Ljepota i šminka": "💄",
  "Muzika i zabava": "🎵",
  "Marketing i društvene mreže": "📱",
  "Kreativne usluge": "✨",
};

export function categoryIcon(category) {
  return CATEGORY_ICONS[category] || "⭐";
}
