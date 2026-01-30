import { orpc } from "@/lib/orpc.server";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/web/navbar";
import {
  Download,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  Clock,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Someone shared files with you - Droply",
  description:
    "Download shared files securely. Files auto-delete after 24 hours.",
};

/* Get file icon based on extension */
function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"];
  const videoExts = ["mp4", "mov", "avi", "mkv", "webm", "flv"];
  const audioExts = ["mp3", "wav", "ogg", "flac", "aac", "m4a"];
  const archiveExts = ["zip", "rar", "7z", "tar", "gz", "bz2"];
  const codeExts = [
    "js",
    "ts",
    "jsx",
    "tsx",
    "html",
    "css",
    "json",
    "py",
    "java",
    "c",
    "cpp",
    "go",
    "rs",
  ];
  const docExts = [
    "pdf",
    "doc",
    "docx",
    "txt",
    "md",
    "rtf",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
  ];

  if (imageExts.includes(ext)) return FileImage;
  if (videoExts.includes(ext)) return FileVideo;
  if (audioExts.includes(ext)) return FileAudio;
  if (archiveExts.includes(ext)) return FileArchive;
  if (codeExts.includes(ext)) return FileCode;
  if (docExts.includes(ext)) return FileText;

  return File;
}

/* Format file size */
function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/* Format time remaining */
function formatTimeRemaining(expiresAt: Date | string) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await orpc.file.getSession({ token });

  if (!session) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-2 py-6">
          <Navbar />
        </div>
        <div className="flex items-center justify-center p-6 pt-20">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <File className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">File not found</h1>
            <p className="text-muted-foreground">
              This link has expired or doesn't exist.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const totalSize = session.files.reduce((acc, file) => acc + file.size, 0);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-2 py-6">
        <Navbar />
      </div>
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Someone shared files with you</h1>
          <p className="text-muted-foreground">
            {session.files.length}{" "}
            {session.files.length === 1 ? "file" : "files"} •{" "}
            {formatFileSize(totalSize)}
          </p>
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTimeRemaining(session.expiresAt)}</span>
          </div>
        </div>

        {/* Download All Button */}
        <div className="mt-8">
          <Button asChild size="lg" className="w-full">
            <a href={`/api/download/session/${token}`}>
              <Download className="mr-2 h-5 w-5" />
              Download All ({formatFileSize(totalSize)})
            </a>
          </Button>
        </div>

        {/* File List */}
        <div className="mt-8 rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h2 className="font-semibold">Files</h2>
          </div>

          <div className="divide-y">
            {session.files.map((file) => {
              const Icon = getFileIcon(file.name);

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  {/* File Icon */}
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* Download Button */}
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`/api/download/${file.id}`}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Files will be automatically deleted when the timer expires
        </p>
      </div>
    </main>
  );
}
