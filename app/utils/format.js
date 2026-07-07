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
