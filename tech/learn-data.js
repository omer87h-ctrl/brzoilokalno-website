"use strict";
/* Original TECH learning paths. All lessons are authored editorial content. */
window.BL_TECH_LEARNING=[
 {id:"proizvod",label:"OD IDEJE DO PROIZVODA",title:"Napravi prvi jasan plan proizvoda",description:"Od stvarnog problema do prototipa koji se može provjeriti.",result:"Na kraju znaš napisati problem, odabrati osnovnu funkciju i pripremiti test.",lessons:[
  {id:"problem",title:"Prvo problem, zatim funkcija",goal:"Razlikovati korisnikov problem od vlastite ideje.",sections:[
   ["Šta zapravo rješavaš?","Rečenica 'Napravit ću aplikaciju za majstore' opisuje rješenje, ne problem. Korisniji početak je: 'Ljudi teško pronalaze jasne informacije o dostupnosti lokalnih usluga.' Tek nakon toga možemo istražiti da li je aplikacija dobar odgovor."],
   ["Provjeri pretpostavku","Zapiši ko ima problem, kada se javlja i kako ga sada pokušava riješiti. Razgovor s nekoliko stvarnih ljudi može osporiti početnu ideju. Nemoj tvrditi da si potvrdio potražnju ako još nemaš takve dokaze."]],
   example:"Pretpostavka: 'Svi žele chat.' Provjerljivo pitanje: 'Šta ti trenutno otežava dogovor oko termina i cijene?'",
   task:"Napiši problem koji bi želio riješiti u jednoj rečenici, bez spominjanja aplikacije ili tehnologije.",
   question:"Koja rečenica bolje opisuje korisnikov problem?",choices:["Treba mi moderna aplikacija s mnogo opcija.","Ljudi teško upoređuju osnovne informacije prije nego što zatraže uslugu."],correct:1,explanation:"Druga rečenica opisuje teškoću korisnika. Tek poslije se odlučuje koje rješenje ima smisla.",link:"./clanci/od-ideje-do-proizvoda.html",linkText:"Pročitaj originalni vodič o razvoju"},
  {id:"opseg",title:"Izaberi najmanji koristan opseg",goal:"Odvojiti neophodno od onoga što samo lijepo izgleda.",sections:[
   ["Jedan jasan zadatak","Prva verzija ne mora pokazati sve što možeš programirati. Mora omogućiti jednu smislenu radnju od početka do kraja. Svaka nova funkcija uvodi dodatna stanja, greške i održavanje."],
   ["Definiši tri stvari","Napiši ulaz, radnju i rezultat. Primjer: korisnik odabere temu, pročita objašnjenje i sačuva naučeno. Tek kada to radi pouzdano, dodaj naprednije mogućnosti."]],
   example:"Slab plan: 'Portal ima 20 sekcija.' Bolji plan: 'Posjetilac pronađe temu i završi jednu lekciju bez registracije.'",
   task:"Odaberi jednu ključnu radnju u svom proizvodu. Napiši šta korisnik vidi prije i poslije te radnje.",
   question:"Kako znaš da je mala početna verzija korisna?",choices:["Ima mnogo animacija i navigacijskih opcija.","Korisnik može završiti važan zadatak i razumije rezultat."],correct:1,explanation:"Korisnost se testira završenim zadatkom, ne brojem opcija.",link:"./citaj.html?resurs=od-ideje-do-proizvoda.txt",linkText:"Otvori mini-knjigu"},
  {id:"test",title:"Provjeri prototip prije širenja",goal:"Napraviti osnovni test bez skupih alata.",sections:[
   ["Testiraj tok, ne samo ekran","Prođi tipičan zadatak na telefonu i računaru. Provjeri da su dugmad dostupna tastaturom, poruke razumljive i greške moguće ispraviti. Nije dovoljno da prva stranica izgleda uredno."],
   ["Bilježi nalaze","Za svaki problem zapiši korak, očekivani rezultat, stvarni rezultat i ozbiljnost. Ako test nije obavljen na stvarnom uređaju, označi to kao ograničenje umjesto kao uspjeh."]],
   example:"Zadatak: pronaći članak o privatnosti za manje od tri jednostavna koraka. Zabilježi gdje se osoba zbunila.",
   task:"Osmisli tri provjere svog prototipa: jedna za telefon, jedna za tastaturu i jedna za grešku pri unosu.",
   question:"Koji je koristan zapis greške?",choices:["'Ne valja.'","'Na mobilnom ekranu dugme Sačuvaj prekriva posljednji red teksta.'"],correct:1,explanation:"Dobar nalaz govori gdje se problem javlja i šta je pogrešno.",link:"./citaj.html?resurs=qa-kontrolna-lista.txt",linkText:"Otvori QA kontrolnu listu"}]},
 {id:"sigurnost",label:"PRIVATNOST I SIGURNOST",title:"Sigurnije koristi račune i uređaje",description:"Razlikuj privid sigurnosti od stvarnih zaštitnih navika.",result:"Na kraju imaš praktičnu listu sigurnosnih koraka koje možeš sam provjeriti.",lessons:[
  {id:"https",title:"Sigurna veza nije isto što i poštena stranica",goal:"Razumjeti šta HTTPS radi, a šta ne.",sections:[
   ["Šta štiti HTTPS?","HTTPS koristi TLS da zaštiti komunikaciju između preglednika i servera od određenih vrsta prisluškivanja i izmjene. Ne potvrđuje poštenje trgovca, istinitost oglasa ili kvalitet proizvoda."],
   ["Provjeri kontekst","Pogledaj puni domen, poslovne podatke, uslove kupovine i nezavisne znakove vjerodostojnosti. Stranica može imati ispravan certifikat, a ipak sadržavati obmanjujuću ponudu."]],
   example:"Dva domena izgledaju slično, ali samo jedan pripada zvaničnoj organizaciji. Zaključavanje veze ne čini ih istim.",
   task:"Zapiši tri stvari koje bi provjerio prije nego što na nepoznatoj stranici ostaviš lične podatke.",
   question:"Znači li oznaka HTTPS da je stranica sigurna za kupovinu?",choices:["Da, certifikat dokazuje da je prodavač pouzdan.","Ne, zaštita veze ne potvrđuje vjerodostojnost ponude."],correct:1,explanation:"HTTPS štiti prenos, ali sama poslovna ponuda zahtijeva dodatnu provjeru.",link:"https://developer.mozilla.org/en-US/docs/Glossary/HTTPS",linkText:"MDN: HTTPS"},
  {id:"dozvole",title:"Zašto aplikacija traži dozvole?",goal:"Procijeniti potrebne i nepotrebne pristupe.",sections:[
   ["Dozvole imaju kontekst","Navigaciji lokacija može biti korisna, ali običnom tekstualnom čitaču često nije potrebna. Ako funkcija može raditi bez dodatne dozvole, to je bolji početak za privatnost."],
   ["Pregledaj i promijeni","Na uređaju pronađi postavke dozvola, provjeri pristup lokaciji, mikrofonu i kameri. Isključi ono što nije potrebno. Neki servisi mogu izgubiti pojedine mogućnosti, zato razumij posljedicu prije promjene."]],
   example:"Aplikacija za čitanje vijesti traži stalnu preciznu lokaciju, a ne objašnjava zašto. Vrijedi preispitati zahtjev.",
   task:"Izaberi jednu aplikaciju i zapiši koju dozvolu koristi, zašto bi joj trebala i može li zadatak raditi bez nje.",
   question:"Koje je ispravno pravilo za dozvole?",choices:["Odobri sve, pa će uređaj bolje raditi.","Dozvoli samo ono što je potrebno za funkciju koju koristiš."],correct:1,explanation:"Minimalne dozvole smanjuju nepotrebno izlaganje podataka.",link:"./clanci/digitalna-privatnost.html",linkText:"Originalni vodič kroz digitalnu privatnost"},
  {id:"nalog",title:"Zaštiti nalog prije nego što nastane problem",goal:"Složiti jednostavan plan zaštite naloga.",sections:[
   ["Lozinka nije jedini sloj","Koristi jedinstvene duge lozinke i omogući višefaktorsku autentifikaciju gdje je dostupna. Ne dijeli jednokratne kodove s osobama koje te neočekivano kontaktiraju."],
   ["Misli na oporavak","Provjeri rezervnu e-mail adresu i metode oporavka. Čuvaj sigurnosne kodove na pouzdanom mjestu. Za važan nalog provjeri i gdje si već prijavljen, te ukloni nepoznate sesije."]],
   example:"Poruka koja traži da odmah pošalješ sigurnosni kod predstavlja upozorenje, čak i kada izgleda kao službena podrška.",
   task:"Sastavi plan zaštite jednog važnog naloga: lozinka, dodatna potvrda, oporavak i provjera aktivnih sesija.",
   question:"Šta radiš ako ti nepoznata osoba zatraži jednokratni kod?",choices:["Ne dijelim ga; pristup provjeravam kroz službenu aplikaciju ili stranicu.","Šaljem ga ako poruka izgleda dovoljno profesionalno."],correct:0,explanation:"Jednokratni kod služi za potvrdu pristupa i ne treba ga slati nepoznatim osobama.",link:"https://www.cisa.gov/secure-our-world",linkText:"CISA: Secure Our World"}]},
 {id:"uredjaji",label:"TELEFONI I AUDIO",title:"Čitaj specifikacije bez marketinške buke",description:"Saznaj šta brojevi govore, a šta je potrebno provjeriti u praksi.",result:"Na kraju možeš sastaviti smislen spisak prioriteta za uređaj.",lessons:[
  {id:"prioritet",title:"Tvoje potrebe su važnije od reklame",goal:"Odrediti najvažnije kriterije prije poređenja modela.",sections:[
   ["Počni od upotrebe","Fotografije, navigacija, dugotrajna podrška, baterija i udobnost ne nose jednaku važnost za svakoga. Odredi koja su tri kriterija za tebe presudna, pa tek onda gledaj katalog."],
   ["Upoređuj iste podatke","Kapacitet baterije, veličina ekrana ili deklarisana otpornost mogu pomoći, ali ne predstavljaju cjelovitu ocjenu. Posebno provjeri da su modeli i tržišne verzije zaista uporedivi."]],
   example:"Dva telefona imaju isti kapacitet baterije, ali različit ekran i softver. Ne možeš samo iz mAh zaključiti koji duže traje.",
   task:"Napiši svoja tri kriterija za telefon i navedi koji podatak ili praktični test bi potvrdio svaki od njih.",
   question:"Šta dokazuje veći broj mAh?",choices:["Veći deklarisani kapacitet baterije, ne nužno duže trajanje.","Da telefon u svakoj situaciji radi duže."],correct:0,explanation:"Trajanje zavisi i od procesora, ekrana, softvera i načina korištenja.",link:"./telefoni.html",linkText:"Otvori katalog specifikacija"},
  {id:"kamera",title:"Broj megapiksela nije kvalitet fotografije",goal:"Prepoznati ograničenja proizvođačkih brojeva.",sections:[
   ["Brojevi su samo dio priče","Rezolucija senzora ne govori dovoljno o obradi slike, stabilizaciji, ekspoziciji i kvalitetu u slabijem svjetlu. Veći broj megapiksela nije automatski bolja fotografija."],
   ["Kada vjerovati testu?","Traži jasno označene primjere snimljene u uporedivim uslovima. Pročitaj metodologiju i razdvoji promotivnu fotografiju od nezavisnog testa. Portal ne treba tvrditi da je testirao uređaj ako nije."]],
   example:"Promotivna noćna fotografija može izgledati odlično, ali ne govori kako će telefon snimati pokret ili video.",
   task:"Odaberi dva kriterija za kameru koja su ti bitnija od samog broja megapiksela.",
   question:"Koji podatak sam po sebi ne dokazuje bolju fotografiju?",choices:["Broj megapiksela.","Jasno opisani primjeri u istim uslovima."],correct:0,explanation:"Broj megapiksela opisuje rezoluciju, ali ne i ukupan kvalitet slike.",link:"./clanci/kako-birati-telefon.html",linkText:"Vodič: kako birati telefon"},
  {id:"audio",title:"Kako izabrati slušalice za vlastite uši",goal:"Razlikovati tehničke specifikacije i stvarnu udobnost.",sections:[
   ["Nije dovoljno da zvuče glasno","Dugotrajna udobnost, stabilnost povezivanja, mikrofon, kašnjenje i servis mogu biti važniji od impresivnog oglasnog opisa. Pri izboru razmisli koliko dugo ih nosiš i u kakvom okruženju."],
   ["Šta provjeriti prije kupovine","Pročitaj koji su kodeci i funkcije stvarno podržani na tvojim uređajima. Uporedi trajanje baterije po navedenim uslovima mjerenja. Ne pretpostavljaj da visoka cijena znači da će odgovarati svakome."]],
   example:"Za online razgovore važniji mogu biti mikrofon i stabilnost veze nego naglašeni bas.",
   task:"Napiši mali izborni profil: gdje koristiš slušalice, koliko dugo i koje dvije osobine su ti presudne.",
   question:"Koji izbor bolje odgovara svakodnevnom korištenju?",choices:["Model s najviše marketinških oznaka.","Model čija udobnost i funkcije odgovaraju stvarnoj upotrebi."],correct:1,explanation:"Specifikacije vrijede samo kada su povezane s konkretnim potrebama.",link:"./clanci/kako-birati-slusalice.html",linkText:"Vodič o slušalicama"}]},
 {id:"ai",label:"AI I PROVJERA INFORMACIJA",title:"Koristi AI bez gubitka kritičkog razmišljanja",description:"Provjeri tvrdnje, zaštiti podatke i razlikuj demonstraciju od proizvoda.",result:"Na kraju imaš vlastitu proceduru za provjeru AI odgovora.",lessons:[
  {id:"tvrdnje",title:"Uvjerljiv tekst može biti pogrešan",goal:"Naučiti kako prepoznati nepotvrđenu tvrdnju.",sections:[
   ["Forma nije dokaz","Generativni sistem može proizvesti tečan i samouvjeren odgovor koji sadrži netačan datum, nepostojeći citat ili pogrešnu vezu. Posebno budi pažljiv kada odgovor utiče na zdravlje, posao, novac ili sigurnost."],
   ["Provjera po koracima","Odvoji tvrdnje koje se mogu provjeriti. Pronađi primarni izvor, datum i kontekst. Ako ga nema, označi odgovor kao nepotvrđen umjesto da ga prenosiš dalje kao vijest."]],
   example:"AI navodi da je kompanija predstavila proizvod 'jučer'. Prije objave provjeri zvaničnu objavu i tačan datum.",
   task:"Uzmi jednu tehnološku tvrdnju koju si pročitao i napiši gdje bi tražio njen primarni izvor.",
   question:"Šta treba uraditi prije objave AI-generisanog citata?",choices:["Objaviti ga ako zvuči vjerodostojno.","Pronaći originalni javni izvor i potvrditi citat."],correct:1,explanation:"Jezička uvjerljivost nije potvrda da citat postoji.",link:"./clanci/ai-alat-ili-proizvod.html",linkText:"Originalna analiza o AI proizvodima"},
  {id:"podaci",title:"Šta ne treba unositi u AI alat",goal:"Razlikovati javne zadatke od osjetljivih podataka.",sections:[
   ["Razmisli prije slanja","Neki servisi obrađuju tekst na udaljenim sistemima. Bez provjere uslova i pristanka ne dijeli lozinke, lične identifikatore, privatnu prepisku ni povjerljive poslovne podatke."],
   ["Koristi manje podataka","Za vježbu ili objašnjenje često je dovoljan izmišljeni primjer s uklonjenim imenima i brojevima. Ako obrađuješ stvarne dokumente, prvo provjeri pravila servisa i svoja ovlaštenja."]],
   example:"Umjesto punog ugovora s tuđim imenima, postavi opće pitanje o strukturi ugovora bez privatnih podataka.",
   task:"Preoblikuj jedno pitanje tako da zadrži smisao, ali ne sadrži identifikacijske ili povjerljive informacije.",
   question:"Koji je sigurniji primjer za opći AI upit?",choices:["Anonimizovan opis problema bez tuđih podataka.","Puni privatni dokument s adresama i potpisima."],correct:0,explanation:"Smanjenje količine osjetljivih podataka umanjuje nepotrebno izlaganje.",link:"./clanci/digitalna-privatnost.html",linkText:"Digitalna privatnost"},
  {id:"vrijednost",title:"AI opcija nije isto što i dobar proizvod",goal:"Procijeniti kada AI stvarno dodaje vrijednost.",sections:[
   ["Postavi kriterij uspjeha","AI funkcija ima smisla ako pomaže korisniku završiti konkretan zadatak bolje nego jednostavniji pristup. Uvedi mjerljive kriterije: razumljivost, tačnost, cijenu, brzinu i mogućnost ispravke."],
   ["Prvo pouzdanost, onda sjaj","Ako je zadatak obična pretraga šest postojećih članaka, lokalni indeks može biti brži, pregledniji i privatniji od udaljenog modela. Nove mogućnosti dodaj samo kada im je korist jasna."]],
   example:"Pretraga 'privatnost' koja pokazuje stvarne članke daje provjerljiv rezultat. Izmišljeni AI odgovor može biti manje pouzdan.",
   task:"Odaberi jednu 'pametnu' funkciju i napiši kako bi dokazao da korisniku pomaže više od obične navigacije.",
   question:"Kada je složenija AI funkcija opravdana?",choices:["Kad izgleda tehnološki napredno.","Kad dokazivo poboljšava važan zadatak i ima prihvatljiva ograničenja."],correct:1,explanation:"Tehnologija je sredstvo. Vrijednost zavisi od rezultata za korisnika.",link:"./clanci/ai-alat-ili-proizvod.html",linkText:"Pročitaj analizu o AI alatima"}]},
 {id:"pisanje",label:"PISANJE I OBJAVLJIVANJE",title:"Od teme do korisnog autorskog članka",description:"Napiši smislen tekst, potvrdi izvore i pripremi ga za urednički pregled.",result:"Na kraju imaš strukturu nacrta koji možeš završiti u TECH Studiju.",lessons:[
  {id:"ugao",title:"Dobra tema traži jasno pitanje",goal:"Pretvoriti široku temu u koristan tekst.",sections:[
   ["Za koga pišeš?","Naslov poput 'Sve o tehnologiji' ne govori čitaocu šta će saznati. Bolje je odabrati konkretnu dilemu: 'Šta mi treba za prvi PWA projekat?' Jedan jasan čitalački problem vodi prema kvalitetnijoj strukturi."],
   ["Obećaj samo ono što tekst daje","Odredi tri stvari na koje ćeš odgovoriti. Izbjegavaj naslove koji obećavaju senzaciju, tajni trik ili nevjerovatan rezultat ako takvo obećanje ne možeš dokazati."]],
   example:"Široko: 'AI i budućnost'. Preciznije: 'Pet pitanja prije dodavanja AI funkcije u mali proizvod'.",
   task:"Napiši radni naslov, čitalačko pitanje i tri podnaslova za svoj članak.",
   question:"Koji naslov bolje definiše šta će čitalac naučiti?",choices:["NEVJEROVATNA TAJNA TEHNOLOGIJE!","Kako prepoznati pouzdan izvor tehnološke vijesti?"],correct:1,explanation:"Drugi naslov precizno opisuje cilj teksta bez neutemeljenog obećanja.",link:"./studio.html",linkText:"Otvori TECH Studio"},
  {id:"izvori",title:"Provjeri prije nego što objaviš",goal:"Odvojiti činjenice, iskustva i pretpostavke.",sections:[
   ["Tri različite vrste tvrdnji","Činjenica zahtijeva izvor. Lično iskustvo treba označiti kao iskustvo. Mišljenje treba biti prepoznatljivo kao stav, a ne univerzalni zaključak. Kod brzih promjena važno je navesti datum provjere."],
   ["Primarni izvor ima prednost","Kada pišeš o novoj verziji alata, potraži službenu dokumentaciju ili saopštenje. U tekstu navedi izvor, datum i ograničenja. Tuđe fotografije i duge odlomke ne objavljuj bez potrebnih prava."]],
   example:"'Proizvođač navodi 7 godina ažuriranja' nije isto što i 'Ja sam 7 godina testirao taj telefon'.",
   task:"Za dvije tvrdnje iz nacrta napiši link ili naziv primarnog izvora koji ih može potvrditi.",
   question:"Kako označiti nešto što si zaključio, ali nisi testirao?",choices:["Predstaviti kao provjeren rezultat.","Jasno napisati da je riječ o procjeni ili pretpostavci."],correct:1,explanation:"Transparentnost podiže vjerodostojnost i čitaocu pokazuje šta je dokazano.",link:"./pravila.html",linkText:"Pravila autorstva i provjere"},
  {id:"uredjivanje",title:"Uredi tekst i predloži objavu",goal:"Proći jednostavnu uredničku kontrolu prije slanja.",sections:[
   ["Skrati bez gubitka smisla","Provjeri odgovara li uvod naslovu, imaju li podnaslovi logičan redoslijed i je li svaki pasus razumljiv. Zamijeni nejasne fraze običnim riječima. Posebno pročitaj tekst na mobilnom ekranu."],
   ["Objava ima odgovornost","Prije prijedloga provjeri autorstvo, izvore, datum, dozvole za vizuale i lične podatke. TECH Studio služi za lokalni nacrt. Slanje uredništvu je zaseban dobrovoljan korak; tekst se ne objavljuje automatski."]],
   example:"Prije: 'Revolucionarna platforma redefiniše iskustvo.' Poslije: 'Portal povezuje provjerene vodiče i besplatne resurse.'",
   task:"Sastavi završnu kontrolnu listu sa pet stavki: naslov, izvori, razumljivost, prava na sadržaj i kontakt.",
   question:"Šta znači klik na Sačuvaj u TECH Studiju?",choices:["Nacrt je javno objavljen.","Nacrt ostaje lokalno i nije poslan uredništvu."],correct:1,explanation:"Korisnik sam odlučuje hoće li i kada poslati prijedlog na uredničku provjeru.",link:"./studio.html",linkText:"Završi nacrt u TECH Studiju"}]}
];