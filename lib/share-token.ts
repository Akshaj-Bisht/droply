import { randomInt } from "node:crypto";

export const SHARE_TOKEN_LENGTH = 5;
export const SHARE_TOKEN_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Creates a cryptographically secure, URL-safe share token. */
export function createShareToken(): string {
  return Array.from(
    { length: SHARE_TOKEN_LENGTH },
    () => SHARE_TOKEN_ALPHABET[randomInt(SHARE_TOKEN_ALPHABET.length)],
  ).join("");
}
