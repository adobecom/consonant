# Components Package

Component library for the Consonant design system. Components are built using HTML, CSS, and JavaScript (only when needed) with data attributes for variant props.

## Button Component

### Usage

Include the CSS file in your project:

```html
<link rel="stylesheet" href="path/to/button.css">
```

Then use the button HTML:

```html
<button class="c-button" data-size="2xl" data-state="default" data-kind="accent" data-background="solid">
  Label
</button>
```

### Variants

- **data-size**: `"2xl"` (default)
- **data-state**: `"default"` | `"disabled"` (hover is automatic via CSS)
- **data-kind**: `"accent"` | `"primary"`
- **data-background**: `"solid"` | `"outlined"`

**Note:** You don't need to set `data-state="hover"` - hover states are handled automatically by CSS when the button is not disabled.

### No JavaScript Required

This component is **pure HTML/CSS** - no JavaScript needed! Hover states are handled automatically via CSS `:hover` pseudo-classes.

### Examples

**Accent Solid Button (Default)**
```html
<button class="c-button" data-size="2xl" data-state="default" data-kind="accent" data-background="solid">
  Label
</button>
```

**Primary Outlined Button**
```html
<button class="c-button" data-size="2xl" data-state="default" data-kind="primary" data-background="outlined">
  Label
</button>
```

**Disabled Button**
```html
<button class="c-button" data-size="2xl" data-state="disabled" data-kind="accent" data-background="solid">
  Label
</button>
```
