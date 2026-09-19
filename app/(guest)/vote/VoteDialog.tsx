"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompetitionEntryWithVotes } from "@/lib/competition";

const VOTED_COOKIE = "cmcmmc-voted";

function hasVotedCookie() {
  if (typeof document === "undefined") {
    return false;
  }
  return document.cookie.split("; ").some((row) => row.startsWith(`${VOTED_COOKIE}=`));
}

function setVotedCookie() {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${VOTED_COOKIE}=1; path=/; max-age=${oneYear}; samesite=lax`;
}

const REASON_MESSAGES: Record<string, string> = {
  voting_closed: "Voting is currently closed.",
  entry_not_found: "This entry is no longer available.",
  already_voted: "This email has already voted. Only one vote is allowed per person.",
  rate_limited: "Too many code requests for this email. Please try again later.",
  email_failed: "We couldn't send the verification email. Please try again in a moment.",
  not_found: "This voting session was not found. Please start again.",
  expired: "This code has expired. Please request a new one.",
  too_many_attempts: "Too many incorrect attempts. Please request a new code.",
  invalid_code: "That code is incorrect. Please try again.",
};

type Step = "already-voted" | "email" | "otp" | "success";

export default function VoteDialog({
  entry,
  open,
  onOpenChange,
  onVoted,
}: {
  entry: CompetitionEntryWithVotes;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoted: () => void;
}) {
  // This component is only mounted while a vote dialog is open (see
  // VoteGallery), and remounts fresh each time a different entry is
  // selected, so lazy initializers are enough -- no reset effect needed.
  const [step, setStep] = useState<Step>(() => (hasVotedCookie() ? "already-voted" : "email"));
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequestCode() {
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/vote/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entry.id, email }),
      });
      const result = (await response.json()) as { ok: boolean; requestId?: string; reason?: string };

      if (!result.ok) {
        toast.error(REASON_MESSAGES[result.reason ?? ""] ?? "Failed to send verification code.");
        return;
      }

      setRequestId(result.requestId ?? null);
      setStep("otp");
      toast.success("Verification code sent! Check your inbox.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmCode() {
    if (!requestId || !code.trim()) {
      toast.error("Please enter the verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/vote/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, code }),
      });
      const result = (await response.json()) as { ok: boolean; reason?: string };

      if (!result.ok) {
        toast.error(REASON_MESSAGES[result.reason ?? ""] ?? "Failed to confirm your vote.");
        return;
      }

      setVotedCookie();
      setStep("success");
      onVoted();
      toast.success("Your vote has been recorded. Thank you!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Vote for &quot;{entry.title}&quot;</DialogTitle>

        {step === "already-voted" && (
          <DialogDescription>
            You&apos;ve already voted in this competition. Only one vote is allowed per person. Thank you!
          </DialogDescription>
        )}

        {step === "email" && (
          <>
            <DialogDescription>
              Enter your email address. We&apos;ll send you a 6-digit code to confirm your vote — this makes
              sure each person can only vote once.
            </DialogDescription>
            <div className="space-y-1">
              <Label htmlFor="vote-email">Email address</Label>
              <Input
                id="vote-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleRequestCode} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send code"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "otp" && (
          <>
            <DialogDescription>
              Enter the 6-digit code sent to {email}. The code expires in 10 minutes.
            </DialogDescription>
            <div className="space-y-1">
              <Label htmlFor="vote-otp">Verification code</Label>
              <Input
                id="vote-otp"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="text-center text-lg tracking-[0.4em]"
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("email")} disabled={isSubmitting}>
                Back
              </Button>
              <Button onClick={handleConfirmCode} disabled={isSubmitting}>
                {isSubmitting ? "Confirming..." : "Confirm vote"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "success" && (
          <DialogDescription>
            Your vote for &quot;{entry.title}&quot; has been recorded. Thank you for voting!
          </DialogDescription>
        )}
      </DialogContent>
    </Dialog>
  );
}
