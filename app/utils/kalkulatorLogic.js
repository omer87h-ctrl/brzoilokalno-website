export function parseDec(value) {
  const n = Number(String(value || "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function calcTripTotal({ distOneWayKm, numTrips, kmCost, flatPerTrip, hoursOnSite, hourlyRate }) {
  const d = parseDec(distOneWayKm);
  const n = Number.parseInt(numTrips, 10);
  const rate = parseDec(kmCost);
  if (d == null || !n || n <= 0 || rate == null || d <= 0 || rate < 0) return null;
  const flat = parseDec(flatPerTrip) ?? 0;
  const kmTotal = d * 2 * n;
  let sum = kmTotal * rate + Math.max(0, flat) * n;
  const h = parseDec(hoursOnSite);
  const hr = parseDec(hourlyRate);
  if (h != null && hr != null && h > 0 && hr >= 0) sum += h * n * hr;
  return sum;
}

export function calcMaterialTotal({ matQty, matWastePct, matPriceUnit }) {
  const q = parseDec(matQty);
  const p = parseDec(matPriceUnit);
  const w = parseDec(matWastePct) ?? 0;
  if (q == null || p == null || q <= 0 || p < 0) return null;
  const eff = q * (1 + Math.min(80, Math.max(0, w)) / 100);
  return eff * p;
}

export function calcServiceTotal({ quantity, pricePerUnit }) {
  const q = parseDec(quantity);
  const p = parseDec(pricePerUnit);
  if (q == null || p == null || q <= 0 || p <= 0) return null;
  return q * p;
}

export function calcSummary({ tripTotal, matTotal, serviceTotal, role, hoursOnSite, hourlyRate, matWastePct }) {
  const parts = [tripTotal, matTotal, serviceTotal].filter((v) => v != null);
  const grandTotal = parts.length ? parts.reduce((a, b) => a + b, 0) : null;
  const activeModuleCount = parts.length;
  const hasOnSiteHours = (parseDec(hoursOnSite) ?? 0) > 0 && (parseDec(hourlyRate) ?? 0) >= 0;
  const materialWaste = Math.min(80, Math.max(0, parseDec(matWastePct) ?? 0));

  let bufferPct = 8;
  if (activeModuleCount <= 1) bufferPct += 7;
  if (activeModuleCount === 2) bufferPct += 3;
  if (!hasOnSiteHours && activeModuleCount > 0) bufferPct += 4;
  if (materialWaste >= 20) bufferPct += 3;
  if (!role || role === "korisnik") bufferPct += 2;
  bufferPct = Math.min(22, Math.max(8, bufferPct));

  const recommendedMin =
    grandTotal != null ? Math.max(0, grandTotal - grandTotal * (bufferPct * 0.45) / 100) : null;
  const recommendedMax = grandTotal != null ? grandTotal + (grandTotal * bufferPct) / 100 : null;
  const recommendedOffer = grandTotal != null ? grandTotal + (grandTotal * bufferPct * 0.7) / 100 : null;

  let confidenceText = "Unesi podatke za procjenu";
  if (activeModuleCount >= 3 && hasOnSiteHours) confidenceText = "Visoka pouzdanost procjene";
  else if (activeModuleCount >= 2) confidenceText = "Srednja pouzdanost procjene";
  else if (activeModuleCount === 1) confidenceText = "Osnovna procjena (dodaj još podataka za preciznije)";

  return { grandTotal, bufferPct, recommendedMin, recommendedMax, recommendedOffer, confidenceText, activeModuleCount };
}

export function formatKm(n) {
  if (n == null) return "—";
  return `${n.toLocaleString("bs-BA", { maximumFractionDigits: 2 })} KM`;
}
