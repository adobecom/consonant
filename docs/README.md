# Documentation Index

Use this index to find the right reference quickly. Each subdirectory focuses on a distinct slice of the system.

- `component-audit/` – Current state of component coverage (accordion, cards, layout containers, etc.)
- `future-notes/` – Forward-looking plans and decisions (e.g., Consonant 1 deprecation, upcoming Figma plugins)
- `guardrails/` – Authoring + implementation guardrails, including Story UI considerations and the "no primitives in components" rules
- `how-tos/` – Task-focused guides and runbooks (`runbook-token-pipeline.md`, `token-pipeline-steps-figjam.md`)
- `setup-guides/` – Environment/config setup for MCP, Story UI, etc.
- `workflows/` – End-to-end process diagrams like `figma-to-code-workflow.md`, plus reusable audit/roadmap frameworks

For Story UI prompts or guardrailed builds, load the files under `docs/guardrails/`. For operational work (tokens, pipelines, releases), start in `docs/how-tos/`.

Design system audit references:

- `docs/workflows/design-system-audit-to-roadmap-framework.md` – Brand-neutral framework for crawling a design system and turning findings into a roadmap
- `docs/workflows/design-system-audit-figjam-layout-guide.md` – Presentation layout system for turning audit findings into polished FigJam boards
- `docs/workflows/design-system-audit-agent-template.md` – Prompt/schema for agents crawling Figma, FigJam, and code artifacts
- `docs/workflows/mattjam-design-system-framework-crawl-report.md` – Source crawl summary from the MattJam FigJam board that informed the reusable framework
