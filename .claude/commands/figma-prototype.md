# Figma Prototype

Read one or more Figma frames via the Desktop Bridge, extract real component instances + bound tokens, download image assets, match to S2A components, validate CSS, and write a working prototype to `apps/prototyping/`.

---

## Icon sourcing — know this before you build

There are two separate icon CDNs. Always use the CDN — never download icons locally or hardcode SVG paths.

### Product icons (app tiles — Acrobat, Firefly, Creative Cloud, etc.)

**CDN:** `https://www.adobe.com/content/dam/shared/images/product-icons/svg/{filename}.svg`

**Use:** The `AppIcon` component wraps this CDN automatically. Import and render it — never reference the CDN URL directly for product icons.

```js
import { AppIcon } from '../../../../packages/components/src/app-icon/app-icon.js';
render(AppIcon({ app: 'acrobat-pdf', size: 'sm' }), el);
```

**Slug lookup:** The `app` prop is a kebab-case slug. When a Figma layer name like `B_app_AdobeAcrobatPDF` needs to map to a slug, read `packages/components/src/app-icon/app-icon.js` — find the `figmaName` field that matches, then use that entry's key as the slug (`acrobat-pdf`).

**Size reference:** `xs`=16px · `sm`=18px · `md`=24px · `lg`=32px

---

### UI icons (chevron, arrow, play, close, etc.)

**CDN:** `https://www.adobe.com/federal/assets/icons/svgs/{iconName}.svg`

This is the same CDN Milo uses in production. Confirmed available: `chevron-right`, `chevron-down`, `arrow-right`, `play`. **`pause` does NOT exist on this CDN — it returns 404.**

**Use:** Drop an `<img>` tag pointing at the CDN URL. Use CSS `filter` to control color — the SVGs ship as black on transparent.

```html
<img
  class="icon-chevron"
  src="https://www.adobe.com/federal/assets/icons/svgs/chevron-right.svg"
  width="12"
  height="12"
  alt=""
  aria-hidden="true"
>
```

**Important:** Federal CDN SVGs are designed at Spectrum scale (18px+). Do not use the pixel dimensions from Figma's CSS border-trick chevron (e.g. 3×6px, 6×9px) as the `width`/`height` — they will render invisible. Use 12px as the minimum for any UI icon from this CDN.

```css
/* White on dark surface */
.icon-chevron { filter: invert(1); }

/* Black on light surface — default, no filter needed */
.category-tab.active .icon-chevron { filter: none; }
```

**Do not** build chevrons or arrows out of CSS borders/transforms. Always use the Federal CDN SVG.

**When an icon isn't on the CDN** (e.g. `pause`): use an inline `<svg>` element and toggle its `innerHTML` from JS. Never use `<img src="...">` for icons that may 404.

```html
<svg id="play-pause-icon" viewBox="0 0 16 16" fill="currentColor" width="16" height="16" aria-hidden="true">
  <rect x="3" y="2" width="4" height="12" rx="1"/>
  <rect x="9" y="2" width="4" height="12" rx="1"/>
</svg>
```

```js
const ICON_PAUSE = `<rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/>`;
const ICON_PLAY  = `<polygon points="3,1 15,8 3,15"/>`;

// Toggle:
icon.innerHTML = isPaused ? ICON_PLAY : ICON_PAUSE;
```

---

## Usage

```
/figma-prototype <figma-url> [<figma-url-md>] [<figma-url-lg>] [optional: name/feature]
```

Examples:
- Single frame: `/figma-prototype https://www.figma.com/design/…?node-id=5916-112958`
- Multi-breakpoint: `/figma-prototype https://…?node-id=SM https://…?node-id=MD https://…?node-id=LG`
- With destination: `/figma-prototype https://…?node-id=… matthew/router-marquee`

If no `name/feature` is provided, derive a slug from the frame name and ask the user to confirm before writing.

---

## Step 0 — Parse the arguments

For each URL provided:
- `fileKey` — segment after `/design/` or `/file/`
- `nodeId` — `node-id=` query param, convert `-` to `:`

