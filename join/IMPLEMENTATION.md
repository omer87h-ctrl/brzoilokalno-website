# Join the Project — review draft (not deployed)

**Repo:** omer87h-ctrl/brzoilokalno-website
**Site:** https://brzoilokalno.com

## What is included
- `/join/` independent BS/EN landing and volunteer-interest form.
- `/join/admin.html` private authentication-based inbox with role filter, search, status management, delete, CSV export.
- Forms store only name, email, role, optional portfolio URL, contribution message, availability, consent flag and creation timestamp.
- Static design matches Brzo i Lokalno AMOLED theme (#06080C / #0F1218 / #5C7CFA), reuses the real app icon. No fake app screenshots.
- Both a direct homepage link and project invitation are planned; link must be enabled in navigation after approval.

## IMPORTANT: NOT READY FOR PUBLIC FORM SUBMISSIONS
GitHub Pages cannot securely store private submissions itself. The current `join.js` demonstrates Firebase anonymous sign-in and Firestore submission, **but do NOT deploy permissive public create rules**. The rules snippet is intentionally `allow create: if false` until a secure backend is ready. Before publishing or announcing, replace direct anonymous Firestore submissions with a Callable/HTTPS Cloud Function validated with App Check, CAPTCHA and rate limits. The dashboard requires private Firestore read access. The connected GitHub integration does NOT deploy Firebase functions or Firestore rules.

## Manual steps before publishing
1. Review copy and accessibility; confirm voluntary and unpaid wording.
2. Review existing project's Firestore rules and existing Cloud Functions, to avoid changing Android/PWA behavior.
3. Deploy the validated intake Cloud Function and new collection-specific Firestore rules without overwriting existing rules.
4. Confirm dashboard authentication and admin-only read (prefer an admin custom claim plus email verification), create/update/delete rules, and no public access.
5. Update privacy policy to explicitly cover volunteer applications, retention period, controller contact and withdrawal/deletion requests. Prefer a fixed retention and purge schedule.
6. Test normal, incomplete, duplicate and malicious submissions; verify no private applicant info can be read by unauthenticated users.
7. Update frontend to call the verified secure function; configure and test live HTTPS/authorized domains.
8. Manually approve merge/deployment and only then promote the /join/ link in Medium, LinkedIn, Instagram, TikTok, Facebook.

**Never** store service-account JSON or email/password credentials in the website repository. Delete/export applicant data only within a protected administrator session. GitHub branch and PR do not change the production site until merged/deployed.
