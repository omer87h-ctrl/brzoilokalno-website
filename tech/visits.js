/* Original TECH integration. Only the fixed public counter badge is requested.
 * No project content, page URL, referrer, identifiers or third-party scripts.
 * Hits counts page openings, not unique people. See privatnost.html#posjete.
 */
(() => {
 'use strict';
 if (!document.body || document.getElementById('tech-visits')) return;
 const preferenceKey = 'bl-tech-counter-disabled';
 let disabled = false;
 try { disabled = localStorage.getItem(preferenceKey) === '1'; } catch {}
 const privateMode = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
 const publicHost = location.protocol === 'https:' && location.hostname === 'tech.brzoilokalno.com';
 const container = document.createElement('section');
 container.id = 'tech-visits'; container.className = 'tech-visits';
 container.setAttribute('aria-label', 'Brojač otvaranja TECH portala');
 const heading = document.createElement('strong'); heading.textContent = 'Otvaranja TECH portala';
 const status = document.createElement('span'); status.setAttribute('role', 'status');
 const explanation = document.createElement('small');
 explanation.textContent = 'Zajednički broj otvaranja stranica od 12. 10. 2026. Ponovne posjete se broje; ovo nije broj različitih ljudi.';
 const privacy = document.createElement('a'); privacy.href = '/privatnost.html#posjete'; privacy.textContent = 'O brojaču i privatnosti';
 const toggle = document.createElement('button'); toggle.type = 'button';
 let badge = null, timer = null, started = false;
 function removeBadge() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (badge) { badge.onload = badge.onerror = null; badge.remove(); badge = null; }
 }
 function render() {
  toggle.hidden = privateMode || !publicHost;
  toggle.textContent = disabled ? 'Uključi brojač za mene' : 'Isključi brojač za mene';
  toggle.setAttribute('aria-pressed', String(!disabled));
  if (privateMode || disabled || !publicHost) {
   removeBadge();
   status.textContent = privateMode ? 'Isključeno prema postavkama privatnosti preglednika.' : disabled ? 'Brojanje je isključeno za ovaj preglednik.' : 'Brojač radi samo na javnom TECH portalu.';
   return;
  }
  if (started) { status.textContent = 'Brojanje je uključeno. Broj će se prikazati pri sljedećem otvaranju stranice.'; return; }
  started = true;
  status.textContent = 'Učitavanje broja…';
  badge = document.createElement('img');
  badge.alt = 'Zajednički brojač otvaranja TECH stranica; broj je prikazan na oznaci.';
  badge.referrerPolicy = 'no-referrer'; badge.decoding = 'async'; badge.height = 28;
  badge.onload = () => { clearTimeout(timer); timer = null; status.textContent = ''; };
  badge.onerror = () => { removeBadge(); status.textContent = 'Brojač trenutno nije dostupan.'; };
  timer = setTimeout(() => { removeBadge(); status.textContent = 'Brojač trenutno nije dostupan.'; }, 12000);
  // Constant namespace for every page; no invented baseline, URL or user values.
  badge.src = 'https://hits.sh/tech.brzoilokalno.com/portal-2026-10-12.svg?label=Otvaranja&style=for-the-badge&color=8ce8c6&labelColor=18232e';
  status.after(badge);
 }
 toggle.addEventListener('click', () => {
  disabled = !disabled;
  let saved = true;
  try { localStorage.setItem(preferenceKey, disabled ? '1' : '0'); } catch { saved = false; }
  render();
  if (!saved) status.textContent += ' Postavka se ne može sačuvati; vrijedi samo za ovu stranicu.';
 });
 window.addEventListener('storage', event => { if (event.key === preferenceKey) { disabled = event.newValue === '1'; render(); } });
 container.append(heading, status, explanation, privacy, toggle);
 (document.querySelector('footer') || document.body).append(container);
 render();
})();
