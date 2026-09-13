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

const QR_SIZE = 448;
const LOGO_SIZE_RATIO = 0.22;
const LOGO_PADDING_RATIO = 0.12;
const LOGO_SRC = "/logo-mark.png";
const QR_COLOR = "#1892bb";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });
}

async function drawCenterLogo(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const logo = await loadImage(LOGO_SRC);

  const boxSize = canvas.width * LOGO_SIZE_RATIO;
  const padding = boxSize * LOGO_PADDING_RATIO;
  const boxX = (canvas.width - boxSize) / 2;
  const boxY = (canvas.height - boxSize) / 2;

  // White backdrop keeps the logo legible against the QR modules underneath.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(boxX - padding, boxY - padding, boxSize + padding * 2, boxSize + padding * 2);

  const scale = Math.min(boxSize / logo.width, boxSize / logo.height);
  const drawWidth = logo.width * scale;
  const drawHeight = logo.height * scale;
  ctx.drawImage(
    logo,
    (canvas.width - drawWidth) / 2,
    (canvas.height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

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
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, buildCheckinUrl(submissionId), {
        errorCorrectionLevel: "H",
        width: QR_SIZE,
        margin: 1,
        color: {
          dark: QR_COLOR,
          light: "#ffffff",
        },
      });

      try {
        await drawCenterLogo(canvas);
      } catch {
        // Logo asset missing or failed to load; fall back to a plain QR code.
      }

      setQrDataUrl(canvas.toDataURL("image/png"));
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
