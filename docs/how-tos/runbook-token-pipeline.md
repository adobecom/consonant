# Token Pipeline Runbook

**Last Updated:** 2025-01-XX  
**Package Name:** `s2a-tokens`  
**Current Version:** `0.0.4`

---

## A) Overview

### What Problem This Solves

This repository implements a design token pipeline that:

- Pulls Variables/Tokens from Figma via the Figma REST API
- Transforms raw Figma variable data into structured JSON token files
- Converts tokens to CSS custom properties (CSS variables) using Style Dictionary
- Packages outputs as a distributable npm package (`s2a-tokens`)
- Supports theme-aware outputs (light/dark modes)
- Generates both development (uncompressed) and production (minified, consolidated) CSS files

### Inputs

- **Figma Variables**: Design tokens defined in Figma Variable Collections
  - Primitives (Core): spacing, typography, radii, opacity, shadows
  - Primitives (Color): color palette values for light/dark modes
  - Semantic: meaning-based tokens that reference primitives
  - Semantic (Color): theme-aware color tokens
  - Component: UI-specific tokens (non-color, light/dark color variants)
  - Typography: Typography scale tokens (font-size, line-height, letter-spacing)
  - Responsive: breakpoint-specific tokens (currently filtered out from build)

### Outputs

- **JSON Token Files**: Raw token data in `packages/tokens/json/` (not published)
- **CSS Custom Properties**: Generated CSS files in `dist/packages/tokens/css/`
  - Development files: `css/dev/` (individual, uncompressed)
  - Production file: `css/min/tokens.min.css` (consolidated, minified)
- **npm Package**: Tarball file `s2a-tokens-<version>.tgz` in repo root

### Who Consumes Outputs

- **Milo**: Primary consumer (TODO: confirm exact integration method)
- **Other applications**: Any project that needs design tokens as CSS custom properties
- **Package consumers**: Install via `npm install ./s2a-tokens-<version>.tgz` or from internal npm registry

---

## B) Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    FIGMA VARIABLES                          │
│  (Variable Collections: Primitives, Semantic, Component)    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ FIGMA REST API
                     │ (sync-figma-variables.js)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              packages/tokens/json/                  │
│  • raw.json (full Figma export)                              │
│  • metadata.json (sync metadata)                             │
│  • <collection>-<id>.<mode>.json (split by collection/mode) │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Style Dictionary + Custom Transforms
                     │ (build-tokens.js)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         dist/packages/tokens/css/                    │
│  dev/                                                         │
│    • tokens.primitives.css                                   │
│    • tokens.primitives.light.css                            │
│    • tokens.primitives.dark.css                              │
│    • tokens.semantic.css                                     │
│    • tokens.semantic.light.css                               │
│    • tokens.semantic.dark.css                                │
│    • tokens.typography.css                                   │
│    • tokens.component.css                                    │
│    • tokens.component.light.css                              │
│    • tokens.component.dark.css                                │
│  min/                                                         │
│    • tokens.min.css (consolidated, minified)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Package & Publish
                     │ (package-tokens.js + npm pack)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              s2a-tokens-<version>.tgz                        │
