# Brzo i Lokalno TECH — portal i vodič za održavanje

## Struktura
- /tech/ — početna urednička TECH stranica, originalni vizuali, BL Pulse
- /tech/biblioteka.html — originalni resursi s vizuelnim naslovnicama, lokalna pretraga i kategorije
- /tech/free-store.html — besplatni digitalni resursi (bez naplate ili plaćenog poslovanja)
- /tech/lab.html — predloži projekat putem e-pošte, bez baze projekata ili automatskih objava
- /tech/majstori-kreatori.html — veza tech sadržaja i glavne aplikacije
- /tech/clanci/*.html — šest postojećih originalnih članaka
- /tech/citaj.html?resurs=<filename> — pregled whitelistovanih resursa
- /tech/experience.css — zajednički izgled svih novih stranica
- /tech/experience.js — pretraga, mobilni meni, filteri biblioteke i storea
- /tech/assets/*.svg — originalne ilustracije izrađene za ovaj portal; bez tuđih fotografija i proizvoda
- /tech/pravila.html i /tech/privatnost.html — urednička pravila i obavijest o privatnosti

## Kako dodati članak
1. Napiši originalni tekst i provjeri činjenice, datume i izvore.
2. Napravi /tech/clanci/slug.html koristeći postojeće članke kao obrazac.
3. Dodaj njegov naslov, kategoriju i stvarnu putanju u /tech/data.js.
4. Ažuriraj /tech/feed.xml i sitemap.xml.
5. Dodaj vlastitu/licenciranu fotografiju ili novu originalnu ilustraciju. Navedi licencu/izvor gdje je potrebno.
6. Nikada ne predstavljaj imaginarne intervjue, recenzije, ocjene, citate i broj korisnika kao činjenice.

## Kako dodati knjigu ili datoteku
1. Pisano provjeri autorstvo, dozvolu za distribuciju i eventualna prava trećih osoba.
2. Sačuvaj resurs pod /tech/resursi/ — samo provjerene, neizvršne statičke datoteke (npr. TXT, CSV, PDF).
3. Dodaj odgovarajući unos u polje materials u /tech/data.js. Za svaki resurs potrebno je pravo objave.
4. Provjeri "Čitaj" i "Preuzmi" na telefonu i računaru. Ako je tip nepoznat čitaču, koristi direktno preuzimanje.
5. Uvijek jasno označi vrstu: mini-knjiga, vodič, lista, predložak. Ne prikazuj vodiče kao nepostojeće knjige.

## Privatnost
Nema prijave na portal, korisničkih naloga, vanjskog analitičkog trackinga, naplate, korpe ili prijema fajlova putem javnog obrasca.
E-mail prijedlozi ne objavljuju se automatski. Uredništvo potvrđuje dozvole.
Postojeća Android/PWA aplikacija nije mijenjana i ima svoje pravilo privatnosti.

## Ograničenja i kvalitet
- GitHub Pages ima ograničenja i nije hosting za primarno komercijalnu trgovinu ili osjetljive transakcije.
- Sadržaj mora poštovati autorska prava i važeće propise. Dokumenti nisu zamjena za pravnu provjeru.
- CSS animacije poštuju prefers-reduced-motion.
- Fontovi koriste lokalni sistemski fallback, bez eksternog Google Fonts učitavanja na novim TECH stranicama.
- Redovno testirati navigaciju, filtere, RSS, sitemap i mobilni prikaz.
- Nove plaćene funkcije, korisničke prijave ili backend zahtijevaju novu tehničku i pravnu analizu.

## Objavljivanje
Promjene se pripremaju na grani feature/tech-editorial-redesign. Glavna domena i aplikacija ne trebaju biti modificirane osim preciznog sitemap.xml za indeksiranje TECH stranica.

## Guardian Core (lokalno, bez Firebasea)
- /tech/guardian.html: prepoznavanje osnovnih zadataka i izbor korisnih koraka.
- /tech/telefoni.html: poređenje nekoliko modela s proizvođačkim izvorima, ručni unos cijena, bez lažnih recenzija.
- /tech/alati.html: kalkulator pločica, boje i jednostavne ponude, te katalog besplatnih alata sa zvaničnim linkovima.
- /tech/guardian-core.js: lokalni proračuni i namjere, ništa se ne šalje u cloud.
- /tech/guardian-data.js: urednički kontrolisani podaci o uređajima, alatima i izvorima.
- /tech/experience.js: mali kontekstualni Guardian na TECH stranicama na osnovu URL-a bez praćenja.

### Kako dodati telefon
Potvrdi model, tačnu tržišnu varijantu, izvor proizvođača i datum. Uredi jedino pouzdano dostupna polja u guardian-data.js; ne pretpostavljaj masu, kapacitet ili IP. Cijene se trenutno ne prikupljaju niti prikazuju kao javne ponude. Zaključak ne predstavlja praktični test ili ocjenu.

### Kako dodati softver
Koristi samo zvaničnu stranicu autora, provjeri besplatni režim i licencu, napiši neutralan opis. Ne hostuj izvršne datoteke ni tuđe slike/logotipe bez dozvole.

### Kako dodati vijesti
Portal nema automatizovani prikupljač vijesti; ažuriranje naslova i RSS-a je uredničko. Ne postoji sistem koji samostalno provjerava i objavljuje vijesti, niti to treba obećavati.

## Premium medijski portal, urednički prijem i Asistent
- /tech/ — jasna medijska početna s postojećim stvarnim člancima.
- /tech/tech-zona.html — filtrirana arhiva iz postojećeg data.js, bez automatskog izmišljanja vijesti.
- /tech/studio.html — lokalni editor: download TXT; opcionalno localStorage samo klikom na Sačuvaj.
- /tech/objavi.html — formular za pripremu e-pošte za članak, knjigu, oglas ili projekat. Korisnik MORA sam otvoriti i poslati mail.
- /tech/oglasi.html — javna lista isključivo urednički odobrenih sadržaja.
- /tech/approved-posts.js — prazan niz za urednički odobrene oglase. Primljena pošta se NE dodaje automatski.
- /tech/asistent.html — jedinstveni centralni ulaz. Postojeći /tech/guardian.html i alati ostaju funkcionalni uz novo javno ime Asistent.

### Postupak odobravanja iz e-pošte
1. Pošiljalac popuni /tech/objavi.html i sam pošalje e-poštu na uredničku adresu.
2. Vlasnik provjeri autorstvo, kontakt, istinitost i pravnu prihvatljivost sadržaja i posebno odobri konkretnu verziju.
3. Tek nakon odobrenja urednik ručno doda tačno odobrenu javnu objavu na /tech/approved-posts.js ili objavi novi članak.
4. GitHub Pages objava slijedi tek nakon mergea na main. Odgovor na email SAM PO SEBI ne objavljuje ništa. Bez dodatne automatizacije nije moguće vjerodostojno tvrditi da mail automatski objavljuje na GitHub Pages.
5. Izbjegavati javno izlaganje privatnih e-mailova, telefona i tuđih podataka bez dozvole. Urednički postupak ostaje ljudski.

## Asistent razgovor i TECH Pulse (razvojna grana)
- assistant-chain.js: lokalni lanac namjera, pretrage stvarnih članaka/knjiga/telefona/alata, provjerljivih linkova i sljedeće radnje.
- local-ai.js: korisnik po želji uključuje WebLLM; koristi se SmolLM2 360M q4f32 (ili f16), WebGPU i javni CDN za JS + model. Na slabijem uređaju radi Lite režim; nema automatskog slanja upita na server.
- tech-pulse.js i news-feed.js: pristupačan pomični panel s postojećim autorskim objavama. Nema automatskog RSS prikupljanja ni lažnih live vijesti u ovoj verziji; za stvarne vanjske vijesti potreban je poseban provjereni periodični izvor i urednička pravila.
- CSS u premium.css zadržava mobilni prikaz i reduced-motion.
- Privatnost: AI se pokreće samo na korisnički zahtjev; vanjski CDN može dobiti standardne tehničke podatke prilikom preuzimanja modela.
- Ne objavljivati na main bez posebne potvrde korisnika. Ne dirati Android/PWA/root app.

## Model i biblioteka - reference licence
- WebLLM runtime: @mlc-ai/web-llm v0.2.85 (Apache-2.0), npm: https://www.npmjs.com/package/@mlc-ai/web-llm.
- SmolLM2-360M-Instruct: HuggingFaceTB, Apache-2.0, https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct.
- WebLLM je opcionalan i zahtijeva WebGPU; q4f32_1 ~580 MB VRAM i q4f16_1 ~376 MB VRAM po službenom WebLLM katalogu; internet preuzimanja i predmemorija nisu besplatni po pitanju korisničkog protoka.
- SmolLM2 je primarno treniran na engleskom. Ne garantirati kvalitet bosanskog, niti prikazivati neprovjeren zaključak kao recenziju ili vijest.
- TECH Pulse: do posebnog urednički odobrenog izvora koristi samo prethodno objavljene interne naslove. Ne smije se nazivati automatskom vanjskom agencijom.

## Asistent OS 2.0 (Guardian architecture translated for web)
- `assistant-chain.js` indexes *only actual* verified portal records; `assistant-os.js` adds interpreter, session context, scenario engine, reliable math and safe tool routing.
- Client processing only. No Firebase, no paid API, no persistence. It is not the recovered original Kotlin source; the code in the app repo could not be retrieved (only README in its default branch).
- User can say 'telefon do 500 KM' then 'baterija': budget and intent survive. 'Pločice za 4x3 m' then '60x60 cm' gives 37 pieces with a default clearly labeled 10% reserve.
- The separately opt-in WebLLM model enhances phrasing, not the math or unverified claims. Client-side model performance depends on user device.

## Portal-only mode (2026-10-10)
Asistent and AI interface removed from navigation, homepage and scripts on development branch. Legacy asistent.html / guardian.html redirect to TECH homepage. Calculator and phone comparator still run locally. No public deploy authorized.

## TECH Ambient — izvorno sintetizirani zvuk
- Web Audio oscilatori bez tuđih snimaka, javnog audio hostinga, download datoteka i autorskih uzoraka.
- Zvuk je po otvaranju stranice isključen; pokreće se isključivo klikom na dugme.
- Zvuk pauzira kada korisnik napusti tab i ne pamti se bez pristanka.
- Dostupan samo na preglednicima s AudioContext podrškom.

## Izvori i vijesti — urednički pregled
- `tech/izvori.html`: direktni linkovi na provjerene izvore i datume; nema kopiranja cijelih članaka.
- `tech/news-feed.js` trenutno je ručno odabrani set objava. Nije automatski ažuriran; ne predstavljati ga kao real-time feed.
- `tech/update-news.py` je neaktivni razvojni pomoćni skript, a nema instaliranog workflowa za automatsko objavljivanje.
- Izbjegavati dijeljenje tuđih zaštićenih fotografija i tekstova bez dozvole.

## Izdanje 2026-10-11: potpuno povezani TECH portal
- Početna /tech/ je naslovnica cijelog TECH portala, a ne dodatak zasebnoj aplikaciji.
- /tech/discovery.html#learning-academy: 5 obrazovnih oblasti sa 15 autorskih lekcija. Svaka sadrži objašnjenje, konkretan primjer, mali zadatak i provjeru znanja. Lokalno se pamte završene lekcije i bilješke; korisnik ih može obrisati. Nema računa ni slanja odgovora.
- /tech/tech-zona.html: urednička arhiva iz /tech/data.js. Nove tekstove ažurirati i u /tech/feed.xml i sitemap.xml.
- /tech/clanci/: javno objavljene članke moguće je podijeliti kao link na LinkedInu ili kopirati adresu. Dijeljenje se pokreće korisničkim klikom, ne daje dozvolu za preuzimanje tuđeg sadržaja.
- /tech/studio.html i /tech/objavi.html: privatni nacrt i urednički pregled odvojeni su od javne objave. E-mail nije automatsko odobrenje za javnu objavu; provjeriti prava i eksplicitnu dozvolu autora.
- /tech/biblioteka.html i /tech/free-store.html koriste zajednički skup digitalnih resursa: biblioteka je za čitanje, a Free Store za preuzimanje. Ne dodavati iste fajlove drugi put.
- /tech/news-live.json: isključivo naslovi iz dozvoljenih RSS feedova s direktnim linkom; bez kopiranja tuđih tekstova, fotografija ili automatskog generisanja vijesti. /tech/update-news.py podržava RSS 2.0 i Atom; ne zamjenjuje uspješno objavljene podatke praznim feedom. GitHub Actions schedule može kasniti, biti onemogućen ili nemati dozvolu za zapis; provjeravati dnevne runs i stanje datoteke. Datum ažuriranja prikazuje se samo iz uspješnog preuzimanja.
- Stare bilješke o razvojnom AI asistentu i ranijem stanju u ovom README-u su historija razvoja, ne trenutna funkcija portala.
- Promjene objaviti tek nakon provjere i odobrenja vlasnika. Nikada ne mijenjati /app/ ili odvojenu Android aplikaciju pri radu na TECH portalu.

## TECH Svijet / zaseban magazinski sloj — 2026-10-11
- `/tech/svijet.html` je samostalna rubrika za tehnologiju općenito, ne prezentacija Android aplikacije.
- 8 oblasti, 32 originalna urednička sažetka i 32 objašnjenja koja se čitaju na samoj stranici. Podaci u `universe-data.js` i `universe-explainers.js`, interakcije u `universe.js`, izgled `universe.css`.
- Vanjski izvori su povezani linkovima. Tekstovi i fotografije trećih strana nisu preuzeti ili ugrađeni; tekstovi objašnjenja su zasebno napisani.
- Spisak sačuvanih tema čuva samo lokalne ID-eve u pregledniku; može se izbrisati u čitaonici. Na vanjskoj stranici vrijede pravila tog izvora.
- `/tech/news-archive.json` čuva istoriju do 180 izlaznih naslova. Početni skup je jasno označen kao ranije urednički odabrani naslovi; ne tvrditi da su automatski prikupljeni. Script `update-news.py` redovno dopunjava arhivu samo ako su feedovi stvarno dostupni i validni.
- Workflow `tech-rss.yml` je zakazan dva puta dnevno po UTC-u i pri ažuriranju workflowa/skripta na glavnoj grani. GitHub Actions može kasniti, biti isključen ili odbiti izvršavanje. Provjeri Action run i novu vrijednost `updated` prije bilo kakve tvrdnje da feed radi automatski.
- Ni automatska arhiva ni urednički naslov nisu potpuni kopirani novinski tekst. Svaka kartica vodi na izvornog izdavača. Ne predstavljati datum arhive kao datum same vijesti.
- Nakon dodavanja novih izvora: provjeri feed URL, dozvoljeni host, pravila upotrebe, eventualno preusmjeravanje i primjere naslova. Ne dodavati neprovjerene treće strane u allowlist.
- Ažuriraj popis tema i originalna objašnjenja zajedno, te testiraj mobilni prikaz, tastaturu, dialog i vanjske veze.

## TECH Radar BiH (2026-10-11)
- Samostalan dio TECH portala: `/tech/radar-bih.html`, ne oglasnik za sve gradske teme i ne funkcija postojeće Android aplikacije. Gradovi i Online su filteri isključivo za IT/digitalne poslove, tehnološke događaje, konferencije, edukacije i podcast prijedloge.
- `radar-bih-data.js`: `BL_TECH_RADAR_SOURCES` su službeni katalozi za daljnju provjeru, **nisu aktuelni oglasi**. `BL_TECH_RADAR_FEATURED` su zasebne javne, datumski potvrđene najave iz izvora (potrebni `approvedDate`, datum, `expires` i direktni HTTPS link). `BL_TECH_RADAR_APPROVED` sadrži **samo ručno odobrene** prijave; inicijalno je prazan.
- Za buduću odobrenu objavu dodaj objekat s poljima `editorialApproved:true`, `kind` (DOGAĐAJI/POSLOVI/EDUKACIJE/PODCAST), `title`, `description`, `city`, `date` (ako postoji), `expires` (ako postoji), `url` (provjerena javna HTTPS stranica), `organizer` i `approvedDate`. Podatke unesi isključivo nakon ručne provjere organizatora, datuma, rokova, sadržaja, prava i dopuštenja. Nikada ne unosi privatne adrese, e-mailove, telefone, CV-ove ili datoteke kandidata.
- `radar-bih.js` prikazuje samo datumski važeće objave, a službene kataloge kao jasno označene izvore. Search, gradovi i filteri rade lokalno. Sažeci izvora su originalni kratki opisi; ništa se ne kopira kao članak niti se hostuju tuđe fotografije.
- Formular priprema `mailto:` za uredništvo, a korisnik mora sam poslati poruku. Nema servera, korisničkih naloga, instant objave, automatskog preuzimanja javnih oglasnika ili lažne verifikacije. Poziv može ostati bez objave.
- Podcast pozivi i teme idu kroz isti kontrolisani formular. Prihvaćena tema nije automatsko snimanje; prije javnog audio sadržaja potreban je zaseban dogovor o dozvolama i pravima na snimak, muziku, vizuale i podatke učesnika.
- Automatizacija globalnih TECH vijesti u `update-news.py` je **poseban** proces. TECH Radar događaji i poslovi se ne osvježavaju automatskim kopiranjem trećih stranica. Za redovno punjenje ovog dijela potrebna je urednička obrada pristiglih prijedloga i provjera službenih kalendara.
- Četiri smjera za čitaoca: **Istraži / Čitaj / Uči / Stvori**, a ostali alati i TECH Radar su dostupni kroz grupisanu navigaciju. Nema dupliranja podataka i sekcija koje više služe kao meni nego kao stvarna funkcija.
