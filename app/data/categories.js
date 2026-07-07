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

export const ALL_CITIES = [
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
