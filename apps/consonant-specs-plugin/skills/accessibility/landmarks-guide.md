# Landmark Mapping Guide

## Visual Section → Landmark Role

| Visual Pattern | ARIA Landmark | Notes |
|---|---|---|
| Site header with logo + nav | `banner` | Once per page. Contains logo, primary nav, search |
| Navigation bar / menu | `navigation` | Label if multiple: `aria-label="Primary"` |
| Main content area | `main` | Once per page. Excludes header/footer |
| Site footer | `contentinfo` | Once per page. Legal, copyright, secondary links |
| Search form/bar | `search` | Can be inside banner |
| Named content section | `region` | Must have `aria-label` or `aria-labelledby` |
| Hero / carousel | `region` | With `aria-roledescription="carousel"` if rotating |
| Sidebar | `complementary` | Related but separate from main content |

## Rules

- Every landmark must be labeled if there are multiple of the same type
- `banner` and `contentinfo` should be used once at the page level
- Don't over-landmark: not every `<div>` needs a role
- Sections without a meaningful label should not be landmarks
