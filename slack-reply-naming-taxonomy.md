Ah, got it. and agree. I typically follow a similar pattern of naming blocks → components as I do with tokens. I feel like this write up does a good job with that: https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676

The core idea is applying Nathan Curtis's hierarchical naming structure to components and their sub-components, so the relationship cascades just like tokens do.

**Component naming pattern**: `{category}.{name}.{sub-component}.{variant}`

**Examples:**
- `component.button` (base component)
- `component.button.icon-start` (sub-component)
- `component.button.icon-end` (sub-component)
- `component.card` (base component)
- `component.card.header` (sub-component)
- `component.card.header.title` (sub-component of sub-component)
- `component.card.body` (sub-component)
- `component.card.footer` (sub-component)
- `component.card.footer.actions` (sub-component of sub-component)

This makes the hierarchy explicit: `card` → `card.header` → `card.header.title` shows that `title` is part of `header`, which is part of `card`.

Same pattern applies to variants:
- `component.button.size-md`
- `component.button.variant-primary`
- `component.card.variant-pricing`

The cascading relationship means:
- Sub-components inherit the parent name (`card.header` not just `header`)
- The hierarchy is discoverable (`card.footer.actions` tells you it's actions within footer within card)
- Composition is explicit (you can see `card.header.title` uses `typography.heading.h3`)

This keeps the same naming pattern from tokens → components → sub-components, so everything feels like one cohesive system.
