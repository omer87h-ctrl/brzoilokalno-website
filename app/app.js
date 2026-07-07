import {
  deleteCurrentUser,
  getWebAppConfig,
  isAdminUser,
  registerWithEmail,
  signInAdmin,
  signInAdminWithGoogle,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  watchAuth,
} from "./services/firebaseService.js";
import {
  fetchAvailableUsers,
  fetchFastMatchPool,
  fetchJob,
  fetchJobs,
  fetchMyApplicationForJob,
  fetchMyApplications,
  fetchApplication,
  fetchPublicWorks,
  fetchTopRated,
  fetchUserProfile,
  fetchUsersByCategory,
  fetchUsersInCity,
  fetchWork,
  fetchWorksByUser,
  fetchApplicationsForJob,
  fetchOffers,
  fetchOffer,
  fetchUsersForSearch,
  filterJobsOrOffersByCity,
  pickFastCandidates,
} from "./services/firestoreReads.js";
import { applyToJob, clearMyUnread, sendChatMessage, updateApplicationStatus } from "./services/firestoreWrites.js";
import { subscribeToChatMessages } from "./services/chatService.js";
import { createUserProfile, isProfileComplete } from "./services/userProfile.js";
import { findCategoryBySlug } from "./data/categories.js";
import { parseRoute } from "./utils/route.js";
import { renderMaintenance } from "./views/maintenance.js";
import { renderPrepScreen } from "./views/prep.js";
import { renderLogin } from "./views/login.js";
import { renderRegister } from "./views/register.js";
import { renderOnboarding } from "./views/onboarding.js";
import { renderShell } from "./views/shell.js";
import { renderHome } from "./views/home.js";
import { renderKategorijeGrid, renderKategorijeList } from "./views/kategorije.js";
import { renderPoslovi } from "./views/poslovi.js";
import { renderProfil, renderPregledProfila } from "./views/profil.js";
import { renderBrzo } from "./views/brzo.js";
import { renderMajstoriList } from "./views/majstori.js";
import { renderPosao } from "./views/posao.js";
import { renderRad, renderRadovi } from "./views/radovi.js";
import { renderPrijave } from "./views/prijave.js";
import { renderChat, renderChatMessages } from "./views/chat.js";
import { renderPretraga } from "./views/pretraga.js";
import { renderPonudaDetail } from "./views/ponude.js";
import { renderKalkulator } from "./views/kalkulator.js";
import { renderScreenError, renderScreenLoading } from "./views/shared.js";

const root = document.getElementById("app-root");

let webConfig = null;
let currentUser = null;
let loginError = "";
let authError = "";
let booted = false;
let selectedCity = "";
let profileCity = "";
let workSlideIndex = 0;
let posloviFilterMyCity = false;
let screenRequestId = 0;
let chatUnsubscribe = null;
let chatContext = null;

