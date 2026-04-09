---
skill: s2a-component-audit
description: Audit S2A Figma component pages for normalization — property order, casing, layer naming, documentation completeness, and unused properties. Flags issues without making changes.
command: /s2a-audit [page-name | all]
---

## Why this skill exists

Before merging into main or publishing a library, every component page needs to be verified against the S2A authoring standards. This skill runs a read-only sweep and produces a flagged report — it never modifies the file. Fixes happen separately after human review.

**Standards reference:** `.codex/skills/s2a-component-authoring.skill.md`

---

## What to check per component page

### 1. Component set structure
- [ ] Has exactly one COMPONENT_SET (or a documented reason for multiple)
- [ ] Component set name is PascalCase matching the component slug
- [ ] No unnamed component sets ("Component 1", etc.)

### 2. Property panel order
Must follow: **Slots → Variants → Booleans → Instance Swaps → Text → Nested**
- [ ] Slots appear first (if used)
- [ ] All variant properties grouped before booleans
- [ ] No booleans that control state or style (those belong in variants)
- [ ] Instance swaps appear after all booleans
- [ ] Text properties appear last before nested

**⚠ FLAG ONLY — never fix programmatically.**
Property reordering via the plugin API requires deleting and re-adding properties, which destroys instance swap connections and breaks all existing overrides. Always flag order issues in the report and let the designer fix them manually by dragging in Figma's Properties panel (right sidebar → select component set → drag to reorder).

### 3. Property name casing
- [ ] All property names are Title Case (`Show Icon Start`, not `showIconStart`)
- [ ] No snake_case, camelCase, or all-lowercase property names

### 4. Property value casing
- [ ] Variant values use canonical Title Case set: `Default`, `Hover`, `Pressed`, `Focused`, `Disabled`, `Sm`, `Md`, `Lg`, `Xl`, `On Light`, `On Dark`, `Fill`, `Hug`, `Vertical`, `Horizontal`, `Mobile`, `Tablet`, `Desktop`
- [ ] All other values are lowercase-kebab

### 5. Layer naming
- [ ] No unnamed layers: "Frame N", "Group N", "Rectangle N", "Ellipse N", "Vector N"
- [ ] Root frame named `.root`
- [ ] Optional layers dot-prefixed, kebab-case (`.icon-start`, `.progress-bar`)
- [ ] Visual-only layers bracket-wrapped (`[focus ring]`, `[hover overlay]`)
- [ ] Text layers match their text property name

### 6. Unused properties
- [ ] Flag any property with zero variant connections or that appears disconnected from any visible layer
- [ ] Do NOT remove — flag for human review

### 7. Documentation completeness
Compare against the standard doc suite (from `component-docs` skill):
- [ ] Anatomy sheet exists
- [ ] Properties sheet exists (or combined with Anatomy)
- [ ] Layout & Spacing sheet exists
- [ ] Accessibility sheet exists
- [ ] Usage sheet exists
- [ ] All sheets use `.sheet frame` scaffolding (not raw frames)
- [ ] "Last updated" date is current
- [ ] No sheet still has placeholder/template text

### 8. General
- [ ] No deprecated components outside the "Deprecated" section
- [ ] No floating frames outside named Sections
- [ ] Live component previews in docs use real instances (not detached)

---

## Audit output format

Report per page, not per issue. Use this structure:

```
## [Component Name] — [Published | WIP | Not Published]

### Component Set
- ✓ / ✗ / ⚠ [finding]

### Properties
- ✓ / ✗ / ⚠ [finding]

### Layers
- ✓ / ✗ / ⚠ [finding]

### Documentation
- ✓ / ✗ / ⚠ [finding]

### Flags for human review
- [anything that needs eyes before action]
```

**Symbols:**
- `✓` — passes
- `✗` — fails, needs fixing
- `⚠` — needs human review before acting

---

## How to run via figma_execute

```js
// Load all pages and collect component sets + their properties
await figma.loadAllPagesAsync();
const report = [];

for (const page of figma.root.children) {
  const sets = page.findAll(n => n.type === 'COMPONENT_SET');
  if (sets.length === 0) continue;

  for (const set of sets) {
    const props = set.componentPropertyDefinitions;
    const propList = Object.entries(props).map(([key, def]) => ({
      name: key,
      type: def.type,
      defaultValue: def.defaultValue,
      variantOptions: def.variantOptions,
    }));

    // Check for unnamed layers inside variants
    const unnamedLayers = [];
    for (const variant of set.children) {
      variant.findAll(n => {
        const defaultNames = /^(Frame|Group|Rectangle|Ellipse|Vector|Polygon|Star|Line|Component)\s+\d+$/;
        if (defaultNames.test(n.name)) unnamedLayers.push({ variant: variant.name, layer: n.name });
      });
    }

    report.push({
      page: page.name,
      componentSet: set.name,
      propertyCount: propList.length,
      properties: propList,
      unnamedLayers: unnamedLayers.slice(0, 10), // cap output
    });
  }
}

return report;
```

---

## Scope for a pre-merge audit

Run against these pages in order:
1. Actions (ButtonGroup)
2. AppIcon
3. Button
4. Card + Router Card
5. Link
6. Logo
7. Media
8. ProductLockup
9. SectionHeader
10. Footer
11. GlobalNav
12. RichContent
13. RouterMarquee

Skip: Tokens, Grid, Icons, Scaffolding, Exploration, TODO (internal/non-component pages).
