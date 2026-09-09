"use client";

import { Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function SharePageQr({ url }: { url: string }) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  async function copyQR() {
    if (!qrRef.current) return;
    const blob = await new Promise<Blob | null>((resolve) =>
      qrRef.current?.toBlob(resolve),
    );
    if (!blob) return;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadQR() {
    if (!qrRef.current) return;
    const link = document.createElement("a");
    link.href = qrRef.current.toDataURL("image/png");
    link.download = "droply-qr.png";
    link.click();
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <div className="rounded-xl bg-white p-3">
        <QRCodeCanvas ref={qrRef} value={url} size={140} />
      </div>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={copyQR}>
          {copied ? "Copied!" : "Copy QR"}
        </Button>
        <Button variant="outline" size="sm" onClick={downloadQR}>
          <Download className="mr-2 h-4 w-4" />
          Download QR
        </Button>
      </div>
    </div>
  );
}
