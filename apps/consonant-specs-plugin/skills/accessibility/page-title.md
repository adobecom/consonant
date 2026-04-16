# Page Title

Descriptive page titles and SPA title management. Use this as the primary reference when filling the Page Title card.

---

## Page Title (WCAG 2.4.2)

Every page MUST have a descriptive `<title>` element that identifies the page purpose.

**Format:** Specific → General
```
Product Details - Adobe Creative Cloud
Checkout Step 2: Payment - Adobe Store
Search Results for "Photoshop" - Adobe
```

**Rules:**
- Title must describe the page content or purpose
- Include the site/app name (usually last, after a separator)
- Be unique across all pages in the site
- Keep under ~60 characters (search engines truncate)
- Front-load the distinguishing information

**Bad titles:**
- "Adobe" (too generic — which page?)
- "Page 1" (meaningless)
- "Untitled" (default)
- Same title on every page

## SPA Title Updates (WCAG 2.4.2)

For single-page applications, the `<title>` MUST update on every route change:

```js
// React
useEffect(() => {
  document.title = `${pageTitle} - App Name`;
}, [pageTitle]);
```

**Additionally:**
- Announce the page change to screen readers via `aria-live` or focus management
- Move focus to the new page heading or a skip-link target
- Update the document title BEFORE announcing the change

## Error Pages

Error states need descriptive titles:
- "Error: Page Not Found - Adobe"
- "Form Error: Missing Required Fields - Checkout"

Not just "Error" or "404".

## Detection Heuristics for Figma

- Identify the page name from the frame name or heading
- Check if this is part of a multi-page flow (checkout, wizard, onboarding)
- Look for breadcrumbs — they often mirror the title hierarchy
- Check for browser chrome in the design (tab bar showing title)
- Determine if this is an SPA view or a full page

## Blueline Card Output

- Title = page/view name (e.g. "Homepage title", "Checkout Step 2", "Search results page")
- Desc = recommended title (e.g. "Title: 'Creative Cloud Plans & Pricing - Adobe'. Update on each route change in SPA.")
- Notes = cite WCAG 2.4.2 Page Titled
- Warnings = generic/missing titles, SPA without title updates
