# Target Size

Minimum interactive target sizes and spacing requirements. Use this as the primary reference when filling the Target Size card.

---

## Minimum Sizes (WCAG 2.5.8)

| Context | Minimum target size |
|---|---|
| Desktop interactive elements | **24 x 24 CSS pixels** |
| Touch interfaces (mobile, tablet) | **44 x 44 CSS pixels** (recommended) |
| Inline text links in body copy | No minimum (exception) |

## Spacing Rule

If a target is smaller than 24px, it can still pass if there is **24px of clear space** around it — no adjacent interactive elements within that space.

This means small icons are acceptable IF they have enough padding/margin separating them from other clickable elements.

## Common Violations

| Element | Typical size | Issue | Fix |
|---|---|---|---|
| Icon-only buttons | 16x16px | Below 24px minimum | Add padding: 16px icon + 4px padding = 24x24 target |
| Modal close button | 14-16px | Below minimum | Enlarge hit area to 24x24 minimum |
| Checkbox/radio (native) | 13x13px | Below minimum | Style with enlarged hit area |
| Pagination dots | 8-12px | Below minimum | Add padding or increase size |
| Small text links (close together) | Varies | Insufficient spacing | Ensure 24px between adjacent links |
| Breadcrumb separators | Varies | Not clickable but reduce spacing | Ensure enough space between breadcrumb links |
| Tag/chip close buttons | 12-16px | Below minimum | Enlarge hit area |

## Touch Target Best Practices

For mobile/responsive designs:
- Primary actions (CTA buttons): minimum 44x44px
- Navigation links: minimum 44px height
- Form inputs: minimum 44px height
- Icon buttons in toolbars: minimum 44x44px with 8px+ spacing

## Design Annotation Format

For small icons, document the required padding:
- "Icon 16px + 4px padding all sides = 24x24px target"
- "Icon 16px + 14px padding = 44x44px touch target"
- "Link cluster: ensure 24px minimum spacing between adjacent links"

## Detection Heuristics for Figma

- Check all interactive elements (buttons, links, checkboxes, radios) for width/height
- Flag any interactive element smaller than 24x24px
- Check spacing between adjacent interactive elements
- Look for icon-only buttons — measure the clickable frame, not just the icon vector
- Check pagination, breadcrumbs, tag lists for tight spacing

## Blueline Card Output

- Title = element name with measured size (e.g. "Close button (16x16)", "Pagination dots (10px)")
- Desc = finding and fix (e.g. "Below 24px minimum — add 4px padding all sides for 24x24 target area")
- Notes = cite WCAG 2.5.8 Target Size (Minimum)
- Warnings = elements below 24px without sufficient spacing