If multiple URLs are given, treat them as breakpoint variants of the same design — SM first, then MD, LG, XL. Extract each frame separately and merge into one responsive prototype.

Label each frame with its breakpoint slot: `sm`, `md`, `lg`, `xl`.

---

## Step 1 — Connect and navigate

Check connection: `figma_get_status`. If not connected → ask user to open Figma Desktop → Plugins → Development → figma-desktop-bridge → Run.

For each frame URL, load the node and collect basic info:

```js
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('NODE_ID');
if (!node) return { error: 'Node not found' };
return { name: node.name, type: node.type, width: node.width, height: node.height };
```

---

## Step 2 — Deep structural extraction

Run this for **each** frame node.

```js
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('NODE_ID');
if (!node) return { error: 'Node not found' };

async function resolveVar(id) {
  try {
    const v = await figma.variables.getVariableByIdAsync(id);
    return v ? v.name : id;
  } catch { return id; }
}

function collectBoundIds(bv) {
  const ids = [];
  for (const val of Object.values(bv ?? {})) {
    if (Array.isArray(val)) val.forEach(x => x?.id && ids.push({ prop: 'fills', id: x.id }));
    else if (val?.id) ids.push({ prop: 'unknown', id: val.id });
  }
  return ids;
}

const allNodes = node.findAll(() => true);

// 1. INSTANCE nodes — real components
const instanceNodes = allNodes.filter(n => n.type === 'INSTANCE');
const mainComponents = await Promise.all(instanceNodes.map(n => n.getMainComponentAsync()));

const instances = [];
for (let i = 0; i < instanceNodes.length; i++) {
  const n = instanceNodes[i];
  const mc = mainComponents[i];
  const compSet = mc?.parent;
  const boundIds = collectBoundIds(n.boundVariables ?? {});
  const resolvedTokens = await Promise.all(
    boundIds.map(async ({ prop, id }) => ({ prop, name: await resolveVar(id) }))
  );
  instances.push({
    layerName: n.name,
    componentSet: compSet?.name ?? null,
    variant: mc?.name ?? null,
    exposedProps: n.componentProperties ?? {},
    boundTokens: resolvedTokens,
    x: n.x, y: n.y, width: n.width, height: n.height,
  });
}

// 2. TEXT nodes
const textStyles = await figma.getLocalTextStylesAsync();
const styleIdToName = Object.fromEntries(textStyles.map(s => [s.id, s.name]));

const textNodes = [];
for (const n of allNodes.filter(n => n.type === 'TEXT')) {
  const fillIds = (n.boundVariables?.fills ?? []).map(f => f?.id).filter(Boolean);
  const resolvedFills = await Promise.all(fillIds.map(id => resolveVar(id)));
  textNodes.push({
    layerName: n.name,
    characters: n.characters?.slice(0, 120),
    textStyle: styleIdToName[n.textStyleId] ?? null,
    boundFillTokens: resolvedFills,
    fontSize: n.fontSize,
    y: n.y,
  });
}

// 3. Container fills, spacing, and IMAGE fill detection
const containers = [];
const imageNodes = [];

for (const n of allNodes.filter(n => ['FRAME', 'COMPONENT', 'GROUP', 'RECTANGLE'].includes(n.type))) {
  const rawFills = n.fills ?? [];

  // Detect visible IMAGE fills — skip hidden ones (visible === false)
  const visibleImageFills = rawFills.filter(f => f.type === 'IMAGE' && f.visible !== false);
  if (visibleImageFills.length > 0) {
    imageNodes.push({
      nodeId: n.id,
      layerName: n.name,
      width: n.width,
      height: n.height,
      x: n.x,
      y: n.y,
      imageHashes: visibleImageFills.map(f => f.imageHash),
    });
  }

  const fillIds = (n.boundVariables?.fills ?? []).map(f => f?.id).filter(Boolean);
  if (!fillIds.length && !n.boundVariables?.paddingTop) continue;
  const resolvedFills = await Promise.all(fillIds.map(id => resolveVar(id)));
  const spacingIds = ['paddingTop','paddingBottom','paddingLeft','paddingRight','itemSpacing']
    .map(k => ({ k, id: n.boundVariables?.[k]?.id }))
    .filter(x => x.id);
  const resolvedSpacing = await Promise.all(
    spacingIds.map(async ({ k, id }) => ({ prop: k, name: await resolveVar(id) }))
  );
  containers.push({
    layerName: n.name,
    boundFillTokens: resolvedFills,
    boundSpacingTokens: resolvedSpacing,
    layoutMode: n.layoutMode,
    width: n.width, height: n.height,
  });
}

// 4. Also check the root frame itself for visible IMAGE fills
const rootFills = node.fills ?? [];
const rootVisibleImages = rootFills.filter(f => f.type === 'IMAGE' && f.visible !== false);
if (rootVisibleImages.length > 0) {
  imageNodes.unshift({
    nodeId: node.id,
    layerName: node.name + ' (root)',
    width: node.width,
    height: node.height,
    x: 0, y: 0,
    isRoot: true,
    imageHashes: rootVisibleImages.map(f => f.imageHash),
  });
}

return {
  frameName: node.name,
  frameWidth: node.width,
  frameHeight: node.height,
  instances,
  textNodes: textNodes.sort((a, b) => a.y - b.y),
  containers: containers.slice(0, 20),
  imageNodes,
};
```

