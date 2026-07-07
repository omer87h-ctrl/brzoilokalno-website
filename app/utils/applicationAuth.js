export function jobOwnerUid(job, app) {
  return job?.userId || job?.ownerId || job?.jobOwnerId || app?.jobOwnerId || "";
}

export function canManageApplicationAction(app, job, uid, action) {
  if (!app || !uid || !action) return false;
  const ownerUid = jobOwnerUid(job, app);
  const isOwner = Boolean(ownerUid && ownerUid === uid);
  const isWorker = app.workerId === uid;
  if (action === "accept" || action === "reject") {
    return isOwner && (app.status || "pending") === "pending";
  }
  if (action === "complete") {
    return (isOwner || isWorker) && app.status === "accepted";
  }
  return false;
}
