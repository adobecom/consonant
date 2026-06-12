# Doc Section

Create or update a documentation section in the s2a-foundations Figma file using the canonical dark style: `background/knockout` surface, `.content` frame with explicit Dark mode, S2A semantic token bindings on all fills.

## Usage

```
/doc-section <figma-url> "Title" "Subtitle" [content...]
```

- `figma-url` — a Figma URL with `node-id` pointing to the **page** or an existing section. Extract file key and page/node ID from it.
- `Title` — the 56px page heading
- `Subtitle` — the 20px gray subtitle line
- `content` — free-form description of the sections to add (body copy, subheadings, etc.)

If no URL is given, use the file key `eGSyBcD5XdFXR8rJXJmVNY` and ask which page.

## Style contract — never deviate

| Layer | Token | Variable ID |
|---|---|---|
| Section background rect | `s2a/color/background/knockout` | `VariableID:6:18` |
| `.content` frame mode | explicit **Dark** (`6:1`) on `VariableCollectionId:6:17` | — |
| Page title (56px, Adobe Clean Display Bold) | `s2a/color/content/knockout` | `VariableID:6:81` |
| Section headings (18px+, Bold) | `s2a/color/content/subheading` | `VariableID:2483:41397` |
| Body, subtitle, meta (all other text) | `s2a/color/content/body-subtle` | `VariableID:2483:41396` |
| Dividers (1px rect) | `s2a/color/border/subtle` | `VariableID:6:22` |

No hardcoded hex values. No primitive tokens. All fills must be variable-bound.

## Layout constants

- Section width: `2400`
- Margin (left): `120`
- Content width: `2160`
- Body width (for wrapped text): `1600`
- Top padding before title: `160`
- Gap after title: `24`
- Gap after subtitle: `24`
- Gap after meta line: `80`
- Gap between sections: `56`
- Divider gap (before/after): `56`

## Steps

1. Parse the Figma URL — extract `fileKey` and `node-id` (convert `1-2` → `1:2`).

2. Use `mcp__figma__use_figma` to inspect the target page and find the bottom-most existing section so you know where to place the new one:
   ```js
   const page = figma.root.children.find(p => p.id === 'PAGE_ID');
   await figma.setCurrentPageAsync(page);
   const sections = page.children.filter(n => n.type === 'SECTION');
   const lastSec = sections.reduce((a, b) => (a.y + a.height > b.y + b.height ? a : b), sections[0]);
   return { lastX: lastSec?.x ?? 160, lastBottom: lastSec ? lastSec.y + lastSec.height : 84, count: sections.length };
   ```
   Position the new section at `x: lastX, y: lastBottom + 80`.

3. Use `mcp__figma__use_figma` to build the section. Use the pattern below — adapt content to what the user described.

## Figma script pattern

