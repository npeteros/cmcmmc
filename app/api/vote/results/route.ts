import { NextResponse } from "next/server";

import { listCompetitionEntriesWithVotes } from "@/lib/competition.server";

export async function GET() {
  const entries = await listCompetitionEntriesWithVotes();
  return NextResponse.json({ ok: true, entries });
}
