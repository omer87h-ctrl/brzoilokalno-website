import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { deleteObject, getStorage, ref as storageRef } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { firebaseConfig } from "../firebase.js";
import { getDb, getAuthInstance, needsEmailVerification } from "./firebaseService.js";
import { isJobNotificationType } from "../constants/notifications.js";
import { normalizeSpaces } from "../utils/textInputValidation.js";
import { representationPayload, validateRepresentation } from "../utils/representation.js";
import { syncPublicProfile } from "./publicProfile.js";

const HOME_TIPS = "home_master_tips";
const TIP_TTL_MS = 24 * 60 * 60 * 1000;

function assertEmailVerified(authUser) {
  const user = authUser || getAuthInstance().currentUser;
  if (needsEmailVerification(user)) {
    throw new Error(
      "Potvrdi email prije ove radnje. Otvori poštu, klikni link za verifikaciju, pa «Provjeri potvrdu»."
    );
  }
}

function authorMetaFromProfile(profile) {
  const meta = {};
  if (profile?.profileImageUrlThumb) {
    meta.userProfileImageUrlThumb = profile.profileImageUrlThumb;
    meta.ownerProfileImageUrlThumb = profile.profileImageUrlThumb;
    meta.profileImageUrlThumb = profile.profileImageUrlThumb;
  }
  if (profile?.profileImageVersionMs) {
    meta.userProfileImageVersionMs = profile.profileImageVersionMs;
    meta.ownerProfileImageVersionMs = profile.profileImageVersionMs;
    meta.profileImageVersionMs = profile.profileImageVersionMs;
  }
  if (profile?.profileVerified) {
    meta.profileVerified = true;
    meta.ownerProfileVerified = true;
    meta.authorProfileVerified = true;
  }
  return meta;
}

async function createNotification(payload) {
  try {
    await addDoc(collection(getDb(), "notifications"), {
      ...payload,
      isRead: false,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.warn("Notification write failed:", error);
  }
}

export async function updateUserProfile(uid, data) {
  const payload = {
    displayName: normalizeSpaces(data.displayName),
    city: normalizeSpaces(data.city),
    description: normalizeSpaces(data.description),
    contactPhone: String(data.contactPhone || "").trim(),
    preferInAppChat: data.preferInAppChat === true,
    allowPhoneCall: data.preferInAppChat ? false : data.allowPhoneCall !== false,
    allowWhatsApp: data.preferInAppChat ? false : data.allowWhatsApp !== false,
  };
  if (data.role === "majstor" || data.role === "kreator") {
    payload.status = data.status === "zauzet" ? "zauzet" : "slobodan";
    payload.category = normalizeSpaces(data.category);
    payload.occupation = normalizeSpaces(data.occupation);
  }
  if (data.representationType) {
    const repErr = validateRepresentation(data);
    if (repErr) throw new Error(repErr);
    Object.assign(
      payload,
      representationPayload(data, { serverTimestamp, deleteField }),
    );
  }
  await setDoc(doc(getDb(), "users", uid), payload, { merge: true });
  const snap = await getDoc(doc(getDb(), "users", uid));
  if (snap.exists()) {
    try {
      await syncPublicProfile(uid, snap.data());
    } catch (error) {
      console.warn("public_profiles sync failed after profile update:", error);
    }
  }
  // Ime na postojećim poslovima, ponudama i radovima — inače kartice ostaju stare.
  const newName = payload.displayName;
  if (newName) {
    await Promise.allSettled([
      rewriteOwnedListingNames(uid, "jobs", { authorName: newName, displayName: newName }),
      rewriteOwnedListingNames(uid, "offers", { authorName: newName, displayName: newName }),
      rewriteOwnedListingNames(uid, "works", { ownerDisplayName: newName }),
    ]);
  }
}

/** Ažurira denormalizovana imena na dokumentima koje je korisnik objavio. */
async function rewriteOwnedListingNames(uid, collectionName, fields) {
  const snap = await getDocs(
    query(collection(getDb(), collectionName), where("userId", "==", uid), limit(100)),
  );
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, fields).catch(() => null)));
}

