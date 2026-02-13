# Design System Considerations for Story UI

## 🚨 MANDATORY RULES - READ FIRST

**Before generating ANY story, Story UI MUST:**

1. **Read Component Registry**: Open and read `story-ui-docs/components/COMPONENT_REGISTRY.md` completely
2. **Check for existing components** in `story-ui.config.cjs` → `components` array (see `whenToUse` and `doNot` fields)
3. **Review component documentation** in `story-ui-docs/components/[component-name].md` for usage examples
4. **Use existing components** - NEVER recreate Button, ProductLockup, or any component that exists
5. **Import correctly** - Always use `import { Component } from '../../../../packages/components/src/[component]/index.js';`
6. **Call component functions** - Use `Component({ props })` in templates, never write custom HTML/CSS for existing components
7. **Verify before coding** - Before writing any HTML/CSS, ask: "Does a component for this already exist?"

**Violation Examples (DO NOT DO):**
- ❌ `<button style="...">Label</button>` → ✅ Use `Button({ label: 'Label', ... })`
- ❌ `<img src="..." alt="Adobe" />` for product icons → ✅ Use `ProductLockup({ productName: 'Adobe', ... })`
- ❌ Custom button CSS → ✅ Use Button component with its built-in styles

**If you're unsure whether a component exists, check `story-ui.config.cjs` first!**

---

## Component Architecture

### Technology Stack
- **Framework**: Web Components (Lit for templating in Storybook)
- **Styling**: Pure CSS with design tokens (CSS custom properties)
- **Pattern**: Data attributes for variants (`data-size`, `data-state`, `data-kind`, `data-background`)
- **No JavaScript Required**: Components are pure HTML/CSS - hover states handled via CSS `:hover`

### Component Structure
Components are located in `packages/components/src/[component]/`:
- `[component].js` - Lit template function
- `[component].css` - Styles using design tokens
- `index.js` - Component export

### Import Patterns
```javascript
// In Storybook stories
import { Component } from './Component'; // Re-exported from packages/components
// Or directly:
import { Component } from '../../../packages/components/src/[component]/index.js';
```

### Story Structure
```javascript
import { html } from 'lit';
import { Component } from './Component';

export default {
  title: 'Components/[ComponentName]',
  tags: ['autodocs'],
  render: (args) => Component(args), // Lit template function
  argTypes: { /* controls */ },
  args: { /* defaults */ },
};
```

## Design Tokens

### Token System
- **Primitives**: Raw values (spacing, typography, colors)
- **Semantic**: Contextual tokens (content colors, backgrounds)
- **Component**: Component-specific tokens (button colors, etc.)

### Token Usage
All components use CSS custom properties from design tokens:
- Import tokens in `.storybook/preview.js`
- Use tokens in component CSS files
- Tokens are scoped to `:root[data-theme="light"]` or `:root[data-theme="dark"]`

### Theme Support
- Light mode: `data-theme="light"` (default)
- Dark mode: `data-theme="dark"`
- Theme is set globally in Storybook preview

## ⚠️ CRITICAL RULES: Component Reuse (MUST FOLLOW)

**📖 Reference**: See `story-ui-docs/components/COMPONENT_REGISTRY.md` for the complete list of available components.

### 🚫 NEVER DO THIS:
- ❌ Create custom `<button>` elements with inline styles
- ❌ Create custom product icon/lockup markup
- ❌ Recreate component functionality that already exists
- ❌ Use placeholder images when components exist
- ❌ Write custom CSS for buttons, cards, or common UI elements

### ✅ ALWAYS DO THIS:
- ✅ Import and use existing components from `packages/components/src/`
- ✅ Check the `components` array in `story-ui.config.cjs` for available components
- ✅ Reference `story-ui-docs/components/` for component usage examples
- ✅ Use components even if you think you can write it "simpler" - consistency is more important

## Component Registry (Available Components)

### 1. Button Component
**Location**: `packages/components/src/button/`  
**Import**: `import { Button } from '../../../../packages/components/src/button/index.js';`

**Usage**:
```javascript
// Primary CTA (accent, solid)
Button({ 
  label: 'Learn more', 
  kind: 'accent', 
  background: 'solid', 
  size: '2xl' 
})

// Secondary CTA (primary, outlined)
Button({ 
  label: 'Get started', 
  kind: 'primary', 
  background: 'outlined', 
  size: '2xl' 
})
```

**Props**:
- `label` (string, required): Button text
- `size` ('xl' | '2xl', default: '2xl'): Button size
- `state` ('default' | 'disabled', default: 'default'): Button state
- `kind` ('accent' | 'primary', default: 'accent'): Button kind
- `background` ('solid' | 'outlined', default: 'solid'): Background style
- `onClick` (function, optional): Click handler

**When to use**: ALL buttons, CTAs, action elements. Never create custom button markup.

### 2. ProductLockup Component
**Location**: `packages/components/src/product-lockup/`  
**Import**: `import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';`

