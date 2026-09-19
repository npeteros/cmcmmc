import "server-only";

import { cookies } from "next/headers";
import { createHash, createHmac, randomInt, randomUUID } from "crypto";

import { createClient } from "@/lib/supabase.server";
import { getCompetitionEntryById, getVotingStatus } from "@/lib/competition.server";
import { sendVoteOtpEmail } from "@/lib/mail-service";

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_REQUESTS_PER_WINDOW = 5;
const OTP_REQUEST_WINDOW_MINUTES = 15;
const MAX_OTP_ATTEMPTS = 5;

type VoteRequestStatus = "pending" | "confirmed" | "expired" | "cancelled";

type VoteRequestRow = {
  id: string;
  entry_id: string;
  email: string;
  otp_code_hash: string;
  status: VoteRequestStatus;
  attempt_count: number;
  expires_at: string;
  created_at: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashVoterEmail(email: string) {
  const secret = process.env.VOTE_EMAIL_HASH_SECRET;

  if (!secret) {
    console.error(
      "VOTE_EMAIL_HASH_SECRET is not set; using an insecure development fallback.",
    );
  }

  return createHmac("sha256", secret || "dev-insecure-default-secret")
    .update(normalizeEmail(email))
    .digest("hex");
}

function hashOtpCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function generateOtpCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export type VoteRequestReason =
  | "voting_closed"
  | "entry_not_found"
  | "already_voted"
  | "rate_limited"
  | "email_failed";

export type VoteRequestResult =
  | { ok: true; requestId: string }
  | { ok: false; reason: VoteRequestReason };

export type ConfirmVoteReason =
  | "not_found"
  | "expired"
  | "too_many_attempts"
  | "invalid_code"
  | "already_voted";

export type ConfirmVoteResult =
  | { ok: true; entryId: string }
  | { ok: false; reason: ConfirmVoteReason };

// In-memory fallback used only when Supabase env vars are absent (local dev).
// Resets on every dev-server restart, same as mockCompetitionEntries.
const mockVoteRequests: VoteRequestRow[] = [];
const mockVotes: { id: string; entryId: string; voterEmailHash: string }[] = [];

async function hasExistingVote(supabase: ReturnType<typeof createClient> | null, emailHash: string) {
  if (!supabase) {
    return mockVotes.some((vote) => vote.voterEmailHash === emailHash);
  }

  const { data, error } = await supabase
    .from("competition_votes")
    .select("id")
    .eq("voter_email_hash", emailHash)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function requestVote(input: {
  entryId: string;
  email: string;
}): Promise<VoteRequestResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const votingOpen = await getVotingStatus();
  if (!votingOpen) {
    return { ok: false, reason: "voting_closed" };
  }

  const entry = await getCompetitionEntryById(input.entryId);
  if (!entry || entry.status !== "visible") {
    return { ok: false, reason: "entry_not_found" };
  }

  const email = normalizeEmail(input.email);
  const emailHash = hashVoterEmail(email);

  if (await hasExistingVote(supabase, emailHash)) {
    return { ok: false, reason: "already_voted" };
  }

  const windowStart = new Date(Date.now() - OTP_REQUEST_WINDOW_MINUTES * 60 * 1000).toISOString();

  let recentRequestCount: number;
  if (!supabase) {
    recentRequestCount = mockVoteRequests.filter(
      (request) => request.email === email && request.created_at > windowStart,
    ).length;
  } else {
    const { count, error } = await supabase
      .from("competition_vote_requests")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gt("created_at", windowStart);

    if (error) {
      throw new Error(error.message);
    }

    recentRequestCount = count ?? 0;
  }

  if (recentRequestCount >= MAX_OTP_REQUESTS_PER_WINDOW) {
    return { ok: false, reason: "rate_limited" };
  }

  const code = generateOtpCode();
  const emailResult = await sendVoteOtpEmail({
    email,
    code,
    entryTitle: entry.title,
  });

  if (!emailResult.success) {
    return { ok: false, reason: "email_failed" };
  }

  const requestId = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  if (!supabase) {
    mockVoteRequests.push({
      id: requestId,
      entry_id: entry.id,
      email,
      otp_code_hash: hashOtpCode(code),
      status: "pending",
      attempt_count: 0,
      expires_at: expiresAt,
      created_at: now.toISOString(),
    });
    return { ok: true, requestId };
  }

  const { error } = await supabase.from("competition_vote_requests").insert({
    id: requestId,
    entry_id: entry.id,
    email,
    otp_code_hash: hashOtpCode(code),
    status: "pending",
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true, requestId };
}

export async function confirmVote(input: {
  requestId: string;
  code: string;
}): Promise<ConfirmVoteResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    const request = mockVoteRequests.find((item) => item.id === input.requestId);

    if (!request) {
      return { ok: false, reason: "not_found" };
    }

    if (request.status !== "pending") {
      return { ok: false, reason: "expired" };
    }

    if (new Date(request.expires_at) < new Date()) {
      request.status = "expired";
      return { ok: false, reason: "expired" };
    }

    if (request.attempt_count >= MAX_OTP_ATTEMPTS) {
      return { ok: false, reason: "too_many_attempts" };
    }

    if (hashOtpCode(input.code) !== request.otp_code_hash) {
      request.attempt_count += 1;
      return { ok: false, reason: "invalid_code" };
    }

    const emailHash = hashVoterEmail(request.email);
    if (mockVotes.some((vote) => vote.voterEmailHash === emailHash)) {
      request.status = "cancelled";
      return { ok: false, reason: "already_voted" };
    }

    mockVotes.push({ id: randomUUID(), entryId: request.entry_id, voterEmailHash: emailHash });
    request.status = "confirmed";
    return { ok: true, entryId: request.entry_id };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("competition_vote_requests")
    .select("*")
    .eq("id", input.requestId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const request = existing as VoteRequestRow | null;

  if (!request) {
    return { ok: false, reason: "not_found" };
  }

  if (request.status !== "pending") {
    return { ok: false, reason: "expired" };
  }

  if (new Date(request.expires_at) < new Date()) {
    await supabase
      .from("competition_vote_requests")
      .update({ status: "expired" })
      .eq("id", request.id);
    return { ok: false, reason: "expired" };
  }

  if (request.attempt_count >= MAX_OTP_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }

  if (hashOtpCode(input.code) !== request.otp_code_hash) {
    await supabase
      .from("competition_vote_requests")
      .update({ attempt_count: request.attempt_count + 1 })
      .eq("id", request.id);
    return { ok: false, reason: "invalid_code" };
  }

  const emailHash = hashVoterEmail(request.email);

  const { error: insertError } = await supabase.from("competition_votes").insert({
    entry_id: request.entry_id,
    voter_email_hash: emailHash,
  });

  if (insertError) {
    // Unique-violation on voter_email_hash is the real concurrency guard for
    // "one vote per person" -- treat it as already_voted rather than a
    // generic failure.
    if (insertError.code === "23505") {
      await supabase
        .from("competition_vote_requests")
        .update({ status: "cancelled" })
        .eq("id", request.id);
      return { ok: false, reason: "already_voted" };
    }

    throw new Error(insertError.message);
  }

  await supabase
    .from("competition_vote_requests")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", request.id);

  return { ok: true, entryId: request.entry_id };
}
