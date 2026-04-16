# Language

Page language declaration and language-of-parts markup. Use this as the primary reference when filling the Language card.

---

## Page Language (WCAG 3.1.1)

The `<html>` element MUST have a `lang` attribute specifying the primary language:

```html
<html lang="en">    <!-- English -->
<html lang="es">    <!-- Spanish -->
<html lang="ja">    <!-- Japanese -->
<html lang="fr">    <!-- French -->
<html lang="de">    <!-- German -->
<html lang="zh">    <!-- Chinese -->
<html lang="ko">    <!-- Korean -->
```

**Why it matters:** Screen readers use the `lang` attribute to select the correct pronunciation engine. Without it, an English screen reader will mangle French text, and vice versa.

## Language of Parts (WCAG 3.1.2)

When content switches language within a page, wrap the foreign-language text in an element with `lang`:

```html
<p>The French phrase <span lang="fr">c'est la vie</span> means "that's life."</p>
```

**When to mark:**
- Foreign words or phrases in body text
- Multilingual navigation (language selector labels)
- Quotations in a different language
- Legal text in another language

**When NOT to mark:**
- Proper nouns (brand names, place names) — these are not language changes
- Technical terms borrowed from another language that are commonly used in the primary language (e.g. "sushi", "ballet" in English)

## Detection Heuristics for Figma

- Check if the design contains text in multiple languages
- Look for language selector components (globe icon, language dropdown)
- Check footer for legal text that might be in another language
- Identify the primary language of the design content
- Check if this is a localized variant of an existing design

## Blueline Card Output

- Title = language concern (e.g. "Page language", "French legal text", "Language selector")
- Desc = requirement (e.g. "Set html lang='en'. Screen readers need this to select correct pronunciation engine.")
- Notes = cite WCAG 3.1.1 for page language, 3.1.2 for language of parts
- Warnings = missing lang attribute, mixed-language content without markup
