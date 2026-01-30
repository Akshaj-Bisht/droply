import { z } from "zod";

export const MAX_TOTAL_SIZE = 1 * 1024 * 1024 * 1024; // 1GB in bytes

export const uploadFileSchema = z.object({
  name: z.string().min(1),
  size: z.number().nonnegative(),
  storageKey: z.string().min(1),
  path: z.string().min(1),
});

export const createSessionSchema = z
  .array(uploadFileSchema)
  .min(1, "At least one file is required")
  .refine(
    (files) =>
      files.reduce((acc, file) => acc + file.size, 0) <= MAX_TOTAL_SIZE,
    { message: "Total file size cannot exceed 1GB" },
  );

export const getSessionSchema = z.object({
  token: z.string().length(32),
});
