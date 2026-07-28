import { escapeHtml } from "../utils/format.js";
import { POLICY_LINKS, POLICY_VERSION } from "../constants/policy.js";
import {
  CONTROLLER_CONTACT,
  CONTROLLER_NAME,
  VERIFIED_BADGE_MEANING,
} from "../utils/legalTexts.js";

export function renderPrivacyInfo() {
  return `
    <div class="screen-scroll">
      <a class="back-link" href="#/postavke">← Postavke</a>
      <h2 class="screen-title">Kontrolor ličnih podataka</h2>
      <section class="settings-group">
        <p class="settings-text">${escapeHtml(CONTROLLER_NAME)}, fizičko lice i razvijač aplikacije, Bosna i Hercegovina. Kontakt: ${escapeHtml(CONTROLLER_CONTACT)}</p>
        <p class="settings-text">Aplikaciju ne razvija firma ni obrt. Na ovaj kontakt šalješ zahtjev za pristup, ispravku ili brisanje svojih podataka.</p>
      </section>
      <h2 class="screen-title">Tvoja prava</h2>
      <section class="settings-group">
        <p class="settings-text">Imaš pravo na pristup podacima, ispravku, brisanje, ograničenje obrade i prigovor na obradu. Prava ostvaruješ kroz uređivanje profila, brisanje naloga ili na kontakt iznad.</p>
        <p class="settings-text">Ako smatraš da su ti prava povrijeđena, možeš podnijeti prigovor Agenciji za zaštitu ličnih podataka u Bosni i Hercegovini i pokrenuti postupak pred nadležnim sudom. Ne moraš se prvo obratiti nama.</p>
        <p class="settings-text">Podaci se čuvaju samo dok su potrebni za rad aplikacije i za svrhu za koju su prikupljeni, odnosno dok postoji zakonska obaveza čuvanja.</p>
      </section>
      <h2 class="screen-title">Šta aplikacija dijeli</h2>
      <section class="settings-group">
        <ul class="settings-bullets">
          <li>Prijava i profil — ime, grad, uloga i opis koje uneseš.</li>
          <li>Javni profil — ocjene, radovi i savjeti koje objaviš.</li>
          <li>Način predstavljanja — ako nastupaš u ime obrta ili firme, vrsta, naziv i sjedište vidljivi su na tvom javnom profilu.</li>
          <li>Poslovi i ponude — oglasi koje kreiraš i prijave na njih.</li>
          <li>Chat — poruke nakon prihvaćene prijave na posao.</li>
          <li>Bilješke o poslu — ostaju samo u pregledniku na ovom uređaju.</li>
          <li>Prognoza — grad iz profila šalje se WeatherAPI servisu.</li>
        </ul>
      </section>
      <h2 class="screen-title">Oznaka PROVJERENO</h2>
      <section class="settings-group">
        <p class="settings-text">${escapeHtml(VERIFIED_BADGE_MEANING)}</p>
      </section>
      <h2 class="screen-title">Pravna dokumenta</h2>
      <section class="settings-group">
        <p class="settings-text">Puna Politika privatnosti i Pravila (verzija ${escapeHtml(POLICY_VERSION)}) otvaraju se na brzoilokalno.com — isti tekst kao pri registraciji i u Android aplikaciji.</p>
        <a class="btn btn--ghost btn--block" href="${POLICY_LINKS.privacy}" target="_blank" rel="noopener noreferrer">Politika privatnosti</a>
        <a class="btn btn--ghost btn--block" href="${POLICY_LINKS.terms}" target="_blank" rel="noopener noreferrer">Pravila i uslovi</a>
        <a class="btn btn--ghost btn--block" href="${POLICY_LINKS.deleteAccount}" target="_blank" rel="noopener noreferrer">Brisanje naloga</a>
      </section>
    </div>`;
}
