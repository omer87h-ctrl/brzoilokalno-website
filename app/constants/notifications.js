/** Obavijesti vezane za poslove — badge na tabu Poslovi, ne u zvoncu. */
export const JOB_NOTIFICATION_TYPES = new Set([
  "new_application",
  "application_accepted",
  "application_rejected",
  "job_completed",
]);

export function isJobNotificationType(type) {
  return JOB_NOTIFICATION_TYPES.has(type);
}
