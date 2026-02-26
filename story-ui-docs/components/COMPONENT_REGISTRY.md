# Component Registry

**This is the authoritative list of available components. ALWAYS check this before creating any UI element.**

## Available Components

### 1. Button
**Path**: `packages/components/src/button/`  
**Import**: `import { Button } from '../../../../packages/components/src/button/index.js';`

**When to use**: ALL buttons, CTAs, action elements, form submissions. matt-atoms design (Figma 141-53460).

**Props**:
- `label` (string, required): Button text
- `background` ('solid' | 'outlined', default: 'solid')
- `state` ('default' | 'disabled', default: 'default')
- `onClick` (function, optional)

**Examples**:
```javascript
// Primary CTA (solid)
Button({ label: 'Learn more', background: 'solid' })

// Secondary CTA (outlined)
Button({ label: 'Get started', background: 'outlined' })

// Disabled button
Button({ label: 'Submit', state: 'disabled', background: 'solid' })
```

**DO NOT**: Create custom `<button>` elements, inline button styles, or button CSS.

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
❌ **Recreating component functionality** "because it's simpler"  
❌ **Not checking the registry** before generating code  
❌ **Using placeholder components** when real components exist  

✅ **Always check this registry first**  
✅ **Import and use existing components**  
✅ **Follow component prop patterns**  
✅ **Reference component docs** in `story-ui-docs/components/`
