function normStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function unreadForUser(app, uid) {
  const counts = app?.unreadCounts || {};
  return Number(counts[uid]) || 0;
}

export function buildActivityDashboard(applications, uid, publishedJobsCount = 0) {
  const merged = applications || [];
  const active = merged.filter((a) => normStatus(a.status) === "pending").length;
  const agreed = merged.filter((a) => normStatus(a.status) === "accepted").length;
  const finished = merged.filter((a) => normStatus(a.status) === "completed").length;
  const acceptedOpen = merged.filter((a) => normStatus(a.status) === "accepted").length;
  const totalUnreadChat = merged.reduce((sum, app) => sum + unreadForUser(app, uid), 0);

  let lastMs = 0;
  for (const app of merged) {
    const ts = app.timestamp;
    const ms =
      typeof ts?.toMillis === "function"
        ? ts.toMillis()
        : ts?.seconds
          ? ts.seconds * 1000
          : Number(ts) || 0;
    if (ms > lastMs) lastMs = ms;
  }

  const chatRows = merged
    .filter((a) => normStatus(a.status) === "accepted" || normStatus(a.status) === "completed")
    .sort((a, b) => {
      const au = unreadForUser(a, uid);
      const bu = unreadForUser(b, uid);
      if (bu !== au) return bu - au;
      return (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0);
    })
    .slice(0, 6)
    .map((app) => ({
      appId: app.id,
      jobId: app.jobId,
      title: app.jobTitle || app.workerName || "Posao",
      unread: unreadForUser(app, uid),
      status: normStatus(app.status),
      isWorker: app.workerId === uid,
    }));

  const summaryParts = [];
  if (totalUnreadChat > 0) summaryParts.push(`${totalUnreadChat} nepročitanih poruka`);
  if (active > 0) summaryParts.push(`${active} na čekanju`);
  if (acceptedOpen > 0) summaryParts.push(`${acceptedOpen} u tijeku`);
  if (!summaryParts.length && finished > 0) summaryParts.push(`${finished} završenih`);
  if (!summaryParts.length) summaryParts.push("Nema nove aktivnosti");

  return {
    publishedJobs: publishedJobsCount,
    activeApplies: active,
    agreedJobs: agreed,
    finishedJobs: finished,
    acceptedOpen,
    totalUnreadChat,
    lastActivityLabel: lastMs
      ? new Date(lastMs).toLocaleString("bs-BA", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    summary: summaryParts.join(" · "),
    chatRows,
  };
}
