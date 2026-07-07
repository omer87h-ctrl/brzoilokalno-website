# Brzo i Lokalno — audit privatnosti i tokova (web + Android + Firebase)

**Projekt:** `brzoilokalno-268a5`  
**Datum:** 2026-07-07  
**Strategija:** OLX-stil — `public_profiles/{uid}` javno (bez emaila), `users/{uid}` samo vlasnik + admin.

---

## 1. Kolekcije i pristup

| Kolekcija | Čitanje | Pisanje | Napomena |
|-----------|---------|---------|----------|
| `users/{uid}` | Vlasnik, admin | Vlasnik (bez protected polja) | Faza 2: anonimno čitanje → **403** |
| `public_profiles/{uid}` | Svi | Vlasnik (bez rating/verified/email) | Listingi, avatari, kontakt prefs |
| `jobs` | Svi | Vlasnik posla | |
| `applications/{jobId}_{workerId}` | Učesnici + vlasnik posla | Worker (create), status update po pravilima | |
| `notifications` | `targetUid` | Učesnici tokova (create), target (isRead) | Job tipovi vs bell tipovi |
| `messages` | Učesnici chata | Pošiljalac | |
| `home_master_tips` | Svi (aktivni) | Autor (majstor/kreator) | TTL 24h |

### Protected polja na `users` (samo Admin SDK / Functions)

- `profileVerified`, `profileVerifiedAt`
- `ratingAverage`, `ratingCount`, `ratingSummaryUpdatedAt`
- `fastReputationScore`, `fastReputationVotes`, `fastTrustedNegativeVotes`

Klijent **ne smije** slati ova polja ni na `users` update ni na `public_profiles` sync.

---

## 2. Status prijave na posao

### Pravila (Firestore)

```
pending → accepted | rejected   (samo vlasnik posla)
accepted → completed             (vlasnik ILI worker)
```

Implementirano u `isValidApplicationStatusUpdate()` u `firestore.rules`.

### Web

- `app/utils/applicationAuth.js` — `canManageApplicationAction()`
- UI + handler u `app/app.js` prije `updateApplicationStatus()`
- Notifikacije: `application_accepted`, `application_rejected`, `job_completed`

### Android

- `ApplicationAuth.kt` — isti matrix dozvola
- `PosloviPotraznjaTabContent.kt` — provjera prije Firestore update
- `OtherScreens.kt` (`JobCard`) — dugmad vidljiva samo kad je akcija dozvoljena

---

## 3. Notifikacije — badge split

### Job tipovi (badge na **Poslovima**)

- `new_application`
- `application_accepted`
- `application_rejected`
- `job_completed`

### Bell tipovi (badge na **Obavijestima** / zvono)

- `new_message`
- ostali koji nisu job tipovi

### Web

- `app/constants/notifications.js` — `JOB_NOTIFICATION_TYPES`
- `markJobNotificationsRead()` — samo job tipovi na tabu Poslovi
- `markBellNotificationsRead()` — samo non-job na Obavijestima
- `fetchUnreadBellNotificationCount` / `fetchUnreadPosloviNotificationCount` — split

### Android

- `JobNotificationTypes.kt`
- `MainActivity.kt` — listener broji samo job tipove; na Poslovima markira pročitanim samo job tipove
- Chat unread ostaje odvojen (`unreadCounts` na applications + messages listener)

---

## 4. Profil i public_profiles sync

### Web (`app/services/publicProfile.js`)

- `toPublicProfile(..., { forClientWrite: true })` — isključuje rating/verified
- `deleteField()` za email, fcmToken, acceptedTerms, itd.
- Try/catch oko synca — profil se spremi čak i ako sync padne

### Android (`PublicProfileSync.kt`)

- Ista zabrana: ne šalje `profileVerified`, `ratingAverage`, `ratingCount`
- `FieldValue.delete()` za forbidden polja pri merge write

### Čitanje profila u listingima

- Web: `public_profiles` primarno, fallback `users` (legacy)
- Android: `PublicProfileCache` — isti pattern
- **Store APK** bez novog koda: listingi čitaju `users` → broken poslije phase 2 rules

---

## 5. Prijava na posao

### Tok

1. Worker (majstor/kreator) klikne Prijavi
2. Create `applications/{jobId}_{workerId}` sa status `pending`
3. Notifikacija `new_application` → vlasniku posla
4. Vlasnik: Prihvati/Odbij
5. Worker/owner: Chat (kad `accepted`)
6. Worker ili owner: Završeno (kad `accepted`)

### Poznati fixevi

- **Read prije create:** rules dopuštaju `get` na nepostojeći doc (`resource == null`) — `workerApplicationSlotForUid`
- **Web fetch:** direktan doc ID `{jobId}_{uid}` umjesto query
- **Modal zaglavljen:** `finishModalAction()` kad si već na `#/poslovi`

---

## 6. Početna (Home) — stabilnost UI

### Android (referenca)

- `HomeTipsCache` — TTL 20 min
- `homeTipsRefreshNonce` — refresh kad se vratiš na home
- `LaunchedEffect` bez blokiranja UI-a

### Web

- `HOME_TIPS_TTL_MS` (20 min) — ne refetch savjeta na svaki render
- `softRenderApp()` za čipove grada, više/manje gradova, work carousel dots
- `skipRouteLoading` — bez fullscreen loadera na soft update

---

## 7. Cloud Functions (Android repo `functions/index.js`)

- Push notifikacije za job tipove
- `backfillPublicProfiles` callable — migracija sparse profila
- Admin operacije (verification, moderation)

**Ne mijenjati** bez potrebe — rules su već deployane.

---

## 8. Preostali zadaci

| Prioritet | Zadatak |
|-----------|---------|
| Visok | Android store build s novim `public_profiles` čitanjem |
| Srednji | Backfill `public_profiles` (17/27 gotovo, 10 sparse) |
| Nizak | Deploy Firestore index `applications` (`jobId` + `workerId`) ako nije na produkciji |

---

## 9. Test checklist

- [ ] Hard refresh web (`Ctrl+Shift+R`) / SW unregister nakon deploya
- [ ] Profil spremi bez permission-denied
- [ ] Objavi posao — modal se zatvori
- [ ] Prijava na posao — drugi nalog (majstor), ne vlasnik oglasa
- [ ] Prihvati/Odbij — samo vlasnik, pending
- [ ] Završeno — samo accepted, worker ili owner
- [ ] Job notifikacije na Poslovima, poruke u zvoncu
- [ ] Home čipovi — bez treperenja loadera
