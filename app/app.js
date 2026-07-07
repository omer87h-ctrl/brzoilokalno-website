import {
  getWebAppConfig,
  isAdminUser,
  signInAdmin,
  signInAdminWithGoogle,
  signOutUser,
  watchAuth,
} from "./services/firebaseService.js";
import {
  fetchAvailableUsers,
  fetchFastMatchPool,
  fetchJobs,
  fetchTopRated,
  fetchUserProfile,
  fetchUsersByCategory,
  fetchUsersInCity,
  pickFastCandidates,
} from "./services/firestoreReads.js";
import { findCategoryBySlug } from "./data/categories.js";
import { parseRoute } from "./utils/route.js";
import { renderMaintenance } from "./views/maintenance.js";
import { renderPrepScreen } from "./views/prep.js";
import { renderShell } from "./views/shell.js";
import { renderHome } from "./views/home.js";
import { renderKategorijeGrid, renderKategorijeList } from "./views/kategorije.js";
import { renderPoslovi } from "./views/poslovi.js";
import { renderProfil, renderPregledProfila } from "./views/profil.js";
import { renderBrzo } from "./views/brzo.js";
import { renderMajstoriList } from "./views/majstori.js";
import { renderKalkulator } from "./views/kalkulator.js";
import { renderScreenError, renderScreenLoading } from "./views/shared.js";

const root = document.getElementById("app-root");

let webConfig = null;
let currentUser = null;
let loginError = "";
let booted = false;
let selectedCity = "";
let profileCity = "";
let screenRequestId = 0;

function setRoot(html) {
  root.innerHTML = html;
  bindRootEvents();
}

function showLoading() {
  setRoot(`
    <div class="screen screen--center">
      <div class="loader" aria-label="Učitavanje"></div>
      <p class="loader-text">Učitavanje…</p>
    </div>`);
}

function getHashRoute() {
  return location.hash || "#/home";
}

function navigateTo(path) {
  location.hash = path.startsWith("#") ? path : `#${path}`;
}

function renderShellWithContent(route, contentHtml) {
  setRoot(
    renderShell({
      route,
      userEmail: currentUser?.email || "",
      contentHtml,
    })
  );
}

async function refreshProfileCity() {
  if (!currentUser?.uid) {
    profileCity = "";
    return;
  }
  const profile = await fetchUserProfile(currentUser.uid);
  profileCity = (profile?.city || "").trim();
}

async function loadRouteContent(route) {
  if (route.name === "home") {
    return renderHome({ selectedCity });
  }

  if (route.name === "kategorije" && !route.categorySlug) {
    return renderKategorijeGrid();
  }

  if (route.name === "kategorije" && route.categorySlug) {
    const category = findCategoryBySlug(route.categorySlug);
    if (!category) {
      return renderScreenError("Kategorija nije pronađena.");
    }
    const users = await fetchUsersByCategory(category, selectedCity || null);
    return renderKategorijeList({ category, users, city: selectedCity || null });
  }

  if (route.name === "brzo") {
    const city = route.city || profileCity || null;
    const pool = await fetchFastMatchPool();
    const candidates = pickFastCandidates(pool, city);
    return renderBrzo({ candidates, city });
  }

  if (route.name === "lista") {
    const city = route.city || selectedCity || null;
    let users = [];
    if (route.filter === "top") {
      users = await fetchTopRated(city);
    } else if (route.filter === "slobodan") {
      users = await fetchAvailableUsers(city);
    } else if (route.filter === "blizu") {
      users = await fetchUsersInCity(city || profileCity || null);
    }
    const filterKey = route.filter === "top" ? "top" : route.filter;
    return renderMajstoriList({ filter: filterKey, users, city: city || profileCity || null });
  }

  if (route.name === "kalkulator") {
    return renderKalkulator();
  }

  if (route.name === "poslovi") {
    const jobs = await fetchJobs(30);
    return renderPoslovi({ jobs });
  }

  if (route.name === "profil") {
    const uid = currentUser?.uid;
    const user = uid ? await fetchUserProfile(uid) : null;
    return renderProfil({ user, authEmail: currentUser?.email || "" });
  }

  if (route.name === "pregled") {
    const user = await fetchUserProfile(route.uid);
    return renderPregledProfila({ user });
  }

  return renderHome({ selectedCity });
}