│  (npm package ready for distribution)                        │
└─────────────────────────────────────────────────────────────┘
```

### Key Modules

- **`packages/tokens/scripts/sync-figma-variables.js`**: Fetches variables from Figma API, transforms to token JSON files
- **`packages/tokens/scripts/build-tokens.js`**: Main build script using Style Dictionary to generate CSS
- **`packages/tokens/scripts/transformers/`**: Custom transformers for unit conversions, typography, CSS processing
- **`packages/tokens/scripts/utils/`**: Utility functions for token merging, string manipulation, CSS file operations
- **`packages/tokens/scripts/package-tokens.js`**: Validates build output and prepares for packaging
- **`packages/tokens/scripts/version.js`**: Version bumping utility (TODO: wire up as npm script)

---

## C) Prerequisites

### Node.js Version

- **Required**: Node.js (TODO: confirm minimum version - check `.nvmrc` or `engines` in package.json)
- **Package Manager**: npm (uses `package-lock.json`)

### Environment Variables

Create a `.env` file in the repository root (or set environment variables):

```bash
FIGMA_REST_API=<your-figma-personal-access-token>
FIGMA_FILE_ID=<figma-file-key>
FIGMA_API_BASE_URL=https://api.figma.com  # Optional, defaults to this
FIGMA_BASE_MODE=<mode-name>                # Optional, for base mode selection
```

**How to get a Figma Personal Access Token:**

1. Go to Figma → Settings → Account
2. Scroll to "Personal access tokens"
3. Generate a new token
4. Copy the token value to `FIGMA_REST_API`

**How to get the Figma File ID:**

1. Open your Figma file
2. The file key is in the URL: `https://www.figma.com/design/<FILE_KEY>/...`
3. Copy the file key to `FIGMA_FILE_ID`

### Access Requirements

- **Figma Access**: Read access to the Figma file containing variables
- **Figma API Token**: Personal access token with file read permissions
- **npm/npm registry**: Access to publish packages (if publishing to registry)

### Dependencies

Install dependencies:

```bash
npm install
```

---

## D) Repo Tour

### Key Folders

- **`packages/tokens/`**: Main token package
  - `tokens/`: Raw token JSON files from Figma (not published)
  - `scripts/`: Build, sync, and transform scripts
  - `CHANGELOG.md`: Version history
  - `README.md`: Package documentation
  - `package.json`: Package metadata

- **`dist/packages/tokens/`**: Build output directory
  - `css/dev/`: Uncompressed CSS files for development
  - `css/min/`: Minified consolidated CSS for production
  - `package.json`: Package manifest (copied during build)
  - `README.md`, `CHANGELOG.md`: Documentation (copied during build)

- **`apps/storybook/`**: Storybook application for token documentation

- **`docs/`**: Documentation (this runbook)

### Key Files

- **`package.json`** (root): Root package scripts and dependencies
- **`nx.json`**: Nx workspace configuration
- **`packages/tokens/project.json`**: Nx project configuration for tokens
- **`packages/tokens/json/metadata.json`**: Figma sync metadata (file ID, collections, modes)
- **`packages/tokens/json/raw.json`**: Full Figma API response (not used in build, for reference)

---

## E) Quickstart

### End-to-End Local Build

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (create .env file or export)
export FIGMA_REST_API="your-token"
export FIGMA_FILE_ID="your-file-id"

# 3. Sync tokens from Figma
npm run tokens:sync

# 4. Build CSS from tokens
npm run tokens:build

