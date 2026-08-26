import { ArrowRight, Check, Copy, Download } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { UploadProgress } from "@/lib/appwrite-upload";

const cardSpring = { type: "spring" as const, stiffness: 120, damping: 22 };
const fadeSlide = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
};

/* Skeleton Loading State */
export function ShareResultSkeleton({
  progress,
  isCreatingSession,
}: {
  progress?: UploadProgress | null;
  isCreatingSession?: boolean;
}) {
  const percentage = progress
    ? Math.round((progress.totalBytesUploaded / progress.totalBytes) * 100)
    : 0;

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatSpeed(bytesPerSec: number) {
    if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
    if (bytesPerSec < 1024 * 1024)
      return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  }

  const activeKey = isCreatingSession
    ? "creating"
    : progress
      ? "progress"
      : "skeleton";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={cardSpring}
      className="mx-auto mt-8 max-w-2xl rounded-2xl border bg-card p-8 shadow-lg overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {activeKey === "creating" && (
          <motion.div
            key="creating"
            {...fadeSlide}
            transition={{ ...fadeSlide.transition, delay: 0.05 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-center gap-2">
              <Spinner className="size-5" />
              <span className="text-sm font-medium">
                Creating share link...
              </span>
            </div>
            <Progress value={100} className="h-2" />
            <p className="text-center text-xs text-muted-foreground">
              Almost done!
            </p>
          </motion.div>
        )}

        {activeKey === "progress" && progress && (
          <motion.div key="progress" {...fadeSlide} className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Spinner className="size-5" />
              <span className="text-sm font-medium">
                Uploading {progress.completedFiles + 1} of {progress.totalFiles}{" "}
                files...
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate max-w-[40%]">
                {progress.currentFile || "Processing..."}
              </span>
              <span className="flex items-center gap-2">
                {progress.completedFiles < progress.totalFiles
                  ? `${progress.currentFileProgress}%`
                  : "100%"}{" "}
                · {formatBytes(progress.totalBytesUploaded)} /{" "}
                {formatBytes(progress.totalBytes)}
                {progress.speed > 0 && (
                  <span className="text-muted-foreground/70">
                    · {formatSpeed(progress.speed)}
                  </span>
                )}
              </span>
            </div>
          </motion.div>
        )}

        {activeKey === "skeleton" && (
          <motion.div key="skeleton" {...fadeSlide} className="space-y-3">
            <div className="flex justify-center">
              <Skeleton className="h-7 w-56" />
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl border bg-muted/30 px-4 py-3">
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <div className="mt-8 flex justify-center">
              <Skeleton className="h-40 w-40 rounded-xl" />
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <Skeleton className="h-10 w-28 rounded-lg" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
            <div className="mt-8 flex justify-center">
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

  const childFade = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, ...cardSpring },
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={cardSpring}
      className="mx-auto mt-8 max-w-2xl rounded-2xl border bg-card p-8 shadow-lg overflow-hidden"
    >
      <motion.h2
        {...childFade(0.1)}
        className="text-xl font-semibold text-center"
      >
        Files uploaded successfully
      </motion.h2>
      <motion.p
        {...childFade(0.15)}
        className="mt-2 text-center text-xs text-muted-foreground"
      >
        Files will be automatically deleted in 24 hours
      </motion.p>

      {/* LINK BOX */}
      <motion.div
        {...childFade(0.2)}
        className="mt-5 flex items-center gap-2 rounded-xl border bg-muted/30 px-4 py-3"
      >
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
      </motion.div>

      {/* QR */}
      <motion.div {...childFade(0.28)} className="mt-8 flex justify-center">
        <div className="rounded-xl bg-white p-3">
          <QRCodeCanvas ref={qrRef} value={url} size={140} />
        </div>
      </motion.div>

      {/* QR ACTIONS */}
      <motion.div
        {...childFade(0.35)}
        className="mt-6 flex gap-3 justify-center"
      >
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
      </motion.div>

      {/* GO TO DOWNLOAD PAGE */}
      <motion.div {...childFade(0.42)} className="mt-8">
        <Button asChild className="w-full" size="lg">
          <a href={url} target="_blank">
            Go to Download Page
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </motion.div>
    </motion.div>
  );
}
