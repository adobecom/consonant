---
skill: token-release
description: Sync tokens from Figma, rebuild CSS, verify output, bump the version, update CHANGELOG.md, package the tarball, and commit the release. Full token pipeline from Figma → published package.
command: /token-release <version>
---

# Token Release

Run the full S2A token pipeline: pull from Figma, build CSS, verify output, bump version, update changelog, package, and commit.

## Usage

```
/token-release 0.0.13
```

---

## Step 1 — Sync from Figma

```bash
nx sync-figma tokens
```

Pull the latest variable values from Figma into `packages/tokens/json/`. This is the source of truth — the JSON files must reflect the current Figma state before building.

After sync, check that the expected JSON files changed:
```bash
git diff --stat packages/tokens/json/
```

If no files changed, the Figma variables may not have been updated since last sync — confirm with the designer before proceeding.

---

## Step 2 — Build

```bash
nx build tokens
```

Regenerates all CSS output in `packages/tokens/dist/packages/tokens/css/dev/`. Watch for any build errors in the output.

---

## Step 3 — Spot-check the output

Verify the key files exist and look correct:

```bash
# Check responsive CSS files exist
ls packages/tokens/dist/packages/tokens/css/dev/tokens.responsive.*.css

# Spot-check semantic CSS for expected tokens
grep "letter-spacing" packages/tokens/dist/packages/tokens/css/dev/tokens.semantic.css | head -20
grep "line-height" packages/tokens/dist/packages/tokens/css/dev/tokens.semantic.css | head -20
```

Rules to enforce:
- No primitive token names (e.g. `--s2a-spacing-16`) in semantic or responsive output
- No raw px values — all references resolve through `var(--s2a-…)`
- Responsive files contain only breakpoint-specific overrides, not the full primitive set

---

## Step 4 — Bump version

Update `packages/tokens/package.json`:
```json
"version": "<new-version>"
```

---

## Step 5 — Update CHANGELOG.md

Add a new `[<version>]` section at the top of `packages/tokens/CHANGELOG.md`. Use the existing entries as a format reference. Sections to include as relevant:

- `### 💥 Breaking changes` — removed tokens, renamed tokens, output format changes
- `### ✨ Improvements` — new tokens, new collections, semantic additions
- `### 🧹 Build & filtering` — pipeline, filtering, or tooling changes

Keep entries specific and technical — engineers need to know exactly what CSS variable names changed and what the migration path is.

---

## Step 6 — Package

```bash
nx package tokens
```

This produces the tarball. Commit it to `releases/`:

```bash
mv packages/tokens/*.tgz releases/adobecom-s2a-tokens-<version>.tgz
```

Also copy the current CHANGELOG.md to `releases/v<minor>/CHANGELOG.md` as a snapshot:

```bash
mkdir -p releases/v<minor>
cp packages/tokens/CHANGELOG.md releases/v<minor>/CHANGELOG.md
```

---

## Step 7 — Commit

Stage and commit all release artifacts:

```bash
git add packages/tokens/package.json
git add packages/tokens/CHANGELOG.md
git add packages/tokens/json/
git add packages/tokens/dist/
git add releases/
git commit -m "chore(tokens): release @adobecom/s2a-tokens@<version>"
```

---

## Output

Report what changed — one line each:

- Version bumped: `0.0.12` → `0.0.13`
- JSON files changed: list the filenames that diffed
- New CSS tokens: any new `--s2a-*` names (summarized)
- Removed CSS tokens: any removed names
- Tarball: `releases/adobecom-s2a-tokens-<version>.tgz`

---

## If something looks wrong

- **No JSON changed after sync** — Figma variables may not have been saved. Check with the designer.
- **Build fails** — Check for unresolved alias references in the JSON. Run `nx clean tokens` then retry.
- **Primitive tokens appearing in semantic output** — The `DESIGN ONLY` filter may have missed a token. Add the description flag in Figma or add a manual exclusion to the build config.
- **Missing responsive file** — Check that the Responsive collection in Figma has the expected mode for that breakpoint.
