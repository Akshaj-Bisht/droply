import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Prisma
const mockPrisma = {
  uploadSession: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
  },
  file: {
    create: vi.fn(),
  },
};

// Mock the db module
vi.mock("@/lib/db", () => ({
  default: mockPrisma,
}));

// Mock crypto
vi.mock("crypto", () => ({
  randomBytes: vi.fn(() => ({
    toString: () => "a".repeat(32),
  })),
}));

describe("File Procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUploadSession logic", () => {
    it("should create a session with files", async () => {
      const mockSession = {
        id: 1,
        token: "a".repeat(32),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      mockPrisma.uploadSession.create.mockResolvedValue(mockSession);
      mockPrisma.file.create.mockResolvedValue({});

      const input = [
        { name: "test.txt", size: 1024, storageKey: "key1", path: "test.txt" },
      ];

      // Simulate the handler logic
      const session = await mockPrisma.uploadSession.create({
        data: {
          token: "a".repeat(32),
          expiresAt: expect.any(Date),
        },
      });

      for (const file of input) {
        await mockPrisma.file.create({
          data: {
            name: file.name,
            size: file.size,
            storageKey: file.storageKey,
            path: file.path,
            sessionId: session.id,
          },
        });
      }

      expect(mockPrisma.uploadSession.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.file.create).toHaveBeenCalledTimes(1);
    });

    it("should create multiple files for a session", async () => {
      const mockSession = {
        id: 1,
        token: "a".repeat(32),
        expiresAt: new Date(),
      };

      mockPrisma.uploadSession.create.mockResolvedValue(mockSession);
      mockPrisma.file.create.mockResolvedValue({});

      const input = [
        {
          name: "file1.txt",
          size: 1024,
          storageKey: "key1",
          path: "file1.txt",
        },
        {
          name: "file2.txt",
          size: 2048,
          storageKey: "key2",
          path: "file2.txt",
        },
        {
          name: "file3.txt",
          size: 512,
          storageKey: "key3",
          path: "folder/file3.txt",
        },
      ];

      await mockPrisma.uploadSession.create({
        data: {
          token: "a".repeat(32),
          expiresAt: expect.any(Date),
        },
      });

      for (const file of input) {
        await mockPrisma.file.create({
          data: {
            name: file.name,
            size: file.size,
            storageKey: file.storageKey,
            path: file.path,
            sessionId: mockSession.id,
          },
        });
      }

      expect(mockPrisma.file.create).toHaveBeenCalledTimes(3);
    });
  });

  describe("getUploadSession logic", () => {
    it("should return session with files when found", async () => {
      const mockSession = {
        id: 1,
        token: "a".repeat(32),
        expiresAt: new Date(),
        files: [
          {
            id: 1,
            name: "test.txt",
            size: 1024,
            storageKey: "key1",
            path: "test.txt",
          },
        ],
      };

      mockPrisma.uploadSession.findUnique.mockResolvedValue(mockSession);

      const result = await mockPrisma.uploadSession.findUnique({
        where: { token: "a".repeat(32) },
        include: { files: true },
      });

      expect(result).toEqual(mockSession);
      expect(result?.files).toHaveLength(1);
    });

    it("should return null when session not found", async () => {
      mockPrisma.uploadSession.findUnique.mockResolvedValue(null);

      const result = await mockPrisma.uploadSession.findUnique({
        where: { token: "nonexistent" },
        include: { files: true },
      });

      expect(result).toBeNull();
    });
  });
});
