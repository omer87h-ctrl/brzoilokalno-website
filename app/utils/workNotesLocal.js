function key(uid, suffix) {
  return `bil_work_notes_${uid}_${suffix}`;
}

export function loadWorkNotes(uid) {
  if (!uid) return { main: "", reminder: "", savedAt: 0 };
  return {
    main: localStorage.getItem(key(uid, "main")) || "",
    reminder: localStorage.getItem(key(uid, "rem")) || "",
    savedAt: Number(localStorage.getItem(key(uid, "saved_at")) || 0),
  };
}

export function saveWorkNotes(uid, { main = "", reminder = "" } = {}) {
  if (!uid) return;
  localStorage.setItem(key(uid, "main"), String(main).slice(0, 12000));
  localStorage.setItem(key(uid, "rem"), String(reminder).slice(0, 400));
  localStorage.setItem(key(uid, "saved_at"), String(Date.now()));
}

export function importLegacyWorkNotes(uid, profile) {
  if (!uid || !profile) return;
  if (localStorage.getItem(key(uid, "migrated")) === "1") return;
  const notes = loadWorkNotes(uid);
  if (!notes.main && profile.workNotes) {
    saveWorkNotes(uid, {
      main: profile.workNotes || "",
      reminder: profile.workNotesReminder || "",
    });
  }
  localStorage.setItem(key(uid, "migrated"), "1");
}
