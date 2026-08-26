import { ID } from "appwrite";
import { storage } from "./appwrite";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB - Appwrite's max chunk size
const BATCH_SIZE = 5; // Upload 5 files at a time in parallel
const DELAY_BETWEEN_BATCHES = 100; // 100ms delay between batches
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000;
const PARALLEL_CHUNKS = 4; // Max parallel chunks per file (after first)

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface UploadProgress {
  completedFiles: number;
  totalFiles: number;
  currentFile: string;
  currentFileProgress: number; // 0-100
  totalBytesUploaded: number;
  totalBytes: number;
  speed: number; // bytes per second
}

// Small files: use SDK (simpler, fast enough)
async function uploadSmallFile(file: File): Promise<string> {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
  if (!bucketId) throw new Error("Missing Appwrite bucket configuration");

  const res = await storage.createFile({
    bucketId,
    fileId: ID.unique(),
    file,
  });
  return res.$id;
}

// Large files: chunked upload via raw fetch with Content-Range
async function uploadChunkedFile(
  file: File,
  onBytesProgress: (bytesUploaded: number) => void,
): Promise<string> {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
  if (!endpoint || !projectId || !bucketId) {
    throw new Error("Missing Appwrite configuration");
  }

  const totalBytes = file.size;
  let fileId = "unique()";
  let bytesUploaded = 0;

  // Upload first chunk (creates the file)
  const firstEnd = Math.min(CHUNK_SIZE, totalBytes) - 1;
  const firstChunk = file.slice(0, firstEnd + 1);

  const firstFormData = new FormData();
  firstFormData.append("fileId", "unique()");
  firstFormData.append("file", firstChunk, file.name);
  firstFormData.append("permissions[]", 'read("any")');

  const firstRes = await fetch(
    `${endpoint}/storage/buckets/${bucketId}/files`,
    {
      method: "POST",
      headers: {
        "Content-Range": `bytes 0-${firstEnd}/${totalBytes}`,
        "X-Appwrite-Project": projectId,
      },
      body: firstFormData,
    },
  );

  if (!firstRes.ok) {
    const err = await firstRes.json().catch(() => ({}));
    throw new Error(
      `Chunk upload failed: ${err.message || firstRes.statusText}`,
    );
  }

  const firstData = await firstRes.json();
  fileId = firstData.$id;
  bytesUploaded = firstEnd + 1;
  onBytesProgress(bytesUploaded);

  // Upload remaining chunks in parallel batches
  for (
    let chunkStart = CHUNK_SIZE;
    chunkStart < totalBytes;
    chunkStart += CHUNK_SIZE * PARALLEL_CHUNKS
  ) {
    const chunkPromises: Promise<void>[] = [];

    for (
      let offset = 0;
      offset < PARALLEL_CHUNKS && chunkStart + offset * CHUNK_SIZE < totalBytes;
      offset++
    ) {
      const start = chunkStart + offset * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, totalBytes) - 1;
      const chunk = file.slice(start, end + 1);

      const chunkPromise = (async () => {
        const formData = new FormData();
        formData.append("fileId", fileId);
        formData.append("file", chunk, file.name);
        formData.append("permissions[]", 'read("any")');

        const res = await fetch(
          `${endpoint}/storage/buckets/${bucketId}/files`,
          {
            method: "POST",
            headers: {
              "Content-Range": `bytes ${start}-${end}/${totalBytes}`,
              "X-Appwrite-Project": projectId,
              "X-Appwrite-ID": fileId,
            },
            body: formData,
          },
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            `Chunk upload failed: ${err.message || res.statusText}`,
          );
        }

        const chunkBytes = end - start + 1;
        bytesUploaded += chunkBytes;
        onBytesProgress(bytesUploaded);
      })();

      chunkPromises.push(chunkPromise);
    }

    await Promise.all(chunkPromises);
  }

  return fileId;
}

async function uploadWithRetry(
  file: File,
  onBytesProgress: (bytesUploaded: number) => void,
  retries = MAX_RETRIES,
  retryDelay = INITIAL_RETRY_DELAY,
): Promise<string> {
  try {
    if (file.size >= CHUNK_SIZE) {
      return await uploadChunkedFile(file, onBytesProgress);
    }
    const result = await uploadSmallFile(file);
    onBytesProgress(file.size);
    return result;
  } catch (error: unknown) {
    const maybeError = error as { code?: number; message?: string };
    if (
      retries > 0 &&
      (maybeError?.code === 429 || maybeError?.message?.includes("rate limit"))
    ) {
      await delay(retryDelay);
      onBytesProgress(0); // Reset progress for retry
      return uploadWithRetry(
        file,
        onBytesProgress,
        retries - 1,
        retryDelay * 1.5,
      );
    }
    throw error;
  }
}

export async function uploadFilesInBatches(
  files: File[],
  onProgress?: (progress: UploadProgress) => void,
): Promise<{ file: File; storageKey: string }[]> {
  const results: { file: File; storageKey: string }[] = [];
  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  let totalBytesUploaded = 0;
  const startTime = Date.now();
  let lastSpeedUpdate = startTime;
  let lastBytesAtSpeedUpdate = 0;
  let currentSpeed = 0;

  function emitProgress(
    batchIndex: number,
    file: File,
    fileBytesUploaded: number,
  ) {
    const now = Date.now();
    const elapsed = (now - lastSpeedUpdate) / 1000;
    if (elapsed >= 0.3) {
      const bytesSinceLast =
        totalBytesUploaded + fileBytesUploaded - lastBytesAtSpeedUpdate;
      currentSpeed = bytesSinceLast / elapsed;
      lastSpeedUpdate = now;
      lastBytesAtSpeedUpdate = totalBytesUploaded + fileBytesUploaded;
    }

    onProgress?.({
      completedFiles: results.length + batchIndex,
      totalFiles: files.length,
      currentFile: file.name,
      currentFileProgress:
        file.size > 0 ? Math.round((fileBytesUploaded / file.size) * 100) : 100,
      totalBytesUploaded: totalBytesUploaded + fileBytesUploaded,
      totalBytes,
      speed: currentSpeed,
    });
  }

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const fileBytesInBatch = batch.reduce((acc, f) => acc + f.size, 0);

    const batchResults = await Promise.all(
      batch.map(async (file, batchIndex) => {
        let fileBytesUploaded = 0;

        const storageKey = await uploadWithRetry(file, (bytes) => {
          fileBytesUploaded = bytes;
          emitProgress(batchIndex, file, fileBytesUploaded);
        });

        return { file, storageKey };
      }),
    );

    totalBytesUploaded += fileBytesInBatch;
    results.push(...batchResults);

    onProgress?.({
      completedFiles: results.length,
      totalFiles: files.length,
      currentFile: "",
      currentFileProgress: 100,
      totalBytesUploaded,
      totalBytes,
      speed: currentSpeed,
    });

    if (i + BATCH_SIZE < files.length) {
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }

  return results;
}