**Usage**:
```javascript
// Single product lockup
ProductLockup({ 
  productName: 'Adobe', 
  size: '2xl' 
})

// Multiple lockups side-by-side (wrap in a container)
html`
  <div style="display: flex; gap: 15px;">
    ${ProductLockup({ productName: 'Adobe', size: '2xl' })}
    ${ProductLockup({ productName: 'Photoshop', size: '2xl' })}
  </div>
`
```

**Props**:
- `productName` (string, default: 'Adobe'): Product name to display
- `showName` (boolean, default: true): Whether to show product name text
- `size` ('xl' | '2xl', default: '2xl'): Lockup size
- `tileVariant` ('default' | 'experience-cloud', default: 'default'): Tile variant
- `productTile` (string | HTMLElement, optional): Custom product tile image URL or HTML

**When to use**: ALL product icons, logos, brand lockups. Never use `<img>` tags for product icons.

## Component Patterns

### Button Component Example
```javascript
export const Button = ({ 
  label = 'Label', 
  size = '2xl',        // Options: 'xl', '2xl'
  state = 'default',   // Options: 'default', 'disabled'
  kind = 'accent',      // Options: 'accent', 'primary'
  background = 'solid', // Options: 'solid', 'outlined'
  onClick 
}) => {
  return html`
    <button
      class="c-button"
      data-size="${size}"
      data-state="${state}"
      data-kind="${kind}"
      data-background="${background}"
      @click=${onClick}
      type="button"
    >
      <span class="c-button__label">${label}</span>
    </button>
  `;
};
```

### Naming Conventions
- **BEM**: `.c-component__element` (e.g., `.c-button__label`)
- **Data Attributes**: `data-[variant]` for component variants
- **CSS Classes**: Component classes prefixed with `c-`

## Story Generation Guidelines

### Pre-Generation Checklist
Before generating any story, Story UI MUST:

1. **Read Component Registry**: Open `story-ui-docs/components/COMPONENT_REGISTRY.md` and review ALL available components
2. **Check Component Config**: Review `story-ui.config.cjs` → `components` array for component metadata
3. **Review Component Docs**: Check `story-ui-docs/components/[component-name].md` for usage examples
4. **Identify Reusable Components**: For ANY UI element in the prompt, check if a component exists:
   - Buttons/CTAs → **MUST** use `Button` component
   - Product icons/logos/brand lockups → **MUST** use `ProductLockup` component
   - Cards/containers → Check registry (if not exists, create following patterns)
5. **Import Components**: Always import from `../../../../packages/components/src/[component]/index.js`
6. **Use Components**: Call component functions in the template (e.g., `Button({ ... })`), NEVER recreate their functionality
7. **Verify No Duplication**: Before writing any HTML/CSS, ask: "Does a component for this already exist?"

### Component Discovery Workflow
```
User Prompt → Identify UI Elements → Check COMPONENT_REGISTRY.md → 
If exists: Import & Use → If not: Create following patterns
```

### Required Elements
1. **Import**: Always import from `../../../../packages/components/src/[component]/index.js`
2. **Render Function**: Use `render: (args) => html\`...\`` for Lit templates with component calls
3. **ArgTypes**: Define all variant options with proper controls
4. **Accessibility**: Include `play: runA11yCheck` for accessibility testing
5. **Tags**: Use `tags: ['autodocs']` for automatic documentation
6. **Component Reuse**: **MANDATORY** - If a component exists (Button, ProductLockup, etc.), you MUST use it. Never recreate component functionality.

### Component Usage Pattern
```javascript
import { html } from 'lit';
import { Button } from '../../../../packages/components/src/button/index.js';
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';

export default {
  title: 'Generated/MyComponent',
  render: (args) => html`
    <div class="c-my-component">
      ${ProductLockup({ productName: 'Adobe', size: '2xl' })}
      <h1>${args.heading}</h1>
      <p>${args.body}</p>
      ${Button({ 
        label: args.buttonLabel, 
        kind: 'accent', 
        background: 'solid', 
        size: '2xl' 
      })}
    </div>
  `,
};
```

### Story Variants
- Create stories for each meaningful variant combination
- Include hover states (handled by CSS, no special story needed)
- Include disabled states
- Include "All Variants" showcase story when appropriate

### Example Story Pattern
```javascript
export const VariantName = {
  args: {
    kind: 'accent',
    background: 'solid',
    state: 'default',
    label: 'Label',
  },
  play: runA11yCheck, // Include accessibility checks
};
```

## Accessibility

- All components must pass `@storybook/addon-a11y` checks
- Use semantic HTML elements
- Include proper ARIA attributes when needed
- Test with `play: runA11yCheck` in stories

## Fonts

- **Primary**: Adobe Clean Display (via Typekit kit ID: `mie2rub`)
- **Fallback**: Inter (from Google Fonts)
- Fonts are loaded in `.storybook/preview.js`
