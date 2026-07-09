# Brzo i Lokalno — QA Release Report

Generated: 2026-07-09 16:47  
Device: SM-A346B (RZCW50607MA)  
Production Firebase: **NOT touched** (Android uses emulators; web reads `app_public/web` only)

---

## Executive summary

| Platform | Automated tests | Result |
|----------|-----------------|--------|
| **Android** | 5 suites / 35 checks | **35/35 PASS** |
| **Web** | 2 suites / 35 checks | **35/35 PASS** |
| **Total** | | **70/70 PASS** |

---

## Android — sve prošlo

### Komande (jedan klik)

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\hp\AndroidStudioProjects\BrzoiLokalno\qa\scripts\run-android-qa-full.ps1"
```

### Rezultati po suite-u

| Suite | Testova | Status | Trajanje | Komanda |
|-------|---------|--------|----------|---------|
| Firebase rules | 17 | **PASS** | 45.4s | `qa/scripts/run-firebase-rules-tests.ps1` |
| Compose UI | 3 | **PASS** | 24.2s | `gradlew :app:connectedQaDebugAndroidTest` |
| Maestro guest | 4 flow-a | **PASS** | 185.9s | `qa/scripts/run-maestro-smoke.ps1` |
| Maestro auth | 3 flow-a | **PASS** | 219.7s | `qa/scripts/run-maestro-seeded-auth.ps1` |
| Maestro jobs+chat | 2 flow-a | **PASS** | 187.2s | `qa/scripts/run-maestro-seeded-jobs.ps1` |

**Ukupno Android trajanje:** ~11 min

### Maestro flow-ovi (svi PASS)

| Fajl | Šta testira |
|------|-------------|
| `auth-login-smoke.yaml` | Guest login ekran, validacija praznih polja |
| `register-validation-smoke.yaml` | Registracija polja + uloge |
| `navigation-guest-smoke.yaml` | Bottom nav kao gost |
| `jobs-guest-smoke.yaml` | Poslovi tab kao gost |
| `login-logout-korisnik.yaml` | Login/logout korisnik (seed) |
| `login-logout-majstor.yaml` | Login/logout majstor (seed) |
| `login-logout-kreator.yaml` | Login/logout kreator (seed) |
| `job-accept-application-korisnik.yaml` | Korisnik prihvata prijavu majstora |
| `chat-majstor-moje-prijave.yaml` | Majstor šalje chat poruku |

### Compose testovi (svi PASS)

- `AuthScreenValidationTest` — 3 testa na QA build-u

---

## Web — sve prošlo

### Komanda

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\hp\Documents\BrzoiLokalnoWebsite\scripts\run-all-web-qa.ps1"
```

### Rezultati

| Suite | Provjera | Status | Trajanje |
|-------|----------|--------|----------|
| `test-phase1-static.mjs` | 23 statičke + Firestore | **23/23 PASS** | 0.8s |
| `test-phase1.mjs` | 12 Playwright browser | **12/12 PASS** | 6.1s |

### Šta web testovi pokrivaju

- Početna: CTA, hero, nema SW na marketing stranici
- `/app`: shell učitavanje, maintenance/prep ekran, svi asseti
- Firestore: `app_public/web` read-only, kill-switch logika
- Service worker: scope `/app`, preskače Firebase cache

---

## Što NIJE automatizirano (manual prije release-a)

### Android
- Puna registracija E2E po ulozi (email signup → home)
- Google sign-in, push notifikacije, upload slika
- Jobs CRUD iz UI, ocjene, galerija radova
- Production App Check, Play Store, Huawei/wear
- Firebase Test Lab

### Web
- Logirani flow-ovi kad je `app_public/web` enabled (login, poslovi, chat)
- Safari/Firefox cross-browser
- PWA instalacija na pravom uređaju

---

## Detaljni izvještaji

- Android: `C:\Users\hp\AndroidStudioProjects\BrzoiLokalno\qa\reports\android-qa-full-2026-07-09_163604.md`
- Web: `C:\Users\hp\Documents\BrzoiLokalnoWebsite\qa\reports\web-qa-full-2026-07-09_164431.md`
