# S2A Design System — Story UI Guardrails

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
background: var(--s2a-color-background-inverse, #000);  /* dark surface */
color: var(--s2a-color-content-default, #292929);
color: var(--s2a-color-content-knockout, #fff);          /* text on dark */
padding: var(--s2a-spacing-lg, 24px);
gap: var(--s2a-spacing-md, 16px);
border-radius: var(--s2a-border-radius-md, 16px);

/* ❌ WRONG — all forbidden */
background: linear-gradient(135deg, #f5f0ff 0%, #ede8ff 50%);
background: #1c1b19;
color: #1a1a1a;
padding: 64px 24px;
font-size: 2.5rem;
font-weight: 700;
```

## 🚨 RULE 3: NEVER write custom heading or body text styles

For text, use inline styles with S2A tokens ONLY — no custom font-size, font-weight, or line-height values.

```js
// ✅ CORRECT — tokens only
html`<h2 style="font-size:var(--s2a-typography-font-size-5xl,32px);color:var(--s2a-color-content-title,#292929)">Heading</h2>`

// ❌ WRONG
html`<h1 style="font-size:2.5rem;font-weight:700;color:#1a1a1a">Heading</h1>`
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

## Layout skeleton — use this as the starting point for every story

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
      ${ProductLockup({ label: 'Adobe Firefly', app: 'firefly' })}
      <h2 style="margin:0;color:var(--s2a-color-content-title,#292929)">Heading text</h2>
      ${Button({ label: 'Get started', background: 'solid', intent: 'accent' })}
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
      background: var(--s2a-color-background-inverse, #000);
      display: flex;
      flex-direction: column;
      gap: var(--s2a-spacing-lg, 24px);
    ">
      ${ProductLockup({ label: 'Adobe Firefly', app: 'firefly', context: 'on-dark' })}
      <h2 style="margin:0;color:var(--s2a-color-content-knockout,#fff)">Heading text</h2>
      ${Button({ label: 'Try for free', background: 'outlined', context: 'on-dark' })}
    </div>
  `,
};
```