```js
return (async () => {
  const page = figma.root.children.find(p => p.id === 'PAGE_ID');
  await figma.setCurrentPageAsync(page);

  await Promise.all([
    figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Bold' }),
    figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' }),
    figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' }),
  ]);

  // Prefetch all tokens
  const [vBg, vBorderSubtle, vBodySubtle, vSubheading, vKnockout] = await Promise.all([
    figma.variables.getVariableByIdAsync('VariableID:6:18'),
    figma.variables.getVariableByIdAsync('VariableID:6:22'),
    figma.variables.getVariableByIdAsync('VariableID:2483:41396'),
    figma.variables.getVariableByIdAsync('VariableID:2483:41397'),
    figma.variables.getVariableByIdAsync('VariableID:6:81'),
  ]);

  const colls = await figma.variables.getLocalVariableCollectionsAsync();
  const coll  = colls.find(c => c.id === 'VariableCollectionId:6:17');
  const darkId = coll.modes.find(m => m.name === 'Dark').modeId; // '6:1'

  function bindFill(node, v) {
    const f = node.fills;
    if (!f || !f.length || f === figma.mixed) return;
    const ps = [...f];
    ps[0] = figma.variables.setBoundVariableForPaint(ps[0], 'color', v);
    node.fills = ps;
  }

  const W = 2400, M = 120, CW = 2160, BW = 1600;

  // Create section
  const sec = figma.createSection();
  sec.name = 'SECTION_TITLE';
  sec.x = PLACE_X;
  sec.y = PLACE_Y;
  sec.resizeWithoutConstraints(W, 800); // initial height — will grow

  // Background rect
  const bg = figma.createRectangle();
  bg.resize(W, 800);
  bg.x = 0; bg.y = 0;
  bg.fills = [{ type: 'SOLID', color: { r: 0.04, g: 0.04, b: 0.047 } }];
  sec.appendChild(bg);
  bindFill(bg, vBg);

  // Content frame — hosts all text/dividers, has explicit Dark mode
  const frame = figma.createFrame();
  frame.name = '.content';
  frame.fills = [];
  frame.clipsContent = false;
  frame.layoutMode = 'NONE';
  frame.resize(W, 800);
  frame.x = 0; frame.y = 0;
  sec.appendChild(frame);
  frame.setExplicitVariableModeForCollection(coll, darkId);

  let cy = 160; // y cursor

  function txt(chars, family, style, size, v, w) {
    const n = figma.createText();
    n.fontName = { family, style };
    n.fontSize = size;
    n.characters = chars;
    n.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    n.x = M; n.y = cy;
    n.resize(w || CW, n.height);
    n.textAutoResize = 'HEIGHT';
    frame.appendChild(n);
    bindFill(n, v);
    cy += n.height;
    return n;
  }

  function gap(px) { cy += px; }

  function divider() {
    const r = figma.createRectangle();
    r.resize(CW, 1);
    r.x = M; r.y = cy;
    r.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }];
    frame.appendChild(r);
    bindFill(r, vBorderSubtle);
    cy += 1;
  }

  // ── Content ──────────────────────────────────────────────────────────────
  txt('SECTION_TITLE', 'Adobe Clean Display', 'Bold', 56, vKnockout, CW);
  gap(24);
  txt('SECTION_SUBTITLE', 'Adobe Clean', 'Regular', 20, vBodySubtle, BW);
  gap(24);
  txt('May 2026  ·  @matt', 'Adobe Clean', 'Regular', 14, vBodySubtle, 600);
  gap(80);
  divider();
  gap(56);

  // Add your section content here following this pattern:
  // txt('Section Heading', 'Adobe Clean', 'Bold', 18, vSubheading, CW); gap(12);
  // txt('Body copy...', 'Adobe Clean', 'Regular', 18, vBodySubtle, BW);
  // gap(56); divider(); gap(56);

  // ── Resize section and frame to content ───────────────────────────────────
  const finalH = cy + 120;
  sec.resizeWithoutConstraints(W, finalH);
  bg.resize(W, finalH);
  frame.resize(W, finalH);

  return { done: true, sectionId: sec.id, height: finalH };
})();
```

4. After the section is created, report:
   - The section node ID
   - Its position (x, y)
   - A one-line summary of content added

## Notes

- Always use `mcp__figma__use_figma` (REST-based) — does **not** require the Desktop Bridge plugin or the s2a-toolkit to be open.
- Font loading is mandatory before any text node creation — the three `loadFontAsync` calls above cover all needed weights.
- `textAutoResize = 'HEIGHT'` after `resize(w, n.height)` — this lets text wrap at the given width and grow downward.
- The `cy` cursor tracks vertical position. Always add a `gap()` after each element.
- Keep the meta line format consistent: `May 2026  ·  @matt` (two em-space-padded dots, no comma).
- For changelog-style pages with version entries, structured lists, or timestamps — build the content in the `txt()` / `gap()` / `divider()` pattern. Do not use auto-layout; manual y-cursor positioning is deliberate so each section's height is predictable.
