const STORAGE_KEY = "droply_upload_history";
const MAX_ENTRIES = 20;

export interface UploadHistoryEntry {
  token: string;
  files: { name: string; size: number }[];
  createdAt: number;
  expiresAt: number;
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getUploadHistory(): UploadHistoryEntry[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: UploadHistoryEntry[] = JSON.parse(raw);
    return entries.filter((e) => e.expiresAt > Date.now());
  } catch {
    return [];
  }
}

export function addUploadHistoryEntry(
  entry: Omit<UploadHistoryEntry, "createdAt" | "expiresAt">,
): UploadHistoryEntry[] {
  if (!isClient()) return [];
  const newEntry: UploadHistoryEntry = {
    ...entry,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  const existing = getUploadHistory();
  const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeUploadHistoryEntry(token: string): UploadHistoryEntry[] {
  if (!isClient()) return [];
  const existing = getUploadHistory();
  const updated = existing.filter((e) => e.token !== token);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearUploadHistory(): void {
  if (!isClient()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function saveToHistory(
  token: string,
  files: { name: string; size: number }[],
): UploadHistoryEntry[] {
  return addUploadHistoryEntry({ token, files });
}
