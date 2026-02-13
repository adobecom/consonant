# Story UI Docs Overview

This directory teaches Story UI our design-system rules. Files mirror the recommendations from the Story UI guide: guardrails, tokens, component usage, and patterns.

## 🚨 START HERE: Component Registry

**Before generating ANY story, Story UI MUST read:**
- **`components/COMPONENT_REGISTRY.md`** - The authoritative list of available components

This registry tells you:
- What components exist
- When to use them
- How to import them
- What NOT to do (common mistakes)

**If you're generating a story with buttons, icons, or any UI element, check the registry FIRST!**

## Directory Structure

- **`components/COMPONENT_REGISTRY.md`** ⭐ **READ THIS FIRST** - Complete component list
- `components/`: Individual component usage examples (button.md, product-lockup.md, etc.)
- `guidelines/`: Accessibility, responsive guidance, brand notes
- `tokens/`: Spacing, color, typography references (mapped to --s2a-* names)
- `patterns/`: Layout/data-table patterns

## Workflow

1. **Read** `components/COMPONENT_REGISTRY.md`
2. **Check** if components exist for your UI elements
3. **Review** `components/[component-name].md` for usage examples
4. **Import and use** existing components - NEVER recreate them
5. **Reference** `tokens/` and `guidelines/` for styling and accessibility