# 5. Package for distribution
npm run tokens:package
```

**Expected Output:**

- Token JSON files in `packages/tokens/json/`
- CSS files in `dist/packages/tokens/css/dev/` and `css/min/`
- Tarball `s2a-tokens-<version>.tgz` in repo root

---

## F) Operating the Pipeline

### How to Update/Add Tokens in Figma

1. Open the Figma file (file key in `FIGMA_FILE_ID`)
2. Navigate to Variables panel (Shift + Cmd/Ctrl + K)
3. Edit existing variables or create new ones in the appropriate collection:
   - **Primitives (Core)**: Raw values (spacing, typography, radii, etc.)
   - **Primitives (Color)**: Color palette values
   - **Semantic**: Meaning-based tokens (reference primitives)
   - **Semantic (Color)**: Theme-aware color tokens
   - **Component**: Component-specific tokens (currently filtered out)
   - **Responsive**: Breakpoint-specific tokens (currently filtered out)
4. Save changes in Figma
5. Run `npm run tokens:sync` to pull changes into the repo

**Note**: Token names in Figma use `/` separators (e.g., `spacing/16`) which become nested paths in JSON and kebab-case in CSS (e.g., `--s2a-spacing-16`).

### How to Pull/Export from Figma

**Command:**

```bash
npm run tokens:sync
```

**Or via Nx:**

```bash
nx sync-figma tokens
```

**What it does:**

1. Reads `FIGMA_REST_API` and `FIGMA_FILE_ID` from environment or `.env` file
2. Calls Figma REST API: `GET /v1/files/{fileId}/variables/local`
3. Transforms Figma variables into token JSON files
4. Splits tokens by collection and mode into separate files
5. Writes to `packages/tokens/json/`:
   - `raw.json`: Full API response
   - `metadata.json`: Sync metadata (file ID, collections, modes, timestamps)
   - `<collection>-<id>.<mode>.json`: Token files split by collection and mode

**Output Location:**

- `packages/tokens/json/`

**Excluded Collections:**

- Collection ID `VariableCollectionId:615453529a3e5f28b1a63fa69f5f3131a7400bb8/8335:3614` is excluded (see `EXCLUDED_COLLECTION_IDS` in `sync-figma-variables.js`)

### How Transforms Work

**Transform Pipeline:**

1. **Load tokens** from JSON files (by collection and mode)
2. **Merge tokens** from multiple files (primitives + semantic, etc.)
3. **Apply unit conversions**:
   - Typography: font-size (px → rem), line-height (percentage strings), letter-spacing (percentage strings)
   - Spacing: px → rem conversions
   - See `packages/tokens/scripts/transformers/unit-conversions.js`
4. **Typography transformations**:
   - Font weight: string → numeric (`"Regular"` → `400`)
   - Line height: calculated as unitless ratios based on font-size
   - See `packages/tokens/scripts/transformers/typography-transformers.js`
5. **CSS post-processing**:
   - Hex color shorthand (`#ffffff` → `#fff`)
   - Modern color syntax (`rgba(r, g, b, a)` → `rgb(r g b / a%)`)
   - Zero unit removal (`0px` → `0`)
   - See `packages/tokens/scripts/transformers/css-processors.js`

**Where Transforms Are Defined:**

- `packages/tokens/scripts/transformers/unit-conversions.js`
- `packages/tokens/scripts/transformers/typography-transformers.js`
- `packages/tokens/scripts/transformers/css-processors.js`

**How to Add a Transform:**

1. Add transform logic to appropriate transformer file
2. Call transform function in `build-tokens.js` at the appropriate stage
3. Update tests in `packages/tokens/scripts/__tests__/`

### How CSS Outputs Are Generated

**Build Command:**

```bash
npm run tokens:build
```

**Or via Nx:**

```bash
nx build tokens
```

**Build Process:**

1. Reads `packages/tokens/json/metadata.json` to determine available collections and modes
2. Loads and merges token files by category:
   - Primitives Core (non-color)
   - Primitives Color (light/dark)
   - Semantic (non-color)
   - Semantic Color (light/dark)
   - Typography (font-size, line-height, letter-spacing)
   - Component (non-color, light/dark color variants)
   - Responsive (currently filtered out)
3. Applies unit conversions and transforms
4. Generates CSS files using Style Dictionary with custom `s2a-` prefix
5. Post-processes CSS (color shorthand, modern syntax, zero units)
6. Organizes outputs:
   - Uncompressed files in `dist/packages/tokens/css/` (temporarily)
   - Moves uncompressed files to `css/dev/`
   - Creates consolidated minified file in `css/min/tokens.min.css`

**File Naming:**

- `tokens.primitives.css`: Non-color primitives
- `tokens.primitives.light.css`: Color primitives (light mode)
- `tokens.primitives.dark.css`: Color primitives (dark mode)
- `tokens.semantic.css`: Non-color semantic tokens
- `tokens.semantic.light.css`: Semantic colors (light mode)
- `tokens.semantic.dark.css`: Semantic colors (dark mode)
- `tokens.typography.css`: Typography scale tokens (font-size, line-height, letter-spacing)
- `tokens.component.css`: Component non-color tokens
- `tokens.component.light.css`: Component colors (light mode)
- `tokens.component.dark.css`: Component colors (dark mode)
- `tokens.min.css`: Consolidated minified file (all layers)

