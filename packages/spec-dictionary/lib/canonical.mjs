// Stable JSON (sorted keys at every level) and sha256, shared by every layer so
// hashes only move when content does.
import { createHash } from "node:crypto";

export function canonicalJson(value) {
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.keys(value).sort().map((k) => JSON.stringify(k) + ":" + canonicalJson(value[k])).join(",") + "}";
  return JSON.stringify(value === undefined ? null : value);
}
export const sha256 = (text) => "sha256:" + createHash("sha256").update(text).digest("hex");
export const hashOf = (value) => sha256(canonicalJson(value));
