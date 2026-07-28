/**
 * Jedini izvor pravnog teksta u PWA — mora biti istovjetan Android LegalTexts.kt.
 * Javne HTML stranice (privacy-policy.html, terms.html) koriste isti sadržaj.
 */

export const CONTROLLER_NAME = "Omer Hotović";
export const CONTROLLER_CONTACT = "omer.creating.apps87@gmail.com";

/** Isti tekst kao Android BusinessRepresentation.VERIFIED_BADGE_MEANING. */
export const VERIFIED_BADGE_MEANING =
  "Oznaka PROVJERENO znači da je email potvrđen, da je profil kompletan i da protiv " +
  "naloga nema otvorene prijave. Ne znači da smo provjerili obrt, firmu ili " +
  "poslovni registar. Za pregled šaljemo ime, email, ulogu i grad, a email ostaje " +
  "interni i ne prikazuje se drugim korisnicima.";

export function termsText(version) {
  return `Korištenjem aplikacije Brzo i Lokalno potvrđujete da ćete koristiti aplikaciju zakonito i odgovorno.

1. Nalozi i tačnost podataka

Odgovorni ste za tačnost podataka koje unesete.

Ne smijete se lažno predstavljati niti koristiti tuđi identitet.

Aplikacija je namijenjena osobama od 18 godina i više. Ako nemate 18 godina, ne otvarajte nalog i ne koristite aplikaciju.

2. Dozvoljeno korištenje

Aplikacija služi za objavu usluga, radova, ponuda, poslova i komunikaciju između korisnika.

3. Zabranjeno ponašanje i sadržaj

Zabranjeni su spam, uznemiravanje, prijetnje, govor mržnje, prevare, lažno predstavljanje i obmanjujuće objave.

Zabranjen je nezakonit, nasilan, seksualno eksplicitan ili drugi neprimjeren sadržaj.

Zabranjeno je objavljivanje sadržaja koji krši tuđa prava, privatnost ili intelektualno vlasništvo.

Zabranjena je zloupotreba chata, prijava, ocjena i drugih funkcija aplikacije.

4. Korisnički sadržaj

Korisnik je odgovoran za radove, opise, oglase, ponude, poruke i druge informacije koje objavi.

Aplikacija može ukloniti sadržaj ili ograničiti nalog ako procijeni da postoji kršenje pravila, rizik za druge korisnike ili sigurnost platforme.

5. Tačnost profila i predstavljanje poslovnog subjekta

Korisnik je odgovoran za tačnost podataka koje unosi na svoj profil.

Korisnik koji navede da predstavlja obrt, firmu ili drugi poslovni subjekt potvrđuje da ima pravo predstavljati taj subjekt.

Zabranjeno je lažno predstavljanje, korištenje tuđeg poslovnog naziva bez ovlaštenja, unošenje netačnih poslovnih podataka, stvaranje lažnog dojma da je profil provjeren, predstavljanje kao druga osoba ili organizacija, te korištenje platforme radi prevare ili obmanjivanja drugih korisnika.

Brzo i Lokalno trenutno ne provjerava poslovne registre i ne garantuje tačnost poslovnog statusa koji je korisnik sam naveo.

Brzo i Lokalno može zatražiti pojašnjenje ili dokaz, ukloniti poslovnu oznaku, ukloniti ili ispraviti očigledno netačan sadržaj, privremeno ograničiti profil, ugasiti račun kod ozbiljne ili ponovljene zloupotrebe, sačuvati potrebne podatke radi sigurnosti, rješavanja prijave ili zakonske obaveze, te postupiti po zakonitom zahtjevu nadležnog organa.

Majstor, kreator ili drugi pružalac usluge odgovoran je za ispunjavanje uslova za obavljanje svoje djelatnosti, potrebne dozvole i registracije, porezne i druge zakonske obaveze, svoje cijene, račune i garancije kada su primjenjivi, izvršenje dogovorene usluge i tačnost opisa svojih radova i ponuda.

Brzo i Lokalno povezuje korisnike i ne postaje automatski strana u ugovoru koji korisnici međusobno zaključe.

Nijedna odredba ovih Uslova ne ukida prava potrošača ili druga prava koja se prema važećem zakonu ne mogu isključiti.

6. Oznaka PROVJERENO

${VERIFIED_BADGE_MEANING}

Profil s ovom oznakom ima nešto veću težinu pri izračunu reputacije na platformi. Oznaka se može ukloniti u svakom trenutku ako uslovi više nisu ispunjeni ili ako se oznaka zloupotrebljava.

7. Plaćanje

Brzo i Lokalno ne obrađuje plaćanja, ne prima i ne prenosi novac, ne izdaje račune i ne posreduje u plaćanju.

Cijenu, način plaćanja, račun, garanciju i eventualni povrat novca korisnici dogovaraju i rješavaju direktno između sebe. Aplikacija ne posreduje u sporovima o plaćanju i ne može vratiti novac plaćen izvan aplikacije.

8. Blokiranje, prijava i moderacija

Korisnici mogu prijaviti i blokirati problematične korisnike.

Prijave se mogu pregledati i koristiti za moderaciju, sigurnost i sprečavanje zloupotrebe.

9. Ograničenje odgovornosti

Brzo i Lokalno je platforma za povezivanje korisnika i pružalaca usluga i ne garantuje kvalitet, zakonitost, sigurnost ili ishod svakog dogovora između korisnika.

10. Prekid korištenja

Aplikacija može ograničiti, suspendovati ili ukloniti nalog u slučaju kršenja pravila ili ugrožavanja sigurnosti platforme.

11. Mjerodavno pravo i sporovi

Na ova Pravila primjenjuje se pravo Bosne i Hercegovine.

Spor prvo pokušavamo riješiti direktno, na kontakt naveden u Politici privatnosti. Ako to nije moguće, za spor je nadležan sud u Bosni i Hercegovini. Ako ste potrošač, ovo ne utiče na vaše pravo da postupak pokrenete pred sudom svog mjesta prebivališta, ni na druga prava potrošača koja se po zakonu ne mogu isključiti.

12. Izmjene pravila

Pravila se mogu povremeno ažurirati. Nastavak korištenja nakon izmjena znači prihvatanje ažurirane verzije.

Verzija pravila: ${version}`;
}

