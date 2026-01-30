"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import { FileUpload } from "@/components/web/file-upload";
import { uploadToAppwrite } from "@/lib/appwrite-upload";
import { orpc } from "@/lib/orpc";
import HeroSection from "@/components/web/hero-section";
import ShareResult, {
  ShareResultSkeleton,
} from "@/components/web/share-result";

export default function Home() {
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createSession = useMutation(
    orpc.file.createSession.mutationOptions({
      onSuccess: (data) => {
        setShareToken(data.token);
      },
    }),
  );

  async function handleUpload(files: File[]) {
    if (!files.length) return;

    setIsUploading(true);
    setShareToken(null);

    const uploadedFiles: {
      name: string;
      size: number;
      storageKey: string;
      path: string;
    }[] = [];

    for (const file of files) {
      const storageKey = await uploadToAppwrite(file);

      uploadedFiles.push({
        name: file.name,
        size: file.size,
        storageKey,
        path: file.webkitRelativePath || file.name,
      });
    }

    createSession.mutate(uploadedFiles, {
      onSettled: () => {
        setIsUploading(false);
      },
    });
  }

  const shareUrl =
    shareToken && `${window.location.origin}/share/${shareToken}`;

  return (
    <>
      <HeroSection />
      <main className="mx-auto max-w-4xl px-6 pb-16">
        {/* Upload UI */}
        <FileUpload onUpload={handleUpload} />

        {/* Share Result - show skeleton while uploading, real result when done */}
        <AnimatePresence mode="wait">
          {isUploading && <ShareResultSkeleton key="skeleton" />}
          {shareUrl && !isUploading && (
            <ShareResult key="result" url={shareUrl} />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
