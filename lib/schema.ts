import { z } from "zod";

export const uploadSchema = z.object({
  name: z.string().min(1),
  size: z.number().positive(),
  storageKey: z.string(),
});

export const getFileSchema = z.object({
  token: z.string().length(32),
});
