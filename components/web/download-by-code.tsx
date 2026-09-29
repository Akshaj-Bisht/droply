"use client";

import { ArrowRight, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const shareCodePattern = /^(?:[A-Za-z0-9]{5}|[a-f0-9]{32})$/;

function getShareCode(value: string) {
  const trimmedValue = value.trim();

  try {
    const url = new URL(trimmedValue);
    const match = url.pathname.match(/^\/share\/([^/]+)\/?$/);
    return match?.[1] ?? "";
  } catch {
    return trimmedValue;
  }
}

export function DownloadByCode() {
  const router = useRouter();
  const [shareCode, setShareCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = getShareCode(shareCode);
    if (!shareCodePattern.test(code)) {
      setError("Enter a valid share code or link.");
      return;
    }

    setError("");
    router.push(`/share/${encodeURIComponent(code)}`);
  }

  return (
    <section className="mt-6 rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Download className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-semibold">Download shared files</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the share code or paste the link you received.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <div className="min-w-0 flex-1">
          <label htmlFor="share-code" className="sr-only">
            Share code
          </label>
          <Input
            id="share-code"
            value={shareCode}
            onChange={(event) => {
              setShareCode(event.target.value);
              if (error) setError("");
            }}
            placeholder="Paste your share code or link"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "share-code-error" : undefined}
          />
          {error && (
            <p id="share-code-error" className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="sm:self-start">
          Open files
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
    </section>
  );
}
