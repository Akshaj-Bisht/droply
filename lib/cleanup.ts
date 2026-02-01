import { storage } from "@/lib/appwrite";
import prisma from "@/lib/db";

export async function cleanupExpiredFiles() {
  const expiredSessions = await prisma.uploadSession.findMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
    include: {
      files: true,
    },
  });

  for (const session of expiredSessions) {
    try {
      const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
      if (!bucketId) {
        throw new Error("Missing Appwrite bucket configuration");
      }
      // Delete each file from Appwrite
      for (const file of session.files) {
        await storage.deleteFile({
          bucketId,
          fileId: file.storageKey,
        });
      }

      // Delete session (auto deletes files via cascade)
      await prisma.uploadSession.delete({
        where: { id: session.id },
      });
    } catch (err) {
      console.error("Failed to cleanup session:", session.id, err);
    }
  }

  return expiredSessions.length;
}
