# Guardrail: No Primitives Inside Components

**Status**: Active  
**Applies to**: All MCP/Codex/Claude/Cursor codegen requests, manual code edits, Storybook examples, and component packages.

## Rule

Use semantic (`--s2a-spacing-sm`) or component tokens (`--s2a-button-color-background-accent-solid-default`) everywhere inside component code. Primitive tokens (`--s2a-spacing-20`, `--s2a-typography-font-family-adobe-clean`, etc.) are only allowed when there is no semantic alias *and* the code immediately documents the exception with a comment starting with `Primitive:`.

```css
/* ✅ Semantic */
padding: var(--s2a-spacing-sm, 12px) var(--s2a-spacing-2xl, 40px);

/* ✅ Primitive with comment */
padding-top: calc(
  var(--s2a-spacing-20, 20px) - var(--s2a-border-width-md, 2px)
); /* Primitive: spacing-20 has no semantic vertical alias yet */

/* ❌ Primitive without comment */
padding: var(--s2a-spacing-20, 20px) var(--s2a-spacing-40, 40px);
```

## MCP Prompt Snippet

Paste this snippet before running `mcp_Figma_get_design_context` (or any other MCP tool) via Codex/Claude/Cursor:

```
Guardrail reminder:
- Use semantic/component tokens only in generated CSS.
- If you *must* use a primitive token, add a comment starting with "Primitive:" explaining why.
- Point out primitive usages in your response so we can replace them during token maintenance.
```

## Validation Checklist

1. Run `rg "--s2a-" packages/components/<component>` to list all tokens.
2. Confirm every primitive token either has a `Primitive:` comment or is part of `packages/design-tokens` (which may still use primitives).
3. Reject any code review / MCP response that doesn’t call out primitive usages.

## Next Steps

- Once a semantic alias exists for a primitive, remove the inline comment and swap in the alias.
- Add automated linting to flag primitive tokens without comments (tracked separately).
