const translations = {
  bs: {
    "nav.features": "Kako radi",
    "nav.forWhom": "Za koga",
    "nav.download": "Preuzmi",
    "hero.eyebrow": "Lokalne usluge, pametna pretraga",
    "hero.title1": "Brzo do pravog",
    "hero.title2": "majstora",
    "hero.lead": "Pronađi majstora ili kreatora u svom gradu. Ocjene, recenzije, javni radovi i direktan chat — sve na jednom mjestu.",
    "hero.pill1": "Ocjene i recenzije",
    "hero.pill2": "Slobodni sada",
    "hero.pill3": "Blizu mene",
    "store.huaweiSmall": "Preuzmi na",
    "store.playSmall": "Uskoro na",
    "features.title": "Kako aplikacija radi",
    "features.subtitle": "Od pretrage do dogovora — sve lokalno, brzo i transparentno.",
    "features.f1.tag": "Pametna pretraga",
    "features.f1.title": "Brzo do pravog majstora",
    "features.f1.text": "Pametna pretraga koristi ocjene i recenzije da ti preporuči najboljeg izvođača za tvoj posao.",
    "features.f2.tag": "Pretraga",
    "features.f2.title": "Pronađi majstora brzo",
    "features.f2.text": "Filtriraj po gradu, kategoriji, „Slobodni sada” i „Blizu mene”. Popularni gradovi: Kladanj, Tuzla, Sarajevo, Zenica.",
    "features.f3.tag": "Aktivnost",
    "features.f3.title": "Sve aktivnosti na jednom mjestu",
    "features.f3.text": "Prati prijave, dogovorene i završene poslove, obavijesti i svoj napredak na profilu.",
    "features.f4.tag": "Poslovi",
    "features.f4.title": "Objavi posao ili se prijavi",
    "features.f4.text": "Potražnja i ponuda bez komplikacije. Objavi posao, pronađi izvođača i razgovaraj direktno u chatu.",
    "features.f5.tag": "Povjerenje",
    "features.f5.title": "Pogledaj stvarne radove",
    "features.f5.text": "Javni radovi, profil izvođača i ocjene pomažu ti da doneseš bolju odluku prije kontakta.",
    "forWhom.title": "Za koga je Brzo i Lokalno",
    "forWhom.users.title": "Za korisnike",
    "forWhom.users.text": "Tražiš majstora, kreatora ili lokalnu uslugu? Brzo pronađi provjerenog izvođača u svom gradu.",
    "forWhom.craftsmen.title": "Za majstore",
    "forWhom.craftsmen.text": "Prikaži svoje radove, primaj prijave na poslove i gradi reputaciju kroz ocjene i recenzije.",
    "download.title": "Preuzmi aplikaciju",
    "download.text": "Brzo i Lokalno je dostupno na Huawei AppGallery. Google Play uskoro.",
    "footer.privacy": "Politika privatnosti",
    "footer.terms": "Uslovi korištenja",
    "footer.delete": "Brisanje naloga",
    "footer.copy": "© 2026 Brzo i Lokalno. Sva prava zadržana.",
  },
  en: {
    "nav.features": "How it works",
    "nav.forWhom": "Who it's for",
    "nav.download": "Download",
    "hero.eyebrow": "Local services, smart search",
    "hero.title1": "Fast to the right",
    "hero.title2": "craftsman",
    "hero.lead": "Find a craftsman or creator in your city. Ratings, reviews, public work samples and direct chat — all in one place.",
    "hero.pill1": "Ratings & reviews",
    "hero.pill2": "Available now",
    "hero.pill3": "Near me",
    "store.huaweiSmall": "Get it on",
    "store.playSmall": "Coming soon on",
    "features.title": "How the app works",
    "features.subtitle": "From search to agreement — local, fast and transparent.",
    "features.f1.tag": "Smart search",
    "features.f1.title": "Fast to the right craftsman",
    "features.f1.text": "Smart search uses ratings and reviews to recommend the best provider for your job.",
    "features.f2.tag": "Search",
    "features.f2.title": "Find a craftsman quickly",
    "features.f2.text": "Filter by city, category, \"Available now\" and \"Near me\". Popular cities: Kladanj, Tuzla, Sarajevo, Zenica.",
    "features.f3.tag": "Activity",
    "features.f3.title": "All activity in one place",
    "features.f3.text": "Track applications, agreed and completed jobs, notifications and your progress on your profile.",
    "features.f4.tag": "Jobs",
    "features.f4.title": "Post a job or apply",
    "features.f4.text": "Demand and supply without hassle. Post a job, find a provider and chat directly in the app.",
    "features.f5.tag": "Trust",
    "features.f5.title": "See real work samples",
    "features.f5.text": "Public work, provider profiles and ratings help you make a better decision before contact.",
    "forWhom.title": "Who Brzo i Lokalno is for",
    "forWhom.users.title": "For users",
    "forWhom.users.text": "Looking for a craftsman, creator or local service? Quickly find a trusted provider in your city.",
    "forWhom.craftsmen.title": "For craftsmen",
    "forWhom.craftsmen.text": "Show your work, receive job applications and build reputation through ratings and reviews.",
    "download.title": "Download the app",
    "download.text": "Brzo i Lokalno is available on Huawei AppGallery. Google Play coming soon.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Use",
    "footer.delete": "Delete Account",
    "footer.copy": "© 2026 Brzo i Lokalno. All rights reserved.",
  },
};

const LANG_KEY = "bil-lang";

function setLanguage(lang) {
  const strings = translations[lang] || translations.bs;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (strings[key]) {
      el.textContent = strings[key];
    }
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  localStorage.setItem(LANG_KEY, lang);
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});

const savedLang = localStorage.getItem(LANG_KEY);
setLanguage(savedLang === "en" ? "en" : "bs");

const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}