**CSS Custom Property Naming:**

- Format: `--s2a-<category>-<subcategory>-<name>`
- Example: `--s2a-spacing-16`, `--s2a-color-background-default`
- Prefix: `s2a-` (defined in custom Style Dictionary transform)

**Selectors:**

- Base tokens: `:root`
- Light mode: `:root[data-theme="light"]`
- Dark mode: `:root[data-theme="dark"]`

**Filtering:**

- Component tokens: Built as separate files (`tokens.component.css`, `tokens.component.light.css`, `tokens.component.dark.css`)
- Typography tokens: Built as separate file (`tokens.typography.css`)
- Responsive tokens: Currently filtered out (commented in `build-tokens.js`)
- Dataviz colors: Filtered out from primitives color files
- Primitive font-size values: Excluded from semantic.css (only semantic t-shirt sizes included)

### How to Produce a "Milo-Ready" Consolidated Output

**Production File (Recommended):**
The build automatically creates a consolidated minified file:

- **Location**: `dist/packages/tokens/css/min/tokens.min.css`
- **Contains**: All token layers in correct order (primitives → semantic → typography → component)
- **Format**: Minified, single file

**Usage in Milo:**

```css
/* In Milo's root stylesheet */
@import "s2a-tokens/css/min/tokens.min.css";
```

**Development Files (Optional):**
If Milo needs individual files for debugging:

