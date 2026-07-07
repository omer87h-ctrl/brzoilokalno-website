const PREFIX = "bil_activity_hide_";

function storageKey(uid) {
  return `${PREFIX}${uid}`;
}

export function getHiddenActivityAppIds(uid) {
  if (!uid) return [];
  try {
    const raw = localStorage.getItem(storageKey(uid));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (_) {
    return [];
  }
}

export function hideActivityAppId(uid, appId) {
  if (!uid || !appId) return;
  const hidden = new Set(getHiddenActivityAppIds(uid));
  hidden.add(appId);
  localStorage.setItem(storageKey(uid), JSON.stringify([...hidden]));
}
