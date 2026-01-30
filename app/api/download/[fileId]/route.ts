import prisma from "@/lib/db";
import { storage } from "@/lib/appwrite";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
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

  // Check if session has expired
  if (new Date() > new Date(file.session.expiresAt)) {
    return NextResponse.json(
      { error: "This link has expired" },
      { status: 410 },
    );
  }

  await prisma.file.update({
    where: { id: fileId },
    data: {
      downloads: { increment: 1 },
    },
  });

  const downloadUrl = storage.getFileDownload({
    bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
    fileId: file.storageKey,
  });

  return NextResponse.redirect(downloadUrl);
}
