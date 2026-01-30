import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock archiver first (before other mocks)
vi.mock("archiver", () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    append: vi.fn(),
    finalize: vi.fn(),
  })),
}));

// Mock modules with inline factories (hoisted)
vi.mock("@/lib/db", () => ({
  default: {
    uploadSession: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/appwrite", () => ({
  storage: {
    getFileDownload: vi.fn(),
  },
}));

// Import after mocking
import { GET } from "@/app/api/download/session/[token]/route";
import prisma from "@/lib/db";
import { storage } from "@/lib/appwrite";

describe("Session Download API (Zip)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_APPWRITE_BUCKET_ID", "test-bucket");
  });

  it("should return 404 when session not found", async () => {
    vi.mocked(prisma.uploadSession.findUnique).mockResolvedValue(null);

    const req = new Request(
      "http://localhost/api/download/session/invalid-token",
    );
    const response = await GET(req, {
      params: Promise.resolve({ token: "invalid-token" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Session not found");
  });

  it("should return 410 when session has expired", async () => {
    const expiredDate = new Date(Date.now() - 1000); // 1 second ago

    vi.mocked(prisma.uploadSession.findUnique).mockResolvedValue({
      id: "session-1",
      token: "test-token",
      expiresAt: expiredDate,
      files: [],
    } as any);

    const req = new Request("http://localhost/api/download/session/test-token");
    const response = await GET(req, {
      params: Promise.resolve({ token: "test-token" }),
    });
    const data = await response.json();

    expect(response.status).toBe(410);
    expect(data.error).toBe("This link has expired");
  });

  it("should return zip response for valid session", async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    vi.mocked(prisma.uploadSession.findUnique).mockResolvedValue({
      id: "session-1",
      token: "test-token",
      expiresAt: futureDate,
      files: [
        {
          id: "file-1",
          name: "test.txt",
          storageKey: "key-1",
          path: "test.txt",
        },
      ],
    } as any);

    vi.mocked(storage.getFileDownload).mockResolvedValue(
      new ArrayBuffer(100) as any,
    );

    const req = new Request("http://localhost/api/download/session/test-token");
    const response = await GET(req, {
      params: Promise.resolve({ token: "test-token" }),
    });

    expect(response.headers.get("Content-Type")).toBe("application/zip");
    expect(response.headers.get("Content-Disposition")).toContain(
      "droply-test-token.zip",
    );
  });

  it("should set correct filename in Content-Disposition header", async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const token = "abc123def456";

    vi.mocked(prisma.uploadSession.findUnique).mockResolvedValue({
      id: "session-1",
      token,
      expiresAt: futureDate,
      files: [],
    } as any);

    const req = new Request(`http://localhost/api/download/session/${token}`);
    const response = await GET(req, { params: Promise.resolve({ token }) });

    expect(response.headers.get("Content-Disposition")).toBe(
      `attachment; filename="droply-${token}.zip"`,
    );
  });
});
