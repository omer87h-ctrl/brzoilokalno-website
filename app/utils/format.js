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
  return user?.displayName || user?.authorName || "Korisnik";
}
