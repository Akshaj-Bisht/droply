import { randomBytes } from "node:crypto";
import { os } from "@orpc/server";
import prisma from "@/lib/db";
import { createSessionSchema, getSessionSchema } from "@/lib/schema";

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
    const sessionToken = randomBytes(16).toString("hex");
    const session = await prisma.uploadSession.create({
      data: {
        token: sessionToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

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
