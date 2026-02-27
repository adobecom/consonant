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
