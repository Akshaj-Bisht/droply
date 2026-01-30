import prisma from "@/lib/db";
import { storage } from "@/lib/appwrite";
import archiver from "archiver";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const session = await prisma.uploadSession.findUnique({
    where: { token },
    include: { files: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Check if session has expired
  if (new Date() > new Date(session.expiresAt)) {
    return NextResponse.json(
      { error: "This link has expired" },
      { status: 410 },
    );
  }

  const archive = archiver("zip");

  const stream = new ReadableStream({
    start(controller) {
      archive.on("data", (chunk) => controller.enqueue(chunk));
      archive.on("end", () => controller.close());
      archive.on("error", (err) => controller.error(err));
    },
  });

  (async () => {
    for (const file of session.files) {
      const buffer = await storage.getFileDownload({
        bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        fileId: file.storageKey,
      });

      archive.append(Buffer.from(buffer), {
        name: file.path,
      });
    }

    archive.finalize();
  })();

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="droply-${token}.zip"`,
    },
  });
}
