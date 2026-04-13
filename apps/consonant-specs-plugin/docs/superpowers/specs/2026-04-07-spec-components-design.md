# Section 5: Component Details — Design Spec

## Overview

The Component Details section lists every component instance found in the selected frame's tree, showing variant properties, overrides, component set info, and nested instance relationships. It renders as indented per-instance cards that visualize the nesting hierarchy up to 4 levels deep.

This section is conditionally rendered — returns `null` if the frame contains no component instances.

## Visual Structure

```
Component Details (section title, 24px Inter Bold)
└── Container (gray bg #F7F7F7, cornerRadius 8, padding 12)
    ├── Instance Card (depth 0)
    │   ├── Header: ◈ icon (orange) + instance name (Inter Bold 11px)
    │   ├── Prop rows (reuse addPropRow pattern):
    │   │   ├── Main component: ComponentName
    │   │   ├── Component set: SetName (if part of COMPONENT_SET)
    │   │   ├── Variant properties: size=L, state=default, icon=true
    │   │   ├── Available variants: Default, Hover, Pressed, Disabled
    │   │   ├── Overrides: (each on its own row, token-matched)
    │   │   └── Component ID: mainComponent.id
    │   ├── Divider
    │   └── Nested instances (indented, depth+1):
    │       ├── Instance Card (depth 1, paddingLeft +24px, left border)
    │       │   └── ... (same structure)
    │       └── Instance Card (depth 1)
    │           └── Nested instances (depth 2, paddingLeft +48px)
    │               └── ...
    ├── Divider
    └── Instance Card (depth 0)
        └── ...
```

## Visual Constants

Reuse existing constants from the codebase:

| Constant | Value | Source |
|---|---|---|
| Section title font | Inter Bold, 24px | Same as Anatomy/Typography |
| Container background | `#F7F7F7` (r:0.97) | Same as typography table |
| Container corner radius | 8px | Same as typography table |
| Badge/icon color (orange) | `#E87A2E` (r:0.91, g:0.48, b:0.18) | `BADGE_COLOR` from spec-anatomy |
| Property label color | `#737373` (r:0.45) | `PROP_LABEL_COLOR` from spec-anatomy |
| Property value color | `#262626` (r:0.15) | `PROP_VALUE_COLOR` from spec-anatomy |
| Token highlight color | `#2E9E78` (r:0.18, g:0.62, b:0.47) | `TOKEN_COLOR` from spec-anatomy |
| Prop font size | 10px | `PROP_FONT_SIZE` from spec-anatomy |
| Header font size | 11px | Same as anatomy block headers |
| Nesting indent | 24px per depth level | New |
| Nesting left border | 1px, `#E0E0E0` | New |
| Card item spacing | 2px | Same as anatomy property blocks |
| Card padding | 8px top, 12px bottom, 12px left/right | Same as anatomy blocks |
| Table width | 500px | `TABLE_WIDTH` from spec-anatomy |
| Max depth | 4 | Matches anatomy depth cap |

## Properties Shown Per Instance

| Property | Figma API Source | Token-matched? |
|---|---|---|
| Instance name | `node.name` | No |
| Main component | `node.mainComponent.name` | No |
| Component set | `node.mainComponent.parent.name` (when parent.type === 'COMPONENT_SET') | No |
| Variant properties | `node.variantProperties` — displayed as `key=value` pairs | No |
| Available variants | `node.mainComponent.parent.children.map(c => c.name)` (when COMPONENT_SET) | No |
| Overrides | `node.overrides` — properties that differ from main component | Colors and spacing are token-matched |
| Component ID | `node.mainComponent.id` | No |

## Recursion Logic

1. Walk the source node's tree starting from root
2. When an `INSTANCE` node is found, create a card for it at the current depth
3. Recurse into the instance's children looking for more `INSTANCE` nodes
4. Nested instances render as indented child cards under their parent card
5. Top-level instances (those whose parent is not also an INSTANCE being rendered) appear at root indent (depth 0)
6. Max depth: 4 levels. At the limit, show "... N deeper instances" as a text note instead of recursing further

## Override Detection

Uses `node.overrides` which returns `Array<{ id: string, overriddenFields: string[] }>`:

- Each entry has an `id` (the overridden descendant node) and `overriddenFields` (e.g., `["characters", "fills", "width"]`)
- To show values: resolve the node via `figma.getNodeByIdAsync(override.id)`, then read the overridden fields from the resolved node
- Display format: group by field type — text overrides show the string, fill overrides show hex + token match, dimension overrides show px value
- If `node.overrides` is empty, omit the overrides section from the card entirely

## File Integration

- **Create:** `src/spec-components.ts` — exports `generateComponentDetailsSection(node: SceneNode): Promise<FrameNode | null>`
- **Modify:** `src/spec-it.ts` — add import and call between typography and the positioning logic, with a status message "Generating component details..."

The function signature and return pattern matches the existing sections:
- Returns `FrameNode` containing the full section
- Returns `null` if no component instances found (section is skipped)

## Edge Cases

- **No instances in tree:** return `null`, section not rendered
- **Instance with no main component** (detached): show "Detached instance" instead of component name
- **Component not in a set:** omit "Component set" and "Available variants" rows
- **Mixed content symbol:** `figma.mixed` for properties — show "Mixed" as value
- **Very deep nesting (>4):** show count note, don't recurse further
