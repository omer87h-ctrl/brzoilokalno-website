/** Isti izvor kao Android ProfileVerifiedUi.fromMap */
export function isProfileVerified(data) {
  if (!data || typeof data !== "object") return false;
  return (
    data.profileVerified === true ||
    data.ownerProfileVerified === true ||
    data.authorProfileVerified === true ||
    data.workerProfileVerified === true
  );
}
