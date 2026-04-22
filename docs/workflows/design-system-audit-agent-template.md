# Design System Audit Agent Template

**Status:** Draft reusable prompt/schema  
**Use when:** Asking an agent to crawl a Figma library, FigJam strategy board, or codebase and produce a design-system audit roadmap

## Agent Role

You are auditing a design system as a structured system, not just a set of visual assets.

Inspect the system across:

- Tokens
- Components
- Figma architecture
- Code architecture
- Documentation
- Accessibility
- Governance
- Pipeline
- Design-code parity
- Agent readiness

The output must be brand-neutral unless asked to produce a client-specific deliverable. Use placeholders such as `{namespace}`, `{system}`, `{platform}`, `{repo}`, `{token-package}`, and `{consumer}`.

## Crawl Inputs

The agent may receive any combination of:

- Figma file URL
- FigJam board URL
- Design system repo path
- Token package path
- Storybook URL or local Storybook project
- Documentation folder
- Component inventory
- Existing roadmap or strategy board

## Figma Crawl Checklist

Inspect:

- Pages
- Sections
- Local variables
- Published variables
- Styles
- Components
- Component sets
- Instances
- Detached instances
- Old library references
- Token bindings
- Hard-coded values
- Naming patterns
- Variant axes
- State coverage
- Accessibility affordances
- Documentation and annotations
- Duplicate components
- Redundant tokens
- Component-code alignment signals

For each component set, capture:

- Name
- Category
- Variant axes
- Variant values
- State coverage
- Token-bound properties
- Hard-coded properties
- Nested instances
- External library references
- Public/private component split
- Accessibility notes
- Coded equivalent, if known

For each token collection, capture:

- Collection name
- Modes
- Variable count
- Naming pattern
- Alias depth
- Missing mode values
- Old/deprecated references
- Duplicate values
- Primitive/semantic/component split
- Export readiness

## FigJam Crawl Checklist

Inspect every page and text-bearing node:

- Sections
- Stickies
- Text blocks
- Shape text
- Tables
- Code blocks
- Connectors, if labels exist
- Embeds and link previews, as context

Classify content into:

- Strategy
- Tokens
- Components
- Pipeline
- Accessibility
- Governance
- Agentic workflows
- Design-code parity
- Risks
- Deliverables
- Decisions
- Questions

Separate:

- Reusable framework material
- Client/system-specific evidence
- Historical archive material
- One-off ideas
- Open questions

## Code Crawl Checklist

Inspect:

- Package structure
- Token source files
- Token build scripts
- CSS custom property output
- TypeScript token types
- Component source
- Component props
- Storybook stories
- Tests
- Accessibility checks
- Visual regression config
- CI/CD
- Changelog
- Versioning
- Package publishing

Check:

- Do component props match Figma variants?
- Do components consume tokens or hard-coded values?
- Are token names stable and predictable?
- Are deprecated tokens still consumed?
- Are components documented?
- Are accessibility states implemented?
- Are stories complete?
- Are tests meaningful?

## Classification Output

Classify findings into:

- Good
- Bad
- Ugly
- Unknowns
- Risks
- Quick wins
- Strategic initiatives
- Decisions needed
- Roadmap phases

## Required Deliverables

Produce:

1. System snapshot
2. Good / bad / ugly audit
3. Token audit
4. Component audit
5. Naming and taxonomy audit
6. Design-code parity audit
7. Pipeline proposal
8. Accessibility audit summary
9. Governance audit
10. Agent-readiness audit
11. Roadmap phases
12. Pilot recommendation
13. Decision log
14. Definition-of-done checklist

## Token Naming Evaluation

Evaluate naming using these levels:

```text
namespace
object
category
concept
property
variant
state
scale
mode
```

Ask:

- Is there a namespace?
- Is the namespace brand-neutral or system-specific by design?
- Are categories consistent?
- Are primitive tokens separated from semantic aliases?
- Are component tokens used sparingly?
- Are states modeled consistently?
- Are modes modeled correctly?
- Are names readable by humans and machines?
- Are there abbreviations that block understanding?
- Are there duplicate names for the same concept?
- Are there duplicate values with the same meaning?
- Are there duplicate values with different meaning that should remain separate?

## Component Taxonomy Evaluation

Classify components as:

```text
Foundations
Atoms
Components
Patterns
Blocks
Templates
Pages
```

Ask:

- Is the taxonomy explicit?
- Are atoms truly atomic?
- Are components functional and reusable?
- Are patterns composed from existing components?
- Are blocks platform/CMS-ready?
- Are pages final content implementations?
- Are names aligned across Figma, code, docs, and platform?

## Brand-Neutralization Pass

Before writing the reusable framework, replace specific names with placeholders.

Use:

```text
{client}
{system}
{namespace}
{platform}
{consumer}
{repo}
{token-package}
{component-library}
{documentation-site}
{product}
```

Do not leave client-specific names in reusable templates unless they are explicitly marked as source evidence.

## Roadmap Phase Template

For every roadmap phase, output:

```text
Phase:
Goal:
Current Evidence:
Decisions Needed:
Deliverables:
Risks:
Definition of Done:
Owner:
Dependencies:
Keep / Cut / Change Decision:
```

## Pilot Recommendation Template

```text
Pilot Name:
Why This Pilot:
Scope:
Out of Scope:
Design Inputs:
Code Inputs:
Token Inputs:
Accessibility Requirements:
Success Criteria:
Decision Gate:
```

## Scoring Template

Score from 0 to 3:

```text
0 = Missing or unusable
1 = Exists, but inconsistent or manual
2 = Mostly structured, needs cleanup
3 = Structured, governed, machine-readable
```

Categories:

- Token architecture
- Token naming
- Token redundancy
- Figma variable usage
- Component structure
- Component naming
- Variant strategy
- Accessibility
- Documentation
- Code parity
- Release process
- Governance
- Agent readiness

## Final Output Format

Write the final answer as:

```text
Executive Summary
Evidence Reviewed
System Snapshot
Good / Bad / Ugly
Token Audit
Component Audit
Naming + Taxonomy
Pipeline Proposal
Agentic System Model
Roadmap
Pilot Plan
Risks
Decisions Needed
Appendix
```