async function renderApp() {
  if (!webConfig) {
    showLoading();
    return;
  }

  if (!webConfig.enabled) {
    setRoot(renderMaintenance(webConfig));
    return;
  }

  if (webConfig.adminOnly) {
    if (!currentUser || !isAdminUser(currentUser)) {
      setRoot(
        renderPrepScreen({
          showAdminLogin: true,
          loginError,
        })
      );
      return;
    }
  }

  const route = parseRoute(getHashRoute());
  const requestId = ++screenRequestId;

  renderShellWithContent(route, renderScreenLoading());

  try {
    if (currentUser?.uid) {
      await refreshProfileCity();
    }
    const contentHtml = await loadRouteContent(route);
    if (requestId !== screenRequestId) return;
    renderShellWithContent(route, contentHtml);
  } catch (error) {
    console.error("Screen load failed:", error);
    if (requestId !== screenRequestId) return;
    renderShellWithContent(
      route,
      renderScreenError("Nije moguće učitati podatke. Provjerite Firestore rules.")
    );
  }
}

async function boot() {
  showLoading();
  try {
    webConfig = await getWebAppConfig();
  } catch (error) {
    console.error("Kill switch read failed:", error);
    webConfig = {
      enabled: false,
      adminOnly: true,
      chatEnabled: false,
      maintenanceMessage:
        "Nije moguće učitati konfiguraciju. Provjerite Firestore rules za app_public/web.",
      _missing: true,
      _error: true,
    };
  }
  booted = true;
  renderApp();
}

function listaPath(filter) {
  if (selectedCity) {
    return `#/lista/${filter}/${encodeURIComponent(selectedCity)}`;
  }
  return `#/lista/${filter}`;
}

function bindHomeActions() {
  document.querySelectorAll('[data-action="auto-izbor"]').forEach((el) => {
    el.addEventListener("click", () => {
      const city = profileCity;
      navigateTo(city ? `#/brzo/${encodeURIComponent(city)}` : "#/brzo");
    });
  });

  const topBtn = document.querySelector('[data-action="lista-top"]');
  if (topBtn) topBtn.addEventListener("click", () => navigateTo(listaPath("top")));

  const slobodanBtn = document.querySelector('[data-action="lista-slobodan"]');
  if (slobodanBtn) slobodanBtn.addEventListener("click", () => navigateTo(listaPath("slobodan")));

  const blizuBtn = document.querySelector('[data-action="lista-blizu"]');
  if (blizuBtn) {
    blizuBtn.addEventListener("click", () => {
      const city = selectedCity || profileCity;
      navigateTo(city ? `#/lista/blizu/${encodeURIComponent(city)}` : "#/lista/blizu");
    });
  }

  const kalkulatorBtn = document.querySelector('[data-action="kalkulator"]');
  if (kalkulatorBtn) kalkulatorBtn.addEventListener("click", () => navigateTo("#/kalkulator"));

  document.querySelectorAll(".chip--btn[data-city]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const city = chip.dataset.city || "";
      selectedCity = selectedCity === city ? "" : city;
      renderApp();
    });
  });
}

function bindRootEvents() {
  bindHomeActions();

  const googleBtn = document.getElementById("admin-google-signin-btn");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      loginError = "";
      try {
        const result = await signInAdminWithGoogle();
        if (!isAdminUser(result.user)) {
          await signOutUser();
          loginError = "Ovaj Google nalog nema admin pristup.";
          renderApp();
        }
      } catch (error) {
        if (error?.code !== "auth/popup-closed-by-user") {
          loginError = "Google prijava nije uspjela. Pokušajte ponovo.";
          renderApp();
        }
      }
    });
  }

  const loginForm = document.getElementById("admin-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      loginError = "";
      const form = event.currentTarget;
      const email = form.email.value.trim();
      const password = form.password.value;
      try {
        await signInAdmin(email, password);
      } catch (error) {
        loginError = "Prijava nije uspjela. Provjerite email i lozinku.";
        renderApp();
      }
    });
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOutUser();
      navigateTo("#/home");
    });
  }
}

window.addEventListener("hashchange", () => {
  if (booted) renderApp();
});

watchAuth((user) => {
  currentUser = user;
  if (booted) renderApp();
});

boot();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {});
  });
}
