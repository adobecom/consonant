---
name: figma-s2a-audit
description: Audit a Figma design node to enforce S2A design system token usage. Produces a report AND creates native Figma annotations pointing to each issue.
argument-hint: [figma-node-url-or-id]
allowed-tools: mcp__figma-console__figma_get_selection mcp__figma-console__figma_execute mcp__figma-console__figma_take_screenshot mcp__figma-console__figma_set_annotations mcp__figma-console__figma_get_annotations
---

You are enforcing S2A design system token compliance for a Figma design node.

## Your task

1. **Resolve the node** — if $ARGUMENTS contains a Figma URL, extract the node ID (e.g. `node-id=10391-4493` → `10391:4493`). If no argument is given, use `figma_get_selection` to get the currently selected node.

2. **Fetch all variable bindings** — use `figma_execute` to walk the entire node tree recursively. For each node, collect:
   - `boundVariables` — resolve each to its variable name + collection name
   - Solid fills — check if bound or raw hex
   - Solid strokes — check if bound or raw hex
   - Text styles — fontSize, fontFamily, fontWeight
   Use async APIs (`getNodeByIdAsync`, `getVariableByIdAsync`, `getVariableCollectionByIdAsync`). Return all entries.

3. **Classify every binding** as one of:
   - **S2A token** — variable name starts with `s2a/` or `--s2a-` (from any collection starting with `S2A /`)
   - **S2A primitive token** — variable from a collection starting with `Primitives /` or `S2A / Primitives` (e.g. `font/family/adobe-clean`, `font/weight/adobe-clean-display/black`). These are the S2A foundation layer — compliant but worth noting.
   - **Non-S2A token** — a named variable from a non-S2A collection (e.g. `Black` from `Color`, `4 XS` from `Spacing`, `spacing-XS` from `Spacing & Radius`). These should be migrated.
   - **Brand token** — variable from `brand colors` collection (e.g. `DC/dark red`, `Photography & Digital Imaging/tile`). Acceptable exception.
   - **Raw / hardcoded value** — a plain hex, number, or string with no variable binding at all.

4. **Create native Figma annotations** — see Annotation System below.

5. **Report** in chat — see Report Format below.

## Annotation System

Use Figma's native annotation feature via `figma_set_annotations` to attach audit notes directly to problematic nodes. These appear when users press **Y** (Annotation mode) in Figma.

### What gets annotated
- Every node with a **raw/hardcoded value**
- Every node with a **non-S2A token**
- Do NOT annotate nodes that only have S2A tokens, S2A primitives, or brand tokens — those are compliant or acceptable

### Annotation format

For each problematic node, call `figma_set_annotations` with:

```json
{
  "nodeId": "NODE_ID",
  "annotations": [{
    "labelMarkdown": "**Non-S2A token**\nFill: `Black` (Color collection)\n\n**Suggested:** `s2a/color/content/title`",
    "properties": [{"type": "fills"}]
  }]
}
```

#### Label format
- Start with **bold issue type**: `**Non-S2A token**`, `**Hardcoded**`, or `**Non-S2A + Hardcoded**`
- List each problem: property name, current value/token, collection name
- End with **Suggested:** and the recommended S2A token replacement
- Use markdown: backticks for token names, bold for headers, bullet lists for multiple issues

#### Pinned properties
Pin the relevant design properties so they show inline with the annotation. Valid property types:
`width`, `height`, `fills`, `strokes`, `effects`, `strokeWeight`, `cornerRadius`, `fontSize`, `fontFamily`, `fontStyle`, `fontWeight`, `lineHeight`, `letterSpacing`, `itemSpacing`, `layoutMode`, `alignItems`, `opacity`

Note: `padding` is NOT a valid pinned property — use the label text to describe padding issues instead.

### Deduplication
- If multiple children in the same instance share the same issue (e.g. all children of `B_app_AdobeFirefly` have unbound fills), annotate the parent instance once with a combined note
- If a node has both non-S2A tokens AND hardcoded values, combine into a single annotation with type `**Non-S2A + Hardcoded**`

