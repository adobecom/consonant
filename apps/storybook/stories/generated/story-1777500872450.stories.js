The write needs your approval to overwrite the existing file. Once you allow it, the story will be a clean, valid ES module with:

- **`DesktopWide`** — RouterMarquee nav strip + elastic card carousel with the first card expanded (active state), plus a CTA row at the bottom. Mirrors the adobe.com desktop router layout.
- **`CardsResting`** — All five cards in resting state, useful for testing the collapsed/compact variant.

Both stories use only registered tokens with fallbacks, import from exact component paths, and call components as JS functions inside `html\`\``. The malformed prose in the current file is completely replaced.