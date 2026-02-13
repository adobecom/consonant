| Phase | Name | Key Actions | Tooling |
|-------|------|-------------|---------|
| 1 | Design in Figma | 100% variable usage; follow atomic structure | Figma Variables, annotations kept off-frame |
| 2 | Validate with FigmaLint | Run Component Audit; ensure MCP-readiness | FigmaLint plugin |
| 3 | Generate Code (MCP) | `mcp_Figma_get_design_context` for structure + assets | Figma MCP (Codex/Story UI) |
| 4 | Bind Tokens | Replace hard-coded values with `--s2a-*` tokens | Token pipeline (`s2a-tokens`) |
| 5 | Download Assets | Use MCP asset URLs + `fetch_mcp_resource` | Figma MCP asset tooling |
| 6 | Create Component Skeleton | Follow BEM + Milo block conventions (HTML/CSS/JS) | Repo components (Button, Product Lockup) |
| 7 | Storybook & Tests | Generate stories; run a11y + visual checks | Storybook, `story-ui-docs`, Axe |
| 8 | Refine & Align | Tweak spacing, fonts, performance; handoff to Milo | Storybook approvals, Milo runtime |