---

## Step 2.5 — Download image assets

**Always run this step.** For every `imageNode` found across all extracted frames, extract and save each visible image fill.

### Why not `figma_get_component_image`

`figma_get_component_image` renders a node as a flattened PNG — it captures everything on top of the image (text, components, overlays). It also requires a Figma REST API token that may not be configured. **Do not use it for background image extraction.**

### Correct approach — `getImageByHash` via `figma_execute`

Each `imageNode` now includes `imageHashes` — one hash per visible IMAGE fill. Use `figma.getImageByHash(hash).getBytesAsync()` to get the original uploaded file (PNG or JPEG) exactly as the designer placed it, with no overlaid content.

**Critical:** the extraction already filtered to `visible !== false`. Never call `getImageByHash` on hashes from hidden fills.

```js
// In figma_execute — for each hash in imageNode.imageHashes:
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('NODE_ID');
const fills = node.fills.filter(f => f.type === 'IMAGE' && f.visible !== false);

const image = figma.getImageByHash(fills[0].imageHash); // use the correct index
const bytes = await image.getBytesAsync();

// Manual base64 encoder — btoa() is not available in the plugin sandbox
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const parts = [];
const len = bytes.length;
for (let i = 0; i < len; i += 3) {
  const b0 = bytes[i];
  const b1 = i + 1 < len ? bytes[i + 1] : 0;
  const b2 = i + 2 < len ? bytes[i + 2] : 0;
  parts.push(
    chars[b0 >> 2],
    chars[((b0 & 3) << 4) | (b1 >> 4)],
    i + 1 < len ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=',
    i + 2 < len ? chars[b2 & 63] : '=',
  );
}
return { base64: parts.join(''), byteLength: len };
```

The result is saved to a temp file by the tool. Decode and write it to disk with Python:

```bash
python3 -c "
import json, base64
with open('/path/to/tool-result.txt', 'r') as f:
    data = json.loads(f.read())
img = base64.b64decode(data['result']['base64'])
# Detect PNG vs JPEG from magic bytes
ext = 'png' if img[0] == 137 else 'jpg'
with open('apps/prototyping/{name}/{feature}/assets/{slug}.' + ext, 'wb') as f:
    f.write(img)
print(f'Written: {len(img):,} bytes')
"
```

### Matching crop and position from Figma

After downloading the image, read `imageTransform` and `scaleMode` from the fill to set the correct `object-position` in CSS:

