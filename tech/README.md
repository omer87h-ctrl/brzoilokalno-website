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