function stopChatListener() {
  if (chatUnsubscribe) {
    chatUnsubscribe();
    chatUnsubscribe = null;
  }
  chatContext = null;
}

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
    const [worksPreview, profile] = await Promise.all([
      fetchPublicWorks(3),
      currentUser?.uid ? fetchUserProfile(currentUser.uid) : Promise.resolve(null),
    ]);
    return renderHome({
      selectedCity,
      worksPreview,
      workSlideIndex,
      userName: profile?.displayName || currentUser?.displayName || "",
      userRole: profile?.role || "",
      userCity: profile?.city || "",
    });
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
      const blizuCity = city || profileCity || null;
      users = await fetchUsersInCity(blizuCity);
    }
    const filterKey = route.filter === "top" ? "top" : route.filter;
    const displayCity = route.filter === "blizu" ? city || profileCity || null : city;
    return renderMajstoriList({ filter: filterKey, users, city: displayCity });
  }

  if (route.name === "pretraga") {
    const city = route.city || selectedCity || null;
    const users = await fetchUsersForSearch(route.query, city);
    return renderPretraga({ query: route.query, users, city });
  }

  if (route.name === "kalkulator") {
    return renderKalkulator();
  }

  if (route.name === "poslovi") {
    const tab = route.tab || "potraznja";
    const [jobs, offers] = await Promise.all([fetchJobs(30), fetchOffers(30)]);
    const cityFilter = posloviFilterMyCity ? profileCity : "";
    const filteredJobs = cityFilter ? filterJobsOrOffersByCity(jobs, cityFilter) : jobs;
    const filteredOffers = cityFilter ? filterJobsOrOffersByCity(offers, cityFilter) : offers;
    return renderPoslovi({
      jobs: filteredJobs,
      offers: filteredOffers,
      tab,
      filterMyCity: posloviFilterMyCity,
      userCity: profileCity,
    });
  }

  if (route.name === "ponuda") {
    const offer = await fetchOffer(route.offerId);
    return renderPonudaDetail({ offer });
  }

  if (route.name === "posao") {
    const [job, profile] = await Promise.all([
      fetchJob(route.jobId),
      fetchUserProfile(currentUser.uid),
    ]);
    if (!job) return renderScreenError("Posao nije pronađen.");
    const [applications, myApplication] = await Promise.all([
      job.userId === currentUser.uid ? fetchApplicationsForJob(route.jobId) : Promise.resolve([]),
      fetchMyApplicationForJob(route.jobId, currentUser.uid),
    ]);
    return renderPosao({
      job,
      myApplication,
      applications,
      currentUid: currentUser.uid,
      myRole: profile?.role || "",
      chatEnabled: webConfig?.chatEnabled === true,
    });
  }

  if (route.name === "radovi") {
    const works = await fetchPublicWorks(30);
    return renderRadovi({ works });
  }

  if (route.name === "rad") {
    const work = await fetchWork(route.workId);
    if (!work || work.isPublic !== true) {
      return renderScreenError("Javni rad nije pronađen.");
    }
    return renderRad({ work });
  }

  if (route.name === "prijave") {
    const applications = await fetchMyApplications(currentUser.uid);
    const jobIds = [...new Set(applications.map((a) => a.jobId).filter(Boolean))];
    const jobs = await Promise.all(jobIds.map((id) => fetchJob(id)));
    const jobsById = Object.fromEntries(jobs.filter(Boolean).map((j) => [j.id, j]));
    return renderPrijave({ applications, jobsById, currentUid: currentUser.uid, chatEnabled: webConfig?.chatEnabled === true });
  }

  if (route.name === "chat") {
    if (!webConfig?.chatEnabled) {
      return renderScreenError("Chat je trenutno isključen na web verziji.");
    }
    const app = await fetchApplication(route.appId);
    if (!app) return renderScreenError("Prijava nije pronađena.");
    const uid = currentUser.uid;
    const isParticipant = uid === app.workerId || uid === app.jobOwnerId;
    const status = app.status || "";
    const open = status === "accepted" || status === "completed";
    if (!isParticipant || !open) {
      return renderScreenError("Nemate pristup ovom chatu.");
    }
    const job = await fetchJob(route.jobId);
    const otherUid = uid === app.workerId ? app.jobOwnerId : app.workerId;
    const otherProfile = otherUid ? await fetchUserProfile(otherUid) : null;
    const otherName =
      uid === app.workerId
        ? job?.authorName || otherProfile?.displayName || "Naručitelj"
        : app.workerName || otherProfile?.displayName || "Majstor";
    const otherRole = uid === app.workerId ? "Naručitelj posla" : "Majstor / kreator";
    chatContext = {
      jobId: route.jobId,
      appId: route.appId,
      receiverId: otherUid,
      currentUid: uid,
      displayName: currentUser.displayName || currentUser.email || "",
    };
    try {
      await clearMyUnread(route.appId, uid);
    } catch (_) {}
    return renderChat({
      jobTitle: job?.title || "Chat",
      otherName,
      otherRole,
      messages: [],
      currentUid: uid,
      error: "",
    });
  }

  if (route.name === "profil") {
    const uid = currentUser?.uid;
    const user = uid ? await fetchUserProfile(uid) : null;
    return renderProfil({ user, authEmail: currentUser?.email || "" });
  }

  if (route.name === "pregled") {
    const [user, works] = await Promise.all([
      fetchUserProfile(route.uid),
      fetchWorksByUser(route.uid, true),
    ]);
    return renderPregledProfila({ user, works });
  }

  return renderHome({ selectedCity });
}