export function privacyText(version) {
  return `Kontrolor ličnih podataka

${CONTROLLER_NAME}, fizičko lice i razvijač aplikacije, Bosna i Hercegovina.
Kontakt: ${CONTROLLER_CONTACT}

Aplikaciju ne razvija privredno društvo ni obrt. Kontrolor ličnih podataka je fizičko lice navedeno iznad i njemu se podnose svi zahtjevi u vezi s ličnim podacima.

Brzo i Lokalno obrađuje podatke potrebne za rad aplikacije.

1. Koje podatke prikupljamo

Podatke naloga (korisnički ID, email, uloga na platformi, grad) kroz Firebase Authentication i, kada se koristi, Google Sign-In.

Podatke profila koje korisnik sam unese: ime prikaza, opis, kontakt telefon (ako ga unese), kontakt preferencije (chat, poziv, WhatsApp), način predstavljanja (fizičko lice ili u ime poslovnog subjekta), vrstu poslovnog subjekta, puni poslovni naziv, grad ili općinu sjedišta, verziju i vrijeme prihvatanja poslovne izjave kada je to primjenjivo, te sadržaj koji korisnik objavi (objave, oglasi, ponude, poruke, slike).

Ocjene i broj ocjena, te podatke o praćenju profila (pratitelji / praćeni) kada korisnik koristi te funkcije.

Podatke prijava i blokiranja radi sigurnosti i moderacije. Ako je nalog ograničen ili uklonjen od strane administratora, može se čuvati i zapis o toj mjeri (npr. razlog i trajanje).

Podatke zahtjeva za oznaku PROVJERENO: ime prikaza, email, uloga i grad, radi pregleda zahtjeva. Taj zapis nije javno čitljiv i email se ne prikazuje drugim korisnicima.

Tehničke podatke potrebne za rad usluga koje aplikacija koristi (npr. Firebase Firestore, Cloud Storage, Cloud Messaging / push notifikacije i token uređaja na Androidu kada su obavijesti omogućene, App Check, crash/analitičke usluge ako su uključene).

Na Androidu, ako korisnik koristi povezani Huawei sat (Wear Engine), mogu se razmjenjivati ograničeni operativni podaci potrebni za prikaz obavijesti ili administratorske pomoćne funkcije na satu. Ti podaci ne služe za oglašavanje.

Aplikacija ovom funkcijom ne prikuplja JMBG, kopije ličnih dokumenata, JIB, poslovna rješenja ni bankovne podatke.

2. Svrha, osnov i obaveznost (ključne kategorije)

Uloga na platformi — svrha: usmjeravanje funkcija (traženje usluge / nuđenje usluge); osnov: izvršenje ugovora / pružanje usluge; obavezna pri registraciji; bez nje nalog nije dovršen; tip naloga može biti vidljiv na profilu; obrađuju je Firebase/Google usluge; može se prenositi izvan BiH putem tih pružalaca; čuva se dok nalog postoji; pristup/ispravka/brisanje putem profila, brisanja naloga ili kontakta.

Način predstavljanja i poslovni podaci (vrsta, naziv, sjedište) — svrha: jasno prikazivanje kako se korisnik predstavlja drugim korisnicima; osnov: izvršenje ugovora i legitimni interes transparentnosti; obavezni pri novoj registraciji; ako nedostaju kod starih naloga, aplikacija i dalje radi, a na javnom profilu se ta sekcija ne prikazuje (ne pretpostavlja se fizičko lice); kada su popunjeni, na javnom profilu mogu biti vidljivi način predstavljanja, vrsta, naziv i sjedište; ne smatraju se službeno provjerenim; obrađuju ih Firebase usluge; mogući prenos izvan BiH putem pružalaca; čuvaju se dok nalog postoji ili dok korisnik ne izmijeni/obriše; ispravku poslovnih podataka moguće je zatražiti na kontakt iznad; brisanje brisanjem naloga ili kontaktom.

Poslovna izjava (verzija i vrijeme prihvatanja) — svrha: evidencija da je korisnik potvrdio pravo predstavljanja; osnov: izvršenje ugovora / dokazivanje saglasnosti; obavezna samo kada se bira poslovni subjekt; nije javno prikazana; čuva se uz nalog; pristup/brisanje putem zahtjeva ili brisanja naloga.

3. Prognoza vremena

Kad otvoriš plan za vanjski rad, aplikacija šalje naziv grada prema WeatherAPI servisu kako bi vratila satnu prognozu.

Ti podaci služe samo za prikaz vremena i savjeta u aplikaciji.

4. Zašto koristimo podatke

Za kreiranje i održavanje naloga, prikaz sadržaja, komunikaciju, sigurnost, moderaciju i poboljšanje rada aplikacije.

5. Dijeljenje podataka

Podaci se ne prodaju oglašivačima.

Ono što korisnik javno objavi, uključujući način predstavljanja i navedene poslovne podatke, može biti vidljivo drugim korisnicima.

Podaci se obrađuju kroz tehničke servise koje aplikacija koristi (npr. Google Firebase Authentication, Firestore, Storage, Cloud Messaging, App Check, WeatherAPI i, na Androidu kada je sat povezan, Huawei Wear Engine). To znači da se određeni podaci šalju tim pružaocima radi rada aplikacije i mogu biti obrađeni izvan Bosne i Hercegovine.

6. Čuvanje podataka

Podaci se čuvaju samo dok je to potrebno za rad aplikacije i za svrhu za koju su prikupljeni, odnosno dok postoji zakonska obaveza čuvanja.

Kad svrha prestane i kad nema zakonske obaveze da se podatak zadrži, podatak se briše ili se čuva bez veze s nalogom.

Kod brisanja naloga, aplikacija pokušava obrisati povezane podatke naloga i sadržaja. Dio podataka može se zadržati samo ako je to potrebno radi sigurnosti, rješavanja prijave ili zakonske obaveze, i samo za vrijeme koje zakon dopušta.

Nakon brisanja može ostati kratka arhiva naloga odvojena od stvarnih korisnika (npr. ime, email, uloga, grad, način predstavljanja, poslovni naziv ako je bio naveden, broj otvorenih prijava u trenutku brisanja i vrijeme brisanja). Prijave u kojima je obrisani nalog bio meta, te zapisi o zabrani, mogu ostati radi sigurnosti platforme.

7. Prava korisnika

Korisnik ima pravo na pristup svojim podacima, na ispravku netačnih podataka, na brisanje, na ograničenje obrade i na prigovor na obradu.

Ta prava korisnik ostvaruje kroz uređivanje profila, brisanje naloga u aplikaciji ili na kontakt kontrolora naveden na početku ovog dokumenta.

Ako korisnik smatra da su mu prava povrijeđena, može podnijeti prigovor Agenciji za zaštitu ličnih podataka u Bosni i Hercegovini i pokrenuti postupak pred nadležnim sudom. Obraćanje kontroloru nije uslov za podnošenje prigovora Agenciji ili sudu.

Korisnik može koristiti opcije prijave i blokiranja gdje su dostupne.

8. Pravna dokumenta

Puna Politika privatnosti, Pravila i uslovi i stranica za brisanje naloga dostupni su kroz vanjske linkove u postavkama aplikacije.

9. Kontakt za pitanja o privatnosti

${CONTROLLER_NAME} — ${CONTROLLER_CONTACT}

Verzija politike: ${version}`;
}

