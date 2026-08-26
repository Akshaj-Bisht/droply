import { NextResponse } from "next/server";
import { storage } from "@/lib/appwrite";
import prisma from "@/lib/db";

const PREVIEWABLE_TEXT_EXTENSIONS = new Set([
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
  "cfg",
  "conf",
  "py",
  "rb",
  "go",
  "rs",
  "java",
  "c",
  "cpp",
  "h",
  "hpp",
  "sh",
  "bash",
  "zsh",
  "sql",
  "log",
  "env",
  "gitignore",
  "dockerfile",
]);

const IMAGE_EXTENSIONS: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",
};

const VIDEO_EXTENSIONS: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
};

const AUDIO_EXTENSIONS: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  flac: "audio/flac",
  aac: "audio/aac",
  m4a: "audio/mp4",
};

function getExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;

  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: { session: true },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (new Date() > new Date(file.session.expiresAt)) {
    return NextResponse.json(
      { error: "This link has expired" },
      { status: 410 },
    );
  }

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
  if (!bucketId) {
    return NextResponse.json(
      { error: "Server is missing Appwrite bucket configuration" },
      { status: 500 },
    );
  }

  const ext = getExtension(file.name);

  if (IMAGE_EXTENSIONS[ext]) {
    const previewUrl = storage.getFilePreview({
      bucketId,
      fileId: file.storageKey,
    });
    const response = await fetch(previewUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 },
      );
    }
    const blob = await response.arrayBuffer();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": IMAGE_EXTENSIONS[ext],
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  if (VIDEO_EXTENSIONS[ext] || AUDIO_EXTENSIONS[ext]) {
    const downloadUrl = storage.getFileDownload({
      bucketId,
      fileId: file.storageKey,
    });
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 },
      );
    }
    const blob = await response.arrayBuffer();
    const contentType = VIDEO_EXTENSIONS[ext] || AUDIO_EXTENSIONS[ext];
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  if (PREVIEWABLE_TEXT_EXTENSIONS.has(ext)) {
    const fileUrl = storage.getFileDownload({
      bucketId,
      fileId: file.storageKey,
    });

    const response = await fetch(fileUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 },
      );
    }

    const text = await response.text();
    const truncated = text.length > 50_000 ? text.slice(0, 50_000) : text;

    return new NextResponse(truncated, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  if (ext === "pdf") {
    const downloadUrl = storage.getFileDownload({
      bucketId,
      fileId: file.storageKey,
    });
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 },
      );
    }
    const blob = await response.arrayBuffer();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  return NextResponse.json(
    { error: "Preview not available for this file type" },
    { status: 415 },
  );
}
