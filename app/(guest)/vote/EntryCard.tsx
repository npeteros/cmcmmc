"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CompetitionEntryWithVotes } from "@/lib/competition";
import { buildYoutubeEmbedUrl, buildYoutubeThumbnailUrl } from "@/lib/youtube";

export default function EntryCard({
  entry,
  rank,
  votingOpen,
  onVoteClick,
}: {
  entry: CompetitionEntryWithVotes;
  rank: number;
  votingOpen: boolean;
  onVoteClick: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-video w-full bg-slate-900">
        {isPlaying ? (
          <iframe
            src={buildYoutubeEmbedUrl(entry.youtubeVideoId)}
            title={entry.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group absolute inset-0 flex h-full w-full items-center justify-center"
          >
            <Image
              src={buildYoutubeThumbnailUrl(entry.youtubeVideoId)}
              alt={entry.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
            />
            <span className="relative flex size-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
              <Play className="ml-1 size-6 text-[#1a2e5a]" fill="currentColor" />
            </span>
          </button>
        )}
        <Badge className="absolute top-3 left-3" variant="secondary">
          #{rank}
        </Badge>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className="text-base font-semibold text-[#1a2e5a]">{entry.title}</h3>
          <p className="text-sm text-slate-500">{entry.participantName}</p>
        </div>
        {entry.description && <p className="text-sm text-slate-600">{entry.description}</p>}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-[#2aadb5]">
            {entry.voteCount} {entry.voteCount === 1 ? "vote" : "votes"}
          </span>
          <Button size="sm" onClick={onVoteClick} disabled={!votingOpen}>
            Vote
          </Button>
        </div>
      </div>
    </div>
  );
}
