import { os } from "@orpc/server";
import prisma from "@/lib/db";
import crypto from "crypto";
import { getFileSchema, uploadSchema } from "@/lib/schema";

export const createFile = os
  .route({
    method: "POST",
    path: "/api/orpc",
    summary: "Create a temporary file upload entry",
    description:
      "Creates a temporary file upload entry and returns a unique token.",
    tags: ["File"],
  })
  .input(uploadSchema)
  .handler(async ({ input }) => {
    const token = crypto.randomBytes(16).toString("hex");

    await prisma.file.create({
      data: {
        token,
        name: input.name,
        size: input.size,
        storageKey: input.storageKey,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    return { token };
  });

export const getFile = os
  .route({
    method: "GET",
    path: "/api/orpc",
    summary: "Get file upload entry by token",
    description: "Retrieves a file upload entry using its unique token.",
    tags: ["token"],
  })
  .input(getFileSchema)
  .handler(async ({ input }) => {
    return prisma.file.findUnique({
      where: { token: input.token },
    });
  });
