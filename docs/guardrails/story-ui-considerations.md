# S2A Design System — Story UI Guardrails

## 🚨 RULE 0: NEVER INVENT TOKEN NAMES

Only use tokens from the exact list below. If a name isn't in this list, **it does not exist**.

Common mistakes and what to use instead:

| ❌ Invented (does NOT exist) | ✅ Correct token |
|---|---|
| `--s2a-color-background-dark` | `--s2a-color-background-knockout` |
| `--s2a-color-background-black` | `--s2a-color-background-knockout` |
| `--s2a-color-background-night` | `--s2a-color-background-knockout` |
| `--s2a-color-text-*` | `--s2a-color-content-*` |
| `--s2a-color-content-white` | `--s2a-color-content-knockout` |
| `--s2a-color-content-light` | `--s2a-color-content-knockout` |
| `--s2a-spacing-sm` | `--s2a-spacing-xs` (8px) or `--s2a-spacing-lg` (24px) |
| `--s2a-spacing-*px` | Use named scales only — `xs`, `lg`, `3xl`, etc. |
| `--s2a-border-radius-*px` | Use named scales only — `sm`, `md`, `lg`, etc. |
| `--s2a-font-size-*` | **DOES NOT EXIST** — S2A has no font-size tokens |
| `--s2a-font-family-*` | **DOES NOT EXIST** — S2A has no font-family tokens |
| `--s2a-font-weight-*` | **DOES NOT EXIST** — S2A has no font-weight tokens |
| `--s2a-line-height-*` | **DOES NOT EXIST** — S2A has no line-height tokens |
| `--s2a-typography-*` | **DOES NOT EXIST as CSS** — Figma-only style IDs, not CSS custom properties |

---

## Valid token quick reference

### Background tokens
| Token | Resolves to | When to use |
|---|---|---|
| `--s2a-color-background-default` | `#fff` | Light surface (default) |
| `--s2a-color-background-subtle` | `#f8f8f8` | Slightly off-white surface |
| `--s2a-color-background-knockout` | `#000` | Dark / black surface |
| `--s2a-color-background-inverse` | `#000` | Alias for knockout — same value |
| `--s2a-color-background-disabled` | `#f8f8f8` | Disabled element background |
| `--s2a-color-background-brand` | `#eb1000` | Adobe brand red (use sparingly) |

### Content (text) tokens
| Token | Resolves to | When to use |
|---|---|---|
| `--s2a-color-content-default` | `#000` | Body text on light |
| `--s2a-color-content-title` | `#000` | Headings on light |
| `--s2a-color-content-strong` | `#131313` | Bold/strong text on light |
| `--s2a-color-content-subtle` | `rgb(0 0 0 / 64%)` | Secondary text on light |
| `--s2a-color-content-knockout` | `#fff` | Any text on dark background |
| `--s2a-color-content-inverse` | `#fff` | Alias for knockout — same value |
| `--s2a-color-content-subheading` | `#000` | Subheadings on light |
| `--s2a-color-content-eyebrow` | `rgb(0 0 0 / 64%)` | Eyebrow / label text on light |

### Spacing tokens
| Token | Resolves to |
|---|---|
| `--s2a-spacing-2xs` | `4px` |
| `--s2a-spacing-xs` | `8px` |
| `--s2a-spacing-lg` | `24px` |
| `--s2a-spacing-3xl` | `48px` |

### Border radius tokens
| Token | Resolves to |
|---|---|
| `--s2a-border-radius-none` | `0` |
| `--s2a-border-radius-2xs` | `2px` |
| `--s2a-border-radius-xs` | `4px` |
| `--s2a-border-radius-sm` | `8px` |
| `--s2a-border-radius-md` | `16px` |
| `--s2a-border-radius-lg` | `32px` |
| `--s2a-border-radius-round` | `999px` |

### Border tokens
| Token | Resolves to |
|---|---|
| `--s2a-color-border-subtle` | `#dadada` |
| `--s2a-color-border-default` | `#292929` |
| `--s2a-color-border-inverse` | `#fff` |

---

## 🚨 RULE 1: NEVER write raw HTML for components that exist

Every button, product lockup, card, and icon is a **Lit template function**. Call it — never recreate it.

```js
// ✅ CORRECT — always call the imported function inside html``
import { Button } from '../../../../packages/components/src/button/index.js';
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';

render: () => html`
  <div>
    ${ProductLockup({ label: 'Adobe Firefly', app: 'firefly' })}
    ${Button({ label: 'Get started', background: 'solid', intent: 'accent' })}
  </div>
`

// ❌ WRONG — these are all forbidden
<button style="background:#1473e6">Get started</button>
<product-lockup app="firefly"></product-lockup>
<s2a-button></s2a-button>
<button-component label="Get started"></button-component>
<div class="custom-button">Get started</div>
```

## 🚨 RULE 2: NEVER hardcode colors, spacing, or gradients

Use only `var(--s2a-*)` tokens. Always include a fallback value.

```css
/* ✅ CORRECT */
background: var(--s2a-color-background-default, #fff);
background: var(--s2a-color-background-knockout, #000);  /* dark surface */
color: var(--s2a-color-content-default, #000);
color: var(--s2a-color-content-knockout, #fff);           /* text on dark */
padding: var(--s2a-spacing-3xl, 48px);
gap: var(--s2a-spacing-lg, 24px);
border-radius: var(--s2a-border-radius-md, 16px);

/* ❌ WRONG — all forbidden */
background: linear-gradient(135deg, #f5f0ff 0%, #ede8ff 50%);
background: #1c1b19;
background: var(--s2a-color-background-dark, #000);   /* ← "dark" does NOT exist */
color: #1a1a1a;
padding: 64px 24px;
font-size: 2.5rem;
font-weight: 700;
```