```js
return {
  scaleMode: fill.scaleMode,        // usually 'FILL'
  imageTransform: fill.imageTransform, // 2x3 affine matrix [[a,b,tx],[c,d,ty]]
};
```

The transform is in normalised UV space (0–1). For the common identity case `[[1,0,0],[0,1,0]]`, the image is anchored **top-left** — use `object-position: left top`.

| `imageTransform` tx/ty | CSS `object-position` |
|---|---|
| `[[1,0,0],[0,1,0]]` (identity) | `left top` |
| tx=0.5, ty=0.5 | `center` |
| tx=1, ty=1 | `right bottom` |
| tx=0, ty=0.5 | `left center` |

For non-identity transforms (rotated or non-uniform scale), read the matrix values and convert manually. The tx and ty columns (index 2 of each row) map directly to `object-position` x% and y%.

### Naming convention

| Breakpoint | Filename |
|---|---|
| Single frame or SM | `{slug}.jpg` / `{slug}.png` |
| MD | `{slug}-md.jpg` |
| LG | `{slug}-lg.jpg` |
| XL | `{slug}-xl.jpg` |

Use the layer name (kebab-cased) as `{slug}` — e.g. layer `Hero Background` → `hero-background.png`.

If the same image appears in all breakpoints, export it once from the largest frame and use it for all.

### When no image nodes are found

If `imageNodes` is empty and the frame is a full-page design, still export the entire root frame as a reference screenshot at 1x:

```js
const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
```

Save as `assets/ref.png` — useful for visual parity checking.

---

## Step 3 — Map instances to S2A components

For each unique `instance.componentSet` name across all extracted frames:

```
list_components                              — full inventory
find_component_for_use_case "<set name>"     — ranked match
get_component_spec "<matched name>"          — exact props, variants, import path
```

Build a mapping table:

| Figma componentSet | Figma variant | S2A component | Function | Props to use |
|---|---|---|---|---|
| `Button` | `State=Default, Context=On Dark` | `Button` | `packages/components/src/button/button.js` | `{ label, background: 'solid', context: 'on-dark' }` |

**Important:** S2A components are Lit function components, not custom elements. `<s2a-button>` as an HTML tag renders nothing. Always use `render()` from `lit` — see Step 5.

### AppIcon — icon-only rendering

When a Figma layer uses a product icon with no label (e.g., an icon slot inside a tab card, a product badge), use `AppIcon` directly — not `ProductLockup`. `ProductLockup` always renders both icon AND label.

```js
import { AppIcon } from '../../../../packages/components/src/app-icon/app-icon.js';

// size='sm' = 18px — matches Figma's 18.67×18px product icon slots
render(AppIcon({ app: 'acrobat-pdf', size: 'sm' }), document.querySelector('#icon-acrobat'));
```

Size reference: `'xs'`=16px · `'sm'`=18px · `'md'`=24px · `'lg'`=32px

**Slug lookup:** The `app` prop is a kebab-case slug, not a Figma layer name. When a Figma instance is named something like `B_app_AdobeAcrobatPDF`, find the correct slug by reading `packages/components/src/app-icon/app-icon.js` — look for the `figmaName` field in the icon map that matches the Figma layer name. Do not guess.

**Pattern for multiple icon slots with `data-app`:**

```html
<!-- index.html — one div per icon slot, data-app carries the slug -->
<div class="tab-icon" data-app="creative-cloud"></div>
<div class="tab-icon" data-app="firefly"></div>
<div class="tab-icon" data-app="acrobat-pdf"></div>
```

```js
// script.js — single render loop
document.querySelectorAll('.tab-icon[data-app]').forEach((el) => {
  render(AppIcon({ app: el.dataset.app, size: 'sm' }), el);
});
```

### When instances are zero — building from Figma measurements

If the extraction returns no `INSTANCE` nodes for a layer (type=FRAME instead of INSTANCE), that element has no S2A component match yet. Build it as plain HTML from the exact Figma measurements:

