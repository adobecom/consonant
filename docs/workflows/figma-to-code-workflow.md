# Figma to Code Workflow: Design Token Pipeline + MCP Codegen + Story UI

This document outlines the complete workflow for transforming Figma designs into production-ready code using:

- The **design token pipeline** (Figma Variables → `s2a-tokens`)
- **Figma MCP** (Model Context Protocol) for initial code generation
- **Story UI** for AI-assisted Storybook story generation once components exist

**Technology Stack**: HTML, CSS, and JavaScript (ES modules) - no frameworks required.

## Table of Contents

- [Overview](#overview)
- [Workflow Steps](#workflow-steps)
  - [Phase 1: Design in Figma with Design Tokens](#phase-1-design-in-figma-with-design-tokens)
  - [Phase 2: Validate with FigmaLint](#phase-2-validate-with-figmalint)
  - [Guardrails Before Running MCP Codegen](#guardrails-before-running-mcp-codegen)
  - [Design Systems MCP (Southleft)](#design-systems-mcp-southleft)
  - [Phase 3: Generate Code with Figma MCP](#phase-3-generate-code-with-figma-mcp)
  - [Phase 4: Bind Design Tokens](#phase-4-bind-design-tokens)
  - [Phase 5: Download Assets](#phase-5-download-assets)
  - [Phase 6: Create Component Structure](#phase-6-create-component-structure)
  - [Phase 7: Create Storybook Stories (Manual + Story UI)](#phase-7-create-storybook-stories-manual--story-ui)
  - [Phase 8: Refine and Align](#phase-8-refine-and-align)
- [Appendix](#appendix) _(add sections here as needed)_

---

## Overview

The workflow enables designers and developers to:

1. Design components in Figma using design tokens (Figma Variables)
2. Validate components with FigmaLint for MCP-readiness
3. Generate code using Figma MCP (converting to HTML/CSS/JS)
4. Bind design tokens automatically (CSS custom properties)
5. Download assets (SVGs, images)
6. Create Storybook stories (using Lit for templating)
7. Iterate and refine to match design system specifications

---

## Workflow Steps

### Phase 1: Design in Figma with Design Tokens

**Goal**: Create components in Figma that use design tokens (Figma Variables) instead of hardcoded values.

**Steps**:

1. Design your component in Figma
2. Use Figma Variables for all design properties:
   - Colors → `color/*` variables
   - Typography → `typography/*` variables
   - Spacing → `spacing/*` variables
   - Border → `border/*` variables
   - Size → `S2A/Breakpoint/Size/*` variables
3. Ensure component structure follows atomic design principles (atoms → molecules → organisms)

**Example**: Button component uses:

- `button/color/background/accent/solid-default` for background color
- `typography/font-size/2xl` for font size
- `spacing/20` for padding

> ⚠️ **Design Annotation Reminder**: Avoid leaving sticky notes or absolute-positioned annotations inside the component frame. MCP (and Story UI) will treat any vector/text layer as part of the UI, so annotations end up in the generated markup/CSS. Keep callouts outside the frame or on a separate canvas to prevent them from leaking into code.

- `border/radius/lg` for border radius

---

### Phase 2: Validate with FigmaLint

**Goal**: Ensure components are MCP-ready and follow design system best practices.

**Steps**:

1. Select your component in Figma
2. Open FigmaLint plugin
3. Click "Analyze Component"
4. Review the Component Audit score (aim for 100%)
5. Address any issues:
   - **Design Token Usage**: Ensure 100% of properties use design tokens (5/5 properties)
   - **Component Description**: Add a clear, concise description (see below) - this is often the missing piece that prevents 100% score
   - **Property Configuration**: Verify all properties are properly configured
   - **Accessibility**: Check accessibility warnings

**Typical Score Progression**:

- **Initial Score**: 86% (missing component description)
- **After Adding Description**: 100% ✅

**Component Description Template**:

```
[Component Name] displays [primary function]. It supports [key variants] and is used for [use cases]. The component uses [key design tokens] and follows [design system principles].
```

**Example - Product Lockup Description**:

```
Product Lockup displays a branded product tile with an optional product name. It supports size variants (M, L, XL) and can show or hide the product name. Used for hero sections, product pages, and navigation. The component uses spacing, typography, and color design tokens and follows atomic design principles.
```

**FigmaLint Score Breakdown**:

- **100% Token Usage**: All properties use design tokens (5/5 properties) ✅
- **Component Description**: Clear description of purpose, variants, and usage ✅
- **Property Configuration**: All properties properly configured ✅
- **Accessibility**: Proper alt text, semantic structure ✅

**Achieving 100% Score**:
The most common issue preventing a 100% score is a missing component description. After adding a clear description following the template below, the score typically jumps from 86% to 100%.

---

### Guardrails Before Running MCP Codegen

**Goal**: Ensure every code block generated by Codex/Claude/Cursor respects the design system contract before we ask MCP for HTML/CSS/JS. Components were drifting because codegen kept pulling primitive tokens, so we stood up [`docs/guardrails/`](./guardrails) (see [`no-primitives-in-components.md`](./guardrails/no-primitives-in-components.md)) to codify the policy and keep MCP in check.

**Rules**:

1. **No primitives inside components**
   - Reference semantic/component tokens only (e.g., `--s2a-spacing-sm`, `--s2a-button-color-background-accent-solid-default`).
   - Primitive tokens such as `--s2a-spacing-20` or `--s2a-typography-font-family-adobe-clean` are allowed _only_ when a semantic alias does not exist **and** the code includes a comment explaining the exception, e.g. `/* Primitive: spacing-20 has no semantic alias yet */`.
2. **Call out missing aliases**
   - When MCP returns a primitive value, immediately note it in the response so we can add an alias during the next token sync.
3. **Verify the guardrail before handing code to Git**
   - Quick checklist: `rg "--s2a-spacing-"` and `rg "--s2a-typography-"` in the component directory; every match should either be a semantic alias or have an inline primitive comment.

**Agent Prompt Snippets** (paste into Codex/Claude/Cursor before invoking MCP):

```
Guardrail reminder:
- When you generate CSS from Figma MCP, use only semantic/component tokens.
- If you must use a primitive token, add a comment that starts with "Primitive:" describing why.
- Highlight any primitive usages in your explanation so I can replace them later.
```

**Examples**:

- _Codex_: "Run `mcp_Figma_get_design_context` for node 18587:2885 using the guardrail reminder above."
- _Claude_: "Fetch the button component via MCP. Follow the guardrail reminder so CSS sticks to semantic tokens."
- _Cursor_: Add the guardrail snippet to the MCP command input block before clicking "Run".

These prompts keep every agent aligned so that the generated code already respects our design-system policies, reducing cleanup once the component lands in the repo.

---

### Design Systems MCP (Southleft)

We also connect Codex/Claude/Cursor to the public **Design Systems MCP** server (`https://design-systems-mcp.southleft.com/mcp`). It supplements our workflow with authoritative references (W3C specs, design-system docs, Style Dictionary guides, etc.).

**What it’s good for**

- Pulling accessibility guidance (WCAG 2.2 contrast, ARIA practices)
- Comparing cross-system patterns (Material vs. Fluent vs. Carbon buttons)
- Looking up token methodology, Style Dictionary best practices, or W3C DTCG updates
- Sanity-checking component decisions against industry guidance before implementation

**What it’s not**

- It does _not_ expose our private Figma content or repo code, so don’t expect it to describe Consonant components.
- It shouldn’t be used to auto-generate UI code; rely on Figma MCP for that and apply guardrails here.
- Results are generalized—always reconcile the advice with our guardrails (especially the “no primitives” rule) before merging changes.

Add the server in `~/.cursor/mcp.json` (see `doc/guardrails/README.md` for instructions), restart Codex/Cursor, then use the MCP tool list to run `search_design_knowledge`, `search_chunks`, etc. When prompting Codex/Claude/Cursor, remind them to cite the source and explain how the guidance applies to our system.

---

### Phase 3: Generate Code with Figma MCP

**Goal**: Generate initial code structure from Figma design.

**Steps**:

1. Get the Figma node ID and file key from the URL:
   ```
   https://www.figma.com/design/[FILE_KEY]/[FILE_NAME]?node-id=[NODE_ID]
   ```
2. Use Figma MCP `get_design_context` tool:
   ```javascript
   mcp_Figma_get_design_context({
     nodeId: "12511-7135",
     fileKey: "zYLC4bKrGVhWQXVoVPJXh4",
   });
   ```
3. Review generated code structure
4. Note which design tokens are referenced

**Output**:

- HTML structure
- CSS with hardcoded values (will be replaced with tokens)
- Asset URLs for images/icons
- Component metadata

**Note**: Figma MCP may generate React code initially, but we convert it to pure HTML/CSS/JS (using Lit for templating when needed).

---

### Phase 4: Bind Design Tokens

**Goal**: Replace hardcoded values with design token CSS variables.

**Steps**:

1. Identify all hardcoded values in generated CSS
2. Map to design tokens using Figma Variables:
   - Use `mcp_Figma_get_variable_defs` to get token names
   - Match Figma variable paths to CSS custom property names
3. Replace hardcoded values with `var(--s2a-*)` references
4. Add fallback values for each token

**Token Mapping Example**:

```css
/* Before (hardcoded) */
background-color: #3b63fb;
font-size: 22px;
padding: 20px 40px;

/* After (with tokens) */
background-color: var(--s2a-color-background-accent-solid-default, #3b63fb);
font-size: var(--s2a-typography-font-size-22, 22px);
padding: var(--s2a-spacing-20, 20px) var(--s2a-spacing-40, 40px);
```

**Token Categories**:

- **Primitives**: Base values (colors, spacing, typography)
- **Semantic**: Contextual values (content colors, background colors)
- **Component**: Component-specific values (button colors, etc.)

---

### Phase 5: Download Assets

**Goal**: Download and integrate visual assets from Figma using MCP.

**Steps**:

1. Use Figma MCP `get_design_context` tool - it automatically provides asset URLs:
   ```javascript
   mcp_Figma_get_design_context({
     nodeId: "12511-7135",
     fileKey: "zYLC4bKrGVhWQXVoVPJXh4",
   });
   ```
2. The MCP response includes asset URLs in the format:
   ```javascript
   const imgTile = "https://www.figma.com/api/mcp/asset/[ASSET_ID]";
   const img = "https://www.figma.com/api/mcp/asset/[ASSET_ID]";
   ```
3. Use `fetch_mcp_resource` to download assets directly:
   ```javascript
   fetch_mcp_resource({
     server: "Figma",
     uri: "https://www.figma.com/api/mcp/asset/[ASSET_ID]",
     downloadPath: "packages/components/src/[component]/assets/[filename].svg",
   });
   ```
4. Organize assets in component directory:
   ```
   packages/components/src/[component]/assets/
   ```
5. Update imports in component code to reference local assets
6. Verify asset sizing and positioning match Figma

**Asset Types**:

- SVGs (logos, icons) - automatically extracted by MCP
- Images (backgrounds, illustrations) - automatically extracted by MCP
- Fonts (if required, see font setup) - must be obtained separately

**Note**: Figma MCP automatically extracts and provides asset URLs from the design. The `get_design_context` tool returns asset references that can be downloaded using `fetch_mcp_resource`.

---

### Phase 6: Create Component Structure

**Goal**: Set up component files following project conventions.

**File Structure**:

```
packages/components/src/[component]/
├── [component].js          # Lit component wrapper (for Storybook, optional)
├── [component].html         # HTML template (pure HTML)
├── [component].css          # Styles with design tokens (pure CSS)
├── index.js                 # Component export (ES module)
├── assets/                  # Visual assets
│   ├── [asset].svg
│   └── [asset].png
└── fonts/                   # Font files (if needed)
    └── README.md
```

**Technology Stack**:

- **HTML**: Pure semantic HTML structure
- **CSS**: Pure CSS with CSS custom properties (design tokens)
- **JavaScript**: ES modules, Lit for templating (only when needed for Storybook)
- **No frameworks**: No React, Vue, Angular, etc. - just HTML, CSS, and JS

**Component Patterns**:

- Use data attributes for variants: `data-size`, `data-state`, `data-kind`
- Pure HTML/CSS when possible (no JS required for hover states - use CSS `:hover`)
- Use Lit for templating in Storybook (JavaScript/ES modules)
- Follow BEM naming: `.c-component__element`
- Prefer vanilla HTML/CSS/JS - only add JavaScript when necessary for interactivity

---

### Phase 7: Create Storybook Stories (Manual + Story UI)

**Goal**: Document and test component variants, with AI assistance once the component and tokens exist.

There are two complementary paths:

- **Manual stories** – hand-authored stories for core, canonical usage.
- **Story UI–generated stories** – AI-generated scaffolds for additional variants, layouts, and scenarios.

#### 7.1 Manual Stories

Create a baseline set of hand-written stories for each component to define the contract clearly.

**Steps**:

1. Create `[Component].stories.ts` in `apps/storybook/stories/`.
2. Import component from `packages/components`.
3. Define stories for each key variant.
4. Add controls for interactive testing.
5. Include an "All Variants" showcase story.

**Story Structure** (JavaScript/ES modules):

```javascript
import { html } from "lit";
import { Component } from "../../../packages/components/src/[component]/index.js";

export default {
  title: "Components/[ComponentName]",
  tags: ["autodocs"],
  render: (args) => Component(args), // Lit template function
  argTypes: {
    /* controls */
  },
  args: {
    /* defaults */
  },
};

export const Variant1 = {
  args: {
    /* ... */
  },
};
export const Variant2 = {
  args: {
    /* ... */
  },
};
export const AllVariants = {
  render: () => html`/* HTML template */`,
};
```

#### Accessibility Add-on Workflow

- We ship `@storybook/addon-a11y` via `.storybook/main.js` and enable it globally in `.storybook/preview.js` so axe violations show up in the Addons panel.
- Every component must expose at least one story with an automated accessibility `play` function. Example:

```js
import { expect } from "storybook/test";

const runA11yCheck = async ({ canvasElement }) => {
  await expect(canvasElement).toBeAccessible();
};

export const AccentSolid = {
  args: {
    /* ... */
  },
  play: runA11yCheck,
};
```

- Button (`AccentSolid`) and ProductLockup (`Default`) currently run this helper so Storybook’s a11y addon and test runner will fail fast if accessibility regresses. Add the same helper when new components land.

**Note**: Stories use Lit for templating, but components themselves are pure HTML/CSS/JS.

#### 7.2 AI Story Generation (Story UI)

Once a component exists in `packages/components/src` and is wired to tokens, Story UI can generate additional stories.

- We use Story UI (https://github.com/southleft/story-ui) as an **MCP/CLI tool** (no Storybook panel).
- Configuration lives in `story-ui.config.cjs`; it points to:
  - `componentsPath: ./packages/components/src` (real components)
  - `generatedStoriesPath: ./apps/storybook/stories/generated/`
  - `considerationsPath: ../guardrails/story-ui-considerations.md`
  - `docsPath: ./story-ui-docs`
- The `components` array teaches Story UI which components to reuse (e.g., `Button`, `ProductLockup`) and how to import them.

**Workflow**:

1. Start Story UI MCP server:

   ```bash
   npm run story-ui:mcp
   ```

2. In Cursor/Codex, prompt Story UI via MCP, for example:
   - “Generate Storybook stories for the Button component using our existing variants and tokens.”
   - “Create a Hero Marquee story that composes `ProductLockup` + `Button` using our `--s2a-*` tokens.”

3. Story UI will:
   - Read the config + docs to understand components, tokens, and patterns.
   - Generate `.stories.ts` files into `apps/storybook/stories/generated/`.
   - Import and call the real components (`Button`, `ProductLockup`) instead of inventing new elements.

4. Review each generated story:
   - **Imports**: Ensure imports use `index.js` re‑exports and correct relative paths.
   - **Tokens**: Enforce guardrails (only `--s2a-*` tokens; primitives require `/* Primitive: ... */` comments).
   - **A11y**: Add a `play` function with `expect(canvasElement).toBeAccessible()` for any story you keep.
   - **Variants**: Prune variants/layouts you don’t intend to support.

Story UI effectively automates the “examples matrix” in Phase 7, while the **contract** (component API + tokens) still comes from Figma + MCP + the token pipeline.

---

### Phase 8: Refine and Align

**Goal**: Iterate to match design system specifications exactly.

**Common Refinements**:

1. **Height/Spacing Alignment**:
   - Adjust padding, line-height, and box-sizing
   - Account for font metrics
   - Handle borders in outlined variants

2. **Font Setup**:
   - Add `@font-face` declarations (if self-hosting)
   - For Typekit/Adobe Fonts: Use `<link>` tags, not ES module `import`
   - Match font-family name exactly (Typekit uses lowercase with hyphens: `"adobe-clean-display"`)
   - Verify font-weight availability (Typekit may provide 800 instead of 900)
   - Set up fallbacks in font stack
   - Load fonts in Storybook decorator to ensure they're available before rendering

3. **Token Integration**:
   - Ensure Storybook loads all token CSS files
   - Set `data-theme` attribute for semantic tokens
   - Verify token resolution in browser

4. **Variant Pruning**:
   - Remove variants not in Figma design
   - Keep only explicitly defined variants

5. **Asset Positioning**:
   - Center logos using flexbox
   - Match Figma positioning percentages
   - Verify aspect ratios

6. **SVG Asset Fixes**:
   - Remove CSS variables from SVG files if they're not resolving (`var(--fill-0, ...)`)
   - Replace with hardcoded values or ensure CSS variables are defined
   - Verify SVG viewBox matches expected dimensions

---

## Example: Button Component Workflow

### 1. Design in Figma

- Created button with variants: Accent+Solid, Primary+Outlined
- Used design tokens for all properties
- Set up proper component structure

### 2. FigmaLint Analysis

- **Initial score**: 86% (missing component description)
- **Issue identified**: Component description field was empty
- **Fixed**: Added component description using the template
- **Final score**: 100% ✅
  - ✅ Token usage: 5/5 properties (100%)
  - ✅ All properties use design tokens
  - ✅ Property configuration
  - ✅ Component description

### 3. MCP Code Generation

```bash
# Generated initial structure with:
# - HTML template (pure HTML)
# - CSS with hardcoded values (will be replaced with tokens)
# - Asset references
#
# Note: MCP may generate React code, but we convert to HTML/CSS/JS
```

### 4. Token Binding

```css
/* Replaced hardcoded values */
background-color: var(--s2a-color-background-accent-solid-default, #3b63fb);
font-size: var(--s2a-typography-font-size-22, 22px);
```

### 5. Asset Download

- Used Figma MCP `get_design_context` to extract asset URLs
- Used `fetch_mcp_resource` to download assets directly from Figma
- Organized in `packages/components/src/button/assets/`

### 6. Component Structure

```
packages/components/src/button/
├── button.js
├── button.css
├── button.html
└── index.js
```

### 7. Storybook Stories

- Created stories for all variants
- Added interactive controls
- Included "All Variants" showcase

### 8. Refinements

- Fixed height from 67.5px → 64px
- Adjusted line-height for font metrics
- Removed non-Figma variants
- Fixed outlined button border padding

---

## Example: Product Lockup Component Workflow

### 1. Design in Figma

- Created product lockup with tile and name
- Used design tokens for spacing, typography, colors
- Set up proper component structure

### 2. FigmaLint Analysis

- **Initial score**: 86% (missing component description)
- **Issue identified**: Component description field was empty
- **Description Added**:
  ```
  Product Lockup displays a branded product tile with an optional product name.
  It supports size variants (M, L, XL) and can show or hide the product name.
  Used for hero sections, product pages, and navigation. The component uses
  spacing, typography, and color design tokens and follows atomic design principles.
  ```
- **Final score**: 100% ✅
  - ✅ Token usage: 5/5 properties (100%)
  - ✅ All properties use design tokens
  - ✅ Property configuration
  - ✅ Component description

### 3. MCP Code Generation

- Generated tile structure with background and logo
- Extracted asset URLs for tile-background.svg and mnemonic-logo.svg

### 4. Token Binding

- Replaced spacing, typography, and color values
- Added semantic token references

### 5. Asset Download

- Used Figma MCP `get_design_context` to extract asset URLs for tile-background.svg and mnemonic-logo.svg
- Used `fetch_mcp_resource` to download assets directly from Figma
- Organized in `packages/components/src/product-lockup/assets/`

### 6. Component Structure

```
packages/components/src/product-lockup/
├── product-lockup.js
├── product-lockup.css
├── product-lockup.html
├── index.js
└── assets/
    ├── tile-background.svg
    └── mnemonic-logo.svg
```

### 7. Storybook Stories

- Created stories for default, without name, custom name variants

### 8. Refinements

**Logo and Image Fixes:**

- Fixed broken image: SVG files had CSS variables (`var(--fill-0, ...)`) that weren't resolving
  - Changed `fill="var(--fill-0, #EB1000)"` to `fill="#EB1000"` in tile-background.svg
  - Changed `fill="var(--fill-0, white)"` to `fill="white"` in mnemonic-logo.svg
- Fixed logo centering using flexbox (`display: flex; align-items: center; justify-content: center`)
- Adjusted logo sizing to match Figma positioning:
  - Width: 59.25% (42.66px out of 72px)
  - Max-height: 53.71% (38.67px out of 72px)
  - Matches Figma inset values: `inset-[22.22%_20.37%_24.07%_20.37%]`

**Font Loading Fixes:**

- Added Typekit kit ID (`mie2rub`) to `.storybook/preview.js`
- Fixed font-family name mismatch:
  - Typekit uses `"adobe-clean-display"` (lowercase, hyphens)
  - Updated CSS to use `"adobe-clean-display"` as first font in stack
- Fixed font-weight mismatch:
  - Typekit provides weight 800 (ExtraBold), not 900 (Black)
  - Updated CSS from `font-weight: 900` to `font-weight: 800`
- Fixed font loading method:
  - Changed from ES module `import` (caused MIME type error) to `<link>` tag
  - Added font loading in decorator to ensure fonts load before rendering

**Result:** Component now displays with correct Adobe Clean Display font and properly centered logo matching Figma design

---

## Key Tools and Commands

### Figma MCP Tools

- `mcp_Figma_get_design_context` - Generate code from design (converts to HTML/CSS/JS) and extract asset URLs
- `mcp_Figma_get_variable_defs` - Get design token definitions
- `mcp_Figma_get_screenshot` - Get visual reference
- `mcp_Figma_get_metadata` - Get component structure
- `fetch_mcp_resource` - Download assets from Figma MCP asset URLs (use with `server: "Figma"`)

### Design Token Pipeline

- `packages/tokens/scripts/build-tokens.js` - Build token CSS (CSS custom properties)
- `packages/tokens/scripts/sync-figma-variables.js` - Sync from Figma

### Storybook

- `nx run storybook:serve` - Start Storybook dev server
- `nx run storybook:build` - Build static Storybook
- Uses Lit for templating in stories (JavaScript), but components are pure HTML/CSS

---

## Best Practices

1. **Always use design tokens** - Never hardcode values (use CSS custom properties)
2. **Validate with FigmaLint** - Ensure 100% score before codegen (add component description if score is 86%)
3. **Start with atoms** - Build components bottom-up
4. **Pure HTML/CSS when possible** - Use CSS `:hover` instead of JavaScript
5. **Test in Storybook** - Verify all variants work
6. **Document font requirements** - If using restricted fonts
7. **Match Figma exactly** - Pixel-perfect alignment
8. **Iterate and refine** - Expect multiple passes
9. **Keep it simple** - HTML, CSS, and JavaScript only - no frameworks unless necessary

**FigmaLint Quick Win**: If your component score is 86%, it's almost always because the component description is missing. Add a description using the template above to quickly achieve 100%.

---

## Troubleshooting

### Design Tokens Not Loading

- Check token CSS import order in `.storybook/preview.js`
- Verify `data-theme` attribute is set
- Check token file paths

### Height/Spacing Misalignment

- Account for font metrics (line-height adjustments)
- Use `box-sizing: border-box`
- Adjust padding for borders in outlined variants

### Assets Not Displaying

- Verify asset file paths
- Check SVG viewBox matches expected dimensions
- Ensure proper object-fit settings

### Font Not Loading

- Check font file paths
- Verify `@font-face` declarations
- Check font file formats (woff2, woff)

---

## Next Steps

1. Continue building atomic components (Button, Product Lockup)
2. Build molecular components (combining atoms)
3. Create organism components (Hero section, etc.)
4. Document component API and usage
5. Set up automated testing
6. Create design system documentation

---

## Time Savings: Automated Workflow vs Manual Handoff

### The Old Way: Manual Design-to-Code Handoff

**Traditional Process (per component):**

1. **Designer creates component in Figma** (~30-60 min)
   - Design component with hardcoded values
   - Export assets manually (right-click → Export)
   - Create design specs document
   - Send to developer via Slack/email

2. **Developer receives handoff** (~15 min)
   - Review design specs
   - Ask clarifying questions
   - Wait for responses

3. **Developer implements component** (~2-4 hours)
   - Manually extract values from Figma (inspect each element)
   - Hardcode colors, spacing, typography values
   - Download assets manually
   - Write HTML structure
   - Write CSS with hardcoded values
   - Create component files
   - Write Storybook stories
   - Test and iterate with designer feedback

4. **Back-and-forth iterations** (~1-2 hours)
   - Designer reviews implementation
   - Provides feedback on mismatches
   - Developer fixes alignment issues
   - Multiple rounds of "make it 2px smaller" adjustments

5. **Token integration (if done)** (~1-2 hours)
   - Manually map hardcoded values to design tokens
   - Replace all hardcoded values
   - Verify token names match design system
   - Test token resolution

**Total Time (Old Way): ~5-10 hours per component**

---

### The New Way: Figma MCP + Token Pipeline

**Automated Process (per component):**

1. **Designer creates component in Figma** (~30-60 min)
   - Design component using design tokens (Figma Variables)
   - Validate with FigmaLint (2 min)
   - Add component description (1 min)

2. **Developer generates code** (~5 min)
   - Use Figma MCP `get_design_context` to generate code structure
   - Assets automatically extracted with URLs

3. **Developer binds tokens** (~15-30 min)
   - Map Figma variables to CSS custom properties
   - Replace hardcoded values with token references
   - Most values already match token names

4. **Developer downloads assets** (~2 min)
   - Use `fetch_mcp_resource` to download assets automatically
   - Assets organized automatically

5. **Developer creates Storybook stories** (~10-15 min)
   - Import component
   - Create stories for variants
   - Add controls

6. **Refinements** (~30-60 min)
   - Fix alignment issues (height, spacing)
   - Adjust font loading if needed
   - Verify against Figma design

**Total Time (New Way): ~1-2 hours per component**

---

### Time Savings Breakdown

| Task                       | Old Way        | New Way       | Time Saved    |
| -------------------------- | -------------- | ------------- | ------------- |
| Extract design values      | 30-60 min      | 0 min (auto)  | 30-60 min     |
| Download assets            | 10-15 min      | 2 min (auto)  | 8-13 min      |
| Map to design tokens       | 60-120 min     | 15-30 min     | 45-90 min     |
| Create component structure | 30-45 min      | 5 min (auto)  | 25-40 min     |
| Back-and-forth iterations  | 60-120 min     | 30-60 min     | 30-60 min     |
| **Total**                  | **5-10 hours** | **1-2 hours** | **4-8 hours** |

**Time Savings: 70-80% reduction in development time**

---

### Additional Benefits Beyond Time Savings

1. **Accuracy**:
   - No manual value extraction errors
   - Design tokens ensure consistency
   - Assets automatically match Figma

2. **Consistency**:
   - All components use same token system
   - No hardcoded values to maintain
   - Design system stays in sync

3. **Scalability**:
   - Process works for 1 component or 100
   - Token updates propagate automatically
   - Less context switching between tools

4. **Quality**:
   - FigmaLint ensures MCP-readiness
   - Design tokens enforce design system rules
   - Storybook provides immediate visual feedback

5. **Collaboration**:
   - Single source of truth (Figma Variables)
   - Less back-and-forth between designer and developer
   - Faster iteration cycles

---

### Real-World Example: Button + Product Lockup

**Old Way:**

- Button component: ~6 hours
- Product Lockup component: ~8 hours
- **Total: ~14 hours**

**New Way:**

- Button component: ~1.5 hours
- Product Lockup component: ~2 hours
- **Total: ~3.5 hours**

**Time Saved: ~10.5 hours (75% reduction)**

---

### ROI Calculation

For a design system with **20 components**:

- **Old Way**: 20 components × 7 hours avg = **140 hours**
- **New Way**: 20 components × 1.75 hours avg = **35 hours**
- **Time Saved**: **105 hours** (~2.6 weeks of developer time)

**Additional Benefits:**

- Fewer bugs from manual value extraction
- Faster design system updates (token changes propagate automatically)
- Better design-developer collaboration
- Higher quality components (validated with FigmaLint)

---

## Resources

- [Design Tokens README](../packages/tokens/README.md)
- [Token Pipeline Runbook](../how-tos/runbook-token-pipeline.md)
- [Figma Variables Documentation](https://help.figma.com/hc/en-us/articles/15339657135383)
- [Storybook Documentation](https://storybook.js.org/docs)
