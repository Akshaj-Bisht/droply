"use client";

import { Check, Clock, Copy, ExternalLink, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  addUploadHistoryEntry,
  clearUploadHistory,
  getUploadHistory,
  removeUploadHistoryEntry,
  type UploadHistoryEntry,
} from "@/lib/upload-history";

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTimeRemaining(expiresAt: number): string {
  const seconds = Math.floor((expiresAt - Date.now()) / 1000);
  if (seconds <= 0) return "expired";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadHistory({
  onEntryAdded,
}: { onEntryAdded?: number }) {
  const [entries, setEntries] = useState<UploadHistoryEntry[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(() => {
    setEntries(getUploadHistory());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, onEntryAdded]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [isOpen, refresh]);

  async function copyLink(token: string) {
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 1500);
  }

  function removeEntry(token: string) {
    setEntries(removeUploadHistoryEntry(token));
  }

  function clearAll() {
    clearUploadHistory();
    setEntries([]);
  }

  const hasEntries = entries.length > 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Clock className="h-[1.2rem] w-[1.2rem]" />
          {hasEntries && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[0.5rem] font-bold text-primary-foreground">
              {entries.length}
            </span>
          )}
          <span className="sr-only">Upload history</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Recent Uploads</span>
          {hasEntries && (
            <button
              onClick={clearAll}
              className="text-muted-foreground hover:text-destructive text-[0.625rem] font-normal transition-colors"
            >
              Clear all
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!hasEntries && (
          <div className="px-2 py-6 text-center">
            <Clock className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              No uploads yet
            </p>
            <p className="text-[0.625rem] text-muted-foreground/70">
              Your upload history will appear here
            </p>
          </div>
        )}
        {entries.map((entry) => {
          const fileCount = entry.files.length;
          const totalSize = entry.files.reduce((sum, f) => sum + f.size, 0);
          const isCopied = copiedToken === entry.token;

          return (
            <DropdownMenuItem
              key={entry.token}
              className="flex flex-col items-start gap-1.5 py-2.5 px-2 cursor-default"
            >
              <div className="flex w-full items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {fileCount === 1
                      ? entry.files[0].name
                      : `${fileCount} files`}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[0.625rem] text-muted-foreground">
                    <span>{formatFileSize(totalSize)}</span>
                    <span>·</span>
                    <span>{formatTimeAgo(entry.createdAt)}</span>
                    <span>·</span>
                    <span>{formatTimeRemaining(entry.expiresAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyLink(entry.token);
                    }}
                  >
                    {isCopied ? (
                      <Check className="h-2.5 w-2.5 text-green-500" />
                    ) : (
                      <Copy className="h-2.5 w-2.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/share/${entry.token}`, "_blank");
                    }}
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEntry(entry.token);
                    }}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </div>
              {fileCount > 1 && (
                <p className="w-full truncate text-[0.625rem] text-muted-foreground/70">
                  {entry.files.map((f) => f.name).join(", ")}
                </p>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
