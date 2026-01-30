import { storage } from "./appwrite";
import { ID } from "appwrite";

// Fast parallel uploads with retry
const BATCH_SIZE = 3; // Upload 3 files at a time in parallel
const DELAY_BETWEEN_BATCHES = 800; // 800ms delay between batches
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds initial retry delay

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadWithRetry(
  file: File,
  retries = MAX_RETRIES,
  retryDelay = INITIAL_RETRY_DELAY,
): Promise<string> {
  try {
    const res = await storage.createFile({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      fileId: ID.unique(),
      file,
    });
    return res.$id;
  } catch (error: any) {
    if (
      retries > 0 &&
      (error?.code === 429 || error?.message?.includes("rate limit"))
    ) {
      // Rate limit error - wait with exponential backoff and retry silently
      await delay(retryDelay);
      return uploadWithRetry(file, retries - 1, retryDelay * 1.5);
    }
    throw error;
  }
}

export async function uploadToAppwrite(file: File) {
  return uploadWithRetry(file);
}

export async function uploadFilesInBatches(
  files: File[],
  onProgress?: (completed: number, total: number) => void,
): Promise<{ file: File; storageKey: string }[]> {
  const results: { file: File; storageKey: string }[] = [];

  // Upload files in batches of 3 in parallel
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (file) => {
        const storageKey = await uploadWithRetry(file);
        return { file, storageKey };
      }),
    );

    results.push(...batchResults);
    onProgress?.(results.length, files.length);

    // Add delay between batches to avoid rate limits
    if (i + BATCH_SIZE < files.length) {
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }

  return results;
}
