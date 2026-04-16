# Consistent Navigation

Navigation consistency and identification across pages. Use this as the primary reference when filling the Consistent Navigation card.

---

## Consistent Navigation (WCAG 3.2.3)

Navigation mechanisms that appear on multiple pages MUST appear in the **same relative order** on every page.

**Rules:**
- Same navigation links in the same order across all pages
- New links can be added between existing ones, but existing order must not change
- Navigation position (header, sidebar, footer) stays consistent
- Menu structure (dropdowns, mega-menus) stays consistent

**Common failures:**
- Reordering nav items based on "most popular" per page
- Different navigation structure on mobile vs. desktop (order can change, but all items must be present)
- Login/account links moving positions between pages
- Footer links in different order on different pages

## Consistent Identification (WCAG 3.2.4)

Components with the **same function** MUST have the **same label** across the site.

**Same function = same name:**
- Don't use "Search" on one page and "Find" on another
- Don't use "Sign In" on one page and "Log In" on another
- Don't use "Cart" on one page and "Bag" on another
- Don't use "Submit" for a contact form and "Send" for a feedback form if they do the same thing

**Exception:** Components that genuinely do different things can have different names even if they look similar.

## Predictable Behavior (WCAG 3.2.1, 3.2.2)

**On Focus (3.2.1):**
- Receiving focus MUST NOT trigger a change of context
- No auto-submitting on focus
- No opening new windows on focus
- No navigation on focus

**On Input (3.2.2):**
- Changing a setting MUST NOT trigger unexpected context change
- Select menus that auto-navigate on change (without submit button) fail
- Radio buttons that navigate on selection fail
- Exception: if the user is warned before the change

## Detection Heuristics for Figma

- Check if multiple page designs exist in the file — compare navigation across them
- Look for navigation bar consistency (same links, same order)
- Compare labels for similar functions across different pages/views
- Check if login/account elements appear in the same position
- Look for search functionality — is it consistently labeled and placed?
- Check footer links across page variants

## Blueline Card Output

- Title = navigation element or consistency concern (e.g. "Primary navigation order", "Search label consistency", "CTA label convention")
- Desc = finding (e.g. "Main nav uses Products, Solutions, Learn, Support across all pages. Order must not change between pages.")
- Notes = cite WCAG 3.2.3 for navigation order, 3.2.4 for identification
- Warnings = inconsistent labels for same function, navigation order differences between page variants
