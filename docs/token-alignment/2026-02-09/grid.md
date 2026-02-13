## Token Alignment · Grid & Layout (2026‑02‑09)

> Alignment between **S2A grid / layout tokens** (columns, gutters, margins, breakpoints) and the **layout specs** in the latest home redesign.

| ID   | Breakpoint   | Our Grid Tokens / Values                  | Figma Spec (cols / gutter / margin / width)              | Relation (same / close / new / unused) | Recommendation                                         | Notes                                  |
| ---- | ------------ | ----------------------------------------- | -------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------ | -------------------------------------- |
| G-01 | L (desktop)  | 12-col grid (token: `grid/12col/desktop`) | 12 columns over 2560px; column ≈169.33, gutters implicit | new (spec) / missing (token)           | Add explicit grid tokens for 12-col large desktop      | from `Grid — L / 12 Column Grid` frame |
| G-02 | M (tablet)   | 12-col grid (token: `grid/12col/tablet`)  | 12 columns over 1440px; column =92, margins at 126px     | new (spec) / missing (token)           | Add M breakpoint grid tokens mapped to 1440 container  | from `Grid — M / 12 Column Grid` frame |
| G-03 | S (mobile-L) | 14-col grid (token: `grid/14col/mobileL`) | 14 cols implied; 6 visible rects in 768px, 24px margin   | new                                    | Add 14-col mobile grid tokens for authoring alignment  | from `Grid — S / 14 Column Grid`       |
| G-04 | XS (mobile)  | 6-col grid (token: `grid/6col/mobile`)    | 6 columns over 375px; 24px margin, 47.83px column        | new                                    | Add 6-col XS grid tokens; use for smallest breakpoints | from `Grid — XS / 6 Column Grid`       |