export async function createJob({ profile, authUser, fields }) {
  assertEmailVerified(authUser);
  const uid = authUser.uid;
  const safeProfile = profile || {};
  const when = normalizeSpaces(fields.whenNeeded);
  const payload = {
    title: normalizeSpaces(fields.title),
    description: normalizeSpaces(fields.description),
    category: normalizeSpaces(fields.category),
    city: normalizeSpaces(fields.city),
    budget: normalizeSpaces(fields.budget),
    whenNeeded: when,
    neededWhen: when,
    userId: uid,
    ownerId: uid,
    jobOwnerId: uid,
    authorName: safeProfile.displayName || authUser.displayName || "Korisnik",
    timestamp: Timestamp.now(),
    ...authorMetaFromProfile(safeProfile),
  };
  if (safeProfile.preferInAppChat) payload.preferInAppChat = true;
  if (fields.contactPhone?.trim()) payload.contactPhone = fields.contactPhone.trim();
  return addDoc(collection(getDb(), "jobs"), payload);
}

export async function createOffer({ profile, authUser, fields }) {
  assertEmailVerified(authUser);
  const uid = authUser.uid;
  const safeProfile = profile || {};
  const payload = {
    title: normalizeSpaces(fields.title),
    description: normalizeSpaces(fields.description),
    category: normalizeSpaces(fields.category),
    city: normalizeSpaces(fields.city),
    budget: normalizeSpaces(fields.budget),
    availableWhen: normalizeSpaces(fields.availableWhen),
    userId: uid,
    authorName: safeProfile.displayName || authUser.displayName || "Korisnik",
    authorRole: safeProfile.role || "",
    timestamp: Timestamp.now(),
    ...authorMetaFromProfile(safeProfile),
  };
  if (safeProfile.preferInAppChat) payload.preferInAppChat = true;
  if (fields.contactPhone?.trim()) payload.contactPhone = fields.contactPhone.trim();
  return addDoc(collection(getDb(), "offers"), payload);
}

export async function saveHomeTip({ uid, displayName, title, teaser, body, existingId = null }) {
  const nowMs = Date.now();
  const docId = existingId || `author_${uid}`;
  const dayKey = new Date().toISOString().slice(0, 10);
  const payload = {
    title: normalizeSpaces(title),
    teaser: normalizeSpaces(teaser),
    body: normalizeSpaces(body),
    authorUid: uid,
    authorDisplayName: normalizeSpaces(displayName),
    dayKey,
    expiresAtMs: nowMs + TIP_TTL_MS,
    updatedAtMs: nowMs,
  };
  if (!existingId) {
    payload.createdAt = serverTimestamp();
    payload.createdAtMs = nowMs;
  }
  await setDoc(doc(getDb(), HOME_TIPS, docId), payload, { merge: true });
  return docId;
}

export async function deleteHomeTip(tipId) {
  await deleteDoc(doc(getDb(), HOME_TIPS, tipId));
}

export async function markNotificationsRead(uid) {
  const q = query(
    collection(getDb(), "notifications"),
    where("targetUid", "==", uid),
    where("isRead", "==", false)
  );
  const snap = await getDocs(q);
  if (!snap.docs.length) return;
  const batch = writeBatch(getDb());
  snap.docs.forEach((d) => batch.update(d.ref, { isRead: true }));
  await batch.commit();
}

export async function markBellNotificationsRead(uid) {
  const q = query(
    collection(getDb(), "notifications"),
    where("targetUid", "==", uid),
    where("isRead", "==", false)
  );
  const snap = await getDocs(q);
  const bellDocs = snap.docs.filter((d) => !isJobNotificationType(d.data()?.type));
  if (!bellDocs.length) return;
  const batch = writeBatch(getDb());
  bellDocs.forEach((d) => batch.update(d.ref, { isRead: true }));
  await batch.commit();
}

export async function markJobNotificationsRead(uid) {
  const q = query(
    collection(getDb(), "notifications"),
    where("targetUid", "==", uid),
    where("isRead", "==", false)
  );
  const snap = await getDocs(q);
  const jobDocs = snap.docs.filter((d) => isJobNotificationType(d.data()?.type));
  if (!jobDocs.length) return;
  const batch = writeBatch(getDb());
  jobDocs.forEach((d) => batch.update(d.ref, { isRead: true }));
  await batch.commit();
}

