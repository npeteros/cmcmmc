import { NextResponse } from "next/server";

import { confirmVote, type ConfirmVoteReason } from "@/lib/competition-votes.server";

const STATUS_BY_REASON: Record<ConfirmVoteReason, number> = {
  not_found: 404,
  expired: 410,
  too_many_attempts: 429,
  invalid_code: 400,
  already_voted: 409,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requestId = String(body.requestId ?? "").trim();
    const code = String(body.code ?? "").trim();

    if (!requestId || !code) {
      return NextResponse.json({ ok: false, error: "Missing requestId or code." }, { status: 400 });
    }

    const result = await confirmVote({ requestId, code });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, reason: result.reason },
        { status: STATUS_BY_REASON[result.reason] },
      );
    }

    return NextResponse.json({ ok: true, entryId: result.entryId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm vote.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
