# Brzo i Lokalno Web — postavka (Faza 1)

## 1. Firestore dokument za kill switch (`app_public/web`)

`/app` **samo čita** ovaj dokument — nikad ga ne kreira niti ažurira iz browsera.

Ako dokument **ne postoji**, `/app` tretira kao:
- `enabled: false`
- `adminOnly: true`
- `chatEnabled: false`
- `maintenanceMessage: "Brzo i Lokalno Web je trenutno u pripremi."`

### Opcija A — lokalna admin skripta (preporučeno)

**Samo lokalno.** Ne commitati `serviceAccountKey.json`. Ne pokretati bez odobrenja.

1. Firebase Console → Project settings → Service accounts → **Generate new private key**
2. Spremi JSON kao `serviceAccountKey.json` u root repoa (fajl je u `.gitignore`)
3. Instaliraj zavisnosti (jednom):

```powershell
cd C:\Users\hp\Documents\BrzoiLokalnoWebsite
npm install
```

4. Pokreni skriptu (kad odobriš):

```powershell
npm run create-web-config
```

Alternativa bez fajla u rootu:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\putanja\do\tvoj-service-account.json"
npm run create-web-config
```

Skripta postavlja:

```json
{
  "enabled": true,
  "adminOnly": true,
  "chatEnabled": false,
  "maintenanceMessage": "Brzo i Lokalno Web je trenutno u pripremi."
}
```

### Opcija B — ručno u Firebase Console

Firestore → kolekcija `app_public` → dokument `web` → ista polja kao gore.

| Polje | Značenje |
|-------|----------|
| `enabled: false` | Maintenance ekran, ništa drugo se ne učitava |
| `adminOnly: true` | Samo `omer.creating.apps87@gmail.com` vidi app shell |
| `chatEnabled` | Za Fazu 3 (chat) |
| `maintenanceMessage` | Opcionalni custom tekst |

**Za test admin shell-a:** `enabled: true`, `adminOnly: true`  
**Za javno zatvaranje:** `enabled: false`  
**Kad otvoriš javnosti (kasnije):** `adminOnly: false`

Rules **ne mijenjati** — `app_public` već ima `allow read: if true`.

---

## 2. Firebase Web app (za Auth)

Ako admin prijava ne radi, u Firebase Console → Project settings → Your apps → **Add app → Web**.

Kopiraj `appId` u `app/firebase.js` (trenutno placeholder).

Email/Password provider mora biti uključen (Authentication → Sign-in method).

## 3. Firebase Auth — authorized domains

Firebase Console → Authentication → Settings → Authorized domains:

- `brzoilokalno.com`
- `www.brzoilokalno.com` (ako se koristi)
- `omer87h-ctrl.github.io` (za test na GitHub Pages)

---

## 4. Admin prijava (Faza 1)

Na `/app` pri dnu ekrana „u pripremi” — **Admin prijava (test)**.

Koristi isti email/lozinka kao Android app (`omer.creating.apps87@gmail.com`).

---

## 5. Deploy

**Nisam deployao** bez tvog odobrenja. Kad odobriš:

```powershell
cd C:\Users\hp\Documents\BrzoiLokalnoWebsite
git add .
git commit -m "Faza 1: platform CTA + /app shell with kill switch"
git push origin main
```

GitHub Pages objavi na `brzoilokalno.com/app/` ako je CNAME već postavljen.

---

## 6. Šta Faza 1 uključuje

- CTA na vrhu landing stranice → `/app`
- Kill switch `app_public/web`
- Maintenance + adminOnly ekrani
- Admin test login
- Osnovni Android-like layout (Home placeholder + bottom nav)
- PWA manifest + service worker (samo statički fajlovi)

**Ne uključuje:** chat, notifications, login/register za sve, Firestore rules deploy.
