import { os } from "@orpc/server";
import prisma from "@/lib/db";
import { createSessionSchema, getSessionSchema } from "@/lib/schema";
import { createShareToken } from "@/lib/share-token";

const MAX_TOKEN_ATTEMPTS = 10;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export const createUploadSession = os
  .route({
    method: "POST",
    path: "/api/orpc",
    summary: "Create file upload session",
    description:
      "Creates a new file upload session and returns a unique token.",
    tags: ["upload-file"],
  })
  .input(createSessionSchema)
  .handler(async ({ input }) => {
    let session: { id: string } | undefined;
    let sessionToken = "";

    for (let attempt = 0; attempt < MAX_TOKEN_ATTEMPTS; attempt += 1) {
      sessionToken = createShareToken();

      try {
        session = await prisma.uploadSession.create({
          data: {
            token: sessionToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          },
        });
        break;
      } catch (error) {
        if (!isUniqueConstraintError(error)) {
          throw error;
        }
      }
    }

    if (!session) {
      throw new Error("Unable to create a unique share link. Please try again.");
    }

    for (const file of input) {
      await prisma.file.create({
        data: {
          name: file.name,
          size: file.size,
          storageKey: file.storageKey,
          path: file.path,
          sessionId: session.id,
        },
      });
    }
    return { token: sessionToken };
  });

export const getUploadSession = os
  .route({
    method: "GET",
    path: "/api/orpc",
    summary: "Get file upload session by token",
    description: "Retrieves a file upload session using its unique token.",
    tags: ["get-file"],
  })
  .input(getSessionSchema)
  .handler(async ({ input }) => {
    const session = await prisma.uploadSession.findUnique({
      where: { token: input.token },
      include: {
        files: true,
      },
    });
    if (!session) {
      return null;
    }

    return session;
  });
