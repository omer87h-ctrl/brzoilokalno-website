import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  doc,
  getDoc,
  getFirestore,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAIL } from "../firebase.js";

let appInstance = null;
let authInstance = null;
let dbInstance = null;
let appCheckInitialized = false;

function initAppCheckIfConfigured() {
  if (appCheckInitialized) return;
  const siteKey = firebaseConfig.recaptchaAppCheckSiteKey?.trim();
  if (!siteKey) return;

  const host = globalThis.location?.hostname || "";
  if (["localhost", "127.0.0.1"].includes(host) && globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN == null) {
    globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  initializeAppCheck(getApp(), {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  appCheckInitialized = true;
}

function getApp() {
  if (!appInstance) {
    appInstance = initializeApp(firebaseConfig);
    initAppCheckIfConfigured();
  }
  return appInstance;
}

export function getAuthInstance() {
  if (!authInstance) {
    authInstance = getAuth(getApp());
  }
  return authInstance;
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = getFirestore(getApp());
  }
  return dbInstance;
}

const DEFAULT_WEB_CONFIG = {
  enabled: false,
  adminOnly: true,
  chatEnabled: false,
  maintenanceMessage: "Brzo i Lokalno Web je trenutno u pripremi.",
};

/**
 * Kill switch — jedini Firestore poziv pri bootu (Faza 1).
 * Čita app_public/web (allow read: true u postojećim rules).
 */
export async function getWebAppConfig() {
  const ref = doc(getDb(), "app_public", "web");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { ...DEFAULT_WEB_CONFIG, _missing: true };
  }

  const data = snap.data() || {};
  return {
    enabled: data.enabled === true,
    adminOnly: data.adminOnly !== false,
    chatEnabled: data.chatEnabled === true,
    weatherApiKey: typeof data.weatherApiKey === "string" ? data.weatherApiKey.trim() : "",
    maintenanceMessage: typeof data.maintenanceMessage === "string" ? data.maintenanceMessage : "",
    _missing: false,
  };
}

export function watchAuth(callback) {
  return onAuthStateChanged(getAuthInstance(), callback);
}

export function needsEmailVerification(user) {
  if (!user || user.emailVerified) return false;
  return user.providerData?.some((p) => p.providerId === "password") ?? false;
}

export async function sendEmailVerificationIfNeeded(user) {
  if (needsEmailVerification(user)) {
    await sendEmailVerification(user);
  }
}

export async function reloadCurrentUser() {
  const user = getAuthInstance().currentUser;
  if (!user) return null;
  await user.reload();
  return getAuthInstance().currentUser;
}

export async function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(getAuthInstance(), email, password);
}

export async function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(getAuthInstance(), email, password);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(getAuthInstance(), provider);
}

/** @deprecated alias — koristi signInWithEmail */
export async function signInAdmin(email, password) {
  return signInWithEmail(email, password);
}

/** @deprecated alias — koristi signInWithGoogle */
export async function signInAdminWithGoogle() {
  return signInWithGoogle();
}

export async function signOutUser() {
  return signOut(getAuthInstance());
}

export async function deleteCurrentUser() {
  const user = getAuthInstance().currentUser;
  if (user) await deleteUser(user);
}

export function isAdminUser(user) {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export { ADMIN_EMAIL };
