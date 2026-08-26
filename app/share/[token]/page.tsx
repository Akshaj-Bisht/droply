import { Clock, Download, File } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FileList } from "@/components/web/file-list";
import Navbar from "@/components/web/navbar";
import { orpc } from "@/lib/orpc.server";
import { CopyLinkButton } from "./copy-link-button";

export const metadata: Metadata = {
  title: "Download Shared Files",
  description:
    "Someone shared files with you on Droply. Download them securely before they expire.",
  robots: {
    index: false,
    follow: false,
  },
};

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

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

  const totalSize = session.files.reduce(
    (acc: number, file: { size: number }) => acc + file.size,
    0,
  );

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
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTimeRemaining(session.expiresAt)}</span>
            </div>
            <CopyLinkButton token={token} />
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
        <div className="mt-8">
          <FileList
            files={session.files.map(
              (f: { id: string; name: string; size: number }) => ({
                id: f.id,
                name: f.name,
                size: f.size,
              }),
            )}
          />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Files will be automatically deleted when the timer expires
        </p>
      </div>
    </main>
  );
}
