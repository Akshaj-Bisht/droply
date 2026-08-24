import { describe, expect, it } from "vitest";
import {
  createShareToken,
  SHARE_TOKEN_ALPHABET,
  SHARE_TOKEN_LENGTH,
} from "@/lib/share-token";

describe("createShareToken", () => {
  it("creates a five-character mixed-case alphanumeric token", () => {
    const token = createShareToken();

    expect(token).toHaveLength(SHARE_TOKEN_LENGTH);
    expect(token.split("").every((character) => SHARE_TOKEN_ALPHABET.includes(character))).toBe(true);
  });
});