### Parallelization
Batch annotations by calling multiple `figma_set_annotations` in parallel (up to 6-8 per message) to maximize speed.

## Report Format

After creating annotations, also report in chat:

```
## S2A Token Audit — [Node Name]

### S2A Tokens (compliant) — [count]
- `s2a/color/content/title` → fills
- `s2a/spacing/lg` → padding
...

### S2A Primitives (foundation layer) — [count]
- `font/family/adobe-clean` → fontFamily (Primitives / Dimension / Static)
...

### Brand Tokens (acceptable) — [count]
- `Photography & Digital Imaging/tile` → fills (brand colors)
...

### Non-S2A Tokens — [count]
- `Black` (Color collection) → fills on "L Button / Primary / Dark"
  Suggested: `s2a/color/content/title` or `s2a/color/background/knockout`
...

### Hardcoded Raw Values — [count]
- `#cecece` → fill on "Asset" frame
  Suggested: bind to S2A background or surface token
...

### Summary
- Total bindings inspected: N
- S2A compliant: N (X%)
- S2A primitives: N (X%)
- Brand tokens: N (X%)
- Non-S2A tokens: N (X%) — needs migration
- Hardcoded values: N (X%) — must fix

### Verdict
PASS / NEEDS REVIEW / FAIL
```

## S2A Token Categories (for suggesting alternatives)

- **Color — content:** `s2a/color/content/title`, `s2a/color/content/body`, `s2a/color/content/body-subtle`, `s2a/color/content/eyebrow`, `s2a/color/content/label`, `s2a/color/content/knockout`, `s2a/color/content/disabled`
- **Color — background:** `s2a/color/background/default`, `s2a/color/background/knockout`, `s2a/color/background/layer-1`, `s2a/color/background/layer-2`
- **Color — border:** `s2a/color/border/default`, `s2a/color/border/subtle`, `s2a/color/border/strong`
- **Color — transparent:** `s2a/color/transparent/white-*`, `s2a/color/transparent/black-*`
- **Spacing:** `s2a/spacing/xs` (8), `s2a/spacing/sm` (12), `s2a/spacing/md` (16), `s2a/spacing/lg` (24), `s2a/spacing/xl` (32), `s2a/spacing/2xl` (48), `s2a/spacing/3xl` (64), `s2a/spacing/4xl` (80)
- **Typography:** `s2a/typography/font-size/*`, `s2a/typography/line-height/*`, `s2a/typography/letter-spacing/*` (title-1 through title-4, body-sm/md/lg, eyebrow, label, caption)
- **Font primitives:** `font/family/adobe-clean`, `font/family/adobe-clean-display`, `font/weight/adobe-clean/*`, `font/weight/adobe-clean-display/*`
- **Border radius:** `s2a/border-radius/sm`, `s2a/border-radius/md`, `s2a/border-radius/lg`

## Classification Rules

1. **S2A semantic** — variable name starts with `s2a/` AND collection starts with `S2A / Semantic` or `S2A / Responsive`
2. **S2A primitive** — collection starts with `S2A / Primitives` or `Primitives /` — these are foundation tokens, compliant
3. **Brand token** — collection is `brand colors` — acceptable exception, note "product brand token"
4. **Non-S2A token** — any other named variable (from `Color`, `Spacing`, `Spacing & Radius`, or other legacy collections)
5. **Hardcoded** — property has no variable binding and contains a raw value

## Important Rules

- Product brand tokens (e.g. `Photography & Digital Imaging/tile`, `DVA/mnemonic`, `Corporate/red`) are **acceptable exceptions**. Do NOT annotate them.
- S2A primitive tokens (`font/family/*`, `font/weight/*`) are **compliant**. Do NOT annotate them.
- Any hardcoded hex that matches an S2A token value should be flagged as hardcoded and the matching token suggested.
- If the audit passes cleanly (no non-S2A tokens or hardcoded values), congratulate and confirm compliance.
- Remind the user to press **Y** in Figma to view annotations, or select annotated nodes to see the notes.
- Annotations are undoable in Figma (Cmd+Z) — mention this for easy cleanup.