- Location: `dist/packages/tokens/css/dev/`
- Import order (in Milo's stylesheet):

```css
@import "s2a-tokens/css/dev/tokens.primitives.css";
@import "s2a-tokens/css/dev/tokens.primitives.light.css";
@import "s2a-tokens/css/dev/tokens.primitives.dark.css";
@import "s2a-tokens/css/dev/tokens.semantic.css";
@import "s2a-tokens/css/dev/tokens.semantic.light.css";
@import "s2a-tokens/css/dev/tokens.semantic.dark.css";
@import "s2a-tokens/css/dev/tokens.typography.css";
@import "s2a-tokens/css/dev/tokens.component.css";
@import "s2a-tokens/css/dev/tokens.component.light.css";
@import "s2a-tokens/css/dev/tokens.component.dark.css";
```

**TODO: Confirm Milo Integration**

- Verify exact import path in Milo codebase
- Confirm if Milo uses the minified file or individual files
- Document any Milo-specific configuration

---

## G) Release Process

### Versioning Strategy

**Semantic Versioning (SemVer):**

- **Patch** (`0.0.X`): Bug fixes, internal improvements, no breaking changes
- **Minor** (`0.X.0`): New tokens, new modes, backward compatible additions
- **Major** (`X.0.0`): Token removals, renames, breaking structural changes

**Current Version:** `0.0.4` (see `packages/tokens/package.json`)

### How to Generate a New Release Locally

**Step 1: Update Tokens (if needed)**

```bash
npm run tokens:sync
```

**Step 2: Run Tests**

```bash
npm run tokens:test
```

**Step 3: Bump Version**

**TODO: Wire up version script as npm command**

Currently, version bumping must be done manually or via the standalone script:

```bash
# Option A: Use the version script directly
node packages/tokens/scripts/version.js patch
# or
node packages/tokens/scripts/version.js minor
# or
node packages/tokens/scripts/version.js major
```

**Or manually edit:**

- `packages/tokens/package.json` → `version` field
- `package.json` (root) → `version` field (optional, for consistency)

**Step 4: Update CHANGELOG.md**

- Edit `packages/tokens/CHANGELOG.md`
- Add new version entry with changes
- Follow format: `[X.Y.Z] - YYYY-MM-DD`

**Step 5: Build**

```bash
npm run tokens:build
```

**Step 6: Package**

```bash
npm run tokens:package
```

**Step 7: Verify Package**

```bash
# Check tarball was created
ls -lh s2a-tokens-*.tgz

# Optional: Inspect package contents
tar -tzf s2a-tokens-<version>.tgz | head -20
```

**Step 8: Commit and Tag**

```bash
git add packages/tokens/package.json package.json packages/tokens/CHANGELOG.md
git commit -m "chore: release s2a-tokens v<version>"
git tag "s2a-tokens-v<version>"
```

### How to Publish

**Option 1: Publish to npm Registry**

```bash
cd dist/packages/tokens
npm publish
```

**Option 2: Distribute Tarball**
The tarball `s2a-tokens-<version>.tgz` in the repo root is ready for distribution:

- Share via file system
- Upload to internal artifact repository
- Install directly: `npm install ./s2a-tokens-<version>.tgz`

**Option 3: Publish to Internal Registry**

```bash
cd dist/packages/tokens
npm publish --registry=<internal-registry-url>
```

**Package Contents:**

- `css/dev/`: Development CSS files
- `css/min/`: Production minified CSS
- `package.json`: Package manifest
- `README.md`: Package documentation
- `CHANGELOG.md`: Version history

### How Consumers Update

**Install from Tarball:**

```bash
npm install ./s2a-tokens-<version>.tgz
```

**Install from npm Registry:**

```bash
npm install s2a-tokens@<version>
```

**Example Usage in Consumer Project:**

```css
/* In consumer's root stylesheet (e.g., index.css) */
@import "s2a-tokens/css/min/tokens.min.css";
```

**Or for development (individual files):**

```css
@import "s2a-tokens/css/dev/tokens.primitives.css";
@import "s2a-tokens/css/dev/tokens.primitives.light.css";
@import "s2a-tokens/css/dev/tokens.primitives.dark.css";
@import "s2a-tokens/css/dev/tokens.semantic.css";
@import "s2a-tokens/css/dev/tokens.semantic.light.css";
@import "s2a-tokens/css/dev/tokens.semantic.dark.css";
```

**Switch Themes:**

```javascript
// In consumer's JavaScript
document.documentElement.dataset.theme = "dark"; // or "light"
```

### Rollback Procedure

**If Published to npm:**

1. Unpublish (if within 72 hours):
   ```bash
   npm unpublish s2a-tokens@<version>
   ```
2. Publish previous version:
   ```bash
   cd dist/packages/tokens
   # Restore previous version in package.json
   npm publish
   ```

**If Distributed via Tarball:**

1. Revert git commit and tag:
   ```bash
   git revert <commit-hash>
   git tag -d s2a-tokens-v<version>
   ```
2. Rebuild previous version:
   ```bash
   git checkout <previous-version-tag>
   npm run tokens:build
   npm run tokens:package
   ```

**Notify Consumers:**

- Update internal documentation
- Notify Milo team (TODO: confirm notification process)

---

## H) Troubleshooting

### 1. Auth/Token Errors

**Error:** `Missing FIGMA_REST_API environment variable`

**Solution:**

- Create `.env` file in repo root with `FIGMA_REST_API=<token>`
- Or export: `export FIGMA_REST_API="your-token"`
- Verify token is valid in Figma → Settings → Account → Personal access tokens

**Error:** `Failed to fetch Figma variables (401 Unauthorized)`

**Solution:**

- Token may be expired or invalid
- Regenerate token in Figma
- Ensure token has read access to the file

**Error:** `Failed to fetch Figma variables (403 Forbidden)`

**Solution:**

- Token may not have access to the file
- Verify file ID is correct
- Ensure token has appropriate permissions

### 2. Figma Rate Limits

**Error:** `Failed to fetch Figma variables (429 Too Many Requests)`

**Solution:**

- Figma API has rate limits (typically 200 requests per minute)
- Wait a few minutes and retry
- Consider caching token files locally and only syncing when needed

### 3. Missing Variables

**Error:** `Warning: no variables returned from Figma`

**Solution:**

- Verify file ID is correct (`FIGMA_FILE_ID`)
- Check that the file contains variables
- Ensure variables are not in excluded collections (check `EXCLUDED_COLLECTION_IDS` in `sync-figma-variables.js`)
- Verify token has read access to the file

**Error:** Variables exist in Figma but not in output

**Solution:**

- Check if collection is excluded (see `EXCLUDED_COLLECTION_IDS`)
- Verify variable is not marked as "remote" or "deletedButReferenced"
- Check `packages/tokens/json/raw.json` to see if variable was fetched

### 4. Transform Failures

**Error:** `Unable to parse Figma token file`

**Solution:**

- JSON file may be corrupted
- Re-run `npm run tokens:sync` to regenerate files
- Check `packages/tokens/json/raw.json` for API response issues

**Error:** CSS generation fails with reference errors

**Solution:**

- Token references may be broken (e.g., `{spacing.16}` but `spacing.16` doesn't exist)
- Check token files for broken aliases
- Verify primitive tokens exist before semantic tokens reference them

### 5. Output Missing/Empty

**Error:** `dist/packages/tokens/css/` is empty

**Solution:**

- Run `npm run tokens:build` (not just sync)
- Check build logs for errors
- Verify `packages/tokens/json/metadata.json` exists and contains files

**Error:** CSS files exist but are empty

**Solution:**

- Check if tokens were filtered out (component tokens, responsive tokens, dataviz colors)
- Verify token files contain data: `cat packages/tokens/json/primitives-core-*.json`
- Check build logs for filtering messages

### 6. CI Failures

**TODO: Confirm if CI exists**

If CI/CD is configured:

- Check CI logs for environment variable issues
- Ensure `FIGMA_REST_API` and `FIGMA_FILE_ID` are set in CI secrets
- Verify Node.js version matches local
- Check for rate limiting in CI (may need to cache token files)

### 7. Package Build Fails

**Error:** `dist/packages/tokens/css directory not found`

**Solution:**

- Run `npm run tokens:build` before packaging
- Verify build completed successfully

**Error:** `dist/packages/tokens/package.json not found`

**Solution:**

- Build script should copy `package.json` during build
- Check `build-tokens.js` → `copyPackageJson()` function
- Manually copy if needed: `cp packages/tokens/package.json dist/packages/tokens/`

### 8. Version Bump Issues

**Error:** Version script not found

**Solution:**

- Use direct script: `node packages/tokens/scripts/version.js patch`
- Or manually edit `packages/tokens/package.json`

### 9. Minification Errors

**Error:** Minified CSS has errors

**Solution:**

- Check `css/dev/` files for CSS syntax errors
- Verify CleanCSS is processing correctly
- Check build logs for CleanCSS warnings

### 10. Import Order Issues in Consumer

**Error:** CSS variables are undefined in consumer

**Solution:**

- Ensure import order: primitives → semantic → component
- Use consolidated file: `@import "s2a-tokens/css/min/tokens.min.css"`
- Verify all required files are imported

---

## I) Governance + Ownership

### Recommended Maintainers

**Primary Maintainer:**

- TODO: Document primary maintainer name/contact

**Secondary Maintainers:**

- TODO: Document secondary maintainer(s)

**Design System Team:**

- TODO: Document design system team contacts

### Ownership Areas

- **Figma Variables**: Design system team (designers)
- **Token Pipeline**: Engineering team (platform engineers)
- **Package Distribution**: Engineering team (DevOps/platform)
- **Consumer Integration**: Milo team (TODO: confirm)

### Bus Factor Plan

**Minimum Bus Factor:** 2 (at least 2 people should be able to run releases)

**Knowledge Transfer:**

- This runbook (primary documentation)
- Code comments in key scripts
- Test coverage (205 tests in `packages/tokens/scripts/__tests__/`)

**Onboarding Checklist:**

- [ ] Read this runbook
- [ ] Set up `.env` file with Figma credentials
- [ ] Run end-to-end build locally
- [ ] Review `packages/tokens/README.md`
- [ ] Review test files to understand expected behavior
- [ ] Practice a version bump and package build

---

## J) Appendix

### Environment Variable Reference Table

| Variable                     | Required | Default                 | Description                         |
| ---------------------------- | -------- | ----------------------- | ----------------------------------- |
| `FIGMA_REST_API`             | Yes      | -                       | Figma personal access token         |
| `FIGMA_FILE_ID`              | Yes      | -                       | Figma file key (from URL)           |
| `FIGMA_API_BASE_URL`         | No       | `https://api.figma.com` | Figma API base URL                  |
| `FIGMA_BASE_MODE`            | No       | Auto-detected           | Base mode name for non-color tokens |
| `STYLE_DICTIONARY_VERBOSITY` | No       | `verbose`               | Style Dictionary log level          |

### Scripts Reference Table (from package.json)

| Script           | Command                                                      | Description                                          |
| ---------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| `tokens:sync`    | `nx sync-figma tokens`                                | Pull tokens from Figma                               |
| `tokens:build`   | `nx build tokens`                                     | Build CSS from tokens                                |
| `tokens:package` | `nx package tokens`                                   | Create distributable tarball                         |
| `tokens:minify`  | `nx minify tokens`                                    | Minify CSS files (legacy, minification now in build) |
| `tokens:clean`   | `nx clean tokens`                                     | Clean build output and tokens                        |
| `tokens:test`    | `nx test tokens`                                      | Run tests                                            |
| `tokens:analyze` | `node packages/tokens/scripts/analyze-performance.js` | Analyze performance                                  |
| `version:patch`  | `npm version patch --no-git-tag-version`                     | Bump patch version (root package only)               |
| `version:minor`  | `npm version minor --no-git-tag-version`                     | Bump minor version (root package only)               |
| `version:major`  | `npm version major --no-git-tag-version`                     | Bump major version (root package only)               |

**Note:** Version scripts in root `package.json` only affect root package. For tokens version, use `node packages/tokens/scripts/version.js <patch|minor|major>`.

### Output Artifacts Inventory

**Source Token Files** (not published):

- `packages/tokens/json/raw.json`: Full Figma API response
- `packages/tokens/json/metadata.json`: Sync metadata
- `packages/tokens/json/*.json`: Token files by collection/mode

**Build Output** (`dist/packages/tokens/`):

- `css/dev/tokens.primitives.css`: Non-color primitives (uncompressed)
- `css/dev/tokens.primitives.light.css`: Color primitives light (uncompressed)
- `css/dev/tokens.primitives.dark.css`: Color primitives dark (uncompressed)
- `css/dev/tokens.semantic.css`: Non-color semantic (uncompressed)
- `css/dev/tokens.semantic.light.css`: Semantic colors light (uncompressed)
- `css/dev/tokens.semantic.dark.css`: Semantic colors dark (uncompressed)
- `css/dev/tokens.typography.css`: Typography scale tokens (uncompressed)
- `css/dev/tokens.component.css`: Component non-color tokens (uncompressed)
- `css/dev/tokens.component.light.css`: Component colors light (uncompressed)
- `css/dev/tokens.component.dark.css`: Component colors dark (uncompressed)
- `css/min/tokens.min.css`: Consolidated minified file (production, all 10 files)

**Package Files** (in tarball):

- `css/dev/`: All development CSS files
- `css/min/`: Production minified CSS
- `package.json`: Package manifest
- `README.md`: Package documentation
- `CHANGELOG.md`: Version history

**Distribution Artifacts** (repo root):

- `s2a-tokens-<version>.tgz`: npm package tarball

---

## TODOs for Future Updates

- [ ] Confirm minimum Node.js version (add to `package.json` `engines` field)
- [ ] Wire up version script as npm command (`tokens:version:patch`, etc.)
- [ ] Document Milo integration method (exact import path, configuration)
- [ ] Confirm CI/CD setup (if exists, document workflow)
- [ ] Document primary/secondary maintainer contacts
- [ ] Add `.nvmrc` or `.node-version` file for Node version
- [x] Package name is `s2a-tokens` (consistent across README, runbook, and package.json)

---

**End of Runbook**
