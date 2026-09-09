"use client";

import { Download, QrCode } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function SharePageQr({ url }: { url: string }) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="gap-2"
      >
        <QrCode className="h-4 w-4" />
        {open ? "Hide QR Code" : "Show QR Code"}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden flex flex-col items-center gap-3"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
