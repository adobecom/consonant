# Story UI Setup Guide

> **Current approach:** Story UI is used **via MCP/CLI only** (no Storybook panel addon).  
> It acts as an AI “story generator” that writes stories into `apps/storybook/stories/generated/` using our real components and tokens.

## What Was Installed

- **Package**: `@tpitre/story-ui@^4.12.0`
- **Config**: `story-ui.config.cjs` (CommonJS) in the repo root
- **Design System Docs**:
  - `docs/guardrails/story-ui-considerations.md`
  - `story-ui-docs/**` (component registry + patterns)

## Configuration Files

### `story-ui.config.cjs`

- **Framework**: `web-components`
- **Storybook framework**: `@storybook/web-components-vite`
- **Generated stories path**: `apps/storybook/stories/generated/` (absolute)
- **Component source path**: `packages/components/src`
- **Import style**: `individual` (imports `.js` modules directly)
- **Template library**: `lit`
- **Component registry**:
  - `Button` (`packages/components/src/button/index.js`)
  - `ProductLockup` (`packages/components/src/product-lockup/index.js`)
- **Docs + guardrails**:
  - `considerationsPath: ./docs/guardrails/story-ui-considerations.md`
  - `docsPath: ./story-ui-docs`

### `docs/guardrails/story-ui-considerations.md`

- Design system patterns and conventions
- Component structure documentation
- Story generation guidelines
- Import patterns and examples

### `story-ui-docs/**`

- `components/COMPONENT_REGISTRY.md` – list of components Story UI must reuse
- `components/*.md` – usage docs for `Button`, `ProductLockup`, etc.
- `tokens/**`, `guidelines/**`, `patterns/**` – extra guardrails for prompts

## Environment Variables

To use Story UI, you'll need to set up API keys in your `.env` file:

```bash
# For OpenAI (Recommended - similar to Codex/Copilot models)
OPENAI_API_KEY=your_key_here

# Optional: For Claude (Anthropic)
ANTHROPIC_API_KEY=your_key_here

# Optional: For Google Gemini
GEMINI_API_KEY=your_key_here

# Optional: Custom MCP server port (default: 4001)
VITE_STORY_UI_PORT=4001

# Optional: Override LLM provider (default: 'openai')
STORY_UI_LLM_PROVIDER=openai  # or 'claude' or 'gemini'
```

## Usage

### Start Storybook

```bash
npm run storybook
```

This runs the Nx Storybook target for the `apps/storybook` app. Generated stories will appear under the `Generated/` group once Story UI has written them.

### Start Story UI MCP Server (for Codex/Cursor integration)

```bash
npm run story-ui:mcp
```

This starts the MCP server in STDIO mode for local integration with Claude Desktop or Cursor.

### Start Story UI HTTP Server

```bash
npm run story-ui
```

This starts the HTTP server on port 4001 (or your configured port) for remote MCP connections.

### Run everything together (local dev)

```bash
npm run dev
```

This runs, in parallel:

- Storybook
- Story UI HTTP server
- Story UI MCP server

## Generating Stories

We currently **do not** use the Storybook panel. Instead, you drive Story UI via MCP (Cursor/Codex) or direct prompts.

### Via MCP (Codex/Cursor)

Once the MCP server is running, you can ask Codex/Cursor to:

- "Generate a Storybook story for a Button component with all variants"
- "Create stories for the ProductLockup component"
- "Add accessibility tests to existing stories"

## Design System Integration

Story UI automatically reads:

- `docs/guardrails/story-ui-considerations.md` - Your design system guidelines
- `story-ui.config.cjs` - Component paths and framework settings
- Existing stories - To learn your patterns and conventions

## Troubleshooting

### API Key Issues

- Ensure your API key is set in `.env` file
- For Claude: Get your key from https://console.anthropic.com/
- Restart Storybook after adding API keys

### Component Import Errors

- Verify component paths in `story-ui.config.js` match your structure
- Check that components are exported correctly from `packages/components/src`

### Story Generation Quality

- Review and update `docs/guardrails/story-ui-considerations.md` with more specific patterns
- Add more example stories for Story UI to learn from
- Provide detailed prompts with specific requirements

## Next Steps

1. **Add API Key**:
   - **For OpenAI** (default, recommended): Set `OPENAI_API_KEY` in your `.env` file
     - Get your key from: https://platform.openai.com/api-keys
     - This uses the same API that powers Codex/Copilot models
   - **For Claude**: Set `ANTHROPIC_API_KEY` in your `.env` file
     - Get your key from: https://console.anthropic.com/
2. **Test Generation**: Start Storybook and try generating a story
3. **Refine Guidelines**: Update `docs/guardrails/story-ui-considerations.md` based on your needs
4. **Set Up MCP**: Configure MCP server for Codex/Cursor integration if desired

## Resources

- [Story UI GitHub](https://github.com/southleft/story-ui)
- [Story UI Documentation](https://github.com/southleft/story-ui#readme)
- [MCP Integration Guide](https://github.com/southleft/story-ui#mcp-integration)
