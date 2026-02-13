# Component Registry

**This is the authoritative list of available components. ALWAYS check this before creating any UI element.**

## Available Components

### 1. Button
**Path**: `packages/components/src/button/`  
**Import**: `import { Button } from '../../../../packages/components/src/button/index.js';`

**When to use**: ALL buttons, CTAs, action elements, form submissions

**Props**:
- `label` (string, required): Button text
- `size` ('xl' | '2xl', default: '2xl')
- `state` ('default' | 'disabled', default: 'default')
- `kind` ('accent' | 'primary', default: 'accent')
- `background` ('solid' | 'outlined', default: 'solid')
- `onClick` (function, optional)

**Examples**:
```javascript
// Primary CTA
Button({ label: 'Learn more', kind: 'accent', background: 'solid', size: '2xl' })

// Secondary CTA
Button({ label: 'Get started', kind: 'primary', background: 'outlined', size: '2xl' })

// Disabled button
Button({ label: 'Submit', state: 'disabled', kind: 'accent', background: 'solid', size: '2xl' })
```

**DO NOT**: Create custom `<button>` elements, inline button styles, or button CSS.

---

### 2. ProductLockup
**Path**: `packages/components/src/product-lockup/`  
**Import**: `import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';`

**When to use**: ALL product icons, logos, brand lockups, product tiles

**Props**:
- `productName` (string, default: 'Adobe'): Product name to display
- `showName` (boolean, default: true): Whether to show product name text
- `size` ('xl' | '2xl', default: '2xl'): Lockup size
- `tileVariant` ('default' | 'experience-cloud', default: 'default'): Tile variant
- `productTile` (string | HTMLElement, optional): Custom product tile image URL or HTML

**Examples**:
```javascript
// Single product lockup
ProductLockup({ productName: 'Adobe', size: '2xl' })

// Multiple lockups (wrap in flex container)
html`
  <div style="display: flex; gap: 15px; align-items: center;">
    ${ProductLockup({ productName: 'Adobe', size: '2xl' })}
    ${ProductLockup({ productName: 'Photoshop', size: '2xl' })}
  </div>
`
```

**DO NOT**: Use `<img>` tags for product icons, create custom product tile markup, or inline product logos.

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
❌ **Using `<img>` for product icons** when `ProductLockup` exists  
❌ **Recreating component functionality** "because it's simpler"  
❌ **Not checking the registry** before generating code  
❌ **Using placeholder components** when real components exist  

✅ **Always check this registry first**  
✅ **Import and use existing components**  
✅ **Follow component prop patterns**  
✅ **Reference component docs** in `story-ui-docs/components/`