async function afterAuthSuccess(user) {
  const profile = await fetchUserProfile(user.uid);
  if (!isProfileComplete(profile)) {
    navigateTo("#/onboarding");
    return;
  }
  navigateTo("#/home");
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

  const route = parseRoute(getHashRoute());

  if (!currentUser) {
    if (route.name === "login") {
      setRoot(renderLogin({ error: authError }));
      return;
    }
    if (route.name === "register") {
      setRoot(renderRegister({ error: authError }));
      return;
    }
    if (webConfig.adminOnly) {
      setRoot(renderPrepScreen({ showAdminLogin: true, loginError }));
      return;
    }
    navigateTo("#/login");
    return;
  }

  const profile = await fetchUserProfile(currentUser.uid);

  if (webConfig.adminOnly && !isAdminUser(currentUser)) {
    setRoot(
      renderPrepScreen({
        showAdminLogin: false,
        loginError: "",
      })
    );
    return;
  }

  if (!isProfileComplete(profile)) {
    setRoot(
      renderOnboarding({
        user: currentUser,
        error: authError,
        defaults: {
          displayName: profile?.displayName || currentUser.displayName || "",
          role: profile?.role || "korisnik",
          city: profile?.city || "",
        },
      })
    );
    return;
  }

  const requestId = ++screenRequestId;
  stopChatListener();
  renderShellWithContent(route, renderScreenLoading());

  try {
    await refreshProfileCity();
    const contentHtml = await loadRouteContent(route);
    if (requestId !== screenRequestId) return;
    renderShellWithContent(route, contentHtml);
    if (route.name === "chat" && chatContext) {
      startChatListener(chatContext);
    }
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

function startChatListener(ctx) {
  stopChatListener();
  chatContext = ctx;
  chatUnsubscribe = subscribeToChatMessages({
    jobId: ctx.jobId,
    applicationId: ctx.appId,
    onMessages: (messages) => {
      const el = document.getElementById("chat-messages");
      if (!el) return;
      el.innerHTML = renderChatMessages(messages, ctx.currentUid);
      el.scrollTop = el.scrollHeight;
    },
    onError: (error) => {
      const el = document.getElementById("chat-messages");
      if (!el) return;
      el.innerHTML = `<div class="empty-state empty-state--error">${error?.message || "Greška pri učitavanju poruka."}</div>`;
    },
  });
}

function bindPhase3Actions() {
  const applyBtn = document.getElementById("apply-job-btn");
  if (applyBtn) {
    applyBtn.addEventListener("click", async () => {
      const jobId = applyBtn.dataset.jobId;
      if (!jobId || applyBtn.disabled) return;
      applyBtn.disabled = true;
      try {
        const [job, profile] = await Promise.all([
          fetchJob(jobId),
          fetchUserProfile(currentUser.uid),
        ]);
        if (!job) throw new Error("missing job");
        await applyToJob({ job, profile, authUser: currentUser });
        renderApp();
      } catch (error) {
        console.error("Apply failed:", error);
        applyBtn.disabled = false;
        alert("Prijava nije uspjela. Pokušaj ponovo.");
      }
    });
  }

  document.querySelectorAll("[data-app-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const appId = btn.dataset.appId;
      const action = btn.dataset.appAction;
      if (!appId || !action || btn.disabled) return;
      const status = action === "accept" ? "accepted" : "rejected";
      btn.disabled = true;
      try {
        await updateApplicationStatus(appId, status);
        renderApp();
      } catch (error) {
        console.error("Status update failed:", error);
        btn.disabled = false;
        alert("Ažuriranje statusa nije uspjelo.");
      }
    });
  });

  const chatForm = document.getElementById("chat-form");
  if (chatForm && chatContext) {
    chatForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = chatForm.querySelector('input[name="message"]');
      const text = input?.value?.trim();
      if (!text) return;
      const sendBtn = chatForm.querySelector('button[type="submit"]');
      if (sendBtn) sendBtn.disabled = true;
      try {
        await sendChatMessage({
          text,
          sender: {
            uid: chatContext.currentUid,
            email: currentUser.email,
            displayName: chatContext.displayName,
          },
          receiverId: chatContext.receiverId,
          jobId: chatContext.jobId,
          applicationId: chatContext.appId,
        });
        if (input) input.value = "";
      } catch (error) {
        console.error("Send failed:", error);
        alert("Slanje poruke nije uspjelo.");
      } finally {
        if (sendBtn) sendBtn.disabled = false;
        input?.focus();
      }
    });
  }
}

function navigateToPretraga(query) {
  const q = (query || "").trim();
  const queryPart = q ? encodeURIComponent(q) : "_";
  if (selectedCity) {
    navigateTo(`#/pretraga/${queryPart}/${encodeURIComponent(selectedCity)}`);
  } else {
    navigateTo(`#/pretraga/${queryPart}`);
  }
}

