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

export const POPULAR_CITIES = ["Kladanj", "Tuzla", "Sarajevo", "Zenica"];

export function slugifyCategory(name) {
  return encodeURIComponent(name.trim());
}

export function findCategoryBySlug(slug) {
  const decoded = decodeURIComponent(slug);
  const all = [...MAJSTOR_CATEGORIES, ...KREATOR_CATEGORIES];
  return all.find((c) => c === decoded) || null;
}
