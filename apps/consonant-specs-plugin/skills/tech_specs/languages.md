# Localization Tech Specs

Generate a complete localization tech specs section in Figma from existing English carousel/component frames. Creates 6 language subsections (English, German, Chinese, Thai, Arabic, RTL Layouts) with translated text, instruction cards, and the standard tech specs panel layout.

## Scope

Works on a **Figma page** that already has English component frames (Desktop, Tablet, Mobile). The user provides the page node ID or URL. The skill clones the English frames into 6 localization subsections and replaces text content with translations.

## Structure

### Outer Section
- **Name**: "Localization"
- **Size**: 18700 × 3904
- **Fill**: `{ r: 0.18, g: 0.18, b: 0.18 }` (#2E2E2E)
- **Position**: Below existing content on the page

### 6 Inner Subsections
Each subsection is a SECTION node:
- **Size**: 3000 × 3704
- **Fill**: `{ r: 0.267, g: 0.267, b: 0.267 }` (#444444)
- **Y position**: 100 (inside outer section)
- **X positions**: 100, 3200, 6300, 9400, 12500, 15600

| # | Name | X |
|---|------|---|
| 1 | English (Default) | 100 |
| 2 | German | 3200 |
| 3 | Chinese | 6300 |
| 4 | Thai | 9400 |
| 5 | Arabic | 12500 |
| 6 | RTL Layouts | 15600 |

### Subsection Contents
Each subsection contains:
1. **Instruction card** at (100, 100) — 400×300, white bg, 16px corner radius
2. **Desktop frame** at (780, 671) — cloned from English source
3. **Tablet frame** at (780, 1561) — cloned from English source
4. **Mobile frame** at (780, 2361) — cloned from English source

No note or question frames — keep it clean.

## Instruction Card Format

- **Frame**: 400×300, white fill, corner radius 16, auto-layout VERTICAL, padding 32px, itemSpacing 16
- **Title**: Inter Bold 28px, black, FILL width
- **Body**: Inter Regular 16px, line-height 24px, `{ r: 0.3, g: 0.3, b: 0.3 }`, FILL width

### Card Content Per Language

| Language | Title | Body |
|----------|-------|------|
| English (Default) | English (Default) | Show an example of the component using English as our default |
| German | German | Show an example of the component using German\nBe sure to show examples of long-word wrapping and 1.5x text length |
| Chinese | Chinese | Show an example of the component using Chinese\nCheck for: short sentences |
| Thai | Thai | Show an example of the component using Thai\nCheck for: extra line height for ligatures |
| Arabic | Arabic | Show an example of the component using Arabic\nCheck for: RTL text |
| RTL Layouts | RTL Layouts | Show all layout changes required for RTL languages |

## Text Replacement

### Step 1 — Identify fonts
Before replacing text, discover fonts used in the source English frames:
```javascript
// Walk text nodes in source frame, collect unique fonts
const fonts = new Set();
function walkFonts(node) {
  if (node.type === 'TEXT' && node.characters.length > 0) {
    const fn = node.getRangeFontName(0, 1);
    if (fn !== figma.mixed) fonts.add(JSON.stringify(fn));
  }
  if ('children' in node) for (const c of node.children) walkFonts(c);
}
```
Load all discovered fonts with `figma.loadFontAsync()` before any text replacement.

### Step 2 — Replace text by matching English content
Walk all TEXT nodes in each cloned frame. **Normalize before matching** — Figma text nodes may contain Unicode line separators (U+2028), paragraph separators (U+2029), and curly apostrophes (U+2019) instead of regular spaces/newlines/straight quotes. Always normalize both the source text and match keys before comparing:

```javascript
// Normalize: collapse line separators, paragraph separators, newlines into space; curly quotes to straight
function norm(s) {
  return s.replace(/[\u2028\u2029\n\r]+/g, ' ').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
}

function replaceTexts(node, translations) {
  if (node.type === 'TEXT') {
    const normalized = norm(node.characters);
    for (const [match, replacement] of Object.entries(translations)) {
      if (normalized.includes(norm(match))) { node.characters = replacement; break; }
    }
  }
  if ('children' in node) for (const ch of node.children) replaceTexts(ch, translations);
}
```

### Translation Map Template
For each language, provide a map of English string → translated string. Common strings to translate:
- **Quote/headline text** (main testimonial or heading)
- **Attribution name** (keep as-is unless transliterating for Arabic)
- **Attribution role** (e.g., "Digital Creator, Studio Spence")
- **CTA button text** (e.g., "Create with Firefly")

For **Arabic** and **RTL Layouts**, also transliterate the person's name.

## Workflow

### Step 1 — Discover source frames
Read the target page to find existing English frames (Desktop, Tablet, Mobile). Record their node IDs, sizes, and all text content.

### Step 2 — Create section structure
Create the outer Localization section and 6 inner subsections using `figma_execute`.

### Step 3 — Clone frames
Clone each English frame 6 times (once per subsection). Position at the standard coordinates.

### Step 4 — Create instruction cards
Create one instruction card per subsection with the appropriate title and body text.

### Step 5 — Replace text and apply RTL (PARALLEL with Agents)
This step MUST use parallel agents to maximize speed. Launch 5 agents simultaneously — one per non-English language. Each agent handles its own language's text replacement independently.

**How to parallelize:** Use the `Agent` tool with 5 concurrent calls in a single message. Each agent receives:
- The language name and its translation map
- The 3 cloned frame IDs (desktop, tablet, mobile) for that language's subsection
- The list of fonts to load
- For Arabic and RTL: also apply the RTL layout function after text replacement

```
Agent 1 (German):     Replace text in DE frames
Agent 2 (Chinese):    Replace text in ZH frames
Agent 3 (Thai):       Replace text in TH frames
Agent 4 (Arabic):     Replace text + apply RTL in AR frames
Agent 5 (RTL):        Replace text + apply RTL in RTL frames
```

Each agent runs a single `figma_execute` call that:
1. Loads fonts
2. Defines the `norm()` and `replaceTexts()` functions
3. Replaces all text in its 3 frames
4. (Arabic/RTL only) Applies the `applyRTL()` function
5. Returns confirmation

**Agent prompt template:**
> You are replacing text in Figma frames for [LANGUAGE] localization. Use `figma_execute` to run a single script that:
> 1. Loads these fonts: [font list]
> 2. Defines norm() to normalize U+2028/2029/curly quotes
> 3. Defines replaceTexts(node, translations) using norm() for matching
> 4. Applies this translation map to frames [frame IDs]: [translation map]
> 5. [For Arabic/RTL only] Applies applyRTL() to reverse horizontal layouts, right-align text, and set vertical counterAxisAlignItems to MAX
> Report which frame IDs were processed.

### RTL layout function (used by Arabic and RTL agents)

```javascript
function applyRTL(node) {
  // Text: align right
  if (node.type === 'TEXT') {
    node.textAlignHorizontal = 'RIGHT';
  }
  
  // Frames with auto-layout
  if ((node.type === 'FRAME' || node.type === 'INSTANCE') && node.layoutMode) {
    // Horizontal layouts: reverse children order to simulate RTL flow
    if (node.layoutMode === 'HORIZONTAL') {
      const children = [...node.children];
      for (let i = children.length - 1; i >= 0; i--) {
        node.appendChild(children[i]);
      }
    }
    // Vertical layouts: right-align children
    if (node.layoutMode === 'VERTICAL') {
      node.counterAxisAlignItems = 'MAX';
    }
  }
  
  if ('children' in node) {
    for (const ch of node.children) applyRTL(ch);
  }
}
```

This handles:
- All text nodes set to right-aligned
- Horizontal auto-layout containers (e.g., news columns, header with icon) have children reversed so content flows right-to-left
- Vertical auto-layout containers align children to the right

### Step 6 — Verify
After all 5 agents complete, take screenshots of a few panels (e.g., German desktop, Arabic desktop, Thai mobile) to confirm text rendered correctly and Arabic/RTL panels flow right-to-left.

## Important Rules
- **Always load fonts before replacing text** — use `figma.loadFontAsync()` for each unique font found in source frames
- **Use `figma.getNodeByIdAsync`** (not sync) in dynamic-page mode
- **Do not add note/question frames** — keep panels clean
- **Clone, don't recreate** — preserves all styling, images, and structure from the English source
- **English subsection keeps original text** — no replacement needed
- **ALWAYS parallelize Step 5** — launch 5 agents in a single message, one per language. This is the primary speed optimization. Do NOT run languages sequentially.
- The skill adapts to whatever component the user has on the page — it's not specific to any one carousel or component
