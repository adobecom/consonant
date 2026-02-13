# Token Pipeline Steps (FigJam Cards)

**Quick Reference:** Step-by-step cards for token pipeline operations

---

## Lane 1: Update Tokens (Figma)

### Card 1.1: Open Figma File

**Action:** Open Figma file (file key in `FIGMA_FILE_ID` env var)  
**Expected:** File opens in Figma

### Card 1.2: Navigate to Variables

**Action:** Press `Shift + Cmd/Ctrl + K` to open Variables panel  
**Expected:** Variables panel displays all collections

### Card 1.3: Edit Variables

**Action:** Edit existing or create new variables in appropriate collection  
**Expected:** Changes saved in Figma

### Card 1.4: Verify Collection

**Action:** Confirm variable is in correct collection (Primitives, Semantic, etc.)  
**Expected:** Variable appears in expected collection

---

## Lane 2: Pull/Export (Local)

### Card 2.1: Set Environment Variables

**Command:** Create `.env` file or export: `FIGMA_REST_API=<token>`, `FIGMA_FILE_ID=<file-id>`  
**Expected:** Environment variables set

### Card 2.2: Sync from Figma

**Command:** `npm run tokens:sync`  
**Expected:** Token JSON files in `packages/design-tokens/tokens/`

### Card 2.3: Verify Sync Output

**Action:** Check `packages/design-tokens/tokens/metadata.json` exists  
**Expected:** Metadata file contains file list and sync timestamp

### Card 2.4: Check Token Files

**Action:** List files: `ls packages/design-tokens/tokens/*.json`  
**Expected:** Multiple JSON files (one per collection/mode)

---

## Lane 3: Build/Transforms

### Card 3.1: Run Build

**Command:** `npm run tokens:build`  
**Expected:** CSS files generated in `dist/packages/design-tokens/css/`

### Card 3.2: Verify Dev Files

**Action:** Check `dist/packages/design-tokens/css/dev/`  
**Expected:** 10 CSS files (primitives, semantic, typography, component, each with light/dark variants)

### Card 3.3: Verify Minified File

**Action:** Check `dist/packages/design-tokens/css/min/tokens.min.css`  
**Expected:** Single consolidated minified CSS file

### Card 3.4: Inspect CSS Output

**Action:** Open `css/dev/tokens.primitives.css` in editor  
**Expected:** CSS custom properties with `--s2a-` prefix

---

## Lane 4: Publish/Package

### Card 4.1: Run Tests

**Command:** `npm run tokens:test`  
**Expected:** All tests pass (205 tests)

### Card 4.2: Bump Version

**Command:** `node packages/design-tokens/scripts/version.js patch` (or minor/major)  
**Expected:** Version updated in `packages/design-tokens/package.json`

### Card 4.3: Update CHANGELOG

**Action:** Edit `packages/design-tokens/CHANGELOG.md` with new version entry  
**Expected:** CHANGELOG updated with changes

### Card 4.4: Package Tarball

**Command:** `npm run tokens:package`  
**Expected:** `s2a-tokens-<version>.tgz` created in repo root

### Card 4.5: Verify Package

**Action:** Check tarball: `ls -lh s2a-tokens-*.tgz`  
**Expected:** Tarball file exists with correct version

### Card 4.6: Commit and Tag

**Command:** `git add . && git commit -m "chore: release v<version>" && git tag "s2a-tokens-v<version>"`  
**Expected:** Changes committed, tag created

### Card 4.7: Publish (Optional)

**Command:** `cd dist/packages/design-tokens && npm publish`  
**Expected:** Package published to npm registry

---

## Lane 5: Consume in Milo

### Card 5.1: Install Package

**Command:** `npm install ./s2a-tokens-<version>.tgz` (or from registry)  
**Expected:** Package installed in `node_modules/s2a-tokens/`

### Card 5.2: Import CSS (Production)

**Action:** Add to Milo root stylesheet: `@import "s2a-tokens/css/min/tokens.min.css";`  
**Expected:** All tokens available as CSS custom properties

### Card 5.3: Import CSS (Development)

**Action:** Import individual files in order (primitives → semantic)  
**Expected:** Tokens available for debugging

### Card 5.4: Switch Theme

**Action:** Set `document.documentElement.dataset.theme = "dark"`  
**Expected:** Dark mode tokens applied

---

## Quick Command Reference

**Full Pipeline:**

```bash
npm run tokens:sync && npm run tokens:build && npm run tokens:package
```

**Version Bump + Release:**

```bash
node packages/design-tokens/scripts/version.js patch
npm run tokens:build
npm run tokens:package
git add . && git commit -m "chore: release v<version>"
```

**Clean Start:**

```bash
npm run tokens:clean && npm run tokens:sync && npm run tokens:build
```

---

**End of FigJam Steps**

