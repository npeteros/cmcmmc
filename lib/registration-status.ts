const REGISTRATION_CUTOFF_UTC = "2026-08-31T16:00:00Z"; // 2026-09-01 00:00 Asia/Manila

export function isRegistrationOpen(now: Date = new Date()) {
  return now < new Date(REGISTRATION_CUTOFF_UTC);
}
