"use client";

import { FolderOpen, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MAX_TOTAL_SIZE } from "@/lib/schema";
import { cn } from "@/lib/utils";

export function FileUpload({
  onUpload,
}: {
  onUpload?: (files: File[]) => Promise<void>;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  /* Calculate total size of files */
  /* Check and add files with size validation */
  const addFiles = (newFiles: File[]) => {
    const currentTotal = files.reduce((acc, file) => acc + file.size, 0);
    const newTotal = newFiles.reduce((acc, file) => acc + file.size, 0);

    if (currentTotal + newTotal > MAX_TOTAL_SIZE) {
      toast.error("Upload limit exceeded", {
        description:
          "Total file size cannot exceed 1GB. Please remove some files.",
      });
      return;
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  /* Dropzone */
  const { getRootProps, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    onDrop: (acceptedFiles) => {
      addFiles(acceptedFiles);
    },
  });

  /* Remove file */
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* Upload */
  const handleUpload = async () => {
    if (!files.length || !onUpload) return;

    try {
      setUploading(true);
      await onUpload(files);
      setFiles([]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div {...getRootProps()} className="w-full">
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={cn(
          "relative rounded-2xl border bg-card p-10",
          "shadow-sm transition",
          "text-card-foreground",
        )}
      >
        {/* Hidden Inputs */}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const newFiles = Array.from(e.target.files || []);
            addFiles(newFiles);
            e.target.value = ""; // Reset to allow re-selecting the same files
          }}
        />

        <input
          ref={folderInputRef}
          type="file"
          multiple
          className="hidden"
          // TS doesn't know this attribute, so we cast
          {...({ webkitdirectory: "" } as Record<string, unknown>)}
          onChange={(e) => {
            const newFiles = Array.from(e.target.files || []);
            addFiles(newFiles);
            e.target.value = ""; // Reset to allow re-selecting the same folder
          }}
        />

        {/* Header */}

        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="h-8 w-8 text-muted-foreground" />

          <h3 className="text-lg font-semibold">Upload your files</h3>

          <p className="text-sm text-muted-foreground">
            Drag & drop or choose an option below
          </p>

          <p className="text-xs text-muted-foreground">
            Maximum total size: 1GB
          </p>

          {/* Buttons */}
          <div className="mt-4 flex gap-3">
            <Button
              variant="default"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Files
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => folderInputRef.current?.click()}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Upload Folder
            </Button>
          </div>
        </div>

        {/* File List */}

        {files.length > 0 && (
          <div className="mt-8 space-y-2 max-h-64 overflow-y-auto">
            {files.map((file, index) => {
              // Format file size with appropriate unit
              const formatFileSize = (bytes: number) => {
                if (bytes === 0) return "0 B";
                if (bytes < 1024) return `${bytes} B`;
                if (bytes < 1024 * 1024)
                  return `${(bytes / 1024).toFixed(1)} KB`;
                return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
              };

              return (
                <motion.div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="rounded-md p-1 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Upload CTA */}

        {files.length > 0 && (
          <div className="mt-6">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              size="lg"
              className="w-full"
            >
              {uploading
                ? "Uploading..."
                : `Upload ${files.length} ${files.length === 1 ? "file" : "files"}`}
            </Button>
          </div>
        )}

        {/* Drag Overlay */}

        {isDragActive && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-muted/60 backdrop-blur-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Drop files here
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
