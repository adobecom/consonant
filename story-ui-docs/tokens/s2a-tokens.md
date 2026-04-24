# S2A Design Tokens — Authoritative Reference

> Auto-generated from `dist/packages/tokens/css/dev/`. Do not edit manually.
> Regenerate: `node scripts/generate-story-ui-token-docs.js`

## ⚠️ MANDATORY RULES

1. **ALWAYS use semantic tokens** — never hardcode hex, rgb, or raw px values
2. **Fallback syntax** — always include a fallback: `var(--s2a-spacing-lg, 24px)`
3. **Never use primitive tokens** (--s2a-color-gray-*, --s2a-spacing-16, etc.) — semantic aliases only

```css
/* ✅ CORRECT */
padding: var(--s2a-spacing-lg, 24px);
color: var(--s2a-color-content-default, #292929);
background: var(--s2a-color-background-default, #ffffff);

/* ❌ WRONG */
padding: 24px;
color: #1a1a1a;
background: #f5f0ff;
background: linear-gradient(135deg, #f5f0ff 0%, #ede8ff 50%);
```

---

## Spacing

### Spacing

| Token | Resolved value |
|---|---|
| `--s2a-spacing-2xs` | 4px |
| `--s2a-spacing-xs` | 8px |
| `--s2a-spacing-lg` | 24px |
| `--s2a-spacing-3xl` | 48px |


## Color — Background

### Background

| Token | Resolved value |
|---|---|
| `--s2a-color-background-brand` | #eb1000 |
| `--s2a-color-background-default` | #fff |
| `--s2a-color-background-disabled` | #f8f8f8 |
| `--s2a-color-background-inverse` | #000 |
| `--s2a-color-background-knockout` | #000 |
| `--s2a-color-background-subtle` | #f8f8f8 |
| `--s2a-color-background-utility-error` | #d73220 |


## Color — Content (text)

### Content

| Token | Resolved value |
|---|---|
| `--s2a-color-content-body-strong` | var(--s2a-color-content-strong) |
| `--s2a-color-content-body-subtle` | var(--s2a-color-content-subtle) |
| `--s2a-color-content-brand` | #eb1000 |
| `--s2a-color-content-caption` | var(--s2a-color-content-subtle) |
| `--s2a-color-content-default` | #000 |
| `--s2a-color-content-disabled` | #c6c6c6 |
| `--s2a-color-content-eyebrow` | rgb(0 0 0 / 64%) |
| `--s2a-color-content-inverse` | var(--s2a-color-content-knockout) |
| `--s2a-color-content-knockout` | #fff |
| `--s2a-color-content-label` | var(--s2a-color-content-default) |
| `--s2a-color-content-strong` | #131313 |
| `--s2a-color-content-subheading` | #000 |
| `--s2a-color-content-subtle` | rgb(0 0 0 / 64%) |
| `--s2a-color-content-title` | var(--s2a-color-content-default) |
| `--s2a-color-content-utility-error` | #d73220 |


## Color — Border

### Border

| Token | Resolved value |
|---|---|
| `--s2a-color-border-brand` | #eb1000 |
| `--s2a-color-border-default` | #292929 |
| `--s2a-color-border-disabled` | #c6c6c6 |
| `--s2a-color-border-inverse` | #fff |
| `--s2a-color-border-knockout` | #000 |
| `--s2a-color-border-strong` | #131313 |
| `--s2a-color-border-subtle` | #dadada |
| `--s2a-color-border-utility-error` | #d73220 |


## Border Radius

### Border Radius

| Token | Resolved value |
|---|---|
| `--s2a-border-radius-2xs` | 2px |
| `--s2a-border-radius-xs` | 4px |
| `--s2a-border-radius-sm` | 8px |
| `--s2a-border-radius-md` | 16px |
| `--s2a-border-radius-lg` | 32px |
| `--s2a-border-radius-none` | 0 |
| `--s2a-border-radius-round` | 999px |

