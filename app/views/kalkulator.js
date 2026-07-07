import { escapeHtml } from "../utils/format.js";
import {
  calcMaterialTotal,
  calcServiceTotal,
  calcSummary,
  calcTripTotal,
  formatKm,
} from "../utils/kalkulatorLogic.js";

const MODULES = ["Put & posjete", "Materijal", "Usluga"];
const SERVICES = ["Krečenje", "Vodoinstalater", "Električar", "Keramika", "Građevina", "Ostalo"];
const UNITS = ["m2", "sat", "kom", "m", "kg"];

export function renderKalkulator({ state = {}, role = "korisnik" }) {
  const s = {
    module: 0,
    distOneWayKm: "",
    numTrips: "",
    kmCost: "",
    flatPerTrip: "",
    hoursOnSite: "",
    hourlyRate: "",
    matQty: "",
    matWastePct: "10",
    matPriceUnit: "",
    serviceType: "Krečenje",
    quantity: "",
    unit: "m2",
    pricePerUnit: "",
    ...state,
  };

  const tripTotal = calcTripTotal(s);
  const matTotal = calcMaterialTotal(s);
  const serviceTotal = calcServiceTotal(s);
  const summary = calcSummary({
    tripTotal,
    matTotal,
    serviceTotal,
    role,
    hoursOnSite: s.hoursOnSite,
    hourlyRate: s.hourlyRate,
    matWastePct: s.matWastePct,
  });

  const roleLabel = role === "majstor" ? "Majstor" : role === "kreator" ? "Kreator" : "Korisnik";
  const roleHint =
    role === "majstor"
      ? "Teren: udaljenost, materijal s gubitkom, satnica — sve u jednom pregledu."
      : role === "kreator"
        ? "Naglasak na materijalu i radnom satu; putovanje po potrebi."
        : "Jednostavna procjena usluge i okvirni trošak.";

  const moduleChips = MODULES.map((label, i) => {
    const active = Number(s.module) === i ? " kalk-chip--active" : "";
    return `<button type="button" class="kalk-chip${active}" data-kalk-module="${i}">${escapeHtml(label)}</button>`;
  }).join("");

  let moduleFields = "";
  if (Number(s.module) === 0) {
    moduleFields = `
      <input class="field" data-kalk-field="distOneWayKm" value="${escapeHtml(s.distOneWayKm)}" placeholder="Udaljenost jednim smjerom (km)">
      <input class="field" data-kalk-field="numTrips" value="${escapeHtml(s.numTrips)}" placeholder="Broj posjeta">
      <input class="field" data-kalk-field="kmCost" value="${escapeHtml(s.kmCost)}" placeholder="Cijena po km (KM)">
      <input class="field" data-kalk-field="flatPerTrip" value="${escapeHtml(s.flatPerTrip)}" placeholder="Fiksno po posjeti (KM)">
      <input class="field" data-kalk-field="hoursOnSite" value="${escapeHtml(s.hoursOnSite)}" placeholder="Sati na lokaciji (opc.)">
      <input class="field" data-kalk-field="hourlyRate" value="${escapeHtml(s.hourlyRate)}" placeholder="Satnica (KM)">
      <p class="kalk-line">Put: <strong>${formatKm(tripTotal)}</strong></p>`;
  } else if (Number(s.module) === 1) {
    moduleFields = `
      <input class="field" data-kalk-field="matQty" value="${escapeHtml(s.matQty)}" placeholder="Količina">
      <input class="field" data-kalk-field="matWastePct" value="${escapeHtml(s.matWastePct)}" placeholder="Gubitak % (0–80)">
      <input class="field" data-kalk-field="matPriceUnit" value="${escapeHtml(s.matPriceUnit)}" placeholder="Cijena po jedinici (KM)">
      <p class="kalk-line">Materijal: <strong>${formatKm(matTotal)}</strong></p>`;
  } else {
    const serviceOpts = SERVICES.map(
      (v) => `<option value="${escapeHtml(v)}"${v === s.serviceType ? " selected" : ""}>${escapeHtml(v)}</option>`
    ).join("");
    const unitOpts = UNITS.map(
      (v) => `<option value="${escapeHtml(v)}"${v === s.unit ? " selected" : ""}>${escapeHtml(v)}</option>`
    ).join("");
    moduleFields = `
      <select class="field" data-kalk-field="serviceType">${serviceOpts}</select>
      <input class="field" data-kalk-field="quantity" value="${escapeHtml(s.quantity)}" placeholder="Količina">
      <select class="field" data-kalk-field="unit">${unitOpts}</select>
      <input class="field" data-kalk-field="pricePerUnit" value="${escapeHtml(s.pricePerUnit)}" placeholder="Cijena po jedinici (KM)">
      <p class="kalk-line">Usluga: <strong>${formatKm(serviceTotal)}</strong></p>`;
  }

  return `
    <div class="screen-scroll kalk-screen">
      <a class="back-link" href="#/home">← Početna</a>
      <h2 class="screen-title">Brzi kalkulator</h2>
      <p class="screen-subtitle">Režim: ${escapeHtml(roleLabel)} · ${escapeHtml(roleHint)}</p>
      <div class="kalk-chips">${moduleChips}</div>
      <div class="kalk-panel" id="kalk-panel">
        ${moduleFields}
      </div>
      <article class="kalk-summary">
        <p class="kalk-summary__label">${escapeHtml(summary.confidenceText)}</p>
        <p class="kalk-summary__total">Ukupno: <strong>${formatKm(summary.grandTotal)}</strong></p>
        <p class="kalk-summary__range">Preporuka: ${formatKm(summary.recommendedMin)} – ${formatKm(summary.recommendedMax)}</p>
        <p class="kalk-summary__offer">Ponuda: <strong>${formatKm(summary.recommendedOffer)}</strong> (buffer ${summary.bufferPct.toFixed(0)}%)</p>
      </article>
    </div>`;
}

export function readKalkulatorState(root = document) {
  const state = { module: 0 };
  const active = root.querySelector("[data-kalk-module].kalk-chip--active");
  if (active) state.module = Number(active.dataset.kalkModule) || 0;
  root.querySelectorAll("[data-kalk-field]").forEach((el) => {
    state[el.dataset.kalkField] = el.value;
  });
  return state;
}
