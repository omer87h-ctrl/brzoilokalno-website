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
