import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("px-4", "py-2");
    expect(result).toBe("px-4 py-2");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active");
    expect(result).toBe("base-class active");
  });

  it("should filter out falsy values", () => {
    const result = cn("base", false, null, undefined, "visible");
    expect(result).toBe("base visible");
  });

  it("should merge Tailwind classes correctly (last one wins)", () => {
    const result = cn("px-4", "px-8");
    expect(result).toBe("px-8");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle array of classes", () => {
    const result = cn(["px-4", "py-2"]);
    expect(result).toBe("px-4 py-2");
  });

  it("should handle object syntax", () => {
    const result = cn({ "bg-red-500": true, "bg-blue-500": false });
    expect(result).toBe("bg-red-500");
  });

  it("should merge conflicting Tailwind utilities", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("should handle complex combinations", () => {
    const result = cn(
      "base-class",
      ["array-class"],
      { "conditional-class": true },
      false && "ignored",
      "final-class",
    );
    expect(result).toContain("base-class");
    expect(result).toContain("array-class");
    expect(result).toContain("conditional-class");
    expect(result).toContain("final-class");
    expect(result).not.toContain("ignored");
  });
});