export async function applyToJob({ job, profile, authUser }) {
  assertEmailVerified(authUser);
  const workerId = authUser.uid;
  const safeProfile = profile || {};
  const appDocId = `${job.id}_${workerId}`;
  const ref = doc(getDb(), "applications", appDocId);
  let existing = null;
  try {
    const existingSnap = await getDoc(ref);
    if (existingSnap.exists()) existing = existingSnap.data();
  } catch (error) {
    if (error?.code !== "permission-denied") throw error;
  }
  if (existing) {
    const err = new Error("Već si prijavljen na ovaj posao.");
    err.code = "already-applied";
    throw err;
  }

  const appData = {
    jobId: job.id,
    jobOwnerId: job.userId || job.ownerId || job.jobOwnerId || "",
    workerId,
    workerName: safeProfile.displayName || authUser.displayName || "Korisnik",
    status: "pending",
    timestamp: serverTimestamp(),
  };

  if (safeProfile.role) appData.workerRole = safeProfile.role;
  if (safeProfile.city) appData.workerCity = safeProfile.city;
  if (safeProfile.category) appData.workerCategory = safeProfile.category;
  else if (safeProfile.occupation) appData.workerOccupation = safeProfile.occupation;
  if (safeProfile.status) appData.workerStatus = safeProfile.status;
  if (safeProfile.description) appData.workerDescription = safeProfile.description;
  if (safeProfile.contactPhone) appData.workerContactPhone = safeProfile.contactPhone;
  if (safeProfile.preferInAppChat === true) appData.workerPreferInAppChat = true;
  if (safeProfile.allowPhoneCall === false) appData.workerAllowPhoneCall = false;
  if (safeProfile.allowWhatsApp === false) appData.workerAllowWhatsApp = false;
  if (safeProfile.profileImageUrlThumb) appData.workerProfileImageUrlThumb = safeProfile.profileImageUrlThumb;
  if (safeProfile.profileImageVersionMs) appData.workerProfileImageVersionMs = safeProfile.profileImageVersionMs;
  if (safeProfile.profileVerified === true) appData.workerProfileVerified = true;

  await setDoc(ref, appData);
  const ownerUid = job.userId || job.ownerId || job.jobOwnerId;
  if (ownerUid) {
    await createNotification({
      targetUid: ownerUid,
      type: "new_application",
      jobId: job.id,
      applicationId: appDocId,
      actorName: appData.workerName,
    });
  }
  return ref;
}

export async function updateApplicationStatus(appId, status, context = {}) {
  assertEmailVerified();
  await updateDoc(doc(getDb(), "applications", appId), { status });
  const { workerUid, jobOwnerUid, jobId, jobTitle, currentUid } = context;
  if (status === "accepted" || status === "rejected") {
    if (workerUid) {
      await createNotification({
        targetUid: workerUid,
        type: status === "accepted" ? "application_accepted" : "application_rejected",
        jobId,
        applicationId: appId,
        actorName: jobTitle || "",
      });
    }
  } else if (status === "completed") {
    const target = currentUid === jobOwnerUid ? workerUid : jobOwnerUid;
    if (target) {
      await createNotification({
        targetUid: target,
        type: "job_completed",
        jobId,
        applicationId: appId,
        actorName: jobTitle || "",
      });
    }
  }
}

export async function updateUserStatus(uid, status) {
  const next = status === "zauzet" ? "zauzet" : "slobodan";
  await setDoc(doc(getDb(), "users", uid), { status: next }, { merge: true });
  const snap = await getDoc(doc(getDb(), "users", uid));
  if (snap.exists()) {
    try {
      await syncPublicProfile(uid, snap.data());
    } catch (error) {
      console.warn("public_profiles sync failed after status update:", error);
    }
  }
  return next;
}

export async function deleteChatMessage(messageId) {
  if (!messageId) throw new Error("Poruka nije pronađena.");
  await deleteDoc(doc(getDb(), "messages", messageId));
}

export async function sendChatMessage({ text, sender, receiverId, jobId, applicationId, replyTo = null }) {
  assertEmailVerified();
  const payload = {
    text,
    senderId: sender.uid,
    senderEmail: sender.email || "",
    senderName: sender.displayName || sender.email || "",
    receiverId,
    memberIds: [sender.uid, receiverId],
    jobId,
    applicationId,
    clientCreatedAt: Date.now(),
    timestamp: serverTimestamp(),
  };
  if (replyTo?.messageId) {
    payload.replyToMessageId = replyTo.messageId;
    payload.replyToText = String(replyTo.previewText || "").trim().slice(0, 400);
    if (replyTo.authorLabel) {
      payload.replyToSenderLabel = String(replyTo.authorLabel).trim().slice(0, 80);
    }
  }

  const ref = await addDoc(collection(getDb(), "messages"), payload);
  await updateDoc(doc(getDb(), "applications", applicationId), {
    [`unreadCounts.${receiverId}`]: increment(1),
  });
  return ref.id;
}

