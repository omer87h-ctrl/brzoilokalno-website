import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuthInstance, getDb } from "./firebaseService.js";
import { isJobNotificationType } from "../constants/notifications.js";
import { publicProfilesCollection } from "./publicProfile.js";

function mapDocs(snap) {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchJobs(max = 30) {
  const q = query(collection(getDb(), "jobs"), orderBy("timestamp", "desc"), limit(max));
  const snap = await getDocs(q);
  return mapDocs(snap);
}

export async function fetchJob(jobId) {
  const snap = await getDoc(doc(getDb(), "jobs", jobId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchPublicWorks(max = 24) {
  try {
    const q = query(
      collection(getDb(), "works"),
      where("isPublic", "==", true),
      orderBy("timestamp", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return mapDocs(snap);
  } catch (_) {
    const q = query(collection(getDb(), "works"), where("isPublic", "==", true), limit(max));
    const snap = await getDocs(q);
    return mapDocs(snap).sort((a, b) => timestampMs(b.timestamp) - timestampMs(a.timestamp));
  }
}

function sortWorksByTime(works) {
  return works.sort((a, b) => timestampMs(b.timestamp) - timestampMs(a.timestamp));
}

export async function fetchWorksByUser(uid, publicOnly = true) {
  if (publicOnly) {
    try {
      const q = query(
        collection(getDb(), "works"),
        where("userId", "==", uid),
        where("isPublic", "==", true),
        limit(40)
      );
      const snap = await getDocs(q);
      return sortWorksByTime(mapDocs(snap));
    } catch (_) {
      const q = query(collection(getDb(), "works"), where("isPublic", "==", true), limit(80));
      const snap = await getDocs(q);
      return sortWorksByTime(mapDocs(snap).filter((w) => w.userId === uid));
    }
  }

  const q = query(collection(getDb(), "works"), where("userId", "==", uid), limit(40));
  const snap = await getDocs(q);
  return sortWorksByTime(mapDocs(snap));
}

export async function fetchWork(workId) {
  const snap = await getDoc(doc(getDb(), "works", workId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchApplicationsForJob(jobId) {
  const q = query(collection(getDb(), "applications"), where("jobId", "==", jobId));
  const snap = await getDocs(q);
  return mapDocs(snap).sort((a, b) => timestampMs(b.timestamp) - timestampMs(a.timestamp));
}

export async function fetchMyApplicationForJob(jobId, workerId) {
  if (!jobId || !workerId) return null;
  try {
    const snap = await getDoc(doc(getDb(), "applications", `${jobId}_${workerId}`));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    if (error?.code === "permission-denied") return null;
    throw error;
  }
}

export async function fetchMyApplications(uid) {
  const [workerSnap, ownerSnap] = await Promise.all([
    getDocs(query(collection(getDb(), "applications"), where("workerId", "==", uid))),
    getDocs(query(collection(getDb(), "applications"), where("jobOwnerId", "==", uid))),
  ]);
  const merged = new Map();
  for (const d of [...workerSnap.docs, ...ownerSnap.docs]) {
    merged.set(d.id, { id: d.id, ...d.data() });
  }
  return [...merged.values()].sort((a, b) => timestampMs(b.timestamp) - timestampMs(a.timestamp));
}

export async function fetchApplication(appId) {
  const snap = await getDoc(doc(getDb(), "applications", appId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

function timestampMs(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (value?.seconds) return value.seconds * 1000;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export async function fetchUserProfile(uid, { viewerUid = null } = {}) {
  if (!uid) return null;
  const viewer = viewerUid ?? getAuthInstance().currentUser?.uid ?? null;
  const isOwn = Boolean(viewer && viewer === uid);

  if (isOwn) {
    const snap = await getDoc(doc(getDb(), "users", uid));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  }

  const pubSnap = await getDoc(doc(getDb(), publicProfilesCollection(), uid));
  if (pubSnap.exists()) {
    return { id: pubSnap.id, ...pubSnap.data() };
  }

  return null;
}

/** Dohvat vlasnika oglasa (isti tick kao Android PublicProfileCache.prefetch). */
export async function fetchOwnerProfilesForListings(items = []) {
  const uids = [...new Set(items.map((item) => item?.userId).filter(Boolean))].slice(0, 40);
  if (!uids.length) return {};
  const profiles = await Promise.all(
    uids.map((uid) => fetchUserProfile(uid).catch(() => null))
  );
  return Object.fromEntries(profiles.filter(Boolean).map((profile) => [profile.id, profile]));
}

export function isRateableRole(role) {
  return role === "majstor" || role === "kreator";
}

export async function fetchRatingsForUser(uid) {
  const snap = await getDocs(collection(getDb(), "users", uid, "ratings"));
  const ratings = snap.docs
    .map((d) => Number(d.data().rating))
    .filter((r) => r >= 1 && r <= 5);
  const count = ratings.length;
  const average = count ? ratings.reduce((sum, r) => sum + r, 0) / count : 0;
  return { average, count };
}

export async function fetchMyRatingForUser(profileUid, raterUid) {
  if (!profileUid || !raterUid) return 0;
  const snap = await getDoc(doc(getDb(), "users", profileUid, "ratings", raterUid));
  if (!snap.exists()) return 0;
  const rating = Number(snap.data().rating);
  return rating >= 1 && rating <= 5 ? rating : 0;
}

function publicUsersCollection() {
  return collection(getDb(), publicProfilesCollection());
}

export async function fetchUsersByCategory(category, city = null, role = null) {
  const roles = role ? [role] : ["majstor", "kreator"];
  const results = [];

  for (const roleItem of roles) {
    let q = query(
      publicUsersCollection(),
      where("role", "==", roleItem),
      where("category", "==", category),
      limit(40)
    );
    const snap = await getDocs(q);
    results.push(...mapDocs(snap));
  }

  const filtered = city
    ? results.filter((u) => (u.city || "").toLowerCase() === city.toLowerCase())
    : results;

  return filtered.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
}

export async function fetchOffers(max = 30) {
  const q = query(collection(getDb(), "offers"), orderBy("timestamp", "desc"), limit(max));
  const snap = await getDocs(q);
  return mapDocs(snap);
}

export async function fetchOffer(offerId) {
  const snap = await getDoc(doc(getDb(), "offers", offerId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

function cityMatches(userCity, filterCity) {
  return (userCity || "").trim().toLowerCase() === (filterCity || "").trim().toLowerCase();
}

function filterByCity(items, city, field = "city") {
  if (!city) return items;
  return items.filter((item) => cityMatches(item[field], city));
}

export async function fetchTopRated(city = null) {
  if (city) {
    const q = query(publicUsersCollection(), where("city", "==", city), limit(80));
    const snap = await getDocs(q);
    return mapDocs(snap)
      .filter(
        (u) =>
          (u.role === "majstor" || u.role === "kreator") &&
          ((u.ratingCount || 0) > 0 || (u.ratingAverage || 0) > 0)
      )
      .sort((a, b) => {
        const diff = (b.ratingAverage || 0) - (a.ratingAverage || 0);
        if (diff !== 0) return diff;
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      });
  }

  const q = query(
    publicUsersCollection(),
    where("ratingAverage", ">", 0),
    orderBy("ratingAverage", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return mapDocs(snap)
    .filter(
      (u) =>
        (u.role === "majstor" || u.role === "kreator") &&
        ((u.ratingCount || 0) > 0 || (u.ratingAverage || 0) > 0)
    )
    .sort((a, b) => {
      const diff = (b.ratingAverage || 0) - (a.ratingAverage || 0);
      if (diff !== 0) return diff;
      return (b.ratingCount || 0) - (a.ratingCount || 0);
    });
}

export async function fetchAvailableUsers(city = null) {
  if (city) {
    const q = query(
      publicUsersCollection(),
      where("role", "in", ["majstor", "kreator"]),
      where("status", "==", "slobodan"),
      where("city", "==", city),
      limit(50)
    );
    const snap = await getDocs(q);
    return mapDocs(snap);
  }

  const q = query(
    publicUsersCollection(),
    where("role", "in", ["majstor", "kreator"]),
    where("status", "==", "slobodan"),
    limit(50)
  );
  const snap = await getDocs(q);
  return mapDocs(snap);
}

export async function fetchUsersForSearch(searchText = "", city = null) {
  let users = city ? await fetchUsersInCity(city) : [];
  if (!city) {
    const q = query(
      publicUsersCollection(),
      where("role", "in", ["majstor", "kreator"]),
      limit(120)
    );
    const snap = await getDocs(q);
    users = mapDocs(snap);
  }

  const q = searchText.trim().toLowerCase();
  if (!q) return users;

  return users.filter((user) => {
    const parts = [
      user.displayName,
      user.occupation,
      user.city,
      user.category,
      user.role,
      user.description,
    ]
      .map((v) => String(v || "").toLowerCase())
      .join(" ");
    return parts.includes(q);
  });
}

export function filterJobsOrOffersByCity(items, city) {
  return filterByCity(items, city, "city");
}

export async function fetchHomeTips(max = 4) {
  const now = Date.now();
  try {
    const q = query(
      collection(getDb(), "home_master_tips"),
      where("expiresAtMs", ">", now),
      orderBy("expiresAtMs", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return mapTips(snap.docs, now);
  } catch (_) {
    const q = query(collection(getDb(), "home_master_tips"), limit(20));
    const snap = await getDocs(q);
    return mapTips(snap.docs, now).slice(0, max);
  }
}

export async function fetchMyHomeTip(uid) {
  const snap = await getDoc(doc(getDb(), "home_master_tips", `author_${uid}`));
  if (!snap.exists()) return null;
  const data = snap.data();
  if ((data.expiresAtMs || 0) <= Date.now()) return null;
  return { id: snap.id, ...data };
}

export async function fetchUnreadNotificationItems(uid) {
  const q = query(
    collection(getDb(), "notifications"),
    where("targetUid", "==", uid),
    where("isRead", "==", false)
  );
  const snap = await getDocs(q);
  return mapDocs(snap);
}

export async function fetchUnreadNotificationCount(uid) {
  const items = await fetchUnreadNotificationItems(uid);
  return items.length;
}

export async function fetchUnreadBellNotificationCount(uid) {
  const items = await fetchUnreadNotificationItems(uid);
  return items.filter((item) => !isJobNotificationType(item.type)).length;
}

export async function fetchUnreadPosloviNotificationCount(uid) {
  const items = await fetchUnreadNotificationItems(uid);
  return items.filter((item) => isJobNotificationType(item.type)).length;
}

export async function fetchNotifications(uid, max = 40) {
  const q = query(collection(getDb(), "notifications"), where("targetUid", "==", uid), limit(60));
  const snap = await getDocs(q);
  return mapDocs(snap)
    .sort((a, b) => timestampMs(b.timestamp) - timestampMs(a.timestamp))
    .slice(0, max);
}

export async function fetchMyJobsCount(uid) {
  const q = query(collection(getDb(), "jobs"), where("userId", "==", uid));
  const snap = await getCountFromServer(q);
  return snap.data().count || 0;
}

export async function fetchFollowingList(uid) {
  const snap = await getDocs(
    query(collection(getDb(), "users", uid, "following"), limit(48))
  );
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        targetUid: data.targetUid || d.id,
        targetRole: data.targetRole || "",
        displayName: data.targetDisplayName || "",
        occupation: data.targetOccupation || "",
        category: data.targetCategory || "",
        city: data.targetCity || "",
        status: data.targetStatus || "",
        profileImageUrlThumb: data.profileImageUrlThumb || "",
        followedAtMs: Number(data.followedAtMs) || 0,
      };
    })
    .sort((a, b) => b.followedAtMs - a.followedAtMs);
}

export async function fetchIsFollowing(viewerUid, targetUid) {
  if (!viewerUid || !targetUid) return false;
  const snap = await getDoc(doc(getDb(), "users", viewerUid, "following", targetUid));
  return snap.exists();
}

export async function fetchFollowerCount(uid) {
  if (!uid) return 0;
  try {
    const snap = await getCountFromServer(
      query(collection(getDb(), "users", uid, "followers"))
    );
    return snap.data().count || 0;
  } catch (_) {
    const snap = await getDocs(collection(getDb(), "users", uid, "followers"));
    return snap.size;
  }
}

export async function fetchPublicWorksByUserIds(userIds, max = 12) {
  const ids = [...new Set((userIds || []).filter(Boolean))].slice(0, 10);
  if (!ids.length) return [];
  const q = query(
    collection(getDb(), "works"),
    where("isPublic", "==", true),
    where("userId", "in", ids),
    limit(max)
  );
  const snap = await getDocs(q);
  return mapDocs(snap).sort((a, b) => timestampMs(b.timestamp) - timestampMs(a.timestamp));
}

function mapTips(docs, now) {
  const seen = new Set();
  const tips = [];
  for (const d of docs) {
    const data = d.data();
    if ((data.expiresAtMs || 0) <= now) continue;
    const authorUid = data.authorUid || "";
    if (authorUid && seen.has(authorUid)) continue;
    if (authorUid) seen.add(authorUid);
    const createdMs = data.createdAtMs || timestampMs(data.createdAt);
    tips.push({
      id: d.id,
      title: data.title || "",
      teaser: data.teaser || "",
      body: data.body || "",
      authorUid,
      authorDisplayName: data.authorDisplayName || "",
      isFresh: now - createdMs < 48 * 60 * 60 * 1000,
    });
    if (tips.length >= 4) break;
  }
  return tips;
}

export async function fetchUsersInCity(city = null) {
  if (!city) {
    const q = query(
      publicUsersCollection(),
      where("role", "in", ["majstor", "kreator"]),
      limit(50)
    );
    const snap = await getDocs(q);
    return mapDocs(snap);
  }
  const q = query(
    publicUsersCollection(),
    where("role", "in", ["majstor", "kreator"]),
    where("city", "==", city),
    limit(50)
  );
  const snap = await getDocs(q);
  return mapDocs(snap);
}

export async function fetchFastMatchPool() {
  const majQ = query(publicUsersCollection(), where("role", "==", "majstor"), limit(100));
  const kreQ = query(publicUsersCollection(), where("role", "==", "kreator"), limit(100));
  const [majSnap, kreSnap] = await Promise.all([getDocs(majQ), getDocs(kreQ)]);
  return [...mapDocs(majSnap), ...mapDocs(kreSnap)];
}

function normalizeCategory(user) {
  return (user.category || user.occupation || "Ostalo").trim();
}

function fastScore(user) {
  const rating = Number(user.ratingAverage) || 0;
  const count = Number(user.ratingCount) || 0;
  const works = Number(user.worksCount) || 0;
  const publicWorks = Number(user.publicWorksCount) || 0;
  const reputation = Number(user.fastReputationScore) || 0;
  const available = user.status === "slobodan" ? 2 : 0;
  return available + rating * 2 + Math.min(count, 20) * 0.05 + works * 0.1 + publicWorks * 0.15 + reputation;
}

export function pickFastCandidates(users, city = null) {
  let pool = users.filter((u) => u.status === "slobodan");
  if (city) {
    pool = pool.filter((u) => (u.city || "").toLowerCase() === city.toLowerCase());
  }

  const majstori = pool.filter((u) => u.role === "majstor").sort((a, b) => fastScore(b) - fastScore(a));
  const kreatori = pool.filter((u) => u.role === "kreator").sort((a, b) => fastScore(b) - fastScore(a));

  const picked = [];
  const usedCategories = new Set();

  if (majstori[0]) {
    picked.push(majstori[0]);
    usedCategories.add(normalizeCategory(majstori[0]));
  }
  if (kreatori[0]) {
    picked.push(kreatori[0]);
    usedCategories.add(normalizeCategory(kreatori[0]));
  }

  const rest = [...majstori.slice(1), ...kreatori.slice(1)].sort((a, b) => fastScore(b) - fastScore(a));
  for (const user of rest) {
    if (picked.length >= 3) break;
    const cat = normalizeCategory(user);
    if (usedCategories.has(cat)) continue;
    picked.push(user);
    usedCategories.add(cat);
  }

  return picked;
}

export async function fetchVerificationRequest(uid) {
  const snap = await getDoc(doc(getDb(), "verification_requests", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchBlockedUsersForUser(uid) {
  const q = query(collection(getDb(), "blocked_users"), where("blockerUid", "==", uid), limit(50));
  const snap = await getDocs(q);
  return mapDocs(snap);
}

export async function fetchBlockStatus(myUid, otherUid) {
  if (!myUid || !otherUid) return { iBlocked: false, theyBlocked: false };
  const [mine, theirs] = await Promise.all([
    getDoc(doc(getDb(), "blocked_users", `${myUid}_${otherUid}`)),
    getDoc(doc(getDb(), "blocked_users", `${otherUid}_${myUid}`)),
  ]);
  return { iBlocked: mine.exists(), theyBlocked: theirs.exists() };
}

export async function fetchModerationConfig() {
  const snap = await getDoc(doc(getDb(), "app_public", "moderation"));
  if (!snap.exists()) return null;
  const words = snap.data()?.bannedWords;
  return Array.isArray(words) ? words : null;
}

export async function fetchOpenReports(max = 30) {
  try {
    const q = query(
      collection(getDb(), "reports"),
      where("status", "==", "open"),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return mapDocs(snap);
  } catch (_) {
    const snap = await getDocs(query(collection(getDb(), "reports"), where("status", "==", "open"), limit(max)));
    return mapDocs(snap).sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt));
  }
}

export async function fetchOwnBanRecord(uid) {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(getDb(), "banned_users", uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch {
    return null;
  }
}

export async function fetchBannedUsersAdmin(max = 50) {
  const snap = await getDocs(query(collection(getDb(), "banned_users"), limit(max)));
  return mapDocs(snap);
}
