import { describe, expect, it } from "vitest";
import {
  createSessionSchema,
  getSessionSchema,
  MAX_TOTAL_SIZE,
  uploadFileSchema,
} from "@/lib/schema";

describe("Schema Validation", () => {
  describe("MAX_TOTAL_SIZE", () => {
    it("should be 1GB in bytes", () => {
      expect(MAX_TOTAL_SIZE).toBe(1 * 1024 * 1024 * 1024);
    });
  });

  describe("uploadFileSchema", () => {
    it("should validate a correct file object", () => {
      const validFile = {
        name: "test.txt",
        size: 1024,
        storageKey: "abc123",
        path: "folder/test.txt",
      };

      const result = uploadFileSchema.safeParse(validFile);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const invalidFile = {
        name: "",
        size: 1024,
        storageKey: "abc123",
        path: "test.txt",
      };

      const result = uploadFileSchema.safeParse(invalidFile);
      expect(result.success).toBe(false);
    });

    it("should accept zero-byte files but reject negative size", () => {
      const zeroSize = {
        name: "test.txt",
        size: 0,
        storageKey: "abc123",
        path: "test.txt",
      };

      const negativeSize = {
        name: "test.txt",
        size: -100,
        storageKey: "abc123",
        path: "test.txt",
      };

      expect(uploadFileSchema.safeParse(zeroSize).success).toBe(true);
      expect(uploadFileSchema.safeParse(negativeSize).success).toBe(false);
    });

    it("should reject empty storageKey", () => {
      const invalidFile = {
        name: "test.txt",
        size: 1024,
        storageKey: "",
        path: "test.txt",
      };

      const result = uploadFileSchema.safeParse(invalidFile);
      expect(result.success).toBe(false);
    });

    it("should reject empty path", () => {
      const invalidFile = {
        name: "test.txt",
        size: 1024,
        storageKey: "abc123",
        path: "",
      };

      const result = uploadFileSchema.safeParse(invalidFile);
      expect(result.success).toBe(false);
    });
  });

  describe("createSessionSchema", () => {
    it("should validate an array with valid files", () => {
      const validFiles = [
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
      ];

      const result = createSessionSchema.safeParse(validFiles);
      expect(result.success).toBe(true);
    });

    it("should reject empty array", () => {
      const result = createSessionSchema.safeParse([]);
      expect(result.success).toBe(false);
    });

    it("should reject if total size exceeds 1GB", () => {
      const largeFiles = [
        {
          name: "file1.txt",
          size: 500 * 1024 * 1024,
          storageKey: "key1",
          path: "file1.txt",
        },
        {
          name: "file2.txt",
          size: 600 * 1024 * 1024,
          storageKey: "key2",
          path: "file2.txt",
        },
      ];

      const result = createSessionSchema.safeParse(largeFiles);
      expect(result.success).toBe(false);
    });

    it("should accept files exactly at 1GB total", () => {
      const files = [
        {
          name: "file1.txt",
          size: MAX_TOTAL_SIZE,
          storageKey: "key1",
          path: "file1.txt",
        },
      ];

      const result = createSessionSchema.safeParse(files);
      expect(result.success).toBe(true);
    });

    it("should reject files just over 1GB total", () => {
      const files = [
        {
          name: "file1.txt",
          size: MAX_TOTAL_SIZE + 1,
          storageKey: "key1",
          path: "file1.txt",
        },
      ];

      const result = createSessionSchema.safeParse(files);
      expect(result.success).toBe(false);
    });

    it("should handle many small files within limit", () => {
      const files = Array.from({ length: 100 }, (_, i) => ({
        name: `file${i}.txt`,
        size: 10 * 1024 * 1024, // 10MB each = 1000MB total (under 1GB)
        storageKey: `key${i}`,
        path: `file${i}.txt`,
      }));

      const result = createSessionSchema.safeParse(files);
      expect(result.success).toBe(true);
    });

    it("should reject when many small files exceed limit", () => {
      const files = Array.from({ length: 110 }, (_, i) => ({
        name: `file${i}.txt`,
        size: 10 * 1024 * 1024, // 10MB each = 1100MB total (over 1GB)
        storageKey: `key${i}`,
        path: `file${i}.txt`,
      }));

      const result = createSessionSchema.safeParse(files);
      expect(result.success).toBe(false);
    });

    it("should reject files with invalid nested properties", () => {
      const files = [
        {
          name: "valid.txt",
          size: 1024,
          storageKey: "key1",
          path: "valid.txt",
        },
        {
          name: "", // Invalid: empty name
          size: 1024,
          storageKey: "key2",
          path: "invalid.txt",
        },
      ];

      const result = createSessionSchema.safeParse(files);
      expect(result.success).toBe(false);
    });
  });

  describe("getSessionSchema", () => {
    it("should validate a 32-character token", () => {
      const validToken = { token: "a".repeat(32) };

      const result = getSessionSchema.safeParse(validToken);
      expect(result.success).toBe(true);
    });

    it("should reject tokens shorter than 32 characters", () => {
      const shortToken = { token: "a".repeat(31) };

      const result = getSessionSchema.safeParse(shortToken);
      expect(result.success).toBe(false);
    });

    it("should reject tokens longer than 32 characters", () => {
      const longToken = { token: "a".repeat(33) };

      const result = getSessionSchema.safeParse(longToken);
      expect(result.success).toBe(false);
    });

    it("should reject empty token", () => {
      const emptyToken = { token: "" };

      const result = getSessionSchema.safeParse(emptyToken);
      expect(result.success).toBe(false);
    });

    it("should validate hex token format", () => {
      // Real token from randomBytes(16).toString('hex')
      const hexToken = { token: "a1b2c3d4e5f6789012345678abcdef00" };

      const result = getSessionSchema.safeParse(hexToken);
      expect(result.success).toBe(true);
    });

    it("should reject missing token property", () => {
      const noToken = {};

      const result = getSessionSchema.safeParse(noToken);
      expect(result.success).toBe(false);
    });
  });
});
