# Brzo i Lokalno — web stranica

**Uživo:** https://omer87h-ctrl.github.io/brzoilokalno-website/

---

## Kako sam promijeniti link (bez koda) — samo GitHub

Sve linkove držiš u **jednom fajlu**: `site-config.js`

### Koraci

1. Otvori: https://github.com/omer87h-ctrl/brzoilokalno-website
2. Klikni na fajl **`site-config.js`**
3. Klikni olovku **Edit** (gore desno)
4. Promijeni samo ono što treba (primjeri ispod)
5. Dole klikni **Commit changes** → **Commit changes**

Za 1–2 minute stranica se sama osvježi.

### Google Play (kad app izađe)

U `site-config.js` promijeni:

```javascript
googlePlay: "",
```

u npr.:

```javascript
googlePlay: "https://play.google.com/store/apps/details?id=tvoj.paket.app",
```

Dok je `""` prazno → na stranici piše **„Uskoro na Google Play”**.  
Kad zalijepiš link → dugme postaje aktivno **„Preuzmi na Google Play”**.

### Huawei AppGallery

Već postavljeno. Ako se link promijeni, uredi:

```javascript
huaweiAppGallery: "https://appgallery.huawei.com/app/C117382847",
```

### Instagram (kad napraviš profil)

U `site-config.js`:

```javascript
instagram: "https://www.instagram.com/tvoj_profil/",
```

Dok je `""` prazno, Instagram dugme se ne prikazuje. Email kontakt je uvijek vidljiv.


Kad napraviš Google Analytics nalog i dobiješ ID (`G-XXXXXXXXXX`):

```javascript
googleAnalyticsId: "G-XXXXXXXXXX",
```

---

## Lokalni pregled

```powershell
cd C:\Users\hp\Documents\BrzoiLokalnoWebsite
python -m http.server 8080
```

Otvori: http://localhost:8080

## Politike app-a

https://omer87h-ctrl.github.io/brzoilokalno-policy/

---

## Zašto me Google još ne nalazi?

Stranica **radi** (link direktno u browseru), ali Google je **nov** i treba mu vrijeme (često **nekoliko dana do 2–4 sedmice**) da je indeksira.

### Ubrzaj pojavljivanje u Googleu

1. Otvori [Google Search Console](https://search.google.com/search-console)
2. **Dodaj property** → URL: `https://omer87h-ctrl.github.io/brzoilokalno-website/`
3. Potvrdi vlasništvo (HTML tag ili GitHub način)
4. Idi na **Sitemaps** → pošalji: `sitemap.xml`
5. Klikni **Request indexing** za glavnu stranicu

### Šta još pomaže

- Dijeli link na društvenim mrežama, u app-u, u Huawei opisu
- Dodaj link na policy stranicu (`brzoilokalno-policy`)
- Kasnije: vlastita domena (npr. `brzoilokalno.ba`) — lakše za pamćenje i Google

**Napomena:** Upis „brzo i lokalno” u Google neće odmah pokazati tvoj sajt dok Google ne indeksira stranicu i dok se ne natječeš sa drugim rezultatima. Direktan link uvijek radi odmah.
