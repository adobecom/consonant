# Component Registry

**This is the authoritative list of available components. ALWAYS check this before creating any UI element.**

## Available Components

### 1. Button
**Path**: `packages/components/src/button/`  
**Import**: `import { Button } from '../../../../packages/components/src/button/index.js';`

**When to use**: ALL buttons, CTAs, action elements, form submissions. matt-atoms design (Figma 141-53460).

**Props**:
- `label` (string, required): Button text
- `background` ('solid' | 'outlined' | 'transparent', default: 'solid')
- `size` ('lg' | 'md', default: 'lg')
- `state` ('default' | 'disabled', default: 'default')
- `tone` ('default' | 'knockout' | 'inverse', default: 'default')
- `showElementEnd` (boolean, default: false): Show CaretDown chevron
- `onClick` (function, optional)

**Examples**:
```javascript
// Primary CTA (solid)
Button({ label: 'Learn more', background: 'solid' })

// Secondary CTA (outlined)
Button({ label: 'Get started', background: 'outlined' })

// Tertiary (transparent)
Button({ label: 'Learn more', background: 'transparent' })

// On dark background (knockout tone)
Button({ label: 'Sign up', background: 'outlined', tone: 'knockout' })

// With dropdown chevron
Button({ label: 'Menu', background: 'outlined', showElementEnd: true })

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
- `icon` (string, default: 'pause'): Phosphor icon name (e.g. pause, play, x)
- `background` ('solid' | 'outlined' | 'transparent', default: 'solid')
- `size` ('lg' | 'md', default: 'lg')
- `state` ('default' | 'disabled', default: 'default')
- `tone` ('default' | 'knockout', default: 'default')
- `onClick` (function, optional)

**Note**: Pause icon is from Figma. Other icons use Phosphor — load `@phosphor-icons/web/bold` for play, x, etc.

**Examples**:
```javascript
// Pause button (solid)
IconButton({ ariaLabel: 'Pause', icon: 'pause', background: 'solid' })

// Play button (outlined)
IconButton({ ariaLabel: 'Play', icon: 'play', background: 'outlined' })

// On dark background (knockout tone)
IconButton({ ariaLabel: 'Pause', icon: 'pause', tone: 'knockout' })
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
- `orientation` ('horizontal' | 'vertical', default: 'horizontal') — Also controls default icon size (md vs xl).
- `styleVariant` ('label' | 'eyebrow', default: 'label')
- `context` ('on-light' | 'on-dark', default: 'on-light')
- `width` ('hug' | 'fill', default: 'hug')
- `showIconStart` (boolean, default: true) — Toggle the leading AppIcon. Aliased to `showIcon` for legacy code.
- `showIconEnd` (boolean, default: true — caret hidden automatically for vertical)
- `iconSize` ('sm' | 'md' | 'lg' | 'xl', optional) — Override the AppIcon size when a design calls for a different tile dimension.

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
- `iconSize` ('auto' | 'sm' | 'md' | 'lg' | 'xl', default: 'auto')
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