1. Pull `x`, `y`, `width`, `height`, `paddingTop/Bottom/Left/Right`, `itemSpacing`, `fills` from the extraction
2. Use absolute positioning based on `x`/`y` values relative to the parent frame
3. Build the CSS from raw extracted values (fills as rgba/hex, spacing as px) — these are prototype-accurate fidelity values, not production tokens
4. Document the layer name and measurements in a comment for future component authoring

This is a contribution signal — see Step 3.5.

Token name conversion for plain containers (replace `/` with `-`, prepend `--`):
- `s2a/color/background/knockout` → `--s2a-color-background-knockout`
- `s2a/spacing/lg` → `--s2a-spacing-lg`

**Dark surface detection:** If the frame background token resolves to a dark color (knockout, gray-800+), add `data-theme="dark"` to the `<html>` tag. This activates dark-mode token overrides in the compiled token CSS so content tokens (`--s2a-color-content-title`, etc.) resolve to their light/white values.

---

## Step 3.5 — Flag component gaps as contribution opportunities

The S2A library is actively growing. A Figma extraction will often find one of three situations:

| Situation | Action |
|---|---|
| S2A component matches cleanly | Use it, render with correct props |
| S2A component exists but looks broken or off in Storybook | Flag it — see below |
| No S2A component exists for this pattern | Flag it — see below |

### When a component exists but is broken or off

1. Note which Figma componentSet is off (e.g., `RouterMarqueeItem`)
2. Look at the Figma extraction: what states does it have? What sub-elements (icon, label, indicator, chevron)?
3. Compare against `get_component_spec "<name>"` — identify the prop or CSS delta causing the mismatch
4. Build the prototype using the raw Figma values as a workaround
5. At the end of the Step 6 report, add a **Component Gap** entry:

```
── Component gaps identified ────────────────────────────────────

  RouterMarqueeItem — exists in Storybook but mismatches Figma:
    - Progress indicator is static (should animate across full card width)
    - Chevron rendered via CSS border trick (should be proper SVG icon)
    - Active state (white fill) not reflected in current component props
  → Recommend: audit spec.json and CSS, update to match Figma extraction
  → Prototype uses: hand-built HTML from exact Figma measurements (fallback)
```

### When no component exists at all

1. Note the Figma layer name and its extracted measurements (size, fills, spacing, children)
2. Build the prototype from scratch using those values
3. At the end of Step 6, add a **New Component Candidate** entry:

```
── New component candidates ─────────────────────────────────────

  "Category Tab Card" — no S2A match
    Anatomy: indicator bar (4px, brand red) + product icon (sm) + label + chevron
    States: default (frosted glass rgba(0,0,0,0.44)) · active (white fill)
    Dimensions: 220×67px, padding 12/12/16/12, gap 12
  → Recommend: create RouterMarqueeCard component, contribute to packages/components/
```

This keeps the prototype workflow feeding directly into the design system backlog.

---

## Step 4 — Validate token CSS

Build the layout CSS for the outermost container and any major sections, then validate:

```
validate_css "<css snippet>"
```

Rules:
- Never use primitive tokens (`--s2a-spacing-16`, `--s2a-color-gray-500`)
- Never hardcode hex or px values in CSS properties — use `var(--s2a-*)` only
- Fallbacks in `var()` are allowed only for structural/px values, not colors (hex fallbacks fail validation)

Fix any violations before writing files.

---

## Step 5 — Write the prototype

Resolve `name/feature` from arguments or the frame name slug. Write three files plus the `assets/` folder (already populated in Step 2.5).

### `apps/prototyping/{name}/{feature}/index.html`

```html
<!DOCTYPE html>
<html lang="en" data-theme="{light|dark}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{Feature name}</title>
  <!-- tokens injected automatically by vite.config.js — no link needed -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- content from Figma extraction -->
</body>
<script type="module" src="script.js"></script>
</html>
```

**`data-theme` rule:** Set `data-theme="dark"` on `<html>` whenever the frame background is dark (knockout / near-black). This flips all content token values to their dark-mode equivalents. Leave it off for light-surface designs.

