import {
  getWebAppConfig,
  isAdminUser,
  signInAdmin,
  signOutUser,
  watchAuth,
} from "./services/firebaseService.js";
import { renderMaintenance } from "./views/maintenance.js";
import { renderPrepScreen } from "./views/prep.js";
import { renderShell } from "./views/shell.js";

const root = document.getElementById("app-root");

let webConfig = null;
let currentUser = null;
let loginError = "";
let booted = false;

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
  const raw = (location.hash || "#/home").replace(/^#/, "");
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function navigateTo(route) {
  const normalized = route.startsWith("/") ? route : `/${route}`;
  location.hash = normalized;
}

function renderApp() {
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

  const route = getHashRoute();
  setRoot(
    renderShell({
      route,
      userEmail: currentUser?.email || "",
    })
  );
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

function bindRootEvents() {
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
      navigateTo("/home");
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