export function deleteAccountText() {
  return `Korisnici aplikacije Brzo i Lokalno mogu zatražiti brisanje naloga i povezanih podataka kroz aplikaciju ili ovu javnu stranicu.

1. Brisanje u aplikaciji

Otvori aplikaciju i idi na: Postavke → Obriši nalog.

Kad je dostupno, aplikacija pokušava obrisati nalog i povezane podatke direktno.

2. Zahtjev emailom

Ako više nemaš pristup aplikaciji, pošalji zahtjev na: ${CONTROLLER_CONTACT}

U poruci navedi:
— email adresu naloga,
— jasnu izjavu da želiš brisanje naloga i povezanih podataka,
— dodatne podatke koji pomažu da pronađemo nalog, ako je potrebno.

3. Šta se briše

Nakon važećeg zahtjeva pokušavamo obrisati ili ukloniti: profil, radove i slike, poslove, ponude i prijave, obične poruke, zapise o blokiranju i drugi sadržaj vezan za nalog gdje je to moguće.

4. Šta se može zadržati

Dio podataka može se zadržati, smanjiti ili anonimizirati samo ako je to potrebno radi sigurnosti, rješavanja prijave, zakonske obaveze ili integriteta evidencije — i samo za vrijeme koje zakon dopušta.

Kratka arhiva obrisanog naloga (ime, email, uloga, grad, način predstavljanja, poslovni naziv ako je postojao, broj otvorenih prijava u trenutku brisanja i vrijeme brisanja) može se čuvati odvojeno od stvarnih korisnika radi zakonskih i sigurnosnih provjera, a briše se kad prestane potreba.

Prijave u kojima je obrisani nalog bio meta i zapisi o zabrani mogu ostati radi zaštite drugih korisnika. Ocjene se pri brisanju u aplikaciji uklanjaju gdje je to tehnički moguće.

5. Vrijeme obrade

Važeće zahtjeve obrađujemo u razumnom roku. Dodatno vrijeme može trebati radi provjere ili zakonskog zadržavanja.

6. Kontakt

Pitanja o brisanju: ${CONTROLLER_CONTACT}`;
}