**Image markup rules:**

For a single-breakpoint image fill:
```html
<img
  class="hero-image"
  src="assets/hero-background.png"
  alt=""
  width="{node.width}"
  height="{node.height}"
  loading="eager"
  fetchpriority="high"
>
```

For multi-breakpoint images (one image per breakpoint URL provided):
```html
<picture class="hero-image">
  <source media="(min-width: 1200px)" srcset="assets/hero-background-xl.png">
  <source media="(min-width: 1024px)" srcset="assets/hero-background-lg.png">
  <source media="(min-width: 768px)"  srcset="assets/hero-background-md.png">
  <img
    src="assets/hero-background.png"
    alt=""
    width="{sm-frame-width}"
    height="{sm-frame-height}"
    loading="eager"
    fetchpriority="high"
  >
</picture>
```

- Use `loading="eager"` + `fetchpriority="high"` for hero / above-fold images
- Use `loading="lazy"` for below-fold images
- Always set `width` and `height` from the actual frame dimensions — prevents layout shift
- `alt=""` for decorative/background images; descriptive alt for content images
- If an image is used as a CSS `background-image` (full-bleed behind content), use a `<div>` with `background-image: url('assets/...')` and `background-size: cover; background-position: center` — do not use an `<img>` tag for these

**Component rendering rules:**

S2A components are Lit function components. Render them into DOM containers using `render()` from `lit`. Never use custom element tags (`<s2a-button>`) — they render as empty unknown elements.

Correct pattern in HTML — use a plain container `<div>`:
```html
<div id="cta-primary"></div>
<div id="cta-secondary"></div>
```

Correct pattern in script.js — render into the container:
```js
import { render } from 'lit';
import { Button } from '../../../../packages/components/src/button/button.js';

render(Button({ label: 'Free trial', background: 'solid', context: 'on-dark' }), document.querySelector('#cta-primary'));
render(Button({ label: 'See plans', background: 'outlined', context: 'on-dark' }), document.querySelector('#cta-secondary'));
```

For repeated components (tabs, card grids), create wrapper divs dynamically:
```js
tabs.forEach(tab => {
  const wrapper = document.createElement('div');
  wrapper.className = 'tab-item';
  container.appendChild(wrapper);
  render(RouterMarqueeItem({ label: tab.label, app: tab.app, context: 'on-dark' }), wrapper);
});
```

**Other hard rules:**
- Text content comes from actual `textNodes[].characters` — not placeholder copy
- Prop values come from actual `exposedProps` — not invented
- Background/spacing CSS comes from actual `containers[].boundFillTokens`
- Never hardcode colors, gradients, or font sizes in HTML or inline style attributes

### `apps/prototyping/{name}/{feature}/styles.css`

Layout, spacing, and image positioning only. All values from validated token CSS (Step 4). Responsive breakpoints at 768px, 1024px, 1200px.

```css
/* Base (SM) layout */
.hero {
  position: relative;
  background: var(--s2a-color-background-knockout);
  padding: var(--s2a-spacing-lg, 24px);
}

/* Image fill — full-bleed behind content */
.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* MD+ */
@media (min-width: 768px) {
  .hero {
    padding: var(--s2a-spacing-3xl, 48px) var(--s2a-spacing-2xl, 40px);
  }
}
```

### `apps/prototyping/{name}/{feature}/script.js`

```js
import { render } from 'lit';

import '../../_shared/grid-overlay.js';
import '../../_shared/ref-overlay.js';

// S2A components — import the function, then render() it into a DOM container
import { Button } from '../../../../packages/components/src/button/button.js';
import { RouterMarqueeItem } from '../../../../packages/components/src/router-marquee-item/router-marquee-item.js';

// Render each component into its DOM container
render(Button({ label: 'Free trial', background: 'solid', context: 'on-dark' }), document.querySelector('#cta-primary'));
```

---

## Step 5.5 — Visual parity loop (required)

After writing files, use Figma + Playwright to compare the prototype against the design and iterate until they match.

