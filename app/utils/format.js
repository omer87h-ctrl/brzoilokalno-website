export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatRating(avg, count) {
  const rating = Number(avg) || 0;
  const reviews = Number(count) || 0;
  if (reviews <= 0) return "Nema ocjena";
  return `${rating.toFixed(1)} ★ (${reviews})`;
}

export function formatTimestamp(value) {
  if (!value) return "";
  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : value?.seconds
        ? new Date(value.seconds * 1000)
        : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("bs-BA", { day: "numeric", month: "short", year: "numeric" });
}

export function displayName(user) {
  return user?.displayName || user?.authorName || user?.ownerDisplayName || user?.workerName || "Korisnik";
}

export function formatApplicationStatus(status) {
  const map = {
    pending: "Na čekanju",
    accepted: "Prihvaćena",
    rejected: "Odbijena",
    completed: "Završena",
  };
  return map[status] || status || "—";
}

/** Kratka poruka iz Firebase/Firestore greške za korisnika. */
export function formatFirestoreError(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "");
  if (code.includes("permission-denied") || message.includes("permission-denied")) {
    return "Trenutno nemate dozvolu za ovu radnju. Pokušajte ponovo.";
  }
  if (code.includes("unavailable") || message.includes("unavailable")) {
    return "Provjerite internet vezu i pokušajte ponovo.";
  }
  if (code.includes("failed-precondition")) {
    return "Podaci nisu u ispravnom stanju. Osvježite stranicu i pokušajte ponovo.";
  }
  if (message) {
    return "Trenutno nije moguće završiti ovu radnju. Pokušajte ponovo.";
  }
  return "";
}

export function formatNotificationType(type) {
  const map = {
    new_application: "Nova prijava",
    application_accepted: "Prijava prihvaćena",
    application_rejected: "Prijava odbijena",
    job_completed: "Posao završen",
  };
  return map[type] || type || "Obavijest";
}

export function formatDateTime(value) {
  if (!value) return "";
  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : value?.seconds
        ? new Date(value.seconds * 1000)
        : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("bs-BA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function workImageUrl(work) {
  return work?.imageUrlThumb || work?.imageUrlFull || work?.imageUrl || "";
}

export function workOwnerName(work) {
  return work?.ownerDisplayName || work?.ownerName || "Korisnik";
}
