# Claude Code to Figma Workflow

This guide explains how to capture components from Storybook and send them directly to Figma as editable frames using [Claude Code to Figma](https://www.figma.com/blog/introducing-claude-code-to-figma/).

## Prerequisites

- Claude Code installed: `npm install -g @anthropic-ai/claude-code`
- Storybook running locally (port 6006)
- Figma file open with edit access

## Workflow

### 1. Start Storybook

```bash
npm run storybook
```

This starts Storybook at `http://localhost:6006`

### 2. Navigate to a Component Story

Open your browser and navigate to the component story you want to capture, for example:

- `http://localhost:6006/?path=/story/button--default`
- `http://localhost:6006/?path=/story/marquee--example-1`

### 3. Enable Claude Code Chrome Integration

The Claude Code to Figma feature works through Claude Code's Chrome integration. The exact workflow may use:

1. **Browser extension**: Claude Code Chrome extension for capturing pages
2. **Clipboard integration**: Captured screens can be copied to clipboard
3. **Direct paste**: Paste directly into Figma files as editable frames

### 4. Capture and Send to Figma

According to the [Figma blog post](https://www.figma.com/blog/introducing-claude-code-to-figma/), you can:

1. **Capture from browser**: Use Claude Code's browser integration to capture the current page from localhost, staging, or production
2. **Send to clipboard**: The captured screen can be copied to your clipboard
3. **Paste into Figma**: Paste directly into any Figma file as editable frames

For **multiple screens/flows**, you can capture multiple screens in a single session, preserving sequence and context so the full experience makes sense.

> **Note**: Since this feature was just announced (February 17, 2026), the exact CLI commands or browser extension interface may still be evolving. Check the latest [Claude Code documentation](https://docs.anthropic.com/claude/docs/claude-code) or the Chrome extension for the most up-to-date workflow.

## Benefits

- **See the whole system at once**: Compare components side-by-side in Figma
- **Explore variations**: Duplicate frames and test structural changes without rewriting code
- **Better decisions earlier**: Designers, engineers, and PMs can react to the same artifact
- **Turn built UI into shared direction**: Annotate decisions and conceptualize options

## Roundtrip Back to Code

You can also bring Figma designs back into your coding workflow using the [Figma MCP server](https://www.figma.com/blog/introducing-claude-code-to-figma/#roundtrip-back-to-code), which is already set up in this workspace.

## References

- [Figma Blog: From Claude Code to Figma](https://www.figma.com/blog/introducing-claude-code-to-figma/)
- [Figma MCP Server Guide](https://www.figma.com/blog/introducing-our-mcp-server/)
