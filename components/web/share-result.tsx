import { ArrowRight, Check, Copy, Download } from "lucide-react";
import { motion } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

/* Skeleton Loading State */
export function ShareResultSkeleton({
  progress,
  isCreatingSession,
}: {
  progress?: { completed: number; total: number };
  isCreatingSession?: boolean;
}) {
  const percentage = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mx-auto mt-8 max-w-2xl rounded-2xl border bg-card p-8 shadow-lg"
    >
      {/* Creating Session */}
      {isCreatingSession && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Spinner className="size-5" />
            <span className="text-sm font-medium">Creating share link...</span>
          </div>
          <Progress value={100} className="h-2" />
          <p className="text-center text-xs text-muted-foreground">
            Almost done!
          </p>
        </div>
      )}

      {/* Upload Progress */}
      {progress && !isCreatingSession && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Spinner className="size-5" />
            <span className="text-sm font-medium">
              Uploading {progress.completed} of {progress.total} files...
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
          <p className="text-center text-xs text-muted-foreground">
            {percentage}% complete
          </p>
        </div>
      )}

      {!progress && !isCreatingSession && (
        <>
          {/* Title skeleton */}
          <div className="flex justify-center">
            <Skeleton className="h-7 w-56" />
          </div>

          {/* Link box skeleton */}
          <div className="mt-5 flex items-center gap-2 rounded-xl border bg-muted/30 px-4 py-3">
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>

          {/* QR skeleton */}
          <div className="mt-8 flex justify-center">
            <Skeleton className="h-40 w-40 rounded-xl" />
          </div>

          {/* QR actions skeleton */}
          <div className="mt-6 flex gap-3 justify-center">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>

          {/* Button skeleton */}
          <div className="mt-8 flex justify-center">
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </>
      )}
    </motion.div>
  );
}

/* Main ShareResult Component */
export default function ShareResult({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const [copiedQR, setCopiedQR] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  /*Copy Link*/
  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  /* Copy QR  */
  async function copyQR() {
    if (!qrRef.current) return;

    const blob = await new Promise<Blob | null>((resolve) =>
      qrRef.current?.toBlob(resolve),
    );

    if (!blob) return;

    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    setCopiedQR(true);
    setTimeout(() => setCopiedQR(false), 1500);
  }

  /*Download QR*/
  function downloadQR() {
    if (!qrRef.current) return;

    const link = document.createElement("a");
    link.href = qrRef.current.toDataURL("image/png");
    link.download = "droply-qr.png";
    link.click();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mx-auto mt-8 max-w-2xl rounded-2xl border bg-card p-8 shadow-lg"
    >
      <h2 className="text-xl font-semibold text-center">
        Files uploaded successfully
      </h2>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Files will be automatically deleted in 24 hours
      </p>

      {/* LINK BOX */}
      <div className="mt-5 flex items-center gap-2 rounded-xl border bg-muted/30 px-4 py-3">
        <p className="flex-1 break-all text-sm font-medium">{url}</p>

        <Button
          size="icon"
          variant="ghost"
          className="shrink-0"
          onClick={copyLink}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* QR */}
      <div className="mt-8 flex justify-center">
        <div className="rounded-xl bg-white p-3">
          <QRCodeCanvas ref={qrRef} value={url} size={140} />
        </div>
      </div>

      {/* QR ACTIONS */}
      <div className="mt-6 flex gap-3 justify-center">
        <Button variant="outline" size="sm" onClick={copyQR}>
          {copiedQR ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          Copy QR
        </Button>

        <Button variant="outline" size="sm" onClick={downloadQR}>
          <Download className="mr-2 h-4 w-4" />
          Download QR
        </Button>
      </div>

      {/* GO TO DOWNLOAD PAGE */}
      <div className="mt-8">
        <Button asChild className="w-full" size="lg">
          <a href={url} target="_blank">
            Go to Download Page
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </motion.div>
  );
}