function bindSearchAndFilters() {
  const homeSearch = document.getElementById("home-search-form");
  if (homeSearch) {
    homeSearch.addEventListener("submit", (event) => {
      event.preventDefault();
      navigateToPretraga(homeSearch.q?.value || "");
    });
  }

  const pretragaForm = document.getElementById("pretraga-form");
  if (pretragaForm) {
    pretragaForm.addEventListener("submit", (event) => {
      event.preventDefault();
      navigateToPretraga(pretragaForm.q?.value || "");
    });
  }

  const posloviFilter = document.getElementById("poslovi-city-filter");
  if (posloviFilter) {
    posloviFilter.addEventListener("click", () => {
      posloviFilterMyCity = !posloviFilterMyCity;
      renderApp();
    });
  }

  document.querySelectorAll("[data-work-dot]").forEach((dot) => {
    dot.addEventListener("click", (event) => {
      event.preventDefault();
      workSlideIndex = Number(dot.dataset.workDot) || 0;
      renderApp();
    });
  });
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

async function handleGoogleSignIn() {
  authError = "";
  try {
    const result = await signInWithGoogle();
    await afterAuthSuccess(result.user);
  } catch (error) {
    if (error?.code !== "auth/popup-closed-by-user") {
      authError = "Google prijava nije uspjela.";
      renderApp();
    }
  }
}

function bindRootEvents() {
  bindHomeActions();
  bindPhase3Actions();
  bindSearchAndFilters();

  const publicGoogleBtn = document.getElementById("google-signin-btn");
  if (publicGoogleBtn) {
    publicGoogleBtn.addEventListener("click", handleGoogleSignIn);
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      authError = "";
      const form = event.currentTarget;
      try {
        const result = await signInWithEmail(form.email.value.trim(), form.password.value);
        await afterAuthSuccess(result.user);
      } catch (error) {
        authError = "Prijava nije uspjela. Provjerite email i lozinku.";
        renderApp();
      }
    });
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      authError = "";
      const form = event.currentTarget;
      const displayName = form.displayName.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;
      const confirmPassword = form.confirmPassword.value;
      const role = form.role.value;
      const city = form.city.value;

      if (!displayName || !email || !password || !city) {
        authError = "Sva polja su obavezna.";
        renderApp();
        return;
      }
      if (password !== confirmPassword) {
        authError = "Lozinke se ne podudaraju.";
        renderApp();
        return;
      }
      if (!form.acceptedTerms.checked || !form.acceptedPrivacy.checked) {
        authError = "Morate prihvatiti Pravila i Politiku privatnosti.";
        renderApp();
        return;
      }

      try {
        const cred = await registerWithEmail(email, password);
        await createUserProfile(cred.user.uid, { email, displayName, role, city });
        navigateTo("#/home");
      } catch (error) {
        authError = error?.message?.includes("email")
          ? "Email je već u upotrebi ili nije valjan."
          : "Registracija nije uspjela.";
        try {
          await deleteCurrentUser();
        } catch (_) {}
        renderApp();
      }
    });
  }

  const onboardingForm = document.getElementById("onboarding-form");
  if (onboardingForm) {
    onboardingForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      authError = "";
      const form = event.currentTarget;
      const role = form.role.value;
      const city = form.city.value;
      const displayName = form.displayName.value.trim();

      if (!displayName || !city || !role) {
        authError = "Ime, uloga i grad su obavezni.";
        renderApp();
        return;
      }
      if (!form.acceptedTerms.checked || !form.acceptedPrivacy.checked) {
        authError = "Morate prihvatiti Pravila i Politiku privatnosti.";
        renderApp();
        return;
      }

      try {
        await createUserProfile(currentUser.uid, {
          email: currentUser.email || "",
          displayName,
          role,
          city,
        });
        navigateTo("#/home");
      } catch (error) {
        authError = "Spremanje profila nije uspjelo.";
        renderApp();
      }
    });
  }

  const adminGoogleBtn = document.getElementById("admin-google-signin-btn");
  if (adminGoogleBtn) {
    adminGoogleBtn.addEventListener("click", async () => {
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

  const adminLoginForm = document.getElementById("admin-login-form");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      loginError = "";
      const form = event.currentTarget;
      try {
        await signInAdmin(form.email.value.trim(), form.password.value);
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
