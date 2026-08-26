"use client";

import { Eye, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "ico",
]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "avi", "mkv"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "flac", "aac", "m4a"]);
const PDF_EXTENSIONS = new Set(["pdf"]);
const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "json",
  "js",
  "ts",
  "jsx",
  "tsx",
  "css",
  "html",
  "xml",
  "csv",
  "yaml",
  "yml",
  "toml",
  "ini",
  "py",
  "rb",
  "go",
  "rs",
  "java",
  "c",
  "cpp",
  "h",
  "sh",
  "sql",
  "log",
  "env",
]);

function getExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

function getFileType(
  filename: string,
): "image" | "video" | "audio" | "text" | "pdf" | "none" {
  const ext = getExtension(filename);
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (AUDIO_EXTENSIONS.has(ext)) return "audio";
  if (PDF_EXTENSIONS.has(ext)) return "pdf";
  if (TEXT_EXTENSIONS.has(ext)) return "text";
  return "none";
}

function ImagePreview({
  fileId,
  filename,
}: {
  fileId: string;
  filename: string;
}) {
  return (
    <div className="flex items-center justify-center max-h-[85vh]">
      {/* biome-ignore lint/performance/noImgElement: dynamic preview from API */}
      <img
        src={`/api/preview/${fileId}`}
        alt={filename}
        className="max-h-[85vh] max-w-full object-contain rounded-lg"
        loading="lazy"
      />
    </div>
  );
}

function VideoPreview({ fileId }: { fileId: string }) {
  return (
    <div className="w-full max-w-4xl">
      {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded content */}
      <video
        src={`/api/preview/${fileId}`}
        controls
        autoPlay
        className="w-full max-h-[85vh] rounded-lg"
        preload="metadata"
      />
    </div>
  );
}

function AudioPreview({ fileId }: { fileId: string }) {
  return (
    <div className="w-full max-w-lg bg-card rounded-2xl p-8 shadow-lg border">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
            aria-hidden="true"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded content */}
        <audio
          src={`/api/preview/${fileId}`}
          controls
          autoPlay
          className="w-full"
        />
      </div>
    </div>
  );
}

function PdfPreview({ fileId }: { fileId: string }) {
  return (
    <div className="w-full h-[85vh]">
      <iframe
        src={`/api/preview/${fileId}`}
        className="w-full h-full rounded-lg border"
        title="PDF preview"
      />
    </div>
  );
}

function TextPreview({
  fileId,
  filename,
}: {
  fileId: string;
  filename: string;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/preview/${fileId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setContent(text);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fileId]);

  const ext = getExtension(filename);
  const isCode = !["txt", "md", "csv", "log"].includes(ext);

  if (loading) {
    return (
      <div className="w-full max-w-4xl bg-card rounded-2xl p-6 shadow-lg border">
        <div className="space-y-3">
          <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
          <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
          <div className="h-3 bg-muted rounded w-3/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || content === null) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-lg border text-center text-sm text-muted-foreground">
        Preview not available
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl max-h-[85vh] bg-card rounded-2xl shadow-lg border overflow-hidden flex flex-col">
      <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground truncate">
          {filename}
        </span>
        <span className="text-xs text-muted-foreground shrink-0 ml-2">
          {content.split("\n").length} lines
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <pre
          className={`p-4 text-xs leading-relaxed whitespace-pre-wrap break-words ${
            isCode ? "font-mono" : ""
          }`}
        >
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}

export function FilePreviewButton({
  filename,
  open,
  onToggle,
}: {
  filename: string;
  open: boolean;
  onToggle: () => void;
}) {
  const fileType = getFileType(filename);
  if (fileType === "none") return null;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onToggle}
      className={open ? "bg-muted" : ""}
    >
      {open ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  );
}

export function FilePreviewContent({
  fileId,
  filename,
  open,
  onClose,
}: {
  fileId: string;
  filename: string;
  open: boolean;
  onClose: () => void;
}) {
  const fileType = getFileType(filename);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Content */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation only, keyboard handled by parent */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: content wrapper to prevent backdrop close */}
          <div
            className="relative z-50 w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {fileType === "image" && (
              <ImagePreview fileId={fileId} filename={filename} />
            )}
            {fileType === "video" && <VideoPreview fileId={fileId} />}
            {fileType === "audio" && <AudioPreview fileId={fileId} />}
            {fileType === "pdf" && <PdfPreview fileId={fileId} />}
            {fileType === "text" && (
              <TextPreview fileId={fileId} filename={filename} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