## 🚨 RULE 3: THERE ARE NO TYPOGRAPHY TOKENS — only set color on text nodes

S2A has **no** font-size, font-family, font-weight, or line-height tokens. These token names DO NOT EXIST:

```
--s2a-font-family-heading     ← DOES NOT EXIST
--s2a-font-size-6xl           ← DOES NOT EXIST
--s2a-font-size-weight-bold   ← DOES NOT EXIST
--s2a-line-height-tight       ← DOES NOT EXIST
--s2a-typography-*            ← DOES NOT EXIST (those are Figma-only style IDs, not CSS vars)
```

For raw text nodes (h1, h2, p, span), set **only `color`** via a content token. Nothing else.

```js
// ✅ CORRECT — color token only, no font properties
html`<h2 style="margin:0;color:var(--s2a-color-content-title,#000)">Heading</h2>`
html`<p style="margin:0;color:var(--s2a-color-content-subtle,rgba(0,0,0,0.64))">Body copy</p>`
// On dark:
html`<h2 style="margin:0;color:var(--s2a-color-content-knockout,#fff)">Heading</h2>`
html`<p style="margin:0;color:var(--s2a-color-content-knockout,#fff)">Body copy</p>`

// ❌ WRONG — all of these are forbidden
html`<h1 style="font-size:2.5rem;font-weight:700;color:#1a1a1a">Heading</h1>`
html`<h2 style="font-family:var(--s2a-font-family-heading,'Adobe Clean');font-size:var(--s2a-font-size-6xl,2.5rem)">Heading</h2>`
html`<p style="font-size:var(--s2a-typography-body-md,16px)">Body</p>`
```

---

## Available Components

Import from these exact paths. The function call IS the component — no custom markup needed.

| Component | Import | When to use |
|---|---|---|
| `Button` | `../../../../packages/components/src/button/index.js` | ALL CTAs and actions |
| `IconButton` | `../../../../packages/components/src/icon-button/index.js` | Icon-only actions |
| `ProductLockup` | `../../../../packages/components/src/product-lockup/index.js` | Any Adobe product identifier |
| `ElasticCard` | `../../../../packages/components/src/elastic-card/index.js` | Hero media cards |
| `NavCard` | `../../../../packages/components/src/navigation/nav-card/index.js` | Navigation panels |
| `Media` | `../../../../packages/components/src/media/index.js` | Images and videos |

### Button props
```js
Button({
  label: 'Get started',          // required
  background: 'solid',           // 'solid' | 'outlined' | 'transparent'
  intent: 'primary',             // 'primary' | 'accent'
  context: 'on-light',           // 'on-light' | 'on-dark'
  size: 'md',                    // 'md' | 'xs'
})
```

### ProductLockup props
```js
ProductLockup({
  label: 'Adobe Firefly',        // product name
  app: 'firefly',                // app key (firefly, express, photoshop, etc.)
  orientation: 'horizontal',     // 'horizontal' | 'vertical'
  context: 'on-light',           // 'on-light' | 'on-dark'
  styleVariant: 'label',         // 'label' | 'eyebrow'
})
```

### ElasticCard props
```js
ElasticCard({
  label: 'Creativity & design',
  app: 'experience-cloud',
  title: 'Adobe Express',
  body: 'Create standout content.',
  state: 'resting',              // 'resting' | 'expanded' | 'mobile'
  mediaSrc: 'https://...',
  href: '#',
})
```

---

## Layout skeleton — light surface

```js
import { html } from 'lit';
import { Button } from '../../../../packages/components/src/button/index.js';
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';

export default {
  title: 'Generated/My Layout',
  tags: ['autodocs'],
};

export const Default = {
  render: () => html`
    <div style="
      padding: var(--s2a-spacing-3xl, 48px) var(--s2a-spacing-lg, 24px);
      background: var(--s2a-color-background-default, #fff);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--s2a-spacing-lg, 24px);
    ">
      ${ProductLockup({ label: 'Adobe Firefly', app: 'firefly', context: 'on-light' })}
      <h2 style="margin:0;color:var(--s2a-color-content-title,#000)">Heading text</h2>
      <p style="margin:0;color:var(--s2a-color-content-subtle,rgba(0,0,0,0.64))">Body copy goes here.</p>
      ${Button({ label: 'Get started', background: 'solid', intent: 'accent', context: 'on-light' })}
    </div>
  `,
};
```

## Dark surface layout

```js
export const OnDark = {
  render: () => html`
    <div style="
      padding: var(--s2a-spacing-3xl, 48px) var(--s2a-spacing-lg, 24px);
      background: var(--s2a-color-background-knockout, #000);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--s2a-spacing-lg, 24px);
    ">
      ${ProductLockup({ label: 'Adobe Firefly', app: 'firefly', context: 'on-dark' })}
      <h2 style="margin:0;color:var(--s2a-color-content-knockout,#fff)">Heading text</h2>
      <p style="margin:0;color:var(--s2a-color-content-knockout,#fff)">Body copy on dark.</p>
      ${Button({ label: 'Try for free', background: 'outlined', context: 'on-dark' })}
    </div>
  `,
};
```
