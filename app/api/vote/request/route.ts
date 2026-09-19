import { NextResponse } from "next/server";

import { requestVote, type VoteRequestReason } from "@/lib/competition-votes.server";

const STATUS_BY_REASON: Record<VoteRequestReason, number> = {
  voting_closed: 403,
  entry_not_found: 404,
  already_voted: 409,
  rate_limited: 429,
  email_failed: 502,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entryId = String(body.entryId ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!entryId || !email) {
      return NextResponse.json({ ok: false, error: "Missing entryId or email." }, { status: 400 });
    }

    const result = await requestVote({ entryId, email });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, reason: result.reason },
        { status: STATUS_BY_REASON[result.reason] },
      );
    }

    return NextResponse.json({ ok: true, requestId: result.requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request a vote.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
