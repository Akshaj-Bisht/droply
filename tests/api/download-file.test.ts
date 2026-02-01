import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock modules with inline factories (hoisted)
vi.mock("@/lib/db", () => ({
  default: {
    file: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/appwrite", () => ({
  storage: {
    getFileDownload: vi.fn(),
  },
}));

// Import after mocking
import { GET } from "@/app/api/download/[fileId]/route";
import { storage } from "@/lib/appwrite";
import prisma from "@/lib/db";

describe("File Download API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_BUCKET_ID", "test-bucket");
  });

  it("should return 404 when file not found", async () => {
    vi.mocked(prisma.file.findUnique).mockResolvedValue(null);

    const req = new Request("http://localhost/api/download/invalid-id");
    const response = await GET(req, {
      params: Promise.resolve({ fileId: "invalid-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("File not found");
  });

  it("should return 410 when session has expired", async () => {
    const expiredDate = new Date(Date.now() - 1000); // 1 second ago

    vi.mocked(prisma.file.findUnique).mockResolvedValue({
      id: "file-1",
      name: "test.txt",
      storageKey: "storage-key-1",
      session: {
        id: "session-1",
        expiresAt: expiredDate,
      },
    } as unknown as NonNullable<
      Awaited<ReturnType<typeof prisma.file.findUnique>>
    >);

    const req = new Request("http://localhost/api/download/file-1");
    const response = await GET(req, {
      params: Promise.resolve({ fileId: "file-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(410);
    expect(data.error).toBe("This link has expired");
  });

  it("should redirect to download URL for valid file", async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    vi.mocked(prisma.file.findUnique).mockResolvedValue({
      id: "file-1",
      name: "test.txt",
      storageKey: "storage-key-1",
      session: {
        id: "session-1",
        expiresAt: futureDate,
      },
    } as unknown as NonNullable<
      Awaited<ReturnType<typeof prisma.file.findUnique>>
    >);

    vi.mocked(prisma.file.update).mockResolvedValue(
      {} as Awaited<ReturnType<typeof prisma.file.update>>,
    );
    vi.mocked(storage.getFileDownload).mockReturnValue(
      "https://appwrite.io/download/file",
    );

    const req = new Request("http://localhost/api/download/file-1");
    const response = await GET(req, {
      params: Promise.resolve({ fileId: "file-1" }),
    });

    expect(response.status).toBe(307); // Redirect status
    expect(response.headers.get("location")).toBe(
      "https://appwrite.io/download/file",
    );
  });

  it("should increment download count on successful download", async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    vi.mocked(prisma.file.findUnique).mockResolvedValue({
      id: "file-1",
      name: "test.txt",
      storageKey: "storage-key-1",
      session: {
        id: "session-1",
        expiresAt: futureDate,
      },
    } as unknown as NonNullable<
      Awaited<ReturnType<typeof prisma.file.findUnique>>
    >);

    vi.mocked(prisma.file.update).mockResolvedValue(
      {} as Awaited<ReturnType<typeof prisma.file.update>>,
    );
    vi.mocked(storage.getFileDownload).mockReturnValue(
      "https://appwrite.io/download/file",
    );

    const req = new Request("http://localhost/api/download/file-1");
    await GET(req, { params: Promise.resolve({ fileId: "file-1" }) });

    expect(prisma.file.update).toHaveBeenCalledWith({
      where: { id: "file-1" },
      data: {
        downloads: { increment: 1 },
      },
    });
  });
});
