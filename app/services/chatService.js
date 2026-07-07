import {
  collection,
  onSnapshot,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getDb } from "./firebaseService.js";

function messageSortKey(msg) {
  const ts = msg.timestamp;
  if (ts?.seconds) return ts.seconds * 1000 + (ts.nanoseconds || 0) / 1e6;
  if (typeof ts?.toMillis === "function") return ts.toMillis();
  return msg.clientCreatedAt || 0;
}

export function subscribeToChatMessages({ jobId, applicationId, onMessages, onError }) {
  const q = query(
    collection(getDb(), "messages"),
    where("jobId", "==", jobId),
    where("applicationId", "==", applicationId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const messages = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => messageSortKey(a) - messageSortKey(b));
      onMessages(messages);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}
