export function normalizeSpaces(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function validatePersonName(name, label = "Ime / naziv") {
  const trimmed = normalizeSpaces(name);
  if (trimmed.length < 2) return `${label} mora imati najmanje 2 znaka.`;
  const letters = trimmed.replace(/[^a-zA-ZčćžšđČĆŽŠĐ]/g, "");
  if (letters.length < 2) return `${label} mora sadržavati najmanje 2 slova.`;
  return null;
}

export function validateCity(city) {
  if (!normalizeSpaces(city)) return "Grad je obavezan.";
  return null;
}

export function validatePhone(phone, required = false) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return required ? "Kontakt broj je obavezan." : null;
  if (digits.length < 6) return "Kontakt broj mora imati najmanje 6 cifara.";
  return null;
}

export function validateOptionalDescription(text, label = "Opis") {
  const trimmed = normalizeSpaces(text);
  if (!trimmed) return null;
  const letters = trimmed.replace(/[^a-zA-ZčćžšđČĆŽŠĐ]/g, "");
  if (letters.length < 10) return `${label} mora imati najmanje 10 slova ako je popunjen.`;
  return null;
}

function missingField(value, message) {
  return normalizeSpaces(value) ? null : message;
}

export function firstMissingJobFields(fields, contactRequired) {
  const checks = [
    missingField(fields.title, "Naslov posla je obavezan."),
    missingField(fields.description, "Opis posla je obavezan."),
    missingField(fields.category, "Kategorija je obavezna."),
    missingField(fields.city, "Grad je obavezan."),
    missingField(fields.budget, "Budžet je obavezan."),
    missingField(fields.whenNeeded, "Rok / kada je potrebno je obavezan."),
  ];
  for (const c of checks) if (c) return c;
  if (contactRequired) {
    const phoneErr = validatePhone(fields.contactPhone, true);
    if (phoneErr) return phoneErr;
  }
  return null;
}

export function firstMissingOfferFields(fields, contactRequired) {
  const checks = [
    missingField(fields.title, "Naslov ponude je obavezan."),
    missingField(fields.description, "Opis ponude je obavezan."),
    missingField(fields.category, "Kategorija je obavezna."),
    missingField(fields.city, "Grad je obavezan."),
    missingField(fields.budget, "Cijena / budžet je obavezan."),
    missingField(fields.availableWhen, "Dostupnost je obavezna."),
  ];
  for (const c of checks) if (c) return c;
  if (contactRequired) {
    const phoneErr = validatePhone(fields.contactPhone, true);
    if (phoneErr) return phoneErr;
  }
  return null;
}
