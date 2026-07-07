import { escapeHtml } from "../utils/format.js";

export function renderPrivacyInfo() {
  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/postavke">← Postavke</a>
      <h2 class="screen-title">Što aplikacija dijeli</h2>
      <section class="settings-group">
        <ul class="settings-bullets">
          <li>Prijava i profil — ime, grad, uloga i opis koje uneseš.</li>
          <li>Javni profil — ocjene, radovi i savjeti koje objaviš.</li>
          <li>Poslovi i ponude — oglasi koje kreiraš i prijave na njih.</li>
          <li>Chat — poruke nakon prihvaćene prijave na posao.</li>
          <li>Bilješke o poslu — ostaju samo u pregledniku na ovom uređaju.</li>
          <li>Prognoza — grad iz profila šalje se WeatherAPI servisu.</li>
          <li>Verifikacija — zahtjev ide adminu; odobrenje daje oznaku PROVJERENO.</li>
        </ul>
      </section>
    </div>`;
}
