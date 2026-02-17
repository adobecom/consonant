<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

## Design-System Guardrails

- Before running any MCP codegen (Codex/Claude/Cursor), read the guardrail docs in [`docs/guardrails/`](docs/guardrails/) and paste the "Guardrail reminder" snippet from [`docs/guardrails/no-primitives-in-components.md`](docs/guardrails/no-primitives-in-components.md) into the agent prompt.
- Reject or fix any generated code that uses primitive tokens without an inline `Primitive:` comment.

## Repository Docs to Reference

- Use the workflow primer in [`docs/workflows/figma-to-code-workflow.md`](docs/workflows/figma-to-code-workflow.md) whenever the conversation touches the end-to-end process (Figma → tokens → Storybook → Milo).
- Pull contextual rules/examples from [`story-ui-docs/`](story-ui-docs/) so Story UI/Codex stay aligned with the existing components/tokens.
- Strategy/north-star conversations should cite [`docs/north-star/`](docs/north-star/) (e.g., `GOALS_2026.md`, `PRESENTATION_OUTLINE.md`).
