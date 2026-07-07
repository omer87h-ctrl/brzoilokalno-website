import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getDb } from "./firebaseService.js";
import { normalizeSpaces } from "../utils/textInputValidation.js";

const HOME_TIPS = "home_master_tips";
const TIP_TTL_MS = 24 * 60 * 60 * 1000;

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
  await setDoc(doc(getDb(), "users", uid), payload, { merge: true });
}

export async function createJob({ profile, authUser, fields }) {
  const uid = authUser.uid;
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
    authorName: profile.displayName || authUser.displayName || authUser.email || "",
    userEmail: authUser.email || "",
    timestamp: Timestamp.now(),
    ...authorMetaFromProfile(profile),
  };
  if (profile.preferInAppChat) payload.preferInAppChat = true;
  if (fields.contactPhone?.trim()) payload.contactPhone = fields.contactPhone.trim();
  return addDoc(collection(getDb(), "jobs"), payload);
}

export async function createOffer({ profile, authUser, fields }) {
  const uid = authUser.uid;
  const payload = {
    title: normalizeSpaces(fields.title),
    description: normalizeSpaces(fields.description),
    category: normalizeSpaces(fields.category),
    city: normalizeSpaces(fields.city),
    budget: normalizeSpaces(fields.budget),
    availableWhen: normalizeSpaces(fields.availableWhen),
    userId: uid,
    userEmail: authUser.email || "",
    authorName: profile.displayName || authUser.displayName || authUser.email || "",
    authorRole: profile.role || "",
    timestamp: Timestamp.now(),
    ...authorMetaFromProfile(profile),
  };
  if (profile.preferInAppChat) payload.preferInAppChat = true;
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

export async function applyToJob({ job, profile, authUser }) {
  const workerId = authUser.uid;
  const appData = {
    jobId: job.id,
    jobOwnerId: job.userId || "",
    workerId,
    workerEmail: authUser.email || "",
    workerName: profile.displayName || authUser.displayName || authUser.email || "",
    status: "pending",
    timestamp: serverTimestamp(),
  };

  if (profile.role) appData.workerRole = profile.role;
  if (profile.city) appData.workerCity = profile.city;
  if (profile.category) appData.workerCategory = profile.category;
  else if (profile.occupation) appData.workerOccupation = profile.occupation;
  if (profile.status) appData.workerStatus = profile.status;
  if (profile.description) appData.workerDescription = profile.description;

  const ref = await addDoc(collection(getDb(), "applications"), appData);
  const ownerUid = job.userId;
  if (ownerUid) {
    await createNotification({
      targetUid: ownerUid,
      type: "new_application",
      jobId: job.id,
      applicationId: ref.id,
      actorName: appData.workerName,
    });
  }
  return ref;
}

export async function updateApplicationStatus(appId, status, context = {}) {
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

export async function sendChatMessage({ text, sender, receiverId, jobId, applicationId }) {
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
