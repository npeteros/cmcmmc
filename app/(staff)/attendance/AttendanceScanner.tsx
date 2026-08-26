"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatSubmissionDate,
  getAffiliationLabel,
  getSubmissionDisplayName,
  getSubmissionOrganization,
  type Submission,
} from "@/lib/admin-submissions";
import {
  markArrivalAction,
  markKitReceivedAction,
  revertArrivalAction,
} from "@/lib/attendance/actions";
import QrCameraScanner from "./QrCameraScanner";

type AttendanceMode =
  | "dayOneAttendance"
  | "dayTwoAttendance"
  | "dayOneBreakoutAttendance"
  | "dayTwoBreakoutAttendance";

type ConfirmTarget = { type: "field"; key: AttendanceMode; label: string } | { type: "kit" };

const TIMESTAMP_FIELDS: { key: AttendanceMode; label: string }[] = [
  { key: "dayOneAttendance", label: "Day 1 Attendance" },
  { key: "dayTwoAttendance", label: "Day 2 Attendance" },
  { key: "dayOneBreakoutAttendance", label: "Day 1 Breakout" },
  { key: "dayTwoBreakoutAttendance", label: "Day 2 Breakout" },
];

function extractIdFromScan(text: string) {
  const trimmed = text.trim();
  const segments = trimmed.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? trimmed;
}

function AttendanceFieldRow({
  label,
  timestamp,
  disabled,
  onMark,
  onRequestRevert,
}: {
  label: string;
  timestamp: string | null;
  disabled: boolean;
  onMark: () => void;
  onRequestRevert: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-medium text-slate-700">
          {timestamp ? formatSubmissionDate(timestamp) : "Not yet checked in"}
        </p>
      </div>
      {timestamp ? (
        <Button type="button" size="sm" variant="destructive" disabled={disabled} onClick={onRequestRevert}>
          Revert
        </Button>
      ) : (
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onMark}>
          Mark arrived
        </Button>
      )}
    </div>
  );
}

function KitReceivedRow({
  received,
  disabled,
  onToggle,
}: {
  received: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Kit Received</p>
        <p className="mt-1 text-sm font-medium text-slate-700">{received ? "Yes" : "Not yet"}</p>
      </div>
      <Button
        type="button"
        size="sm"
        variant={received ? "destructive" : "default"}
        disabled={disabled}
        onClick={onToggle}
      >
        {received ? "Revert" : "Mark received"}
      </Button>
    </div>
  );
}

export default function AttendanceScanner({ initialId }: { initialId?: string }) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookupPending, startLookupTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMarkPending, startMarkTransition] = useTransition();
  const [isKitPending, startKitTransition] = useTransition();
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const lastScannedId = useRef<string | null>(null);

  function lookupSubmission(id: string) {
    startLookupTransition(async () => {
      try {
        const response = await fetch(`/api/attendance/${encodeURIComponent(id)}`);
        const result = await response.json();

        if (!result.ok) {
          setSubmission(null);
          setLookupError(result.error ?? "Registrant not found.");
          return;
        }

        setLookupError(null);
        setSubmission(result.submission);
        setIsDialogOpen(true);
      } catch {
        setSubmission(null);
        setLookupError("Failed to look up registrant.");
      }
    });
  }

  useEffect(() => {
    if (initialId) {
      lastScannedId.current = initialId;
      lookupSubmission(initialId);
    }
  }, [initialId]);

  function handleDecode(text: string) {
    const id = extractIdFromScan(text);
    if (!id || id === lastScannedId.current) {
      return;
    }
    lastScannedId.current = id;
    lookupSubmission(id);
  }

  function handleMarkField(fieldKey: AttendanceMode) {
    if (!submission) {
      return;
    }

    const id = submission.id;

    startMarkTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("mode", fieldKey);
      formData.set("override", "false");

      const result = await markArrivalAction({ status: "idle" }, formData);

      if (result.status === "success") {
        toast.success(result.message ?? "Marked arrived.");
        if (result.newData) {
          setSubmission(result.newData);
        }
        return;
      }

      toast.error(result.message ?? "Failed to mark attendance.");
      // Local state may be stale (e.g. a race with another device) - refresh from the server.
      lookupSubmission(id);
    });
  }

  function performRevertField(fieldKey: AttendanceMode) {
    if (!submission) {
      return;
    }

    const id = submission.id;

    startMarkTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("mode", fieldKey);

      const result = await revertArrivalAction({ status: "idle" }, formData);

      if (result.status === "success") {
        toast.success(result.message ?? "Reverted.");
        if (result.newData) {
          setSubmission(result.newData);
        }
        return;
      }

      toast.error(result.message ?? "Failed to revert attendance.");
    });
  }

  function performToggleKit(nextReceived: boolean) {
    if (!submission) {
      return;
    }

    const id = submission.id;

    startKitTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("received", nextReceived ? "true" : "false");

      const result = await markKitReceivedAction({ status: "idle" }, formData);

      if (result.status === "success") {
        toast.success(result.message ?? "Kit status updated.");
        if (result.newData) {
          setSubmission(result.newData);
        }
        return;
      }

      toast.error(result.message ?? "Failed to update kit status.");
    });
  }

  function handleToggleKit() {
    if (!submission) {
      return;
    }

    if (submission.kitReceived) {
      setConfirmTarget({ type: "kit" });
      return;
    }

    performToggleKit(true);
  }

  function handleConfirmRevert() {
    if (!confirmTarget) {
      return;
    }

    if (confirmTarget.type === "field") {
      performRevertField(confirmTarget.key);
    } else {
      performToggleKit(false);
    }

    setConfirmTarget(null);
  }

  return (
    <div className="space-y-6">
      <QrCameraScanner onDecode={handleDecode} />

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        {isLookupPending && <p className="text-sm text-slate-500">Looking up registrant…</p>}

        {!isLookupPending && lookupError && <p className="text-sm text-red-600">{lookupError}</p>}

        {!isLookupPending && !lookupError && !submission && (
          <p className="text-sm text-slate-500">Scan a registrant&apos;s QR code to begin.</p>
        )}

        {!isLookupPending && !lookupError && submission && (
          <p className="text-sm text-slate-500">
            Last scanned: <span className="font-semibold text-slate-700">{getSubmissionDisplayName(submission)}</span>
          </p>
        )}
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          {submission && (
            <>
              <DialogHeader>
                <DialogTitle>{getSubmissionDisplayName(submission)}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-500">
                {getAffiliationLabel(submission.affiliationType)} • {getSubmissionOrganization(submission)} •{" "}
                {submission.status}
              </p>

              <div className="space-y-2">
                {TIMESTAMP_FIELDS.map((field) => (
                  <AttendanceFieldRow
                    key={field.key}
                    label={field.label}
                    timestamp={submission[field.key] as string | null}
                    disabled={isMarkPending}
                    onMark={() => handleMarkField(field.key)}
                    onRequestRevert={() => setConfirmTarget({ type: "field", key: field.key, label: field.label })}
                  />
                ))}
                <KitReceivedRow
                  received={submission.kitReceived}
                  disabled={isKitPending}
                  onToggle={handleToggleKit}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmTarget(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTarget?.type === "field" ? `Revert ${confirmTarget.label}?` : "Revert kit received status?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTarget?.type === "field"
                ? "This clears the recorded timestamp. The registrant will need to be scanned again to mark it."
                : "This will mark the kit as not received."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmRevert}>
              Revert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
