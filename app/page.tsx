"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import { FileUpload } from "@/components/web/file-upload";
import { uploadFilesInBatches } from "@/lib/appwrite-upload";
import { orpc } from "@/lib/orpc";
import HeroSection from "@/components/web/hero-section";
import ShareResult, {
  ShareResultSkeleton,
} from "@/components/web/share-result";

export default function Home() {
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    completed: 0,
    total: 0,
  });

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
    setUploadProgress({ completed: 0, total: files.length });

    try {
      const results = await uploadFilesInBatches(files, (completed, total) => {
        setUploadProgress({ completed, total });
      });

      const uploadedFiles = results.map(({ file, storageKey }) => ({
        name: file.name,
        size: file.size,
        storageKey,
        path: (file as any).webkitRelativePath || file.name,
      }));

      setIsCreatingSession(true);
      createSession.mutate(uploadedFiles, {
        onSettled: () => {
          setIsUploading(false);
          setIsCreatingSession(false);
        },
      });
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      // You could add a toast notification here
    }
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
          {(isUploading || isCreatingSession) && (
            <ShareResultSkeleton
              key="skeleton"
              progress={uploadProgress.total > 0 ? uploadProgress : undefined}
              isCreatingSession={isCreatingSession}
            />
          )}
          {shareUrl && !isUploading && !isCreatingSession && (
            <ShareResult key="result" url={shareUrl} />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
