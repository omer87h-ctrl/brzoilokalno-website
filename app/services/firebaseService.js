import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
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

function getApp() {
  if (!appInstance) {
    appInstance = initializeApp(firebaseConfig);
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
    maintenanceMessage: typeof data.maintenanceMessage === "string" ? data.maintenanceMessage : "",
    _missing: false,
  };
}

export function watchAuth(callback) {
  return onAuthStateChanged(getAuthInstance(), callback);
}

export async function signInAdmin(email, password) {
  return signInWithEmailAndPassword(getAuthInstance(), email, password);
}

export async function signOutUser() {
  return signOut(getAuthInstance());
}

export function isAdminUser(user) {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export { ADMIN_EMAIL };
