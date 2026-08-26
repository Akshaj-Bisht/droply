"use client";

import {
  Download,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FilePreviewButton,
  FilePreviewContent,
} from "@/components/web/file-preview";

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

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

interface FileItem {
  id: string;
  name: string;
  size: number;
}

export function FileList({ files }: { files: FileItem[] }) {
  const [openPreview, setOpenPreview] = useState<string | null>(null);
  const closePreview = () => setOpenPreview(null);

  const openFile = files.find((f) => f.id === openPreview);

  return (
    <>
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30">
          <h2 className="font-semibold">Files</h2>
        </div>

        <div>
          {files.map((file) => {
            const Icon = getFileIcon(file.name);
            const isOpen = openPreview === file.id;

            return (
              <div key={file.id} className="border-b last:border-b-0">
                <div className="flex items-center gap-4 px-4 py-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <FilePreviewButton
                              filename={file.name}
                              open={isOpen}
                              onToggle={() =>
                                setOpenPreview(isOpen ? null : file.id)
                              }
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Preview</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon-sm" asChild>
                            <a href={`/api/download/${file.id}`}>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {openFile && (
        <FilePreviewContent
          fileId={openFile.id}
          filename={openFile.name}
          open={!!openFile}
          onClose={closePreview}
        />
      )}
    </>
  );
}
