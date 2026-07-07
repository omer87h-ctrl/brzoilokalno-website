export const MAX_FOLLOWING = 48;

export function viewerCanFollow(role) {
  return String(role || "").trim().toLowerCase() === "korisnik";
}

export function resolveFollowableRole(profile) {
  const raw = String(
    profile?.role || profile?.ownerRole || profile?.authorRole || profile?.workerRole || ""
  )
    .trim()
    .toLowerCase();
  return raw === "majstor" || raw === "kreator" ? raw : null;
}

export function followDisplayName(profile) {
  return (
    profile?.displayName ||
    profile?.ownerDisplayName ||
    profile?.userDisplayName ||
    "Korisnik"
  );
}
