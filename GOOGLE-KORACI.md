# Google Search Console — 2 minute (besplatno)

Sve ostalo je već urađeno (sitemap, SEO, linkovi). **Samo ovo radiš ti** — Google traži tvoj login, ja to ne mogu umjesto tebe.

## Korak 1 — Otvori Search Console

Idi na: **https://search.google.com/search-console/welcome**

Prijavi se sa **Google nalogom** koji koristiš (npr. `omer.creating.apps87@gmail.com` ili bilo koji Gmail).

## Korak 2 — Dodaj sajt

1. Izaberi **URL prefix** (prefiks URL-a)
2. Upiši tačno:
   ```
   https://omer87h-ctrl.github.io/brzoilokalno-website/
   ```
3. Klikni **Continue** / **Nastavi**

## Korak 3 — Potvrdi vlasništvo (HTML tag)

1. Google će ponuditi načine potvrde — izaberi **HTML tag**
2. Kopiraj samo **kod** iz `content="..."`, npr.:
   ```
   abc123XYZ_dugački_kod
   ```
3. Na GitHubu otvori:  
   https://github.com/omer87h-ctrl/brzoilokalno-website/edit/main/index.html
4. Pronađi red (oko linije 17):
   ```html
   <meta name="google-site-verification" content="">
   ```
5. Zalijepi kod između navodnika:
   ```html
   <meta name="google-site-verification" content="abc123XYZ_dugački_kod">
   ```
6. **Commit changes**
7. Vrati se u Search Console → klikni **Verify** / **Potvrdi**

## Korak 4 — Pošalji sitemap

1. U lijevom meniju: **Sitemaps**
2. Upiši: `sitemap.xml`
3. Klikni **Submit** / **Pošalji**

## Korak 5 — Zatraži indeksiranje

1. Gore lijevo: **URL inspection** / **Provjera URL-a**
2. Zalijepi: `https://omer87h-ctrl.github.io/brzoilokalno-website/`
3. Enter → **Request indexing** / **Zatraži indeksiranje**

---

## Ili pošalji meni kod

Ako ne želiš sam editovati `index.html`, pošalji mi samo taj **verification kod** iz koraka 3 — ja ću ga ubaciti i pushati.

## Koliko čekaš?

Nakon potvrde: obično **2–14 dana** da se pojaviš na Google pretrazi za „brzo i lokalno”. Direktan link radi odmah.

## Naplata?

**Ne.** Search Console je besplatan. Google te neće naplatiti.
