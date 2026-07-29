/** Shared business-representation helpers — same Firestore fields as Android. */

export const REPRESENTATION = {
  INDIVIDUAL: "individual",
  BUSINESS: "business",
  TYPES: [
    { id: "craft_related", label: "Obrt ili srodna djelatnost" },
    { id: "sole_entrepreneur", label: "Samostalni preduzetnik" },
    { id: "company", label: "Privredno društvo, npr. d.o.o." },
    { id: "other", label: "Drugi registrovani poslovni subjekt" },
  ],
  DECLARATION_VERSION: "1.0",
};

/** Isti tekst kao Android BusinessRepresentation.SELF_DECLARED_NOTE. */
export const SELF_DECLARED_NOTE = "Podatke je unio korisnik. Registracija nije provjerena.";

export function normalizeSpaces(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

export function businessTypeLabel(type) {
  return REPRESENTATION.TYPES.find((t) => t.id === type)?.label || "";
}

/** Kratka oznaka na profilu — bez „npr. d.o.o.” (to ostaje samo u pickeru). */
export function businessTypeLabelPublic(type) {
  switch (String(type || "").trim()) {
    case "craft_related":
      return "Obrt ili srodna djelatnost";
    case "sole_entrepreneur":
      return "Samostalni preduzetnik";
    case "company":
      return "Privredno društvo";
    case "other":
      return "Registrovani poslovni subjekt";
    default:
      return "";
  }
}

/** Validate draft before save. Returns user-facing error or "". */
export function validateRepresentation(data) {
  const type = String(data.representationType || "").trim();
  if (type !== REPRESENTATION.INDIVIDUAL && type !== REPRESENTATION.BUSINESS) {
    return "Odaberite kako se predstavljate na platformi.";
  }
  if (type === REPRESENTATION.INDIVIDUAL) return "";
  const bt = String(data.businessType || "").trim();
  if (!REPRESENTATION.TYPES.some((t) => t.id === bt)) {
    return "Odaberite vrstu poslovnog subjekta.";
  }
  const name = normalizeSpaces(data.businessName);
  if (name.length < 2) return "Puni registrovani naziv je obavezan.";
  if (name.length > 150) return "Puni registrovani naziv je predugačak.";
  const city = normalizeSpaces(data.businessMunicipality);
  if (city.length < 2) return "Unesite grad ili općinu sjedišta.";
  if (city.length > 100) return "Grad ili općina sjedišta je predugačka.";
  if (!data.businessDeclarationAccepted) {
    return "Potvrdite da imate pravo predstavljati navedeni poslovni subjekt.";
  }
  return "";
}

/**
 * Fields to merge into users/{uid} on registration / profile edit.
 * @param {{ deleteField?: () => unknown, serverTimestamp?: () => unknown }} helpers
 *   On create, omit delete helpers (nulls are skipped). On update, pass deleteField.
 */
export function representationPayload(data, { serverTimestamp, deleteField } = {}) {
  const type = String(data.representationType || "").trim();
  if (type === REPRESENTATION.INDIVIDUAL) {
    const clear = deleteField ? deleteField() : null;
    return {
      representationType: REPRESENTATION.INDIVIDUAL,
      businessType: clear,
      businessName: clear,
      businessMunicipality: clear,
      businessDeclarationVersion: clear,
      businessDeclarationAcceptedAt: clear,
    };
  }
  if (type === REPRESENTATION.BUSINESS) {
    const payload = {
      representationType: REPRESENTATION.BUSINESS,
      businessType: String(data.businessType || "").trim(),
      businessName: normalizeSpaces(data.businessName).slice(0, 150),
      businessMunicipality: normalizeSpaces(data.businessMunicipality).slice(0, 100),
      businessDeclarationVersion: REPRESENTATION.DECLARATION_VERSION,
    };
    if (data.businessDeclarationAccepted && serverTimestamp) {
      payload.businessDeclarationAcceptedAt = serverTimestamp();
    }
    return payload;
  }
  return {};
}

/** Compact HTML block for public/own profile — hide if legacy missing. */
export function renderRepresentationSummary(profile) {
  const type = String(profile?.representationType || "").trim();
  if (type === REPRESENTATION.BUSINESS) {
    const name = escapeLite(normalizeSpaces(profile.businessName));
    const meta = [businessTypeLabelPublic(profile.businessType), normalizeSpaces(profile.businessMunicipality)]
      .filter(Boolean)
      .map(escapeLite)
      .join(" · ");
    return `
      <div class="profile-representation">
        <p class="profile-representation__title">Poslovni profil</p>
        ${name ? `<p class="profile-representation__name">${name}</p>` : ""}
        ${meta ? `<p class="profile-representation__meta">${meta}</p>` : ""}
        <p class="profile-representation__note">${SELF_DECLARED_NOTE}</p>
      </div>`;
  }
  if (type === REPRESENTATION.INDIVIDUAL) {
    return `<div class="profile-representation"><p class="profile-representation__title">Fizičko lice</p></div>`;
  }
  return "";
}

function escapeLite(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderRepresentationFields(defaults = {}) {
  const selected = defaults.representationType || "";
  const typeRadios = `
    <label class="auth-radio">
      <input type="radio" name="representationType" value="individual"${selected === "individual" ? " checked" : ""} required>
      <span>Kao fizičko lice</span>
    </label>
    <label class="auth-radio">
      <input type="radio" name="representationType" value="business"${selected === "business" ? " checked" : ""} required>
      <span>U ime obrta, firme ili drugog registrovanog poslovnog subjekta</span>
    </label>`;
  const businessTypes = REPRESENTATION.TYPES.map((t) => {
    const checked = defaults.businessType === t.id ? " checked" : "";
    return `<label class="auth-radio"><input type="radio" name="businessType" value="${t.id}"${checked}><span>${t.label}</span></label>`;
  }).join("");
  return `
    <p class="field-label">Kako se predstavljate na platformi?</p>
    <div class="auth-radio-group" id="representation-type-group">${typeRadios}</div>
    <div id="business-fields" class="business-fields" hidden>
      <p class="field-label">Podaci o obrtu ili firmi</p>
      <p class="field-label">Vrsta poslovnog subjekta</p>
      <div class="auth-radio-group">${businessTypes}</div>
      <input class="field" type="text" name="businessName" placeholder="Puni registrovani naziv" maxlength="150" value="${escapeLite(defaults.businessName || "")}">
      <p class="field-hint">Upišite naziv onako kako je registrovan.</p>
      <input class="field" type="text" name="businessMunicipality" placeholder="Grad ili općina sjedišta" maxlength="100" value="${escapeLite(defaults.businessMunicipality || "")}">
      <label class="auth-check">
        <input type="checkbox" name="businessDeclarationAccepted">
        <span>Potvrđujem da su navedeni podaci tačni i da imam pravo predstavljati navedeni obrt, firmu ili drugi poslovni subjekt.</span>
      </label>
    </div>`;
}

export function bindRepresentationFields(root = document) {
  const group = root.querySelector("#representation-type-group");
  const box = root.querySelector("#business-fields");
  if (!group || !box) return;
  const sync = () => {
    const checked = group.querySelector('input[name="representationType"]:checked');
    box.hidden = !(checked && checked.value === "business");
  };
  group.addEventListener("change", sync);
  sync();
}

export function readRepresentationFromForm(form) {
  const fd = new FormData(form);
  return {
    representationType: String(fd.get("representationType") || "").trim(),
    businessType: String(fd.get("businessType") || "").trim(),
    businessName: String(fd.get("businessName") || ""),
    businessMunicipality: String(fd.get("businessMunicipality") || ""),
    businessDeclarationAccepted: form.businessDeclarationAccepted?.checked === true,
  };
}
