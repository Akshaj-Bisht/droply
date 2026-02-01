import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
const mockCleanupExpiredFiles = vi.fn();

vi.mock("@/lib/cleanup", () => ({
  cleanupExpiredFiles: () => mockCleanupExpiredFiles(),
}));

// Import after mocking
import { GET } from "@/app/api/cron/cleanup/route";

describe("Cleanup Cron API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variable
    vi.stubEnv("CRON_SECRET", "test-secret");
  });

  it("should return 401 without authorization header", async () => {
    const req = new Request("http://localhost/api/cron/cleanup", {
      method: "GET",
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 with invalid authorization", async () => {
    const req = new Request("http://localhost/api/cron/cleanup", {
      method: "GET",
      headers: {
        authorization: "Bearer wrong-secret",
      },
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should cleanup expired files with valid authorization", async () => {
    mockCleanupExpiredFiles.mockResolvedValue(5);

    const req = new Request("http://localhost/api/cron/cleanup", {
      method: "GET",
      headers: {
        authorization: "Bearer test-secret",
      },
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.deleted).toBe(5);
    expect(mockCleanupExpiredFiles).toHaveBeenCalledTimes(1);
  });

  it("should return 0 deleted when no expired files", async () => {
    mockCleanupExpiredFiles.mockResolvedValue(0);

    const req = new Request("http://localhost/api/cron/cleanup", {
      method: "GET",
      headers: {
        authorization: "Bearer test-secret",
      },
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.deleted).toBe(0);
  });
});
