# S2A Design System — Claude Code Rules

These rules apply to every conversation in this project. They are non-negotiable and override any default behavior.

---

## Component authoring in Figma — always active rules

### Property panel order

Always add component properties in this exact order. Set it right at creation time — never reorder after the fact (reordering destroys instance override connections).

```
1. Variants       — State, Size, Style, Context, Orientation, Breakpoint (◆ diamond filled)
2. Booleans       — show/hide toggles only, never for state or style (○ circle)
3. Instance Swaps — swappable child components: icon, media, lockup (◇ diamond outline)
4. Text           — every designer-editable text node (@ at sign)
5. Nested props   — exposed sub-component properties, grouped by sub-component (last)
```

> **Slots** (Figma native slot) go first only when the component uses Figma's Slot feature. Most components do not use slots.

### Property naming

| Thing | Convention | Example |
|---|---|---|
| Property names | Title Case | `State`, `Show Icon Start`, `Label` |
| Variant values | Title Case (canonical set only) | `Default`, `Hover`, `On Light`, `Sm`, `Md` |
| All other values | lowercase-kebab | `on-light`, `icon-start` |

**All values are lowercase-kebab — no exceptions:**
`default` · `hover` · `pressed` · `focused` · `disabled` · `on-light` · `on-dark` · `sm` · `md` · `lg` · `xl` · `fill` · `hug` · `vertical` · `horizontal` · `mobile` · `tablet` · `desktop`

### Variant axis order

`State` → `Size` → `Style / Intent` → `Context` → `Orientation` → `Breakpoint`

Start with the most common / default state as the first variant.

### Layer naming

```
ComponentName                    ← COMPONENT_SET (PascalCase)
  └─ State=Default, Size=Md      ← COMPONENT (Figma auto-generates from property values)
       ├─ .root                  ← outermost frame — always ".root"
       │    ├─ .icon-start       ← optional elements: dot-prefixed, kebab-case
       │    ├─ .label            ← text layers: match the text property name
       │    └─ .icon-end
       └─ [focus ring]           ← visual-only layers: bracket-wrapped
```

No unnamed layers ever. No "Frame 1", "Group 47", "Rectangle 3".

### Token binding — never hardcode

Every fill, stroke, spacing, radius, and type decision references an S2A token via `setBoundVariableForPaint` or `setBoundVariable`. No hex values, no raw px in fills.

### Use existing library components — never build placeholder frames

Before creating any child element (icon, lockup, media), search the file for an existing component:
```js
const allSets = figma.root.findAll(n => n.type === 'COMPONENT_SET').map(n => ({ id: n.id, name: n.name }));
```
If it exists, create an instance of the right variant. Expose it as an Instance Swap property. Only build a placeholder frame if no component exists yet.

### Text styles — always setTextStyleIdAsync, never manual fontName

Never set `fontName`, `fontSize`, `lineHeight`, or `letterSpacing` manually on text nodes. Always use `setTextStyleIdAsync` with the real style ID. Get IDs first: `await figma.getLocalTextStylesAsync()`.

**Order:** set `characters` → `Promise.all(setTextStyleIdAsync)` → set `textAutoResize = 'HEIGHT'` → apply fill color. Fills must be applied AFTER text styles.

### figma_execute — mandatory patterns

**Always do these, every script:**

1. Search for existing library components before building anything from scratch
2. Get text style IDs via `figma.getLocalTextStylesAsync()` before any text node creation
3. Load fonts at the top before any text operation
4. Prefetch all variables with `Promise.all` — never `await` inside loops
5. Use `figma.variables.getVariableByIdAsync` (async) — not the sync version
6. Use `await figma.setCurrentPageAsync(page)` — not `figma.currentPage = page`
7. Set `layoutSizingHorizontal = 'FILL'` only after `appendChild`
8. Reassert `primaryAxisSizingMode = 'AUTO'` after every `resize()`
9. Use `primaryAxisAlignItems = 'SPACE_BETWEEN'` — not `primaryAxisAlignContent` (sealed property, throws)
10. Call `createInstance()` on a COMPONENT variant — never on a COMPONENT_SET
11. After `combineAsVariants`, manually reposition variants — they all stack at x:0, y:0
12. Place all components inside a named Section or Frame — never floating on canvas
13. Re-declare page navigation at the top of every script (each `figma_execute` call is isolated)

**Font loading block (paste at top of every script touching text):**
```js
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
await figma.loadFontAsync({ family: 'Adobe Clean Display', style: 'Black' }); // title-4 — NOT ExtraBold
await figma.loadFontAsync({ family: 'Adobe Clean', style: 'Regular' });       // body-lg, body-md
await figma.loadFontAsync({ family: 'Adobe Clean', style: 'Bold' });          // label, caption, eyebrow
```

**Variable prefetch pattern:**
```js
const [vBgDefault, vContentTitle, vBorderSubtle] = await Promise.all([
  figma.variables.getVariableByIdAsync('VariableID:6:49'),
  figma.variables.getVariableByIdAsync('VariableID:2483:41398'),
  figma.variables.getVariableByIdAsync('VariableID:6:22'),
]);
// Then bind synchronously — no await needed after prefetch
```

---

## Token system

- Semantic tokens are in `packages/tokens/json/` and compiled to `dist/packages/tokens/css/dev/`
- Never use primitive tokens directly in components — always alias through semantic tokens
- Component-specific tokens live in `VariableCollectionId:6:178` (S2A / Responsive / Container / Grid), with per-breakpoint mode aliases: `xl`, `lg`, `md`, `sm`
- Raw token IDs are in `packages/tokens/json/raw.json`

---

## In-Figma documentation voice

Write like an educator explaining to someone new. Say what something does and why it matters, then give the technical detail.

- Keep token names and CSS property names exact (engineers need them)
- Replace Figma API jargon (`INSTANCE_SWAP`, `primaryAxisSizingMode`) with plain descriptions
- Cite WCAG 2.2 AA SC codes with a one-line plain-language summary
- Never surface `#nodeId` suffixes in doc copy

---

## Screenshot safety

- Never call `figma_take_screenshot` or `figma_capture_screenshot` on a PAGE node — always target a specific FRAME
- Use `scale: 1` or `scale: 2` on small frames only
- If context is large (many prior figma_execute turns), prefer `figma_get_status` (text) over screenshots

---

## Skill and command references

| What | Where |
|---|---|
| Component authoring (full reference) | `/component-authoring` (`.claude/commands/component-authoring.md`) |
| Component docs generation | `/component-docs` (`.claude/commands/component-docs.md`) |
| Spec generation | `/spec` (`.claude/commands/spec.md`) |
| figma_execute safe patterns | `.codex/skills/figma-console-safe-execution.skill.md` |
| Figma plugin gotchas | `docs/workflows/figma-plugin-patterns.md` |
| End-to-end workflow | `docs/workflows/ai-assisted-design-system-workflow.md` |
