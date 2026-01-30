import { describe, it, expect } from "vitest";
import {
  uploadFileSchema,
  createSessionSchema,
  getSessionSchema,
  MAX_TOTAL_SIZE,
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

    it("should reject zero or negative size", () => {
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

      expect(uploadFileSchema.safeParse(zeroSize).success).toBe(false);
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
  });
});
