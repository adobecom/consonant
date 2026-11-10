#!/usr/bin/env node
// Extract design evidence for the Spectrum contracts and write it beside them.
//
// The extraction itself is the Book's own REST path — the same one the Extract
// rail uses — reached through its dev server so there is exactly one extractor.
// Only the destination differs: the Book's save handler writes into
// packages/components/src, which is the wrong tree for another design system
// and, for Button, the wrong component entirely (both sets are named "Button",
// so the slug collides with ours).
//
//   npm run pull:figma -w @s2a/spectrum2        # needs the Book running on 6007
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BOOK = process.env.BOOK_URL ?? "http://localhost:6007";
const FILE = "https://www.figma.com/design/xHBWBBIe2eo5vwoCeNrC4Q/S2---Web";
// Icon is absent on purpose: Spectrum publishes no Icon component set, which
// the contract records as its own decision.
const SETS = { badge: "9225-2307", button: "9308-53906", picker: "10109-92114", "list-view-item": "10108-5873" };

let failed = 0;
for (const [slug, nodeId] of Object.entries(SETS)) {
  const dir = join(PKG, "src", slug);
  if (!existsSync(dir)) { console.error(`SKIP   ${slug} — no such contract`); continue; }
  let body;
  try {
    const res = await fetch(`${BOOK}/__extract/run`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `${FILE}?node-id=${nodeId}` }),
    });
    body = await res.json();
  } catch (e) {
    console.error(`FAIL   ${slug} — is the Contract Book running on ${BOOK}? (${e.message})`);
    failed++; continue;
  }
  if (!body?.ok || !body.evidence) {
    console.error(`FAIL   ${slug} — ${body?.message ?? body?.reason ?? "no evidence returned"}`);
    failed++; continue;
  }
  const file = join(dir, `${slug}.figma.evidence.json`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, JSON.stringify(body.evidence, null, 2) + "\n");
  const e = body.evidence;
  console.log(`WROTE  src/${slug}/${slug}.figma.evidence.json  set "${e.set?.name}" · ${(e.axes ?? []).length} axes · ${(e.set?.variants ?? e.variants ?? []).length || "?"} variants`);
}
process.exit(failed ? 1 : 0);