### 1. Export the Figma frame as ground truth

```js
// figma_execute — export the frame at 0.5x to keep the base64 payload manageable
await figma.loadAllPagesAsync();
const node = await figma.getNodeByIdAsync('FRAME_NODE_ID');
const bytes = await node.exportAsync({ format: 'JPG', constraint: { type: 'SCALE', value: 0.5 } });
// ... base64 encode as in Step 2.5 ...
return { base64: parts.join('') };
```

Save as `assets/figma-ref.jpg`:
```bash
python3 -c "
import json, base64
with open('/path/to/tool-result.txt', 'r') as f: data = json.loads(f.read())
img = base64.b64decode(data['result']['base64'])
open('apps/prototyping/{name}/{feature}/assets/figma-ref.jpg', 'wb').write(img)
"
```

### 2. Screenshot the prototype with Playwright

Set viewport to match the Figma frame dimensions, then screenshot:

```
browser_resize  width: {frameWidth}  height: {frameHeight}
browser_navigate  url: "http://localhost:5173/{name}/{feature}/"
browser_take_screenshot  filename: "apps/prototyping/{name}/{feature}/assets/prototype-ref.png"  type: "png"
```

### 3. Compare and identify delta

Read both images side-by-side. Call out specific differences:
- Layout positions (content top vs. bottom, full-width vs. hug)
- Missing elements (eyebrow, gradient overlay, dividers)
- Component props (orientation, width, showIconEnd)
- Gradient direction and opacity

### 4. Fix and re-screenshot

Make targeted CSS/HTML/JS edits, then:
```
browser_navigate  url: "http://localhost:5173/{name}/{feature}/"
browser_take_screenshot  filename: "apps/prototyping/{name}/{feature}/assets/prototype-ref.png"  type: "png"
```

Repeat up to 3 iterations until the prototype matches the Figma reference closely. On each pass, re-read `figma-ref.jpg` and the new `prototype-ref.png` to confirm progress.

**Common deltas and fixes:**

| Figma pattern | Likely fix |
|---|---|
| Content upper-left, tabs at bottom | `justify-content: space-between` on hero, tabs as sibling (not child) of content |
| Tabs full-width | `flex: 1` on `.category-tab`, `width: 'fill'` on RouterMarqueeItem |
| Dark gradient left-to-right | `linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%)` on overlay div |
| Tabs horizontal with chevron | `orientation: 'horizontal'`, `showIconEnd: true` |
| Eyebrow text above headline | Add `<p class="hero-eyebrow">` with `--s2a-typography-font-size-eyebrow` |

---

## Step 6 — Report

```
── Assets downloaded ────────────────────────────────────────────

  assets/hero-background.png      1920×960  (2x export)
  assets/hero-background-md.png    768×960  (2x export)
  assets/ref.png                  1920×960  (1x reference)

── Component inventory ──────────────────────────────────────────

  Figma component set       →  S2A function          Props used
  ─────────────────────────────────────────────────────────────
  Button                    →  Button()              background=solid, context=on-dark
  RouterMarqueeItem         →  RouterMarqueeItem()   app=acrobat-pro, active, on-dark

  Layers with no S2A match (plain HTML + token CSS):
    .hero-headline          color: --s2a-color-content-title  (data-theme=dark → resolves white)
    .hero-body              color: --s2a-color-content-body-strong

  ⚠ Unresolved token IDs (variable from disconnected library):
    VariableID:99:123

── Files written ────────────────────────────────────────────────

  apps/prototyping/{name}/{feature}/index.html
  apps/prototyping/{name}/{feature}/styles.css
  apps/prototyping/{name}/{feature}/script.js
  apps/prototyping/{name}/{feature}/assets/

── Next steps ───────────────────────────────────────────────────

  Dev server (from apps/prototyping/, not inside the prototype folder):
    cd apps/prototyping && npx vite

  Then open:
    http://localhost:5173/{name}/{feature}/

  Save and share:
    /push "prototype: {feature}"
```
