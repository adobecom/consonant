// src/loaders/meta-fence.ts
//
// Parse the `s2a:meta` fence out of a Figma component set's description —
// the same convention the s2a-toolkit plugin writes when it stamps a
// version/changelog (apps/s2a-toolkit/src/code.ts, parseMetaFence). This is
// a read-only, best-effort mirror of that logic for the health-check tool:
// it never throws, and a missing/malformed fence is reported, not fatal.

export interface ParsedMetaFence {
  hadFence: boolean;
  version: string;
  status: string;
  updated: string;
  changelog: string;
}

export function parseMetaFence(description: string | undefined): ParsedMetaFence {
  const out: ParsedMetaFence = { hadFence: false, version: "", status: "", updated: "", changelog: "" };
  if (!description) return out;

  const lines = description.split("\n");
  if (!/s2a:meta/i.test(lines[0] || "")) return out;

  out.hadFence = true;
  let end = 1;
  while (end < lines.length && lines[end].trim() !== "") end++;

  const changelog: string[] = [];
  let inChangelog = false;
  for (const line of lines.slice(1, end)) {
    const kv = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (kv && !/^\s/.test(line)) {
      inChangelog = false;
      const k = kv[1].toLowerCase();
      const v = kv[2].trim();
      if (k === "version") out.version = v;
      else if (k === "status") out.status = v;
      else if (k === "updated") out.updated = v;
      else if (k === "changelog") {
        inChangelog = true;
        if (v) changelog.push(v);
      }
    } else if (inChangelog) {
      changelog.push(line.trim());
    }
  }
  out.changelog = changelog.join(" ").trim();
  return out;
}
