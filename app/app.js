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
  fetchOwnerProfilesForListings,
  fetchUsersByCategory,
  fetchUsersInCity,
  fetchWork,
  fetchWorksByUser,
  fetchApplicationsForJob,
  fetchOffers,
  fetchOffer,
  fetchUsersForSearch,
  filterJobsOrOffersByCity,
  fetchHomeTips,
  fetchMyHomeTip,
  fetchUnreadNotificationCount,
  fetchNotifications,
  fetchRatingsForUser,
  fetchMyRatingForUser,
  fetchFollowingList,
  fetchIsFollowing,
  fetchFollowerCount,
  fetchPublicWorksByUserIds,
  fetchMyJobsCount,
  pickFastCandidates,
  fetchVerificationRequest,
  fetchBlockedUsersForUser,
  fetchBlockStatus,
  fetchOpenReports,
  fetchBannedUsersAdmin,
} from "./services/firestoreReads.js";
import {
  applyToJob,
  clearMyUnread,
  createJob,
  createOffer,
  createWork,
  deleteHomeTip,
  deleteJob,
  deleteOffer,
  deleteWork,
  deleteAccountData,
  markNotificationsRead,
  saveHomeTip,
  sendChatMessage,
  setFollowing,
  submitRating,
  submitJobReport,
  submitWorkReport,
  submitTipReport,
  submitVerificationRequest,
  blockUser,
  unblockUser,
  submitChatUserReport,
  submitFastMatchFeedback,
  resolveReport,
  adminBanUser,
  adminUnbanUser,
  adminDeleteReportedContent,
  updateApplicationStatus,
  updateUserProfile,
  updateWorkPublic,
} from "./services/firestoreWrites.js";
import { refreshModerationFromFirestore, findContentViolation, violationMessage } from "./services/moderation.js";
import { applyDisplaySettings, setDisplaySetting } from "./utils/displaySettings.js";
import { loadWorkNotes, saveWorkNotes, importLegacyWorkNotes } from "./utils/workNotesLocal.js";
import { subscribeToChatMessages } from "./services/chatService.js";
import { uploadProfileImage, clearProfileImage, uploadWorkImage } from "./services/storageService.js";
import { createUserProfile, isProfileComplete } from "./services/userProfile.js";
import {
  firstMissingJobFields,
  firstMissingOfferFields,
  normalizeSpaces,
  validateCity,
  validateOptionalDescription,
  validatePersonName,
  validatePhone,
} from "./utils/textInputValidation.js";
import { findCategoryBySlug, categoryRole, categoryTabForCategory } from "./data/categories.js";
import { parseRoute } from "./utils/route.js";
import { formatFirestoreError, workOwnerName } from "./utils/format.js";
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
import { renderPostavke } from "./views/postavke.js";
import { renderBlockedUsers } from "./views/blockedUsers.js";
import { renderWorkNotes } from "./views/workNotes.js";
import { renderDisplaySettings } from "./views/displaySettings.js";
import { renderPrivacyInfo } from "./views/privacyInfo.js";
import { renderAdminModeration } from "./views/adminModeration.js";
import { renderObavijesti } from "./views/obavijesti.js";
import { renderKalkulator, readKalkulatorState } from "./views/kalkulator.js";
import { buildActivityDashboard } from "./utils/activity.js";
import { getHiddenActivityAppIds, hideActivityAppId } from "./utils/activityHide.js";
import { fetchOutdoorForecast, buildOutdoorOutlook } from "./services/weatherOutlook.js";
import { renderOutdoorPlanBody } from "./views/outdoorPlan.js";
import { renderCreateJobForm, renderCreateOfferForm, renderTipEditorForm, renderAddWorkForm, renderActivityHideModal, renderReportModal } from "./views/forms.js";
import { TIP_REPORT_REASONS, CHAT_REPORT_REASONS } from "./constants/reports.js";
import { renderScreenError, renderScreenLoading } from "./views/shared.js";

const root = document.getElementById("app-root");

let webConfig = null;
let currentUser = null;
let loginError = "";
let authError = "";
let booted = false;
let selectedCity = "";
let homeShowAllCities = false;
let profileCity = "";
let workSlideIndex = 0;
let posloviFilterMyCity = false;
let posloviFilterMyJobs = false;
let kategorijeFilterMyCity = false;
let screenRequestId = 0;
let lastRenderedContentHtml = "";
let chatUnsubscribe = null;
let chatContext = null;
let profileEditing = false;
let profileFormError = "";
let activeModal = null;
let modalError = "";
let pendingActivityHideId = "";
let reportTarget = null;
let reportCache = { job: null, work: null };
let homeTipsCache = [];
let chatBlockStatus = { iBlocked: false, theyBlocked: false };
let chatOtherMeta = null;
let brzoTopCandidate = null;
let brzoFeedbackSent = false;
let adminModerationError = "";
let workNotesSavedLabel = "";
let chatMessagesCache = [];
let kalkState = { module: 0 };
let unreadNotifications = 0;
let myTip = null;
let postavkeDeleteError = "";
let aktivnostExpanded = false;
let outdoorPlanExpanded = false;
let outdoorOutlookCache = null;
let outdoorOutlookCacheKey = "";
const scrollPositions = {};
let lastScrollRoute = null;
let skipRouteLoading = false;
/** Prvi ulaz u shell nakon boota — bez duplog loadera (fullscreen pa opet u mainu). */
let bootInitialLoad = true;
let profilRouteCache = null;
let profilOutdoorCtx = { city: "", role: "", weatherKey: "" };
let outdoorFetchToken = 0;
let profilUseCache = false;
let autoIzborLoadingTimer = null;

const AUTO_IZBOR_LOADING_STEPS = [
  "Učitavam majstore i kreatore...",
  "Provjera dostupnosti po kategorijama...",
  "Računamo ocjene i recenzije...",
  "Uključujemo majstore i kreatore...",
  "Biramo po jednog iz svake kategorije...",
  "Finalizujemo prikaz...",
];

function isChatEnabled() {
  return webConfig?.chatEnabled === true;
}

function invalidateProfilCache() {
  profilRouteCache = null;
}

function scrollMemoryKey(route) {
  if (!route) return null;
  if (route.name === "profil" || route.name === "kalkulator") return route.name;
  if (route.name === "poslovi") return `poslovi:${route.tab || "potraznja"}`;
  if (route.name === "kategorije" && !route.categorySlug) {
    return `kategorije:${route.tab || "majstori"}`;
  }
  return null;
}

function getMainScroller() {
  const feedBody = document.querySelector(".screen-feed__body");
  if (feedBody) return feedBody;
  return document.getElementById("app-main");
}

function captureMainScroll(route) {
  const key = scrollMemoryKey(route);
  if (!key) return;
  const el = getMainScroller();
  if (el) scrollPositions[key] = el.scrollTop;
}

function restoreMainScroll(route) {
  const key = scrollMemoryKey(route);
  const el = getMainScroller();
  if (!el || !key) return;
  const top = scrollPositions[key] || 0;
  const apply = () => {
    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";
    el.scrollTop = top;
    el.style.scrollBehavior = prev;
    updateFeedHeadShadow();
  };
  requestAnimationFrame(() => {
    apply();
    requestAnimationFrame(apply);
  });
}

function stopAutoIzborLoading() {
  if (autoIzborLoadingTimer) {
    window.clearInterval(autoIzborLoadingTimer);
    autoIzborLoadingTimer = null;
  }
}

