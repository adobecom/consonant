# S2A Component Audit

Audit an S2A Figma component page for normalization issues — property order, casing, layer naming, token binding, and documentation completeness. Flag issues only, do not make changes.

## Usage

```
/s2a-component-audit [page-name | all]
```

## What to check

**1. Property panel order** — must be exactly:
1. Variants (State, Size, Style, Context, Orientation, Breakpoint)
2. Booleans (show/hide toggles only)
3. Instance Swaps (icon, media, lockup)
4. Text (every designer-editable text node)
5. Nested props (last)

**2. Variant value casing** — all values must be lowercase-kebab: `default`, `hover`, `on-light`, `sm`, `md`. No Title Case values.

**3. Layer naming** — no unnamed layers (`Frame 1`, `Group 47`, `Rectangle 3`). Root frame must be `.root`. Optional elements use dot-prefix kebab-case (`.icon-start`, `.label`). Visual-only layers use bracket wrapping (`[focus ring]`).

**4. Token binding** — no hex values, no raw px in fills, strokes, spacing, or radii. Every fill must reference an S2A variable via `setBoundVariableForPaint`.

**5. Documentation** — check if a doc sheet exists for the component. Flag if missing.

**6. Unused properties** — flag any boolean or instance swap that is never toggled across the full variant matrix.

## Output format

Return one markdown table per component set audited:

| Issue | Property / Layer | Current | Expected | Severity |
|---|---|---|---|---|

Severity scale:
- **High** — blocks engineering handoff (wrong property order, missing tokens)
- **Medium** — naming/casing inconsistency
- **Low** — documentation gap or unused property
