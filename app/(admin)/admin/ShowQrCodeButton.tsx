"use client";

import { useState } from "react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buildCheckinUrl } from "@/lib/checkin";

export default function ShowQrCodeButton({
  submissionId,
  displayName,
}: {
  submissionId: string;
  displayName: string;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleOpenChange(open: boolean) {
    if (!open || qrDataUrl || isGenerating) {
      return;
    }

    setIsGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(buildCheckinUrl(submissionId));
      setQrDataUrl(dataUrl);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Show QR Code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{displayName}&apos;s check-in code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-2">
          {isGenerating && <p className="text-sm text-slate-500">Generating…</p>}
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt={`Check-in QR code for ${displayName}`} className="h-56 w-56" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