function startAutoIzborLoading(city) {
  stopAutoIzborLoading();
  const cityLabel = city ? `Grad: ${city}` : "Grad iz profila";
  const renderStep = (index) => `
    <div class="screen-scroll">
      <a class="back-link" href="#/home">← Početna</a>
      <h2 class="screen-title">Auto izbor</h2>
      <p class="screen-subtitle">${cityLabel}</p>
      <div class="auto-izbor-loading">
        <div class="auto-izbor-loading__ring" aria-hidden="true">
          <div class="auto-izbor-loading__core">
            <svg class="auto-izbor-loading__bolt" viewBox="0 0 24 24">
              <path fill="currentColor" d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66l.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/>
            </svg>
          </div>
        </div>
        <p class="auto-izbor-loading__text">${AUTO_IZBOR_LOADING_STEPS[index] || AUTO_IZBOR_LOADING_STEPS[0]}</p>
      </div>
    </div>`;
  const route = parseRoute(getHashRoute());
  let step = 0;
  renderShellWithContent(route, renderStep(step), { restoreScroll: false });
  autoIzborLoadingTimer = window.setInterval(() => {
    step = (step + 1) % AUTO_IZBOR_LOADING_STEPS.length;
    const activeRoute = parseRoute(getHashRoute());
    if (activeRoute.name !== "home") {
      stopAutoIzborLoading();
      return;
    }
    renderShellWithContent(activeRoute, renderStep(step), { restoreScroll: false });
  }, 560);
}

function patchAktivnostExpanded(expanded) {
  const section = document.getElementById("aktivnost-section");
  if (!section) return false;
  section.classList.toggle("aktivnost-section--expanded", expanded);
  const toggle = document.getElementById("aktivnost-toggle");
  if (toggle) toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  const chev = section.querySelector(".aktivnost-section__chev");
  if (chev) chev.textContent = expanded ? "▴" : "▾";
  return true;
}

function patchOutdoorPlanExpanded(expanded) {
  const section = document.getElementById("outdoor-plan-section");
  if (!section) return false;
  section.classList.toggle("outdoor-plan--expanded", expanded);
  const toggle = document.getElementById("outdoor-plan-toggle");
  if (toggle) toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  const chev = section.querySelector(".outdoor-plan__chev");
  if (chev) chev.textContent = expanded ? "▴" : "▾";
  return true;
}

function outdoorPlanBodyState({ loading = false, outlook = null, forecastFailed = false } = {}) {
  const { city, role, weatherKey } = profilOutdoorCtx;
  return renderOutdoorPlanBody({
    outlook,
    loading,
    missingKey: !weatherKey,
    missingCity: !city,
    missingRole: !["majstor", "kreator", "korisnik"].includes(role),
    forecastFailed,
    expanded: true,
  });
}

function patchOutdoorPlanBody(html) {
  const body = document.querySelector("#outdoor-plan-section .outdoor-plan__body");
  if (body) body.innerHTML = html;
}

function scheduleOutdoorPlanLoad() {
  const { city, role, weatherKey } = profilOutdoorCtx;
  if (!outdoorPlanExpanded || !city || !weatherKey) return;
  if (outdoorOutlookCache && outdoorOutlookCacheKey === `${city}|${role}`) {
    patchOutdoorPlanBody(outdoorPlanBodyState({ outlook: outdoorOutlookCache }));
    return;
  }
  patchOutdoorPlanBody(outdoorPlanBodyState({ loading: true }));
  const token = ++outdoorFetchToken;
  fetchOutdoorForecast(weatherKey, city)
    .then((forecast) => {
      if (token !== outdoorFetchToken || !outdoorPlanExpanded) return;
      const outlook = buildOutdoorOutlook(role, forecast);
      if (outlook) {
        outdoorOutlookCache = outlook;
        outdoorOutlookCacheKey = `${city}|${role}`;
        patchOutdoorPlanBody(outdoorPlanBodyState({ outlook }));
      } else {
        patchOutdoorPlanBody(outdoorPlanBodyState({ forecastFailed: true }));
      }
    })
    .catch((error) => {
      console.warn("Weather load failed:", error);
      if (token !== outdoorFetchToken || !outdoorPlanExpanded) return;
      patchOutdoorPlanBody(outdoorPlanBodyState({ forecastFailed: true }));
    });
}

function softRenderApp() {
  skipRouteLoading = true;
  const route = parseRoute(getHashRoute());
  profilUseCache = route.name === "profil";
  captureMainScroll(route);
  renderApp();
}

function renderModalUpdate() {
  skipRouteLoading = true;
  if (lastRenderedContentHtml) {
    const route = parseRoute(getHashRoute());
    renderShellWithContent(route, lastRenderedContentHtml, { restoreScroll: true });
    return;
  }
  renderApp();
}

function closeActiveModal() {
  activeModal = null;
  modalError = "";
  pendingActivityHideId = "";
  reportTarget = null;
  renderModalUpdate();
}

/** Zatvori modal i osvježi ekran (hashchange se ne okida ako si već na istoj ruti). */
function finishModalAction({ navigate = null } = {}) {
  activeModal = null;
  modalError = "";
  pendingActivityHideId = "";
  reportTarget = null;
  lastRenderedContentHtml = "";
  if (navigate) {
    const target = navigate.startsWith("#") ? navigate : `#${navigate}`;
    if (getHashRoute() !== target) {
      navigateTo(target);
      return;
    }
  }
  renderApp();
}

function getFeedScroller() {
  return getMainScroller();
}

function updateFeedHeadShadow() {
  const body = document.querySelector(".screen-feed__body");
  const head = document.querySelector(".screen-feed__head");
  if (!body || !head) return;
  head.classList.toggle("screen-feed__head--scrolled", body.scrollTop > 6);
}

function bindFeedScroll() {
  const body = document.querySelector(".screen-feed__body");
  if (body) {
    updateFeedHeadShadow();
    body.onscroll = () => updateFeedHeadShadow();
    return;
  }
  const main = document.getElementById("app-main");
  if (!main) return;
  main.onscroll = null;
}

function stopChatListener() {
  if (chatUnsubscribe) {
    chatUnsubscribe();
    chatUnsubscribe = null;
  }
  chatContext = null;
}

function setRoot(html) {
  root.innerHTML = html;
  document.body.classList.toggle("has-app-shell", !!root.querySelector(".app-shell"));
  bindRootEvents();
}

