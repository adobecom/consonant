# Naming Taxonomy for Components, Blocks & Patterns

## Summary: Nathan Curtis's Token Naming Applied Up the Atomic Scale

**Core Principle**: Use the same hierarchical, cascading naming structure from tokens all the way up to components, blocks, and patterns. This creates a discoverable, composable system where the relationship between tokens → components → blocks → patterns is explicit in the naming.

---

## Nathan Curtis's Token Naming Structure

**Pattern**: `Namespace.Object.Base.Modifier`

**Example Token Names:**
- `spacing.4` (primitive)
- `color.brand.primary` (semantic)
- `component.button.padding` (component token)

---

## Applied to Components, Blocks & Patterns

### 1. **Components** (Atoms & Molecules)

**Structure**: `component.{name}.{part}.{variant}.{state}`

**Examples:**
```
component.button
component.button.size-md
component.button.variant-primary
component.button.variant-primary.state-disabled
component.card
component.card.header
component.card.header.title
component.card.footer
component.card.footer.actions
```

**Key Points:**
- **Component name** is the base (button, card, input)
- **Parts/slots** reflect composition (header, footer, media, actions)
- **Variants** are semantic (primary, secondary, outlined)
- **States** are interactive (hover, active, disabled, focus)

### 2. **Blocks/Patterns** (Organisms)

**Structure**: `pattern.{name}.{composition}`

**Examples:**
```
pattern.card-list
pattern.pricing-tryptic
pattern.hero-marquee
pattern.nav-global
pattern.footer-mega
```

**Key Points:**
- **Pattern name** describes the composed structure (card-list, pricing-tryptic)
- **Composition** is implicit in the name (tryptic = 3 cards)
- Can reference sub-components: `pattern.card-list.item` (uses `component.card`)

### 3. **Layout/Containers** (Templates)

**Structure**: `layout.{type}.{size}.{behavior}`

**Examples:**
```
layout.container
layout.container.md
layout.container.fluid
layout.container.xl
layout.grid
layout.grid.12col
layout.grid.6col
```

**Key Points:**
- **Type** is the layout primitive (container, grid, stack)
- **Size** maps to breakpoints/tokens (md, lg, xl)
- **Behavior** describes responsive behavior (fluid, fixed)

---

## Cascading Relationship

### Token → Component → Block → Pattern

```
Token: spacing.4
  ↓
Component: component.button.padding (references spacing.4)
  ↓
Block: pattern.button-group (uses component.button)
  ↓
Pattern: pattern.hero-cta (uses pattern.button-group)
```

### Example: Card System

```
Tokens:
  - spacing.4, spacing.8, spacing.16
  - color.surface.card
  - typography.heading.h3

Component:
  - component.card
  - component.card.header (uses typography.heading.h3)
  - component.card.body (uses spacing.8)
  - component.card.footer (uses spacing.4)

Block:
  - pattern.card-list (composes multiple component.card)
  - pattern.card-grid (composes component.card in grid)

Pattern:
  - pattern.pricing-tryptic (uses pattern.card-grid with 3 items)
  - pattern.editorial-deck (uses pattern.card-list)
```

---

## Naming Rules

### 1. **Semantic Over Implementation**
- ✅ `component.button.variant-primary` (semantic)
- ❌ `component.button.color-blue` (implementation detail)

### 2. **Reflect Composition**
- ✅ `component.card.header.title` (shows hierarchy)
- ❌ `component.card-title` (flattened, loses relationship)

### 3. **Expose Sub-Parts**
- ✅ `component.card.media`, `component.card.header`, `component.card.footer`
- This makes "Sub-components used" explicit in documentation

### 4. **Token → Component Binding**
- Component tokens should reference primitives: `component.button.padding = spacing.4`
- Makes it obvious which tokens power which components

### 5. **Consistent Segments**
- Use the same segment structure across all levels
- `{category}.{name}.{part}.{variant}.{state}` pattern applies everywhere

---

## Practical Examples from Your System

### Button Component
```
component.button
component.button.size-sm
component.button.size-md
component.button.size-lg
component.button.kind-primary
component.button.kind-secondary
component.button.background-solid
component.button.background-outlined
component.button.background-glass
component.button.state-hover
component.button.state-disabled
```

### Card Component
```
component.card
component.card.header
component.card.header.title
component.card.header.subtitle
component.card.media
component.card.body
component.card.footer
component.card.footer.actions
```

### Card Patterns
```
pattern.card-text (uses component.card, no media)
pattern.card-app (uses component.card + component.product-lockup)
pattern.card-pricing (uses component.card + component.button × 2)
pattern.card-list (composes multiple component.card)
pattern.card-grid (composes component.card in grid layout)
```

### Container/Layout
```
layout.container
layout.container.md (max-width: 1198px, margin: 121px)
layout.container.fluid (width: 100%)
layout.grid.12col (desktop)
layout.grid.6col (mobile)
```

---

## Benefits

1. **Discoverability**: Clear hierarchy makes it easy to find related items
2. **Composability**: Names show how pieces fit together
3. **Traceability**: Can trace from pattern → block → component → token
4. **Consistency**: Same naming pattern across all levels
5. **Documentation**: Names are self-documenting (e.g., `component.card.header.title`)

---

## Reference

Based on Nathan Curtis's "Naming Tokens in Design Systems":
- [Medium Article](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676)
- Extends the token naming taxonomy (`Namespace.Object.Base.Modifier`) up the atomic scale
- Maintains the same hierarchical, cascading relationship from tokens → components → blocks → patterns
