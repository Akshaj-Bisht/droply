"use client";

import { Check, Link } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button variant="outline" size="sm" onClick={copyLink}>
      {copied ? (
        <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
      ) : (
        <Link className="mr-1.5 h-3.5 w-3.5" />
      )}
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}
