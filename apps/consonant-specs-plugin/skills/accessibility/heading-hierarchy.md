# Heading Hierarchy

Rules and detection heuristics for determining heading levels in a design. Use this as the primary reference when filling the Heading Hierarchy card.

---

## Rules

1. **One H1 per page** — the main content heading, not the logo or site title
2. **Never skip levels** — H1 → H2 → H3 is valid. H1 → H3 is not. Every level must be used in sequence.
3. **Headings nest by content structure, not visual size** — a visually smaller heading can be H2 if it's a top-level section. A visually larger heading can be H3 if it's inside a section.
4. **Logo text is NOT H1** — the logo is a link to the homepage, not a content heading. The site name in the header is typically not part of the heading hierarchy.
5. **Eyebrow text is NOT a heading** — small uppercase text above a heading (like "PHOTOGRAPHY" above "Capture Every Moment") is an eyebrow/label. It should be a `<span>` or `<p>`, not a heading tag. The larger text below it is the real heading.
6. **Card titles are usually H3 or H4** — under a section H2, individual cards within that section use the next heading level down.
7. **Navigation items are NOT headings** — nav links in the header/footer are links, not headings.

---

## Detection Heuristics for Figma

When analyzing a Figma design to determine heading levels, use these signals:

### Text style mapping (S2A / Adobe Clean)

| Text style | Likely heading level | Notes |
|---|---|---|
| Adobe Clean Display Black, 36px+ | H1 or H2 | H1 if it's the page's primary heading |
| Adobe Clean Display Black, 24-36px | H2 | Section-level heading |
| Adobe Clean Bold, 20-28px | H2 or H3 | Depends on nesting depth |
| Adobe Clean Bold, 16-20px | H3 or H4 | Subsection heading |
| Adobe Clean Bold, 14-16px | H4, H5, or not a heading | Could be a label or caption |
| Adobe Clean Regular (any size) | Not a heading | Body text, descriptions |
| Small uppercase text (10-12px) | Not a heading — eyebrow | Label above a real heading |

### Position heuristics

- **Top of main content area, largest text** → H1 candidate
- **First large text in each major section** → H2 candidate
- **Text that introduces a group of cards or items** → H2 or H3
- **Text inside a card** → H3 or H4 (one level below the section heading above it)
- **Text inside an accordion panel** → H3 or H4 (below the accordion's section heading)

### Structural signals

- Count the nesting depth: page → section → card → detail. Each level increments the heading level.
- If a section contains subsections, the section title is H2 and subsection titles are H3.
- Footer headings (if any, like "Resources", "Company") are typically H2 if they're major sections, H3 if under a footer section heading.

---

## Common Mistakes to Flag

| Mistake | Why it's wrong | Correct approach |
|---|---|---|
| Multiple H1s | Screen readers use H1 to identify the page's main topic | Use H1 once, demote others to H2 |
| H1 → H3 (skipping H2) | Breaks the outline, confuses SR navigation | Insert an H2 between them, or demote H3 to H2 |
| Logo as H1 | Logo appears on every page — not the page's unique content heading | Logo is a link; H1 is the main content heading |
| Eyebrow as heading | Small label text doesn't warrant a heading level | Use `<p>` or `<span>` with appropriate styling |
| All card titles as H2 | If cards are inside a section with its own heading, card titles should be one level below | Cards under an H2 section use H3 |
| Heading used for visual styling | Large bold text that isn't structurally a section heading | Use CSS for visual emphasis, not heading tags |
| No headings at all | Some designs have styled text but no semantic headings marked | Identify the logical sections and assign levels |

---

## Output Format for Blueline Fill

When filling the Heading Hierarchy card, produce a flat list:

```
H1: Creative Cloud for Teams
  H2: Choose Your Plan
    H3: Individual
    H3: Business
    H3: Enterprise
  H2: What's Included
    H3: Photoshop
    H3: Illustrator
    H3: Premiere Pro
  H2: Customer Stories
    H3: [Card title 1]
    H3: [Card title 2]
```

Use indentation to show nesting. Include the first ~50 characters of the heading text. If the design has repeating card titles, show the pattern: `H3: [Card title]` with a note "(one per card)".

---

## Heading Level Decision Flowchart

1. Is this the page's primary content heading? → **H1**
2. Is this a top-level section of the page (below H1)? → **H2**
3. Is this a subsection within an H2 section? → **H3**
4. Is this a detail within an H3 subsection? → **H4**
5. Is this a label, eyebrow, or caption? → **Not a heading**
6. Is this navigation, logo, or footer boilerplate? → **Not a heading** (unless footer sections need their own hierarchy)
