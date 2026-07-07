import { POLICY_VERSION } from "../constants/policy.js";

const STORAGE_KEY = "bil_policy_consent";

export function hasLocalPolicyConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY) === POLICY_VERSION;
  } catch (_) {
    return false;
  }
}

export function saveLocalPolicyConsent() {
  try {
    localStorage.setItem(STORAGE_KEY, POLICY_VERSION);
  } catch (_) {}
}

export function profileHasPolicyConsent(profile) {
  return profile?.acceptedTerms === true && profile?.acceptedPrivacyPolicy === true;
}
