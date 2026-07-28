/** Bosnian plurals - same rules as Android BosnianPlurals.kt */

export function pluralForm(count, one, few, many) {
  const n = Math.abs(Number(count) || 0);
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export function withCount(count, one, few, many) {
  const n = Math.abs(Number(count) || 0);
  return n + ' ' + pluralForm(n, one, few, many);
}

export const pratilac = (c) => withCount(c, 'pratilac', 'pratioca', 'pratilaca');
export const rad = (c) => withCount(c, 'rad', 'rada', 'radova');
export const prijava = (c) => withCount(c, 'prijava', 'prijave', 'prijava');
export const poruka = (c) => withCount(c, 'poruka', 'poruke', 'poruka');
export const ocjena = (c) => withCount(c, 'ocjena', 'ocjene', 'ocjena');
export const posao = (c) => withCount(c, 'posao', 'posla', 'poslova');
export const korisnik = (c) => withCount(c, 'korisnik', 'korisnika', 'korisnika');
