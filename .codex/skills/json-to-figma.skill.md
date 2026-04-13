---
skill: json-to-figma
description: Build or update a Figma component set from a spec.json — enforces property panel order, layer naming conventions, variant structure, and token binding standards.
command: /json-to-figma <component-name> [figma-url]
---

## Why this skill exists

Creating a Figma component set by hand is slow and inconsistent. This skill standardizes how S2A component sets are built via `figma_execute` — ensuring every component follows the same property panel order, layer naming conventions, variant matrix structure, and S2A token bindings. A consistent component set is also a prerequisite for reliable MCP tool output and AI-assisted block generation downstream.

**See also:** `.codex/skills/component-docs.skill.md` for generating the documentation suite after the component set is built.

---

## Component property panel order

This is the canonical order for all S2A component sets. Follow it exactly — this is the convention used across S2A and Radley's C2 block library.

```
1. Slots          (Figma native slot)   — FIRST, only if the component uses Figma Slots
2. Variants       (◆ diamond filled)    — state, size, style, context, orientation, breakpoint
3. Booleans       (○ circle)            — show/hide toggles for optional elements
4. Instance Swaps (◇ diamond outline)   — component slot overrides (icon, media, etc.)
5. Text           (@ at sign)           — editable text content (label, heading, body)
6. Nested props                         — exposed sub-component properties (surfaced last, grouped by sub-component)
```

### ⚠ NEVER reorder properties programmatically

Reordering via the plugin API requires deleting and re-adding properties. Deleting an Instance Swap or Boolean property destroys all existing instance override connections — icons lose their swap targets, booleans lose their layer bindings, and every instance in the file using that component must be manually repaired.

**Always set property order correctly at creation time.** If an existing component needs reordering, flag it and fix it manually by dragging properties in Figma's Properties panel (right sidebar → select component set → drag to reorder). Never use `deleteComponentProperty` + `addComponentProperty` to reorder.

### Rules

- **Slots first** — If the component uses Figma's Slot feature (e.g. Actions, where buttons are slotted children), the slot property must be the very first property in the panel. This is Figma's way of making composition explicit before any variant or toggle.
- **Variants before everything else** — Breakpoint, State, Size, Style, Context, Orientation. These drive the visual behavior of the component.
- **Booleans for show/hide only** — Do not use booleans for state or style. State changes go in variants. Booleans are strictly for optional elements (e.g. "Show Icon Start", "Show Progress").
- **Don't surface sub-booleans without the parent** — If a boolean controls a group (e.g. "Show Actions"), don't also expose "Action 1" and "Action 2" as top-level booleans unless they're independently optional. Group them under the parent instance swap instead.
- **Instance swaps for atom overrides** — When a child component (icon, media, lockup) should be swappable, expose it as an instance swap. Do not hard-code atom variants inside a block.
- **Text properties for all editable copy** — Every text node a designer is expected to change must have a text property. Nodes that are never edited (e.g. internal labels, decorative text) should not be exposed.

---

## Layer naming conventions

All layers must be explicitly named — no "Frame 1", "Group 47", "Rectangle 3".

### Component set structure
```
ComponentName                    ← COMPONENT_SET
  └─ Variant=Default, Size=Md    ← COMPONENT (variant property values as name)
       ├─ .root                  ← outermost frame of the component
       │    ├─ .icon-start       ← optional element: dot-prefixed, kebab-case
       │    ├─ .label            ← text layer
       │    └─ .icon-end
       └─ [focus ring]           ← visual-only layers in brackets
```

### Naming rules
- **Component set** — PascalCase, matches the component's display name (e.g. `Button`, `ProductLockup`, `RouterCard`)
- **Individual variants** — Figma auto-generates from property values (e.g. `Variant=Primary, Size=Md, State=Default`) — do not rename these
- **Root frame** — always `.root`
- **Optional/conditional layers** — dot-prefixed, kebab-case: `.icon-start`, `.progress-bar`, `.media`
- **Structural containers** — kebab-case, descriptive: `header`, `body`, `footer`, `actions-group`
- **Visual-only layers** — bracket-wrapped: `[focus ring]`, `[hover overlay]`, `[background]`
- **Slot containers** — match the slot name from the Figma Slot definition: `Children`, `Action 1`, `Media`
- **Text layers** — match the text property name: `label`, `heading`, `body`, `eyebrow`