export async function clearMyUnread(appId, uid) {
  await updateDoc(doc(getDb(), "applications", appId), {
    [`unreadCounts.${uid}`]: 0,
  });
}

export async function createWork({ profile, authUser, description, imageUrls, paths }) {
  assertEmailVerified(authUser);
  const uid = authUser.uid;
  const payload = {
    userId: uid,
    ownerId: uid,
    ownerDisplayName: normalizeSpaces(profile?.displayName || authUser.displayName || ""),
    ownerRole: profile?.role || "",
    description: normalizeSpaces(description),
    imageUrl: imageUrls.urlFull,
    imagePath: paths.pathFull,
    imageUrlFull: imageUrls.urlFull,
    imagePathFull: paths.pathFull,
    imageUrlThumb: imageUrls.urlThumb,
    imagePathThumb: paths.pathThumb,
    isPublic: false,
    timestamp: Timestamp.now(),
  };

  if (profile?.profileImageUrlThumb) {
    payload.ownerProfileImageUrlThumb = profile.profileImageUrlThumb;
    payload.ownerProfileImageUrlFull = profile.profileImageUrlFull || "";
  }

  return addDoc(collection(getDb(), "works"), payload);
}

export async function updateWorkPublic(workId, isPublic) {
  await updateDoc(doc(getDb(), "works", workId), { isPublic: isPublic === true });
}

export async function deleteWork(workId) {
  await deleteDoc(doc(getDb(), "works", workId));
}

export async function deleteJob(jobId) {
  await deleteDoc(doc(getDb(), "jobs", jobId));
}

export async function deleteOffer(offerId) {
  await deleteDoc(doc(getDb(), "offers", offerId));
}

export async function setFollowing({ followerUid, viewerRole, profile, follow }) {
  const viewer = String(followerUid || "").trim();
  const targetUid = String(profile?.id || profile?.uid || "").trim();
  if (!viewer || !targetUid || viewer === targetUid) {
    throw new Error("invalid follow");
  }
  if (viewerRole !== "korisnik") {
    throw new Error("role cannot follow");
  }
  const role = profile?.role === "majstor" || profile?.role === "kreator" ? profile.role : null;
  if (!role) throw new Error("not followable");

  const db = getDb();
  const followingRef = doc(db, "users", viewer, "following", targetUid);
  const mirrorRef = doc(db, "users", targetUid, "followers", viewer);

  if (!follow) {
    const batch = writeBatch(db);
    batch.delete(followingRef);
    batch.delete(mirrorRef);
    await batch.commit();
    return false;
  }

  const followedAtMs = Date.now();
  const payload = {
    targetUid,
    targetRole: role,
    targetDisplayName: String(profile.displayName || "").slice(0, 60),
    targetOccupation: String(profile.occupation || "").slice(0, 48),
    targetCategory: String(profile.category || "").slice(0, 64),
    targetCity: String(profile.city || "").slice(0, 40),
    targetStatus: String(profile.status || "").slice(0, 32),
    profileImageUrlThumb: String(profile.profileImageUrlThumb || "").slice(0, 2048),
    followedAtMs,
  };
  const batch = writeBatch(db);
  batch.set(followingRef, payload, { merge: true });
  batch.set(mirrorRef, { followedAtMs }, { merge: true });
  await batch.commit();
  return true;
}

