# Component Registry

**This is the authoritative list of available components. ALWAYS check this before creating any UI element.**

## Available Components

### 1. Button
**Path**: `packages/components/src/button/`  
**Import**: `import { Button } from '../../../../packages/components/src/button/index.js';`

**When to use**: ALL buttons, CTAs, action elements, form submissions. matt-atoms design (Figma 141-53460).

**Props**:
- `label` (string, required): Button text
- `intent` ('primary' | 'accent', default: 'primary')
- `context` ('on-light' | 'on-dark', default: 'on-light')
- `background` ('solid' | 'outlined' | 'transparent', default: 'solid')
- `size` ('md' | 'xs', default: 'md')
- `state` ('default' | 'hover' | 'active' | 'focus' | 'disabled', default: 'default')
- `showIconStart` / `showIconEnd` (boolean): Toggle icon slots
- `iconStart` / `iconEnd` (function or TemplateResult): Custom icons
- `onClick` (function, optional)

**Examples**:
```javascript
// Primary CTA (solid)
Button({ label: 'Learn more', background: 'solid' })

// Secondary CTA (outlined)
Button({ label: 'Get started', background: 'outlined' })

// Tertiary (transparent)
Button({ label: 'Learn more', background: 'transparent' })

// On dark background (context)
Button({ label: 'Sign up', background: 'outlined', context: 'on-dark' })

// Accent CTA
Button({ label: 'Get started', intent: 'accent', background: 'solid' })

// With dropdown chevron
Button({ label: 'Menu', background: 'outlined', showIconEnd: true })

// Disabled button
Button({ label: 'Submit', state: 'disabled', background: 'solid' })
```

**DO NOT**: Create custom `<button>` elements, inline button styles, or button CSS.

---

### 2. IconButton
**Path**: `packages/components/src/icon-button/`  
**Import**: `import { IconButton } from '../../../../packages/components/src/icon-button/index.js';`

**When to use**: Icon-only actions (play/pause, close, menu toggle, etc.). matt-atoms design (Figma 2142-53869).

**Props**:
- `ariaLabel` (string, required): Accessible label
- `icon` (string or TemplateResult, default: 'pause'): Legacy Phosphor name or a Lit template (e.g. `<sp-icon-play>`)
- `context` ('on-light' | 'on-dark', default: 'on-light')
- `background` ('solid' | 'outlined' | 'transparent', default: 'solid')
- `size` ('md' | 'lg', default: 'lg')
- `state` ('default' | 'hover' | 'active' | 'focus' | 'disabled', default: 'default')
- `onClick` (function, optional)

**Note**: Preferred icon source is Spectrum 2 (Workflow) icons. Run `npm run icons:fetch Play Pause Close` to download SVGs into `packages/components/src/icon-button/assets/`, or import `@spectrum-web-components/icons-workflow` directly in stories.

**Examples**:
```javascript
import { html } from 'lit';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-close.js';

const closeIconTemplate = html`<sp-icon-close aria-hidden="true" style="width:16px;height:16px"></sp-icon-close>`;

// Pause button (solid)
IconButton({ ariaLabel: 'Pause', icon: 'pause', background: 'solid' })

// Play button (outlined)
IconButton({ ariaLabel: 'Play', icon: 'play', background: 'outlined' })

// On dark background
IconButton({ ariaLabel: 'Pause', icon: 'pause', context: 'on-dark' })

// Compact icon on dark surface with Spectrum icon
IconButton({ ariaLabel: 'Close dialog', icon: closeIconTemplate, background: 'transparent', context: 'on-dark', size: 'md' })
```

**DO NOT**: Create custom icon-only buttons; use IconButton for play/pause, close, menu toggles, etc.

---

### 3. ProductLockup
**Path**: `packages/components/src/product-lockup/`  
**Import**: `import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';`

**When to use**: App/product identifiers in RouterMarquee strips, hero tiles, feature cards, footer link lists, etc. Always use ProductLockup instead of rolling your own icon + label markup.

**Props**:
- `label` / `productName` (string, default: 'Product label') — product text
- `app` (string, default: 'experience-cloud') — AppIcon slug
- `orientation` ('horizontal' | 'vertical', default: 'horizontal') — Controls layout axis (both orientations default to `size="md"`).
- `styleVariant` ('label' | 'eyebrow', default: 'label')
- `context` ('on-light' | 'on-dark', default: 'on-light')
- `width` ('hug' | 'fill', default: 'hug')
- `showIconStart` (boolean, default: true) — Toggle the leading AppIcon. Aliased to `showIcon` for legacy code.
- `showIconEnd` (boolean, default: true — caret hidden automatically for vertical)
- `iconSize` ('xs' | 'sm' | 'md' | 'lg', optional) — Override the AppIcon size when a design calls for a different tile dimension.

