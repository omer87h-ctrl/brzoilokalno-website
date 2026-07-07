import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getDb } from "./firebaseService.js";

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

  return addDoc(collection(getDb(), "applications"), appData);
}

export async function updateApplicationStatus(appId, status) {
  await updateDoc(doc(getDb(), "applications", appId), { status });
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
