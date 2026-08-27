const REGISTRATION_CUTOFF_UTC = "2026-09-01T16:00:00Z"; // 2026-09-02 00:00 Asia/Manila

export function isRegistrationOpen(now: Date = new Date()) {
  if (process.env.REGISTRATION_ALWAYS_OPEN === "true") {
    return true;
  }

  return now < new Date(REGISTRATION_CUTOFF_UTC);
}