**Examples**:
```javascript
// Inline RouterMarquee lockup
ProductLockup({ label: 'Adobe Express', app: 'express' });

// Vertical eyebrow lockup for a tile grid
ProductLockup({
  label: 'Customer journeys',
  app: 'experience-platform',
  orientation: 'vertical',
  styleVariant: 'eyebrow',
});

// Full-width inline lockup that truncates within a grid column
ProductLockup({ label: 'Workflow automation', width: 'fill' });
```

**DO NOT**: Stack arbitrary `<img>` + `<span>` combos. Import and call `ProductLockup` so the AppIcon CDN + caret, typography tokens, and contexts stay consistent.

---

### 4. RouterMarqueeItem
**Path**: `packages/components/src/router-marquee-item/`  
**Import**: `import { RouterMarqueeItem } from '../../../../packages/components/src/router-marquee-item/index.js';`

**When to use**: Hero router navigation tiles (desktop + mobile) that show an app lockup plus a progress/timer bar.

**Props**:
- `label` (string, default: 'PDF and productivity')
- `app` (string, default: 'acrobat-pro')
- `orientation` ('vertical' | 'horizontal', default: 'vertical')
- `styleVariant` ('label' | 'eyebrow', default: 'label')
- `context` ('on-light' | 'on-dark', default: 'on-light')
- `width` ('hug' | 'fill', default: 'fill')
- `showIconStart` (boolean, default: true)
- `showIconEnd` (boolean, default: true)
- `iconSize` ('auto' | 'xs' | 'sm' | 'md' | 'lg', default: 'auto')
- `active` (boolean, default: false)
- `showProgress` (boolean, default: true)
- `progress` ('0' | '25' | '50' | '75' | '100', default: '50')
- `body` (TemplateResult, optional) — custom content slot
- `children` (TemplateResult, optional) — extra content stacked below the ProductLockup
- `href`, `ariaLabel`, `onClick`

**Example**:
```javascript
RouterMarqueeItem({
  label: 'Creative tools',
  app: 'creative-cloud',
  active: true,
  progress: '100',
});
```

**DO NOT**: Compose custom router tiles with ad-hoc markup. Use this component so Body/ProductLockup + progress tokens stay in sync with matt-atoms.

---

### 5. ElasticCard
**Path**: `packages/components/src/elastic-card/`
**Import**: `import { ElasticCard } from '../../../../packages/components/src/elastic-card/index.js';`

**When to use**: Media-forward tiles in router hero bands. Matches matt-atoms `.ElasticCard` (node 4006-461133) with `resting`, `expanded`, and `mobile` axes.

**Props**:
- `label` (string, default: 'Creativity and design')
- `app` (string, default: 'experience-cloud')
- `product` (object, optional) — override `ProductLockup` props (context, width, etc.)
- `title` (string, default: 'Card title')
- `body` (string)
- `state` ('resting' | 'expanded' | 'mobile', default: 'resting')
- `mediaSrc` (string) or `mediaTemplate` (TemplateResult)
- `mediaAspect` ('3:4' | '4:3' | '16:9' | '1:1', default: '3:4')
- `mediaOverlay` (boolean | TemplateResult)
- `bodyTemplate` (TemplateResult, optional)
- `children` (TemplateResult, optional)
- `showCaret` (boolean, default mirrors Figma: true for resting)
- `actionTemplate` (TemplateResult, optional) + `actionLabel`
- `href`, `ariaLabel`, `onClick`, `tag`

**Examples**:
```javascript
ElasticCard({
  label: 'Creativity and design',
  app: 'experience-cloud',
  title: 'Adobe Express',
  body: 'Create standout content with quick actions and guided templates.',
  mediaSrc: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
});

ElasticCard({
  state: 'expanded',
  showCaret: false,
  actionTemplate: IconButton({
    ariaLabel: 'Open router',
    icon: html`<sp-icon-more aria-hidden="true"></sp-icon-more>`,
    size: 'md',
    background: 'outlined',
    context: 'on-dark',
  }),
});
```

**DO NOT**: Hand-roll hero cards with bespoke glassmorphism. Use ElasticCard so ProductLockup, imagery, and typography tokens stay aligned.

---

## Component Discovery Process

**Before generating any story:**

1. **Identify UI elements** in your prompt (buttons, icons, cards, etc.)
2. **Check this registry** to see if a component exists
3. **If component exists**: Import and use it - DO NOT recreate
4. **If component doesn't exist**: Create it following the patterns in `story-ui-docs/patterns/`

## Adding New Components

When a new component is added to `packages/components/src/`, it must be:
1. Added to `story-ui.config.cjs` → `components` array
2. Documented in this registry
3. Added to `story-ui-docs/components/[component-name].md` with usage examples

## Common Mistakes to Avoid

❌ **Creating custom buttons** when `Button` component exists  
❌ **Creating custom icon-only buttons** when `IconButton` component exists  
❌ **Recreating component functionality** "because it's simpler"  
❌ **Not checking the registry** before generating code  
❌ **Using placeholder components** when real components exist  

✅ **Always check this registry first**  
✅ **Import and use existing components**  
✅ **Follow component prop patterns**  
✅ **Reference component docs** in `story-ui-docs/components/`
