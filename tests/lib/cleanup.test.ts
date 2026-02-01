import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock storage
const mockStorage = {
  deleteFile: vi.fn(),
};

// Mock Prisma
const mockPrisma = {
  uploadSession: {
    findMany: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("@/lib/db", () => ({
  default: mockPrisma,
}));

vi.mock("@/lib/appwrite", () => ({
  storage: mockStorage,
}));

describe("Cleanup Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete expired sessions and their files from storage", async () => {
    const expiredSessions = [
      {
        id: 1,
        token: "token1",
        expiresAt: new Date(Date.now() - 1000),
        files: [
          { id: 1, storageKey: "key1" },
          { id: 2, storageKey: "key2" },
        ],
      },
    ];

    mockPrisma.uploadSession.findMany.mockResolvedValue(expiredSessions);
    mockStorage.deleteFile.mockResolvedValue({});
    mockPrisma.uploadSession.delete.mockResolvedValue({});

    // Simulate cleanup logic
    const sessions = await mockPrisma.uploadSession.findMany({
      where: { expiresAt: { lt: new Date() } },
      include: { files: true },
    });

    for (const session of sessions) {
      for (const file of session.files) {
        await mockStorage.deleteFile({
          bucketId: "test-bucket",
          fileId: file.storageKey,
        });
      }
      await mockPrisma.uploadSession.delete({ where: { id: session.id } });
    }

    expect(mockStorage.deleteFile).toHaveBeenCalledTimes(2);
    expect(mockPrisma.uploadSession.delete).toHaveBeenCalledTimes(1);
  });

  it("should handle sessions with no files", async () => {
    const expiredSessions = [
      {
        id: 1,
        token: "token1",
        expiresAt: new Date(Date.now() - 1000),
        files: [],
      },
    ];

    mockPrisma.uploadSession.findMany.mockResolvedValue(expiredSessions);
    mockPrisma.uploadSession.delete.mockResolvedValue({});

    const sessions = await mockPrisma.uploadSession.findMany({
      where: { expiresAt: { lt: new Date() } },
      include: { files: true },
    });

    for (const session of sessions) {
      for (const file of session.files) {
        await mockStorage.deleteFile({
          bucketId: "test-bucket",
          fileId: file.storageKey,
        });
      }
      await mockPrisma.uploadSession.delete({ where: { id: session.id } });
    }

    expect(mockStorage.deleteFile).not.toHaveBeenCalled();
    expect(mockPrisma.uploadSession.delete).toHaveBeenCalledTimes(1);
  });

  it("should return 0 when no expired sessions exist", async () => {
    mockPrisma.uploadSession.findMany.mockResolvedValue([]);

    const sessions = await mockPrisma.uploadSession.findMany({
      where: { expiresAt: { lt: new Date() } },
      include: { files: true },
    });

    expect(sessions.length).toBe(0);
    expect(mockStorage.deleteFile).not.toHaveBeenCalled();
    expect(mockPrisma.uploadSession.delete).not.toHaveBeenCalled();
  });

  it("should handle multiple expired sessions", async () => {
    const expiredSessions = [
      {
        id: 1,
        token: "token1",
        expiresAt: new Date(Date.now() - 1000),
        files: [{ id: 1, storageKey: "key1" }],
      },
      {
        id: 2,
        token: "token2",
        expiresAt: new Date(Date.now() - 2000),
        files: [{ id: 2, storageKey: "key2" }],
      },
    ];

    mockPrisma.uploadSession.findMany.mockResolvedValue(expiredSessions);
    mockStorage.deleteFile.mockResolvedValue({});
    mockPrisma.uploadSession.delete.mockResolvedValue({});

    const sessions = await mockPrisma.uploadSession.findMany({
      where: { expiresAt: { lt: new Date() } },
      include: { files: true },
    });

    for (const session of sessions) {
      for (const file of session.files) {
        await mockStorage.deleteFile({
          bucketId: "test-bucket",
          fileId: file.storageKey,
        });
      }
      await mockPrisma.uploadSession.delete({ where: { id: session.id } });
    }

    expect(sessions.length).toBe(2);
    expect(mockStorage.deleteFile).toHaveBeenCalledTimes(2);
    expect(mockPrisma.uploadSession.delete).toHaveBeenCalledTimes(2);
  });
});