function showLoading() {
  setRoot(`
    <div class="screen screen--center screen--boot-loading">
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

function buildModalsHtml() {
  if (activeModal === "job") return renderCreateJobForm({ defaults: { city: profileCity }, error: modalError });
  if (activeModal === "offer") return renderCreateOfferForm({ defaults: { city: profileCity }, error: modalError });
  if (activeModal === "tip") return renderTipEditorForm({ tip: myTip, error: modalError });
  if (activeModal === "work") return renderAddWorkForm({ error: modalError });
  if (activeModal === "activity-hide") return renderActivityHideModal();
  if (activeModal === "report" && reportTarget?.type === "job") {
    return renderReportModal({
      title: "Prijavi oglas",
      subtitle: reportTarget.data?.title ? `Oglas: ${reportTarget.data.title}` : "",
      error: modalError,
    });
  }
  if (activeModal === "report" && reportTarget?.type === "work") {
    return renderReportModal({
      title: "Prijavi rad",
      subtitle: reportTarget.ownerName ? `Autor: ${reportTarget.ownerName}` : "",
      error: modalError,
    });
  }
  if (activeModal === "report" && reportTarget?.type === "tip") {
    return renderReportModal({
      title: "Prijavi savjet",
      subtitle: reportTarget.data?.title ? `Savjet: ${reportTarget.data.title}` : "",
      error: modalError,
      reasons: TIP_REPORT_REASONS,
      selectedReason: TIP_REPORT_REASONS[0],
    });
  }
  if (activeModal === "report" && reportTarget?.type === "chat-user") {
    return renderReportModal({
      title: "Prijavi korisnika",
      subtitle: reportTarget.data?.name ? `Korisnik: ${reportTarget.data.name}` : "",
      error: modalError,
      reasons: CHAT_REPORT_REASONS,
      selectedReason: CHAT_REPORT_REASONS[0],
    });
  }
  return "";
}

function renderShellWithContent(route, contentHtml, { restoreScroll = true, loading = false } = {}) {
  if (!loading) {
    lastRenderedContentHtml = contentHtml;
  }
  setRoot(
    renderShell({
      route,
      userEmail: currentUser?.email || "",
      contentHtml: contentHtml + buildModalsHtml(),
      unreadNotifications,
      adminOnly: webConfig?.adminOnly === true,
      loading,
    })
  );
  lastScrollRoute = route;
  if (restoreScroll) restoreMainScroll(route);
  bindFeedScroll();
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
    const [worksPreview, profile, tips] = await Promise.all([
      fetchPublicWorks(3),
      currentUser?.uid ? fetchUserProfile(currentUser.uid) : Promise.resolve(null),
      fetchHomeTips(4),
    ]);
    let following = [];
    let followedWorks = [];
    let myHomeTip = null;
    if (profile?.role === "korisnik" && currentUser?.uid) {
      following = await fetchFollowingList(currentUser.uid);
      if (following.length) {
        followedWorks = await fetchPublicWorksByUserIds(following.map((f) => f.targetUid));
      }
    }
    if (currentUser?.uid && (profile?.role === "majstor" || profile?.role === "kreator")) {
      myHomeTip = await fetchMyHomeTip(currentUser.uid);
    }
    homeTipsCache = tips;
    return renderHome({
      selectedCity,
      showAllCities: homeShowAllCities,
      worksPreview,
      workSlideIndex,
      tips,
      tipsLoading: false,
      myHomeTip,
      userName: profile?.displayName || currentUser?.displayName || "",
      userRole: profile?.role || "",
      userCity: profile?.city || "",
      following,
      followedWorks,
      currentUid: currentUser?.uid || "",
    });
  }

  if (route.name === "kategorije" && !route.categorySlug) {
    return renderKategorijeGrid({ tab: route.tab || "majstori" });
  }

  if (route.name === "kategorije" && route.categorySlug) {
    const category = findCategoryBySlug(route.categorySlug);
    if (!category) {
      return renderScreenError("Kategorija nije pronađena.");
    }
    const role = categoryRole(category);
    const tab = categoryTabForCategory(category);
    const city = kategorijeFilterMyCity ? profileCity : selectedCity || null;
    const users = await fetchUsersByCategory(category, city || null, role);
    return renderKategorijeList({
      category,
      users,
      city,
      tab,
      filterMyCity: kategorijeFilterMyCity,
      userCity: profileCity,
    });
  }

  if (route.name === "brzo") {
    const city = route.city || profileCity || null;
    const pool = await fetchFastMatchPool();
    const candidates = pickFastCandidates(pool, city);
    brzoTopCandidate = candidates[0] || null;
    return renderBrzo({ candidates, city, topCandidate: brzoTopCandidate, feedbackSent: brzoFeedbackSent });
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
      if (!blizuCity) {
        return renderScreenError("Odaberi grad ili postavi grad u profilu.");
      }
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
    const profile = await fetchUserProfile(currentUser.uid);
    return renderKalkulator({ state: kalkState, role: profile?.role || "korisnik" });
  }

  if (route.name === "poslovi") {
    const tab = route.tab || "potraznja";
    const profile = await fetchUserProfile(currentUser.uid);
    const role = profile?.role || "";
    const [jobs, offers] = await Promise.all([fetchJobs(30), fetchOffers(30)]);
    const ownerProfilesByUid = await fetchOwnerProfilesForListings([...jobs, ...offers]);
    const cityFilter = posloviFilterMyCity ? profileCity : "";
    let filteredJobs = cityFilter ? filterJobsOrOffersByCity(jobs, cityFilter) : jobs;
    if (posloviFilterMyJobs && tab === "potraznja") {
      filteredJobs = filteredJobs.filter((job) => job.userId === currentUser.uid);
    }
    const filteredOffers = cityFilter ? filterJobsOrOffersByCity(offers, cityFilter) : offers;
    let applicationsByJobId = {};
    if (tab === "potraznja" && (role === "majstor" || role === "kreator")) {
      const apps = await fetchMyApplications(currentUser.uid);
      applicationsByJobId = Object.fromEntries(
        apps.filter((app) => app.jobId).map((app) => [app.jobId, app])
      );
    }
    return renderPoslovi({
      jobs: filteredJobs,
      offers: filteredOffers,
      tab,
      filterMyCity: posloviFilterMyCity,
      filterMyJobs: posloviFilterMyJobs,
      userCity: profileCity,
      canCreateJob: role === "korisnik" || isAdminUser(currentUser),
      canCreateOffer: role === "majstor" || role === "kreator" || isAdminUser(currentUser),
      myRole: role,
      applicationsByJobId,
      chatEnabled: isChatEnabled(),
      currentUid: currentUser.uid,
      ownerProfilesByUid,
    });
  }

  if (route.name === "ponuda") {
    const offer = await fetchOffer(route.offerId);
    const ownerProfile = offer?.userId ? await fetchUserProfile(offer.userId) : null;
    return renderPonudaDetail({ offer, currentUid: currentUser.uid, ownerProfile });
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
    const jobOwnerProfile = job.userId ? await fetchUserProfile(job.userId) : null;
    reportCache.job = job;
    return renderPosao({
      job,
      myApplication,
      applications,
      currentUid: currentUser.uid,
      myRole: profile?.role || "",
      chatEnabled: isChatEnabled(),
      jobOwnerProfile,
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
    reportCache.work = work;
    return renderRad({ work, currentUid: currentUser.uid });
  }

  if (route.name === "prijave") {
    const applications = await fetchMyApplications(currentUser.uid);
    const jobIds = [...new Set(applications.map((a) => a.jobId).filter(Boolean))];
    const jobs = await Promise.all(jobIds.map((id) => fetchJob(id)));
    const jobsById = Object.fromEntries(jobs.filter(Boolean).map((j) => [j.id, j]));
    return renderPrijave({ applications, jobsById, currentUid: currentUser.uid, chatEnabled: isChatEnabled() });
  }

  if (route.name === "chat") {
    if (!isChatEnabled()) {
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
    chatOtherMeta = {
      uid: otherUid,
      name: otherName,
      email: otherProfile?.email || "",
    };
    chatBlockStatus = await fetchBlockStatus(uid, otherUid);
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
      blockStatus: chatBlockStatus,
    });
  }

  if (route.name === "profil") {
    const uid = currentUser?.uid;
    const useCache = profilUseCache && profilRouteCache?.uid === uid;
    profilUseCache = false;

    let user;
    let role;
    let tip;
    let myWorks;
    let activityDashboard;
    let followerCount;

    if (useCache && profilRouteCache) {
      ({ user, role, tip, myWorks, activityDashboard, followerCount } = profilRouteCache);
      myTip = tip;
    } else {
      user = uid ? await fetchUserProfile(uid) : null;
      role = user?.role || "";
      const worker = role === "majstor" || role === "kreator";
      const [fetchedTip, fetchedWorks, applications, publishedJobsCount, fetchedFollowerCount] =
        await Promise.all([
          uid ? fetchMyHomeTip(uid) : Promise.resolve(null),
          uid && worker
            ? fetchWorksByUser(uid, false).catch((error) => {
                console.warn("My works load failed:", error);
                return [];
              })
            : Promise.resolve([]),
          uid ? fetchMyApplications(uid) : Promise.resolve([]),
          uid
            ? fetchMyJobsCount(uid).catch((error) => {
                console.warn("My jobs count failed:", error);
                return 0;
              })
            : Promise.resolve(0),
          uid && worker ? fetchFollowerCount(uid) : Promise.resolve(0),
        ]);
      tip = fetchedTip;
      myWorks = fetchedWorks;
      followerCount = fetchedFollowerCount;
      myTip = tip;
      const jobIds = [...new Set(applications.map((a) => a.jobId).filter(Boolean))].slice(0, 24);
      const jobs = await Promise.all(jobIds.map((id) => fetchJob(id)));
      const jobsById = Object.fromEntries(jobs.filter(Boolean).map((j) => [j.id, j]));
      activityDashboard = uid
        ? buildActivityDashboard(
            applications.map((app) => ({
              ...app,
              jobTitle: jobsById[app.jobId]?.title || "",
              peerLabel:
                app.workerId === uid
                  ? jobsById[app.jobId]?.authorName || "Naručitelj"
                  : app.workerName || "Majstor / kreator",
            })),
            uid,
            publishedJobsCount
          )
        : null;
      profilRouteCache = { uid, user, role, tip, myWorks, activityDashboard, followerCount };
    }

    const weatherKey = webConfig?.weatherApiKey || "";
    const outdoorMissingKey = !weatherKey;
    const outdoorCacheKey = `${user?.city || ""}|${role}`;
    profilOutdoorCtx = { city: user?.city || "", role, weatherKey };
    if (outdoorCacheKey !== outdoorOutlookCacheKey) {
      outdoorOutlookCache = null;
      outdoorOutlookCacheKey = outdoorCacheKey;
    }
    let outdoorOutlook = outdoorOutlookCache;
    let outdoorLoading = false;
    let outdoorForecastFailed = false;
    const canFetchOutdoor =
      outdoorPlanExpanded &&
      user?.city &&
      weatherKey &&
      ["majstor", "kreator", "korisnik"].includes(role);
    if (canFetchOutdoor && !outdoorOutlook) {
      if (useCache) {
        outdoorLoading = true;
      } else {
        outdoorLoading = true;
        try {
          const forecast = await fetchOutdoorForecast(weatherKey, user.city);
          outdoorOutlook = buildOutdoorOutlook(role, forecast);
          if (!outdoorOutlook) outdoorForecastFailed = true;
          outdoorOutlookCache = outdoorOutlook;
        } catch (error) {
          console.warn("Weather load failed:", error);
          outdoorForecastFailed = true;
        }
        outdoorLoading = false;
      }
    }

    const html = renderProfil({
      user,
      authEmail: currentUser?.email || "",
      editing: profileEditing,
      formError: profileFormError,
      myTip: tip,
      myWorks,
      activityDashboard,
      aktivnostExpanded,
      hiddenActivityAppIds: uid ? getHiddenActivityAppIds(uid) : [],
      outdoorOutlook,
      outdoorLoading,
      outdoorMissingKey,
      outdoorForecastFailed,
      outdoorExpanded: outdoorPlanExpanded,
      followerCount,
      chatEnabled: isChatEnabled(),
    });

    if (useCache && outdoorLoading) {
      queueMicrotask(() => scheduleOutdoorPlanLoad());
    }

    return html;
  }

  if (route.name === "pregled") {
    const user = await fetchUserProfile(route.uid);
    let works = [];
    let ratingsSummary = null;
    let myRating = 0;
    let isFollowing = false;
    let followerCount = 0;
    let viewerRole = "";
    if (currentUser?.uid) {
      const viewerProfile = await fetchUserProfile(currentUser.uid);
      viewerRole = viewerProfile?.role || "";
    }
    if (user) {
      try {
        works = await fetchWorksByUser(route.uid, true);
      } catch (error) {
        console.warn("Public works load failed:", error);
      }
      if (user.role === "majstor" || user.role === "kreator") {
        try {
          [ratingsSummary, myRating, followerCount] = await Promise.all([
            fetchRatingsForUser(route.uid),
            currentUser?.uid ? fetchMyRatingForUser(route.uid, currentUser.uid) : 0,
            fetchFollowerCount(route.uid),
          ]);
        } catch (error) {
          console.warn("Ratings load failed:", error);
        }
      }
      if (currentUser?.uid && currentUser.uid !== route.uid) {
        try {
          isFollowing = await fetchIsFollowing(currentUser.uid, route.uid);
        } catch (error) {
          console.warn("Follow state load failed:", error);
        }
      }
    }
    return renderPregledProfila({
      user,
      works,
      ratingsSummary,
      myRating,
      currentUid: currentUser?.uid || "",
      isFollowing,
      viewerRole,
      followerCount,
    });
  }

  if (route.name === "obavijesti") {
    const notifications = await fetchNotifications(currentUser.uid, 40);
    try {
      await markNotificationsRead(currentUser.uid);
      unreadNotifications = 0;
    } catch (_) {}
    return renderObavijesti({
      notifications,
      chatEnabled: isChatEnabled(),
    });
  }

  if (route.name === "postavke") {
    const [user, verification] = await Promise.all([
      fetchUserProfile(currentUser.uid),
      fetchVerificationRequest(currentUser.uid),
    ]);
    return renderPostavke({
      user,
      userEmail: currentUser?.email || "",
      verification,
      isAdmin: isAdminUser(currentUser),
      deleteError: postavkeDeleteError,
    });
  }

  if (route.name === "postavke-blokirani") {
    const users = await fetchBlockedUsersForUser(currentUser.uid);
    return renderBlockedUsers({ users });
  }

  if (route.name === "biljeske" || route.name === "postavke-biljeske") {
    const profile = await fetchUserProfile(currentUser.uid);
    importLegacyWorkNotes(currentUser.uid, profile);
    const notes = loadWorkNotes(currentUser.uid);
    return renderWorkNotes({ notes, savedLabel: workNotesSavedLabel });
  }

  if (route.name === "postavke-izgled") {
    return renderDisplaySettings();
  }

  if (route.name === "postavke-privatnost") {
    return renderPrivacyInfo();
  }

  if (route.name === "postavke-admin") {
    if (!isAdminUser(currentUser)) {
      return renderScreenError("Nemate pristup moderaciji.");
    }
    const [reports, banned] = await Promise.all([fetchOpenReports(30), fetchBannedUsersAdmin(50)]);
    return renderAdminModeration({ reports, banned, error: adminModerationError });
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
  stopAutoIzborLoading();
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

  let profile;
  try {
    profile = await fetchUserProfile(currentUser.uid);
  } catch (error) {
    console.error("Profile load failed:", error);
    setRoot(
      renderScreenError("Nije moguće učitati profil. Provjerite internet i Firestore rules.")
    );
    return;
  }

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
    const isGoogleUser = currentUser.providerData?.some((p) => p.providerId === "google.com");
    setRoot(
      renderOnboarding({
        user: currentUser,
        isGoogleUser,
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
  const softUpdate = skipRouteLoading;
  skipRouteLoading = false;
  if (!softUpdate && !bootInitialLoad) {
    captureMainScroll(lastScrollRoute);
    renderShellWithContent(route, renderScreenLoading(), { restoreScroll: false, loading: true });
  }

  try {
    if (!softUpdate) {
      await refreshProfileCity();
      if (route.name !== "obavijesti") {
        try {
          unreadNotifications = await fetchUnreadNotificationCount(currentUser.uid);
        } catch (_) {
          unreadNotifications = 0;
        }
      }
    }
    const contentHtml = await loadRouteContent(route);
    if (requestId !== screenRequestId) return;
    renderShellWithContent(route, contentHtml, { restoreScroll: softUpdate });
    bootInitialLoad = false;
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
    bootInitialLoad = false;
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

  if (!webConfig.weatherApiKey?.trim()) {
    try {
      const local = await import("./weather.local.js");
      const localKey = local.WEATHER_API_KEY_FALLBACK?.trim();
      if (localKey) webConfig.weatherApiKey = localKey;
    } catch (_) {
      /* optional local dev fallback */
    }
  }

  booted = true;
  applyDisplaySettings();
  refreshModerationFromFirestore().finally(() => renderApp());
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
  let lastClearedMsgId = "";
  chatUnsubscribe = subscribeToChatMessages({
    jobId: ctx.jobId,
    applicationId: ctx.appId,
    onMessages: (messages) => {
      chatMessagesCache = messages;
      const el = document.getElementById("chat-messages");
      if (el) {
        el.innerHTML = renderChatMessages(messages, ctx.currentUid);
        el.scrollTop = el.scrollHeight;
      }
      const last = messages[messages.length - 1];
      const sender = last?.senderId || "";
      const msgId = last?.id || "";
      if (
        last &&
        sender &&
        sender !== ctx.currentUid &&
        msgId &&
        msgId !== lastClearedMsgId
      ) {
        lastClearedMsgId = msgId;
        clearMyUnread(ctx.appId, ctx.currentUid).catch(() => {});
      }
    },
    onError: (error) => {
      const el = document.getElementById("chat-messages");
      if (!el) return;
      el.innerHTML = `<div class="empty-state empty-state--error">${error?.message || "Greška pri učitavanju poruka."}</div>`;
    },
  });
}

function bindPhase3Actions() {
  async function applyToJobById(jobId, button) {
    if (!jobId) return;
    if (button) button.disabled = true;
    try {
      const [job, profile] = await Promise.all([
        fetchJob(jobId),
        fetchUserProfile(currentUser.uid),
      ]);
      if (!job) throw new Error("missing job");
      await applyToJob({ job, profile, authUser: currentUser });
      invalidateProfilCache();
      renderApp();
    } catch (error) {
      console.error("Apply failed:", error);
      if (button) button.disabled = false;
      if (error?.code === "already-applied") {
        alert(error.message);
        return;
      }
      alert("Prijava nije uspjela. Pokušaj ponovo.");
    }
  }

  const applyBtn = document.getElementById("apply-job-btn");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => applyToJobById(applyBtn.dataset.jobId, applyBtn));
  }

  document.querySelectorAll("[data-job-apply]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      applyToJobById(btn.dataset.jobApply, btn);
    });
  });

  const reportJobBtn = document.getElementById("report-job-btn");
  if (reportJobBtn) {
    reportJobBtn.addEventListener("click", () => {
      reportTarget = { type: "job", data: reportCache.job };
      activeModal = "report";
      modalError = "";
      renderModalUpdate();
    });
  }

  const reportWorkBtn = document.getElementById("report-work-btn");
  if (reportWorkBtn) {
    reportWorkBtn.addEventListener("click", async () => {
      const workId = reportWorkBtn.dataset.workId;
      if (!workId) return;
      try {
        const work = reportCache.work?.id === workId ? reportCache.work : await fetchWork(workId);
        if (!work) return;
        reportCache.work = work;
        reportTarget = {
          type: "work",
          data: work,
          ownerName: workOwnerName(work),
        };
        activeModal = "report";
        modalError = "";
        renderModalUpdate();
      } catch (error) {
        console.error("Report work load failed:", error);
      }
    });
  }

  document.querySelectorAll("[data-app-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const appId = btn.dataset.appId;
      const action = btn.dataset.appAction;
      if (!appId || !action || btn.disabled) return;
      const status =
        action === "accept" ? "accepted" : action === "reject" ? "rejected" : action === "complete" ? "completed" : "";
      if (!status) return;
      btn.disabled = true;
      try {
        const app = await fetchApplication(appId);
        const job = app?.jobId ? await fetchJob(app.jobId) : null;
        await updateApplicationStatus(appId, status, {
          workerUid: app?.workerId,
          jobOwnerUid: app?.jobOwnerId,
          jobId: app?.jobId,
          jobTitle: job?.title,
          currentUid: currentUser.uid,
        });
        renderApp();
      } catch (error) {
        console.error("Status update failed:", error);
        btn.disabled = false;
        alert("Ažuriranje statusa nije uspjelo.");
      }
    });
  });

  const deleteJobBtn = document.getElementById("delete-job-btn");
  if (deleteJobBtn) {
    deleteJobBtn.addEventListener("click", async () => {
      const jobId = deleteJobBtn.dataset.jobId;
      if (!jobId || !confirm("Obrisati ovaj posao?")) return;
      try {
        await deleteJob(jobId);
        navigateTo("#/poslovi");
      } catch (error) {
        console.error("Delete job failed:", error);
        alert("Brisanje posla nije uspjelo.");
      }
    });
  }

  const deleteOfferBtn = document.getElementById("delete-offer-btn");
  if (deleteOfferBtn) {
    deleteOfferBtn.addEventListener("click", async () => {
      const offerId = deleteOfferBtn.dataset.offerId;
      if (!offerId || !confirm("Obrisati ovu ponudu?")) return;
      try {
        await deleteOffer(offerId);
        navigateTo("#/ponude");
      } catch (error) {
        console.error("Delete offer failed:", error);
        alert("Brisanje ponude nije uspjelo.");
      }
    });
  }

  const chatForm = document.getElementById("chat-form");
  if (chatForm && chatContext) {
    chatForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (chatBlockStatus.iBlocked || chatBlockStatus.theyBlocked) {
        alert("Poruke nisu dostupne zbog blokade.");
        return;
      }
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

  const chatMenuBtn = document.getElementById("chat-menu-btn");
  const chatMenu = document.getElementById("chat-menu");
  if (chatMenuBtn && chatMenu) {
    chatMenuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      chatMenu.classList.toggle("chat-menu--open");
    });
    document.addEventListener(
      "click",
      () => {
        chatMenu.classList.remove("chat-menu--open");
      },
      { once: true }
    );
  }

  const chatReportBtn = document.getElementById("chat-report-user-btn");
  if (chatReportBtn && chatOtherMeta) {
    chatReportBtn.addEventListener("click", () => {
      reportTarget = { type: "chat-user", data: chatOtherMeta };
      activeModal = "report";
      modalError = "";
      renderModalUpdate();
    });
  }

  const chatBlockBtn = document.getElementById("chat-block-user-btn");
  if (chatBlockBtn && chatOtherMeta && chatContext && !chatBlockStatus.iBlocked && !chatBlockStatus.theyBlocked) {
    chatBlockBtn.addEventListener("click", async () => {
      if (!confirm("Blokirati ovog korisnika?")) return;
      try {
        await blockUser({
          blockerUid: currentUser.uid,
          blockedUid: chatOtherMeta.uid,
          blockedName: chatOtherMeta.name,
          blockedEmail: chatOtherMeta.email,
          jobId: chatContext.jobId,
          appId: chatContext.appId,
        });
        chatBlockStatus = { ...chatBlockStatus, iBlocked: true };
        renderApp();
      } catch (error) {
        alert("Blokiranje nije uspjelo.");
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

function bindProfileAndModals() {
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeActiveModal();
    });
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeActiveModal();
      }
    });
  });

  const fab = document.getElementById("poslovi-fab");
  if (fab) {
    fab.addEventListener("click", () => {
      activeModal = fab.dataset.fabTab === "ponuda" ? "offer" : "job";
      modalError = "";
      renderModalUpdate();
    });
  }

  const editProfileBtn = document.getElementById("edit-profile-btn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      profileEditing = true;
      profileFormError = "";
      softRenderApp();
    });
  }

  const cancelEdit = document.getElementById("cancel-profile-edit");
  if (cancelEdit) {
    cancelEdit.addEventListener("click", () => {
      profileEditing = false;
      profileFormError = "";
      softRenderApp();
    });
  }

  const editTipBtn = document.getElementById("edit-tip-btn");
  if (editTipBtn) {
    editTipBtn.addEventListener("click", () => {
      activeModal = "tip";
      modalError = "";
      renderModalUpdate();
    });
  }

  const addWorkBtn = document.getElementById("add-work-btn");
  if (addWorkBtn) {
    addWorkBtn.addEventListener("click", () => {
      activeModal = "work";
      modalError = "";
      renderModalUpdate();
    });
  }

  document.querySelectorAll(".work-public-toggle").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const workId = event.currentTarget.dataset.workId;
      if (!workId) return;
      const checked = event.currentTarget.checked;
      try {
        await updateWorkPublic(workId, checked);
      } catch (error) {
        console.error("Work visibility update failed:", error);
        event.currentTarget.checked = !checked;
        alert(checked ? "Rad nije mogao biti javan." : "Sakrivanje rada nije uspjelo.");
      }
    });
  });

  document.querySelectorAll(".work-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      const workId = event.currentTarget.dataset.workId;
      if (!workId) return;
      if (!confirm("Obrisati ovaj rad?")) return;
      try {
        await deleteWork(workId);
        renderApp();
      } catch (error) {
        console.error("Work delete failed:", error);
        alert("Brisanje rada nije uspjelo.");
      }
    });
  });

  const workImageInput = document.getElementById("work-image-input");
  if (workImageInput) {
    workImageInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      const preview = document.getElementById("work-image-preview");
      if (!preview) return;
      if (!file) {
        preview.hidden = true;
        preview.innerHTML = "";
        return;
      }
      const url = URL.createObjectURL(file);
      preview.hidden = false;
      preview.innerHTML = `<img src="${url}" alt="Pregled slike" />`;
    });
  }

  const workForm = document.getElementById("add-work-form");
  if (workForm) {
    workForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      modalError = "";
      const form = event.currentTarget;
      const description = normalizeSpaces(form.description.value);
      const file = form.image?.files?.[0];
      if (!description) {
        modalError = "Opis rada je obavezan.";
        renderModalUpdate();
        return;
      }
      if (!file) {
        modalError = "Odaberite sliku rada.";
        renderModalUpdate();
        return;
      }

      const profile = await fetchUserProfile(currentUser.uid);
      const existing = await fetchWorksByUser(currentUser.uid, false).catch(() => []);
      if (existing.length >= 3) {
        modalError = "Možete dodati najviše 3 rada.";
        renderModalUpdate();
        return;
      }

      const submitBtn = document.getElementById("add-work-submit");
      if (submitBtn) submitBtn.disabled = true;

      try {
        const imageData = await uploadWorkImage(currentUser.uid, file);
        await createWork({
          profile,
          authUser: currentUser,
          description,
          imageUrls: imageData,
          paths: imageData,
        });
        invalidateProfilCache();
        finishModalAction();
      } catch (error) {
        console.error("Add work failed:", error);
        modalError = "Spremanje rada nije uspjelo.";
        renderModalUpdate();
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  const profileImageInput = document.getElementById("profile-image-input");
  if (profileImageInput) {
    profileImageInput.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file || !currentUser?.uid) return;
      try {
        await uploadProfileImage(currentUser.uid, file);
        renderApp();
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload slike nije uspio.");
      }
    });
  }

  const deleteImageBtn = document.getElementById("delete-profile-image-btn");
  if (deleteImageBtn) {
    deleteImageBtn.addEventListener("click", async () => {
      if (!currentUser?.uid) return;
      try {
        await clearProfileImage(currentUser.uid);
        renderApp();
      } catch (error) {
        alert("Brisanje slike nije uspjelo.");
      }
    });
  }

  const profileForm = document.getElementById("profile-edit-form");
  if (profileForm) {
    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      profileFormError = "";
      const form = event.currentTarget;
      let profile;
      try {
        profile = await fetchUserProfile(currentUser.uid);
      } catch (error) {
        console.error("Profile read failed:", error);
        profileFormError = formatFirestoreError(error) || "Nije moguće učitati profil.";
        softRenderApp();
        return;
      }
      const role = profile?.role || "korisnik";
      const payload = {
        displayName: form.displayName.value,
        city: form.city.value,
        description: form.description.value,
        contactPhone: form.contactPhone.value,
        preferInAppChat: form.preferInAppChat.checked,
        allowPhoneCall: form.allowPhoneCall.checked,
        allowWhatsApp: form.allowWhatsApp.checked,
        role,
      };
      if (role === "majstor" || role === "kreator") {
        payload.status = form.status.value;
        payload.category = form.category.value;
        payload.occupation = form.occupation.value;
      }

      const nameErr = validatePersonName(payload.displayName);
      if (nameErr) {
        profileFormError = nameErr;
        softRenderApp();
        return;
      }
      if (role === "majstor" || role === "kreator") {
        const cityErr = validateCity(payload.city);
        if (cityErr) {
          profileFormError = cityErr;
          softRenderApp();
          return;
        }
      }
      const descErr = validateOptionalDescription(payload.description, "Opis");
      if (descErr) {
        profileFormError = descErr;
        softRenderApp();
        return;
      }
      if (payload.contactPhone.trim()) {
        const phoneErr = validatePhone(payload.contactPhone, true);
        if (phoneErr) {
          profileFormError = phoneErr;
          softRenderApp();
          return;
        }
      }

      try {
        await updateUserProfile(currentUser.uid, payload);
        invalidateProfilCache();
        outdoorOutlookCache = null;
        try {
          await refreshProfileCity();
        } catch (refreshError) {
          console.warn("refreshProfileCity failed:", refreshError);
        }
        profileEditing = false;
        profileFormError = "";
        renderApp();
      } catch (error) {
        console.error("Profile save failed:", error);
        profileFormError = formatFirestoreError(error) || "Spremanje profila nije uspjelo.";
        softRenderApp();
      }
    });
  }

  const jobForm = document.getElementById("create-job-form");
  if (jobForm) {
    jobForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      modalError = "";
      const form = event.currentTarget;
      let profile;
      try {
        profile = await fetchUserProfile(currentUser.uid);
      } catch (error) {
        console.error("Profile read failed:", error);
        modalError = formatFirestoreError(error) || "Nije moguće učitati profil.";
        renderModalUpdate();
        return;
      }
      if (!profile) {
        modalError = "Profil nije pronađen. Dovršite registraciju ili se ponovo prijavite.";
        renderModalUpdate();
        return;
      }
      const fields = {
        title: form.title.value,
        description: form.description.value,
        category: form.category.value,
        city: form.city.value,
        budget: form.budget.value,
        whenNeeded: form.whenNeeded.value,
        contactPhone: form.contactPhone.value,
      };
      const missing = firstMissingJobFields(fields, !profile?.preferInAppChat);
      if (missing) {
        modalError = missing;
        renderModalUpdate();
        return;
      }
      const violation = findContentViolation(fields.title, fields.description, fields.category);
      if (violation) {
        modalError = violationMessage("Oglas", violation);
        renderModalUpdate();
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        await createJob({ profile, authUser: currentUser, fields });
        finishModalAction();
      } catch (error) {
        console.error("Create job failed:", error);
        modalError = formatFirestoreError(error) || "Objava posla nije uspjela.";
        renderModalUpdate();
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  const offerForm = document.getElementById("create-offer-form");
  if (offerForm) {
    offerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      modalError = "";
      const form = event.currentTarget;
      const profile = await fetchUserProfile(currentUser.uid);
      const fields = {
        title: form.title.value,
        description: form.description.value,
        category: form.category.value,
        city: form.city.value,
        budget: form.budget.value,
        availableWhen: form.availableWhen.value,
        contactPhone: form.contactPhone.value,
      };
      const missing = firstMissingOfferFields(fields, !profile?.preferInAppChat);
      if (missing) {
        modalError = missing;
        renderModalUpdate();
        return;
      }
      const violation = findContentViolation(fields.title, fields.description, fields.category);
      if (violation) {
        modalError = violationMessage("Ponuda", violation);
        renderModalUpdate();
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        await createOffer({ profile, authUser: currentUser, fields });
        finishModalAction({ navigate: "#/ponude" });
      } catch (error) {
        console.error("Create offer failed:", error);
        modalError = formatFirestoreError(error) || "Objava ponude nije uspjela.";
        renderModalUpdate();
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  const tipForm = document.getElementById("tip-editor-form");
  if (tipForm) {
    tipForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      modalError = "";
      const form = event.currentTarget;
      const profile = await fetchUserProfile(currentUser.uid);
      const title = normalizeSpaces(form.title.value);
      const teaser = normalizeSpaces(form.teaser.value);
      const body = normalizeSpaces(form.body.value);
      if (!title || !teaser || !body) {
        modalError = "Naslov, kratki i puni opis su obavezni.";
        renderModalUpdate();
        return;
      }
      const violation = findContentViolation(title, teaser, body);
      if (violation) {
        modalError = violationMessage("Savjet", violation);
        renderModalUpdate();
        return;
      }
      try {
        await saveHomeTip({
          uid: currentUser.uid,
          displayName: profile?.displayName || currentUser.displayName || "",
          title,
          teaser,
          body,
          existingId: myTip?.id || null,
        });
        invalidateProfilCache();
        finishModalAction();
      } catch (error) {
        modalError = "Spremanje savjeta nije uspjelo.";
        renderModalUpdate();
      }
    });
  }

  const deleteTipBtn = document.getElementById("delete-tip-btn");
  if (deleteTipBtn && myTip?.id) {
    deleteTipBtn.addEventListener("click", async () => {
      try {
        await deleteHomeTip(myTip.id);
        myTip = null;
        activeModal = null;
        renderApp();
      } catch (error) {
        modalError = "Brisanje savjeta nije uspjelo.";
        renderApp();
      }
    });
  }
}

function bindKalkulator() {
  let timer;
  document.querySelectorAll("[data-kalk-module]").forEach((chip) => {
    chip.addEventListener("click", () => {
      kalkState = { ...readKalkulatorState(), module: Number(chip.dataset.kalkModule) || 0 };
      softRenderApp();
    });
  });
  document.querySelectorAll("[data-kalk-field]").forEach((field) => {
    const handler = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        kalkState = readKalkulatorState();
        softRenderApp();
      }, 250);
    };
    field.addEventListener("input", handler);
    field.addEventListener("change", handler);
  });
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

  const myJobsFilter = document.getElementById("poslovi-my-jobs-filter");
  if (myJobsFilter) {
    myJobsFilter.addEventListener("click", () => {
      posloviFilterMyJobs = !posloviFilterMyJobs;
      renderApp();
    });
  }

  document.querySelectorAll(".rating-star").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const profileUid = btn.dataset.profileUid;
      const value = Number(btn.dataset.ratingValue);
      if (!profileUid || !value || !currentUser?.uid || btn.disabled) return;
      document.querySelectorAll(".rating-star").forEach((star) => {
        star.disabled = true;
      });
      try {
        await submitRating({
          profileUid,
          raterUid: currentUser.uid,
          rating: value,
        });
        renderApp();
      } catch (error) {
        console.error("Rating failed:", error);
        document.querySelectorAll(".rating-star").forEach((star) => {
          star.disabled = false;
        });
        alert("Ocjenjivanje nije uspjelo.");
      }
    });
  });

  const deleteAccountBtn = document.getElementById("delete-account-btn");
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
      if (!currentUser?.uid) return;
      if (!confirm("Obrisati nalog trajno? Uklonit će se profil, oglasi, ponude i prijave.")) return;
      const typed = prompt('Za potvrdu upišite "OBRIŠI"');
      if (typed !== "OBRIŠI") return;
      deleteAccountBtn.disabled = true;
      postavkeDeleteError = "";
      try {
        await deleteAccountData(currentUser.uid);
        await deleteCurrentUser();
        currentUser = null;
        navigateTo("#/login");
      } catch (error) {
        console.error("Delete account failed:", error);
        postavkeDeleteError = "Brisanje naloga nije uspjelo. Pokušaj ponovo.";
        deleteAccountBtn.disabled = false;
        renderApp();
      }
    });
  }

  const followBtn = document.getElementById("follow-profile-btn");
  if (followBtn) {
    followBtn.addEventListener("click", async () => {
      const profileUid = followBtn.dataset.profileUid;
      const currently = followBtn.dataset.following === "1";
      if (!profileUid || !currentUser?.uid || followBtn.disabled) return;
      followBtn.disabled = true;
      try {
        const [profile, viewerProfile] = await Promise.all([
          fetchUserProfile(profileUid),
          fetchUserProfile(currentUser.uid),
        ]);
        await setFollowing({
          followerUid: currentUser.uid,
          viewerRole: viewerProfile?.role || "",
          profile: { ...profile, id: profileUid },
          follow: !currently,
        });
        renderApp();
      } catch (error) {
        console.error("Follow failed:", error);
        followBtn.disabled = false;
        alert("Pratnja nije uspjela.");
      }
    });
  }

  const aktivnostToggle = document.getElementById("aktivnost-toggle");
  if (aktivnostToggle) {
    aktivnostToggle.addEventListener("click", () => {
      aktivnostExpanded = !aktivnostExpanded;
      if (patchAktivnostExpanded(aktivnostExpanded)) return;
      softRenderApp();
    });
  }

  const outdoorToggle = document.getElementById("outdoor-plan-toggle");
  if (outdoorToggle) {
    outdoorToggle.addEventListener("click", () => {
      outdoorPlanExpanded = !outdoorPlanExpanded;
      if (patchOutdoorPlanExpanded(outdoorPlanExpanded)) {
        if (outdoorPlanExpanded) {
          scheduleOutdoorPlanLoad();
        } else {
          outdoorFetchToken += 1;
        }
        return;
      }
      softRenderApp();
    });
  }

  document.querySelectorAll("[data-activity-hide]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const appId = btn.dataset.activityHide;
      if (!appId || !currentUser?.uid) return;
      pendingActivityHideId = appId;
      activeModal = "activity-hide";
      modalError = "";
      softRenderApp();
    });
  });

  const confirmActivityHideBtn = document.getElementById("confirm-activity-hide-btn");
  if (confirmActivityHideBtn && pendingActivityHideId && currentUser?.uid) {
    confirmActivityHideBtn.addEventListener("click", () => {
      hideActivityAppId(currentUser.uid, pendingActivityHideId);
      pendingActivityHideId = "";
      activeModal = null;
      invalidateProfilCache();
      renderApp();
    });
  }

  const reportForm = document.getElementById("report-form");
  if (reportForm && reportTarget) {
    reportForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      modalError = "";
      const form = event.currentTarget;
      const reason = form.querySelector('input[name="reportReason"]:checked')?.value || "";
      const details = normalizeSpaces(form.details?.value || "");
      if (!reason) {
        modalError = "Odaberi razlog prijave.";
        renderModalUpdate();
        return;
      }
      const reporter = {
        uid: currentUser.uid,
        email: currentUser.email || "",
        displayName: currentUser.displayName || currentUser.email || "Korisnik",
      };
      try {
        if (reportTarget.type === "job" && reportTarget.data) {
          await submitJobReport({ reporter, job: reportTarget.data, reason, details });
        } else if (reportTarget.type === "work" && reportTarget.data) {
          await submitWorkReport({
            reporter,
            work: reportTarget.data,
            ownerName: reportTarget.ownerName || workOwnerName(reportTarget.data),
            reason,
            details,
          });
        } else if (reportTarget.type === "tip" && reportTarget.data) {
          await submitTipReport({ reporter, tip: reportTarget.data, reason, details });
        } else if (reportTarget.type === "chat-user" && reportTarget.data && chatContext) {
          const otherId = reportTarget.data.uid;
          const reportedContent = chatMessagesCache
            .filter((m) => m.senderId === otherId)
            .slice(-3)
            .map((m) => m.text || "")
            .join("\n");
          await submitChatUserReport({
            reporter,
            target: reportTarget.data,
            jobId: chatContext.jobId,
            appId: chatContext.appId,
            reason,
            details,
            reportedContent,
          });
        }
        reportTarget = null;
        activeModal = null;
        alert("Prijava je poslana. Hvala.");
        renderApp();
      } catch (error) {
        console.error("Report failed:", error);
        modalError = error?.message || "Slanje prijave nije uspjelo.";
        renderModalUpdate();
      }
    });
  }

  const deleteTipProfileBtn = document.getElementById("delete-tip-profile-btn");
  if (deleteTipProfileBtn && myTip?.id) {
    deleteTipProfileBtn.addEventListener("click", async () => {
      if (!confirm("Obrisati savjet s početne?")) return;
      try {
        await deleteHomeTip(myTip.id);
        myTip = null;
        renderApp();
      } catch (error) {
        alert("Brisanje savjeta nije uspjelo.");
      }
    });
  }

  const kategorijeFilter = document.getElementById("kategorije-city-filter");
  if (kategorijeFilter) {
    kategorijeFilter.addEventListener("click", () => {
      kategorijeFilterMyCity = !kategorijeFilterMyCity;
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

  const requestVerificationBtn = document.getElementById("request-verification-btn");
  if (requestVerificationBtn) {
    requestVerificationBtn.addEventListener("click", async () => {
      try {
        const profile = await fetchUserProfile(currentUser.uid);
        await submitVerificationRequest({
          uid: currentUser.uid,
          profile,
          email: currentUser.email || "",
        });
        alert("Zahtjev za potvrđeni profil je poslan.");
        renderApp();
      } catch (error) {
        alert("Slanje zahtjeva nije uspjelo.");
      }
    });
  }

  document.querySelectorAll("[data-unblock-uid]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const blockedUid = btn.dataset.unblockUid;
      if (!blockedUid) return;
      try {
        await unblockUser(currentUser.uid, blockedUid);
        renderApp();
      } catch (error) {
        alert("Odblokiranje nije uspjelo.");
      }
    });
  });

  const workNotesForm = document.getElementById("work-notes-form");
  if (workNotesForm) {
    workNotesForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      saveWorkNotes(currentUser.uid, {
        main: form.main.value,
        reminder: form.reminder.value,
      });
      workNotesSavedLabel = `Sačuvano ${new Date().toLocaleString("bs-BA")}`;
      renderApp();
    });
  }

  const fontScale = document.getElementById("display-font-scale");
  if (fontScale) {
    fontScale.addEventListener("change", () => {
      setDisplaySetting("fontScale", Number(fontScale.value) || 1);
      renderApp();
    });
  }
  const reduceMotion = document.getElementById("display-reduce-motion");
  if (reduceMotion) {
    reduceMotion.addEventListener("change", () => {
      setDisplaySetting("reduceMotion", reduceMotion.checked);
    });
  }
  const rememberTab = document.getElementById("display-remember-tab");
  if (rememberTab) {
    rememberTab.addEventListener("change", () => {
      setDisplaySetting("rememberLastTab", rememberTab.checked);
    });
  }

  const dataSaver = document.getElementById("security-data-saver");
  if (dataSaver) {
    dataSaver.addEventListener("change", () => {
      localStorage.setItem("bil_data_saver_images", dataSaver.checked ? "1" : "0");
    });
  }
  const clearSwCacheBtn = document.getElementById("clear-sw-cache-btn");
  if (clearSwCacheBtn) {
    clearSwCacheBtn.addEventListener("click", async () => {
      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.getRegistration("/app/");
          if (reg?.active) reg.active.postMessage({ type: "SKIP_WAITING" });
        }
        alert("Keš je očišćen.");
      } catch (error) {
        alert("Čišćenje keša nije uspjelo.");
      }
    });
  }

  document.querySelectorAll("[data-admin-resolve]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await resolveReport(btn.dataset.adminResolve, currentUser.uid);
        adminModerationError = "";
        renderApp();
      } catch (error) {
        adminModerationError = "Označavanje riješeno nije uspjelo.";
        renderApp();
      }
    });
  });

  document.querySelectorAll("[data-admin-ban]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetUid = btn.dataset.targetUid;
      if (!targetUid || !confirm("Banovati korisnika globalno?")) return;
      try {
        await adminBanUser({
          targetUid,
          name: btn.dataset.targetName || "",
          email: btn.dataset.targetEmail || "",
          reason: "Admin moderacija",
          adminUid: currentUser.uid,
          sourceReportId: btn.dataset.adminBan || "",
        });
        adminModerationError = "";
        renderApp();
      } catch (error) {
        adminModerationError = "Ban nije uspio (provjeri admin prava).";
        renderApp();
      }
    });
  });

  document.querySelectorAll("[data-admin-unban]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await adminUnbanUser(btn.dataset.adminUnban);
        renderApp();
      } catch (error) {
        adminModerationError = "Vraćanje korisnika nije uspjelo.";
        renderApp();
      }
    });
  });

  document.querySelectorAll("[data-admin-delete-content]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Obrisati prijavljeni sadržaj?")) return;
      try {
        await adminDeleteReportedContent(btn.dataset.collection, btn.dataset.contentId);
        await resolveReport(btn.dataset.adminDeleteContent, currentUser.uid);
        adminModerationError = "";
        renderApp();
      } catch (error) {
        adminModerationError = "Brisanje sadržaja nije uspjelo.";
        renderApp();
      }
    });
  });

  const brzoFeedbackForm = document.getElementById("brzo-feedback-form");
  if (brzoFeedbackForm && brzoTopCandidate) {
    brzoFeedbackForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const choice = form.querySelector('input[name="brzoChoice"]:checked')?.value || "pomoglo";
      const comment = normalizeSpaces(form.comment?.value || "");
      try {
        await submitFastMatchFeedback({
          uid: currentUser.uid,
          voterName: currentUser.displayName || currentUser.email || "Korisnik",
          choice,
          comment,
          suggested: brzoTopCandidate,
        });
        brzoFeedbackSent = true;
        renderApp();
      } catch (error) {
        alert("Slanje povratne informacije nije uspjelo.");
      }
    });
  }
}

function bindHomeActions() {
  document.querySelectorAll('[data-action="auto-izbor"]').forEach((el) => {
    el.addEventListener("click", () => {
      const city = selectedCity || profileCity;
      if (!city) {
        window.alert("Odaberi grad na Početnoj da Auto izbor može raditi.");
        return;
      }
      startAutoIzborLoading(city);
      window.setTimeout(() => {
        navigateTo(`#/brzo/${encodeURIComponent(city)}`);
      }, 1450);
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
      if (!city) {
        window.alert("Odaberi grad ili postavi grad u profilu.");
        return;
      }
      navigateTo(`#/lista/blizu/${encodeURIComponent(city)}`);
    });
  }

  const kalkulatorBtn = document.querySelector('[data-action="kalkulator"]');
  if (kalkulatorBtn) kalkulatorBtn.addEventListener("click", () => navigateTo("#/kalkulator"));

  document.querySelectorAll("[data-report-tip]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const tipId = btn.dataset.reportTip;
      const tip = homeTipsCache.find((t) => t.id === tipId);
      if (!tip) return;
      reportTarget = { type: "tip", data: tip };
      activeModal = "report";
      modalError = "";
      renderModalUpdate();
    });
  });

  document.querySelectorAll(".chip--btn[data-city]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const city = chip.dataset.city || "";
      selectedCity = selectedCity === city ? "" : city;
      renderApp();
    });
  });

  document.querySelectorAll('[data-action="toggle-cities"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      homeShowAllCities = !homeShowAllCities;
      renderApp();
    });
  });
}

async function handleGoogleSignIn() {
  authError = "";
  const terms = document.getElementById("google-accepted-terms");
  const privacy = document.getElementById("google-accepted-privacy");
  if (!terms?.checked || !privacy?.checked) {
    authError = "Morate prihvatiti Pravila i Politiku privatnosti.";
    renderApp();
    return;
  }
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
  bindProfileAndModals();
  bindKalkulator();

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
    navigator.serviceWorker
      .register("sw.js", { scope: "./" })
      .then((reg) => reg.update())
      .catch(() => {});
  });
}