---

## Property name and value casing

### Property names → Title Case
Every property name in the component panel must be Title Case.

```
✓ Show Icon Start
✓ Style Variant
✓ Background Color
✗ showIconStart
✗ style_variant
✗ background color
```

### Property values → lowercase-kebab
Every property value (variant options, boolean labels, instance swap names) must be lowercase-kebab-case — with the exception of the canonical variant values defined in the variant matrix section above (those use Title Case by convention: `Default`, `On Light`, etc.).

```
✓ on-light        (context values)
✓ icon-start      (instance swap slot names)
✓ show-progress   (boolean exposed names — if surfaced)
✗ OnLight
✗ IconStart
✗ ShowProgress
```

**Exception — canonical variant values:** The variant matrix defines a fixed set of Title Case values (`Default`, `Hover`, `On Light`, `Sm`, `Md`, `Lg`, `Xl`, `Fill`, `Hug`, `Vertical`, `Horizontal`). These are the only values that use Title Case. Everything else is lowercase-kebab.

---

## Variant matrix structure

- Start with the **default/most common state** as the first variant
- Order variant axes: `State` → `Size` → `Style/Intent` → `Context` → `Orientation` → `Breakpoint`
- Use consistent value names across all components:

| Axis | Values |
|------|--------|
| State | `Default`, `Hover`, `Pressed`, `Focused`, `Disabled` |
| Size | `Sm`, `Md`, `Lg`, `Xl` |
| Context | `On Light`, `On Dark` |
| Orientation | `Vertical`, `Horizontal` |
| Breakpoint | `Mobile`, `Tablet`, `Desktop` |
| Width | `Fill`, `Hug` |

- Avoid one-off value names — if a new axis is needed, check if it belongs in a boolean or instance swap first.

---

## S2A token bindings

Every color, spacing, radius, and type decision must reference an S2A token — never a hardcode.

### Binding checklist per variant
- [ ] Background fill → `--s2a-color-background-*`
- [ ] Text color → `--s2a-color-content-*`
- [ ] Border/stroke → `--s2a-color-border-*`
- [ ] Focus ring → `--s2a-color-focus-ring-default`
- [ ] Padding (inner spacing) → `--s2a-spacing-*`
- [ ] Gap (between children) → `--s2a-spacing-*`
- [ ] Border radius → `--s2a-border-radius-*`
- [ ] Icon size → `--s2a-size-icon-*`
- [ ] Min/max width → responsive token if applicable

### How to apply in figma_execute
```js
// Resolve variable once — never inside a loop
const bgVar = await figma.variables.getVariableByIdAsync('VariableID:6:20');
// Apply to node fill
node.fills = [figma.variables.setBoundVariableForPaint(
  { type: 'SOLID', color: { r: 1, g: 1, b: 1 } },
  'color',
  bgVar
)];
```

---

## figma_execute checklist before running

```text
- [ ] Slots defined first (if component uses Figma Slots)
- [ ] Variant axes use canonical value names (Default, Hover, Sm, Md, On Light…)
- [ ] All layers named — no "Frame N", "Group N", "Rectangle N"
- [ ] Root frame named .root
- [ ] Optional layers dot-prefixed, kebab-case
- [ ] All fills/strokes bound to S2A variables (no hardcoded hex)
- [ ] Text properties exposed for every designer-editable text node
- [ ] Booleans only for show/hide (not state or style)
- [ ] Instance swaps for any child component that should be swappable
- [ ] Fonts loaded before any text mutation
- [ ] FILL sizing set only after appendChild (auto-layout safety)
- [ ] Component placed inside a Section or Frame — never floating on canvas
```

---

## Integration with MCP

After the component set is built in Figma, the MCP can read it if it also has:
- A `{slug}.js` and `{slug}.css` in `packages/components/src/{slug}/`
- A `{slug}.spec.json` with `figmaNodeId` pointing to the component set node

Run `validate_spec` to confirm the Figma node ID is registered and the spec matches source.
