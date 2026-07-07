import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getDb } from "./firebaseService.js";

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

export async function fetchWorksByUser(uid, publicOnly = true) {
  let q = query(collection(getDb(), "works"), where("userId", "==", uid), limit(40));
  const snap = await getDocs(q);
  let works = mapDocs(snap);
  if (publicOnly) works = works.filter((w) => w.isPublic === true);
  return works.sort((a, b) => timestampMs(b.timestamp) - timestampMs(a.timestamp));
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
  const q = query(
    collection(getDb(), "applications"),
    where("jobId", "==", jobId),
    where("workerId", "==", workerId),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.docs[0] ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
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

export async function fetchUserProfile(uid) {
  const snap = await getDoc(doc(getDb(), "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchUsersByCategory(category, city = null) {
  const roles = ["majstor", "kreator"];
  const results = [];

  for (const role of roles) {
    let q = query(
      collection(getDb(), "users"),
      where("role", "==", role),
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

export async function fetchTopRated(city = null) {
  const q = query(
    collection(getDb(), "users"),
    where("ratingAverage", ">", 0),
    orderBy("ratingAverage", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  let users = mapDocs(snap).filter((u) => (u.ratingCount || 0) > 0 || (u.ratingAverage || 0) > 0);
  if (city) {
    users = users.filter((u) => (u.city || "").toLowerCase() === city.toLowerCase());
  }
  return users.sort((a, b) => {
    const diff = (b.ratingAverage || 0) - (a.ratingAverage || 0);
    if (diff !== 0) return diff;
    return (b.ratingCount || 0) - (a.ratingCount || 0);
  });
}

export async function fetchAvailableUsers(city = null) {
  const q = query(
    collection(getDb(), "users"),
    where("role", "in", ["majstor", "kreator"]),
    where("status", "==", "slobodan"),
    limit(50)
  );
  const snap = await getDocs(q);
  let users = mapDocs(snap);
  if (city) {
    users = users.filter((u) => (u.city || "").toLowerCase() === city.toLowerCase());
  }
  return users;
}

export async function fetchUsersInCity(city = null) {
  if (!city) {
    const q = query(
      collection(getDb(), "users"),
      where("role", "in", ["majstor", "kreator"]),
      limit(50)
    );
    const snap = await getDocs(q);
    return mapDocs(snap);
  }
  const q = query(
    collection(getDb(), "users"),
    where("role", "in", ["majstor", "kreator"]),
    where("city", "==", city),
    limit(50)
  );
  const snap = await getDocs(q);
  return mapDocs(snap);
}

export async function fetchFastMatchPool() {
  const majQ = query(collection(getDb(), "users"), where("role", "==", "majstor"), limit(100));
  const kreQ = query(collection(getDb(), "users"), where("role", "==", "kreator"), limit(100));
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