export async function submitRating({ profileUid, raterUid, rating }) {
  const value = Math.max(1, Math.min(5, Math.round(Number(rating) || 0)));
  await setDoc(
    doc(getDb(), "users", profileUid, "ratings", raterUid),
    {
      rating: value,
      raterUid,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
  return value;
}

async function deleteDocsFromQuery(q) {
  const snap = await getDocs(q);
  if (!snap.docs.length) return;
  const db = getDb();
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = writeBatch(db);
    snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

async function submitContentReport({
  reporterUid,
  reporterName,
  reporterEmail,
  contentCollection,
  contentId,
  ownerUid,
  ownerName,
  ownerEmail,
  sourceScreen,
  targetType,
  reason,
  details,
  reportedContent,
}) {
  if (!contentId || !ownerUid) {
    throw new Error("Nedostaju podaci o sadržaju.");
  }
  const reportData = {
    reporterUid,
    reporterName,
    reporterEmail,
    targetType,
    targetId: ownerUid,
    targetUserId: ownerUid,
    targetUserName: ownerName || "Korisnik",
    targetUserEmail: ownerEmail || "",
    sourceScreen,
    reason,
    details: normalizeSpaces(details || ""),
    reportedContent: String(reportedContent || "").slice(0, 500),
    contentCollection,
    contentId,
    status: "open",
    createdAt: serverTimestamp(),
  };
  if (contentCollection === "jobs") reportData.jobId = contentId;
  await addDoc(collection(getDb(), "reports"), reportData);
}

export async function submitJobReport({ reporter, job, reason, details }) {
  const title = job.title || "";
  const description = job.description || "";
  const category = job.category || "";
  const city = job.city || "";
  const reportedContent = [
    title ? `Naslov: ${title}` : "",
    description ? `Opis: ${description.slice(0, 400)}` : "",
    category ? `Kategorija: ${category}` : "",
    city ? `Grad: ${city}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const ownerName =
    job.authorName ||
    job.displayName ||
    String(job.userEmail || "").split("@")[0] ||
    "Korisnik";

  return submitContentReport({
    reporterUid: reporter.uid,
    reporterName: reporter.displayName || reporter.email || "Korisnik",
    reporterEmail: reporter.email || "",
    contentCollection: "jobs",
    contentId: job.id,
    ownerUid: job.userId || "",
    ownerName,
    ownerEmail: job.userEmail || "",
    sourceScreen: "job",
    targetType: "job",
    reason,
    details,
    reportedContent,
  });
}

export async function submitWorkReport({ reporter, work, ownerName, reason, details }) {
  const ownerUid = work.userId || work.ownerId || "";
  const description = work.description || "";
  return submitContentReport({
    reporterUid: reporter.uid,
    reporterName: reporter.displayName || reporter.email || "Korisnik",
    reporterEmail: reporter.email || "",
    contentCollection: "works",
    contentId: work.id,
    ownerUid,
    ownerName: ownerName || "Korisnik",
    ownerEmail: work.ownerEmail || "",
    sourceScreen: "work",
    targetType: "work",
    reason,
    details,
    reportedContent: description.slice(0, 500),
  });
}

export async function submitTipReport({ reporter, tip, reason, details }) {
  const title = tip.title || "";
  const body = tip.body || tip.teaser || "";
  const reportedContent = [title ? `Naslov: ${title}` : "", body ? body.slice(0, 400) : ""]
    .filter(Boolean)
    .join("\n");

  return submitContentReport({
    reporterUid: reporter.uid,
    reporterName: reporter.displayName || reporter.email || "Korisnik",
    reporterEmail: reporter.email || "",
    contentCollection: "home_master_tips",
    contentId: tip.id,
    ownerUid: tip.authorUid || "",
    ownerName: tip.authorDisplayName || "Korisnik",
    ownerEmail: "",
    sourceScreen: "tip",
    targetType: "tip",
    reason,
    details,
    reportedContent,
  });
}

export async function submitVerificationRequest({ uid, profile, email }) {
  await setDoc(
    doc(getDb(), "verification_requests", uid),
    {
      userId: uid,
      displayName: profile?.displayName || "",
      email: email || profile?.email || "",
      role: profile?.role || "",
      city: profile?.city || "",
      status: "pending",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function blockUser({ blockerUid, blockedUid, blockedName, blockedEmail, jobId, appId }) {
  await setDoc(doc(getDb(), "blocked_users", `${blockerUid}_${blockedUid}`), {
    blockerUid,
    blockedUid,
    blockedUserName: String(blockedName || "").slice(0, 60),
    blockedUserEmail: String(blockedEmail || "").slice(0, 320),
    jobId: jobId || "",
    appId: appId || "",
    source: "chat",
    createdAt: Timestamp.now(),
  });
}

export async function unblockUser(blockerUid, blockedUid) {
  await deleteDoc(doc(getDb(), "blocked_users", `${blockerUid}_${blockedUid}`));
}

export async function submitChatUserReport({ reporter, target, jobId, appId, reason, details, reportedContent }) {
  await addDoc(collection(getDb(), "reports"), {
    reporterUid: reporter.uid,
    reporterName: reporter.displayName || reporter.email || "Korisnik",
    reporterEmail: reporter.email || "",
    targetType: "user",
    targetId: target.uid,
    targetUserId: target.uid,
    targetUserName: target.name || "Korisnik",
    targetUserEmail: target.email || "",
    sourceScreen: "chat",
    reason,
    details: normalizeSpaces(details || ""),
    reportedContent: String(reportedContent || "").slice(0, 500),
    jobId: jobId || "",
    applicationId: appId || "",
    appId: appId || "",
    status: "open",
    createdAt: serverTimestamp(),
  });
}

export async function submitFastMatchFeedback({ uid, voterName, choice, comment, suggested }) {
  try {
    await addDoc(collection(getDb(), "fast_match_feedback"), {
      choice,
      helped: choice === "pomoglo",
      comment: String(comment || "").slice(0, 180),
      source: "fast:mk",
      createdAt: serverTimestamp(),
      userId: uid,
      suggestedUid: suggested?.id || "",
      suggestedName: suggested?.displayName || "",
      suggestedRatingAverage: Number(suggested?.ratingAverage) || 0,
      suggestedRatingCount: Number(suggested?.ratingCount) || 0,
    });
  } catch (error) {
    await addDoc(collection(getDb(), "reports"), {
      reporterUid: uid,
      reporterName: voterName || "Korisnik",
      reporterEmail: "",
      targetType: "fast_feedback",
      targetId: suggested?.id || uid,
      targetUserId: suggested?.id || "",
      targetUserName: suggested?.displayName || "",
      targetUserEmail: "",
      sourceScreen: "fast:mk",
      reason: choice,
      details: String(comment || "").slice(0, 500),
      reportedContent: "",
      status: "open",
      createdAt: serverTimestamp(),
    });
  }
}

export async function resolveReport(reportId, adminUid, adminNote = "") {
  await updateDoc(doc(getDb(), "reports", reportId), {
    status: "resolved",
    resolvedAt: serverTimestamp(),
    resolvedByUid: adminUid,
    adminNote: adminNote || "",
  });
}

export async function dismissReport(reportId, adminUid) {
  await updateDoc(doc(getDb(), "reports", reportId), {
    status: "dismissed",
    resolvedAt: serverTimestamp(),
    resolvedByUid: adminUid,
    adminNote: "dismissed",
  });
}

export async function adminBanUser({ targetUid, name, email, reason, adminUid, sourceReportId }) {
  await setDoc(doc(getDb(), "banned_users", targetUid), {
    uid: targetUid,
    name: name || "",
    email: email || "",
    reason: reason || "",
    bannedByUid: adminUid,
    sourceReportId: sourceReportId || "",
    createdAt: serverTimestamp(),
  });
}

/** Privremeno ograničenje — isti zapis kao ban, plus until (pravila + PWA sesija poštuju). */
export async function adminRestrictUser({
  targetUid,
  name,
  email,
  reason,
  adminUid,
  sourceReportId,
  days = 7,
}) {
  const untilMs = Date.now() + Math.max(1, Number(days) || 7) * 24 * 60 * 60 * 1000;
  await setDoc(doc(getDb(), "banned_users", targetUid), {
    uid: targetUid,
    name: name || "",
    email: email || "",
    reason: reason || "",
    bannedByUid: adminUid,
    sourceReportId: sourceReportId || "",
    createdAt: serverTimestamp(),
    until: Timestamp.fromMillis(untilMs),
  });
}

export async function adminUnbanUser(targetUid) {
  await deleteDoc(doc(getDb(), "banned_users", targetUid));
}

export async function adminDeleteReportedContent(collectionName, contentId) {
  if (!collectionName || !contentId) throw new Error("Nedostaje sadržaj.");
  await deleteDoc(doc(getDb(), collectionName, contentId));
}

function getStorageInstance() {
  try {
    return getStorage(getApp(), firebaseConfig.storageBucket);
  } catch (_) {
    return getStorage(initializeApp(firebaseConfig), firebaseConfig.storageBucket);
  }
}

async function deleteStorageBestEffort(paths = [], urls = []) {
  const storage = getStorageInstance();
  await Promise.allSettled([
    ...[...new Set(paths.filter(Boolean))].map((path) => deleteObject(storageRef(storage, path))),
    // Modular SDK: ref(storage, httpsDownloadUrl) resolves URL (no separate refFromURL export).
    ...[...new Set(urls.filter(Boolean))].map((url) => {
      try {
        return deleteObject(storageRef(storage, url));
      } catch (_) {
        return Promise.resolve();
      }
    }),
  ]);
}

async function deleteDocsBestEffort(q) {
  try {
    await deleteDocsFromQuery(q);
  } catch (error) {
    console.warn("Account deletion query failed (best-effort):", error);
  }
}

export async function deleteAccountData(uid) {
  const db = getDb();
  const userSnap = await getDoc(doc(db, "users", uid));
  const userData = userSnap.exists() ? userSnap.data() : {};
  const profilePaths = [
    userData.profileImagePathThumb,
    userData.profileImagePathFull,
  ].filter(Boolean);
  const profileUrls = [
    userData.profileImageUrlThumb,
    userData.profileImageUrlFull,
    userData.photoUrl,
  ].filter(Boolean);

  const worksSnap = await getDocs(query(collection(db, "works"), where("userId", "==", uid)));
  const workPaths = worksSnap.docs.flatMap((d) => {
    const data = d.data() || {};
    return [data.imagePathThumb, data.imagePathFull, data.imagePath].filter(Boolean);
  });
  const workUrls = worksSnap.docs.flatMap((d) => {
    const data = d.data() || {};
    return [data.imageUrlThumb, data.imageUrlFull, data.imageUrl].filter(Boolean);
  });

  const jobsSnap = await getDocs(query(collection(db, "jobs"), where("userId", "==", uid)));
  const jobIds = jobsSnap.docs.map((d) => d.id);

  await deleteStorageBestEffort([...profilePaths, ...workPaths], [...profileUrls, ...workUrls]);

  await Promise.all([
    deleteDocsBestEffort(query(collection(db, "works"), where("userId", "==", uid))),
    deleteDocsBestEffort(query(collection(db, "jobs"), where("userId", "==", uid))),
    deleteDocsBestEffort(query(collection(db, "offers"), where("userId", "==", uid))),
    deleteDocsBestEffort(query(collection(db, "applications"), where("workerId", "==", uid))),
    deleteDocsBestEffort(query(collection(db, "applications"), where("jobOwnerId", "==", uid))),
    deleteDocsBestEffort(query(collection(db, "notifications"), where("targetUid", "==", uid))),
    deleteDocsBestEffort(query(collection(db, "messages"), where("senderId", "==", uid))),
    deleteDocsBestEffort(query(collection(db, "messages"), where("receiverId", "==", uid))),
    deleteDocsBestEffort(query(collection(db, "blocked_users"), where("blockerUid", "==", uid))),
    deleteDocsBestEffort(query(collection(db, "blocked_users"), where("blockedUid", "==", uid))),
    deleteDocsBestEffort(query(collection(db, "reports"), where("reporterUid", "==", uid))),
    deleteDocsBestEffort(query(collection(db, HOME_TIPS), where("authorUid", "==", uid))),
  ]);

  await Promise.all(
    jobIds.map((jobId) =>
      deleteDocsBestEffort(query(collection(db, "applications"), where("jobId", "==", jobId))),
    ),
  );

  try {
    await deleteDocsFromQuery(
      query(collectionGroup(db, "ratings"), where("raterUid", "==", uid), limit(200)),
    );
  } catch (error) {
    console.warn("Outgoing ratings deletion skipped:", error);
  }

  try {
    await deleteDoc(doc(db, "verification_requests", uid));
  } catch (_) {}
  try {
    await deleteDoc(doc(db, HOME_TIPS, `author_${uid}`));
  } catch (_) {}

  await Promise.all([
    deleteDocsBestEffort(query(collection(db, "users", uid, "following"))),
    deleteDocsBestEffort(query(collection(db, "users", uid, "followers"))),
    deleteDocsBestEffort(query(collection(db, "users", uid, "ratings"))),
  ]);
  try {
    await deleteDoc(doc(db, "public_profiles", uid));
  } catch (_) {}
  await deleteDoc(doc(db, "users", uid));
}
