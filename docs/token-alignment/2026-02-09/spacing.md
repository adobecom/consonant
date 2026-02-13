## Token Alignment · Spacing (2026‑02‑09)

> Alignment between **S2A spacing tokens** (from `dist/packages/design-tokens/css/min/tokens.min.css`) and the **latest home redesign** spacing system in Figma.
>
> Use this as a Venn-diagram: what we **already have**, what the redesign **actually uses**, and how we should **normalize** going forward.

| ID   | Category | Our Token (CSS var)         | Value (px) | Figma Spec (name / px)             | Relation (same / close / new / unused) | Recommendation                       | Notes                                |
| ---- | -------- | --------------------------- | ---------: | ---------------------------------- | -------------------------------------- | ------------------------------------ | ------------------------------------ |
| S-01 | spacing  | --s2a-spacing-2             |          2 | 2 px (from Spacing — Global table) | same                                   | Keep; map to `spacing/2` in Figma    |                                      |
| S-02 | spacing  | --s2a-spacing-4             |          4 | 4 px (from Spacing — Global table) | same                                   | Keep; map to `spacing/4` in Figma    |                                      |
| S-03 | spacing  | --s2a-spacing-8             |          8 | 8 px                               | same                                   | Keep; map to `spacing/8`             |                                      |
| S-04 | spacing  | --s2a-spacing-12            |         12 | 12 px                              | same                                   | Keep; map to `spacing/12`            |                                      |
| S-05 | spacing  | --s2a-spacing-16            |         16 | 16 px                              | same                                   | Keep; use as core body spacing unit  |                                      |
| S-06 | spacing  | --s2a-spacing-20            |         20 | 20 px                              | same                                   | Keep; map to medium gutter / inset   |                                      |
| S-07 | spacing  | --s2a-spacing-24            |         24 | 24 px                              | same                                   | Keep; primary vertical rhythm step   |                                      |
| S-08 | spacing  | --s2a-spacing-32            |         32 | 32 px                              | same                                   | Keep; map to `section/stack-large`   |                                      |
| S-09 | spacing  | --s2a-spacing-40            |         40 | 40 px                              | same                                   | Keep; use for desktop block spacing  |                                      |
| S-10 | spacing  | --s2a-spacing-48            |         48 | 48 px                              | same                                   | Keep; hero padding / large gaps      |                                      |
| S-11 | spacing  | --s2a-spacing-64            |         64 | 64 px                              | same                                   | Keep; large desktop section spacing  |                                      |
| S-12 | spacing  | --s2a-spacing-80            |         80 | 80 px                              | same                                   | Keep; hero top/bottom padding        |                                      |
| S-13 | spacing  | --s2a-spacing-96            |         96 | 96 px                              | same                                   | Keep; map to max hero / page header  |                                      |
| S-14 | spacing  | --s2a-spacing-104           |        104 | 104 px                             | close                                  | Keep; only use if Figma needs 104    |                                      |
| S-15 | spacing  | --s2a-spacing-none          |          0 | 0 px                               | same                                   | Keep                                 |                                      |
| S-16 | spacing  | --s2a-spacing-3xs / 2xs / … |    2–104\* | t-shirt scale rows (XS–7XL)        | same                                   | Keep; use for semantic spacing scale | `3xs`→2, `2xs`→4, `xs`→8 … `7xl`→104 |
