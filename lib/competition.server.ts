import "server-only";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";

import {
  mockCompetitionEntries,
  type CompetitionEntry,
  type CompetitionEntryWithVotes,
  type EntryStatus,
} from "@/lib/competition";
import { createClient } from "@/lib/supabase.server";

type EntryRow = {
  id: string;
  title: string;
  participant_name: string;
  description: string;
  youtube_url: string;
  youtube_video_id: string;
  status: EntryStatus;
  created_at: string;
  updated_at: string;
};

export type CompetitionEntryInput = {
  title: string;
  participantName: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
};

function mapRowToEntry(row: EntryRow): CompetitionEntry {
  return {
    id: row.id,
    title: row.title,
    participantName: row.participant_name,
    description: row.description,
    youtubeUrl: row.youtube_url,
    youtubeVideoId: row.youtube_video_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCompetitionEntries(
  opts: { includeHidden?: boolean } = {},
): Promise<CompetitionEntry[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    return opts.includeHidden
      ? mockCompetitionEntries
      : mockCompetitionEntries.filter((entry) => entry.status === "visible");
  }

  let queryBuilder = supabase.from("competition_entries").select("*");

  if (!opts.includeHidden) {
    queryBuilder = queryBuilder.eq("status", "visible");
  }

  const { data, error } = await queryBuilder.order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapRowToEntry(row as EntryRow));
}

export async function listCompetitionEntriesWithVotes(
  opts: { includeHidden?: boolean } = {},
): Promise<CompetitionEntryWithVotes[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const entries = await listCompetitionEntries(opts);

  if (!supabase) {
    return entries.map((entry) => ({ ...entry, voteCount: 0 }));
  }

  const { data, error } = await supabase.from("competition_votes").select("entry_id");

  if (error) {
    throw new Error(error.message);
  }

  const counts = new Map<string, number>();
  (data ?? []).forEach((row) => {
    const entryId = (row as { entry_id: string }).entry_id;
    counts.set(entryId, (counts.get(entryId) ?? 0) + 1);
  });

  return entries
    .map((entry) => ({ ...entry, voteCount: counts.get(entry.id) ?? 0 }))
    .sort((a, b) => b.voteCount - a.voteCount);
}

export async function getCompetitionEntryById(id: string): Promise<CompetitionEntry | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    return mockCompetitionEntries.find((entry) => entry.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("competition_entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRowToEntry(data as EntryRow) : null;
}

export async function createCompetitionEntry(
  input: CompetitionEntryInput,
): Promise<CompetitionEntry> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    const now = new Date().toISOString();
    const entry: CompetitionEntry = {
      id: randomUUID(),
      title: input.title,
      participantName: input.participantName,
      description: input.description,
      youtubeUrl: input.youtubeUrl,
      youtubeVideoId: input.youtubeVideoId,
      status: "visible",
      createdAt: now,
      updatedAt: now,
    };
    mockCompetitionEntries.push(entry);
    return entry;
  }

  const { data, error } = await supabase
    .from("competition_entries")
    .insert({
      title: input.title,
      participant_name: input.participantName,
      description: input.description,
      youtube_url: input.youtubeUrl,
      youtube_video_id: input.youtubeVideoId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToEntry(data as EntryRow);
}

export async function updateCompetitionEntry(
  id: string,
  input: CompetitionEntryInput,
): Promise<CompetitionEntry | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    const entry = mockCompetitionEntries.find((item) => item.id === id);

    if (!entry) {
      return null;
    }

    entry.title = input.title;
    entry.participantName = input.participantName;
    entry.description = input.description;
    entry.youtubeUrl = input.youtubeUrl;
    entry.youtubeVideoId = input.youtubeVideoId;
    entry.updatedAt = new Date().toISOString();
    return entry;
  }

  const { data, error } = await supabase
    .from("competition_entries")
    .update({
      title: input.title,
      participant_name: input.participantName,
      description: input.description,
      youtube_url: input.youtubeUrl,
      youtube_video_id: input.youtubeVideoId,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRowToEntry(data as EntryRow) : null;
}

export async function setCompetitionEntryStatus(
  id: string,
  status: EntryStatus,
): Promise<CompetitionEntry | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    const entry = mockCompetitionEntries.find((item) => item.id === id);

    if (!entry) {
      return null;
    }

    entry.status = status;
    entry.updatedAt = new Date().toISOString();
    return entry;
  }

  const { data, error } = await supabase
    .from("competition_entries")
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRowToEntry(data as EntryRow) : null;
}

let mockVotingOpen = false;

export async function getVotingStatus(): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    return mockVotingOpen;
  }

  const { data, error } = await supabase
    .from("competition_settings")
    .select("voting_open")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as { voting_open: boolean } | null)?.voting_open ?? false;
}

export async function setVotingStatus(open: boolean): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    mockVotingOpen = open;
    return;
  }

  const { error } = await supabase
    .from("competition_settings")
    .update({ voting_open: open })
    .eq("id", true);

  if (error) {
    throw new Error(error.message);
  }
}
