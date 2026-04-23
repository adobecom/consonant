# Design System Audit To Roadmap Framework

**Status:** Draft reusable framework  
**Source pattern:** Extracted from the `mattjam` FigJam audit/strategy board and generalized for future systems  
**Use when:** Auditing a design system, crawling Figma libraries, reviewing token/component architecture, or turning system findings into a roadmap

## Purpose

This framework turns a design system audit into a clear roadmap.

It is intentionally brand-neutral. Do not bake client, platform, or product names into the reusable method. Use placeholders such as `{system}`, `{namespace}`, `{platform}`, `{repo}`, `{token-package}`, and `{consumer}`.

The goal is not just to clean up a Figma library. The goal is to understand the whole operating model:

- What exists today
- What works
- What is fragile
- What is duplicated
- What is undocumented
- What blocks design-code parity
- What blocks accessibility
- What blocks scale
- What needs a governance decision
- What can become machine-readable and agent-operable

The end state is a spec-driven, agent-ready design system where Figma, code, docs, and automation are implementations of structured system data.

## Core Thesis

Audit the current design system across tokens, components, code, documentation, governance, and adoption.

Identify what is working, what is broken, and what is blocking scale.

Normalize the system around shared language, token naming, component taxonomy, accessibility, and design-code contracts.

Prove the strategy through a small end-to-end pilot.

Move toward a spec-driven, agent-ready design system where Figma, code, docs, and automation are implementations of structured design system data.

## Inputs

Use whatever artifacts the team has. Do not assume maturity.

- Figma design libraries
- Figma Variables and Styles
- FigJam strategy boards
- Code repositories
- Token packages
- CSS custom properties
- Storybook or equivalent component docs
- Product implementations
- Design QA notes
- Accessibility requirements
- Team roadmaps
- Existing ADRs or decision logs
- Contribution guidelines
- Changelogs

## Outputs

The audit should produce reusable artifacts, not just observations.

- System snapshot
- Good / bad / ugly audit
- Token taxonomy audit
- Token redundancy report
- Component taxonomy audit
- Naming audit
- Design-code parity review
- Pipeline proposal
- Agentic design system model
- Phased roadmap
- Pilot proposal
- Decision log
- Definition of done
- Open questions

For presentation layout guidance, use `design-system-audit-figjam-layout-guide.md`. This framework defines what the audit should contain; the layout guide defines how to turn it into a polished FigJam board.

## FigJam Board Template

Use this structure when creating the output board.

1. Executive Snapshot
2. System Inventory
3. Good / Bad / Ugly
4. Token Audit
5. Component Audit
6. Naming + Taxonomy
7. Design-Code Parity
8. Pipeline Proposal
9. Agentic System Model
10. Roadmap
11. Pilot Plan
12. Decisions / ADRs
13. Risks + Open Questions
14. Appendix / Raw Findings

Each section should use the same evidence pattern:

- What I found
- Why it matters
- Evidence
- Recommendation
- Decision needed
- Next step

## System Snapshot

Start by documenting the system as it is today.

Capture:

- What this system is
- Who uses it
- Where it lives
- Known consumers
- Current source of truth
- Design files
- Code repos
- Documentation
- Package or publishing flow
- Governance model
- Known constraints
- Known migration pressure

Questions:

- Is Figma the source of truth, or is code?
- Are tokens real variables, styles, JSON, CSS vars, or just visual convention?
- Are components published, local, duplicated, detached, or undocumented?
- Is there a repo?
- Is there Storybook or an equivalent coded reference?
- Is there a release process?
- Who approves changes?
- What breaks if a token or component changes?

Output:

```text
This system has {strength}, but {risk} is blocking {outcome}.
```

Example:

```text
This system has strong visual coverage, but token naming, component structure, and design-code contracts are inconsistent, which blocks scale and reliable automation.
```

## Good / Bad / Ugly Audit

Use this to separate reality from solutioning.

Categories:

- Tokens
- Components
- Naming
- Figma architecture
- Code architecture
- Documentation
- Accessibility
- Governance
- Release process
- Adoption
- Agent readiness

### The Good

What is worth preserving.

Examples:

- Tokens exist
- Designers already use the library
- Component coverage is strong
- There is a coded consumer
- There is a publishing path
- There are strong examples of craft

### The Bad

What is inconsistent, manual, or costly.

Examples:

- Mixed naming conventions
- Duplicate semantic roles
- Components not mapped to code
- State coverage is inconsistent
- Handoff depends on screenshots or redlines
- Docs are spread across tools

### The Ugly

What blocks scale.

Examples:

- Hard-coded values
- Detached components
- Spec overlays embedded inside components
- Old library references
- No changelog
- No owner
- No migration policy
- Component variants that do not map to implementation
- Tokens that mix value, meaning, state, and component context without rules

### Unknowns

What must be answered before roadmap commitments.

Examples:

- Who owns token approvals?
- What platform consumes the tokens?
- Does code already have a parallel system?
- Are product teams allowed to override the system?
- Which tools are mandated by the organization?

## Token Audit

Token naming and redundancy are usually the highest-leverage audit findings because they determine whether the system can scale and whether agents can reason about it.

Audit areas:

- Namespace strategy
- Token categories
- Primitive tokens
- Semantic aliases
- Component-specific tokens
- Object/component group tokens
- Modifiers
- State usage
- Scale usage
- Mode/theme usage
- Redundant values
- Hard-coded values
- Old-library references
- Naming inconsistencies
- Missing aliases
- Premature component tokens
- Tokens that should be promoted from local to global
- Tokens that should stay local
- Pipeline readiness
- Agent readability

## Token Naming Model

Use a structured naming model inspired by Nathan Curtis's token naming guidance and generalized for future systems.

Reference: <https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676>

Reusable levels:

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

Not every token needs every level. The audit should determine which levels are present, which are missing, and which are overused.

### Namespace

The system identifier. This should be configurable per client/system.

```text
{namespace}
```

Examples:

```text
acme
core
brand
product
```

### Category

The broad design decision area.

Examples:

```text
color
space
size
font
radius
shadow
opacity
motion
z-index
grid
```

### Concept

The design intent or role.

Examples:

```text
background
content
border
action
feedback
surface
heading
body
caption
```

### Property

The specific CSS/design property or sub-property.

Examples:

```text
fill
stroke
width
height
size
weight
line-height
letter-spacing
duration
easing
```

### Object

The component, group, or domain that owns the decision.

Examples:

```text
button
icon-button
card
navigation
form
dialog
table
```

### Variant

The authored variant.

Examples:

```text
primary
secondary
danger
solid
outlined
transparent
compact
expanded
```

### State

The interaction or lifecycle state.

Examples:

```text
default
hover
focus
active
disabled
loading
selected
error
success
```

### Scale

The size or ramp value.

Examples:

```text
0
2
4
8
12
sm
md
lg
100
200
300
```

### Mode

The contextual mode.

Examples:

```text
light
dark
high-contrast
mobile
desktop
brand-a
brand-b
```

## Token Layers

Use a layered model. Avoid mixing raw values, intent, component details, and modes in one flat naming scheme.

### Primitive Layer

Raw reusable values with no product meaning.

```text
{namespace}.color.gray.900
{namespace}.space.8
{namespace}.font.size.16
{namespace}.radius.4
```

Rules:

- No theme
- No component
- No interaction state
- No product meaning
- No breakpoint baked in

### Semantic Layer

Intent-based aliases that can vary by mode, theme, or context.

```text
{namespace}.color.content.primary
{namespace}.color.background.default
{namespace}.color.feedback.error
{namespace}.font.body.md.size
```

Rules:

- Adds meaning
- Can point to primitives
- Can vary by theme or mode
- Should be the default layer used by components

### Component Layer

Component-specific tokens used only when semantic tokens are not enough.

```text
{namespace}.button.background.primary.default
{namespace}.button.content.primary.hover
{namespace}.navigation.item.content.selected
```

Rules:

- Keep minimal
- Use when component behavior needs a stable contract
- Avoid creating component tokens for every primitive value
- Promote repeated component decisions back into semantic tokens when they become system-wide

### Output Layer

Generated implementation artifacts.

Examples:

```text
tokens.json
tokens.css
tokens.d.ts
metadata.json
CHANGELOG.md
package.json
```

CSS output examples:

```css
--{namespace}-color-content-primary
--{namespace}-color-background-default
--{namespace}-button-background-primary-default
--{namespace}-font-body-md-size
```

## Token Decision Rules

- Use primitives for raw reusable values.
- Use semantic tokens for meaning and intent.
- Use component tokens only when semantics are insufficient.
- Do not globalize a component-specific decision too early.
- Promote a local token only after it appears across multiple components or patterns.
- Use modes for theme/context differences.
- Use state modifiers only where interaction state matters.
- Use object levels for component, nested element, or component-group specificity.
- Keep naming predictable enough for humans, code, and agents.
- If two tokens share the same value but different meaning, keep both.
- If two tokens share the same value and same meaning, consolidate.
- If a token references an old library or deprecated collection, map it to the closest current equivalent and document the decision.

## Component Audit

Audit whether the component library is clean enough for humans, code, and agents.

Areas:

- Component inventory
- Atomic taxonomy
- Component quality
- Variant strategy
- State coverage
- Accessibility
- Token binding
- Design-code parity
- Spec hygiene
- Reuse opportunities
- Deprecated or duplicate components

Questions:

- Are components organized as atoms, components, patterns, blocks, and pages?
- Are components built like the DOM, or visually hacked together?
- Are annotations embedded as real layers?
- Are implementation notes separated into Dev Mode, docs, or metadata?
- Are variants meaningful or over-modeled?
- Are states complete?
- Are icons wrapped in accessible icon buttons?
- Are components bound to semantic or component tokens?
- Are old libraries referenced?
- Is there a coded equivalent?
- Is there a Storybook story or implementation spec?
- Are redundant components better expressed as variants?

## Component Taxonomy

Use Brad Frost's atomic design model as the base, but adapt it for design systems that span Figma, code, CMS, and agents.

Reference: <https://bradfrost.com/blog/post/atomic-web-design/>

Reusable taxonomy:

```text
Foundations
Atoms
Components
Patterns
Blocks
Templates
Pages
```

### Foundations

Tokens, variables, styles, grid, motion, and accessibility primitives.

### Atoms

Smallest reusable UI parts.

Examples:

```text
icon
label
link
checkbox
logo
button core
icon button
```

### Components

Functional UI units that expose props, variants, states, and accessibility behavior.

Examples:

```text
button
input
card
nav item
dialog
menu
```

### Patterns

Composed reusable product experiences.

Examples:

```text
global navigation
footer
filter bar
pricing card group
```

### Blocks

Platform or CMS-ready sections.

Examples:

```text
hero marquee
accordion section
product card rail
```

### Templates

Layout recipes without final content.

### Pages

Final content-filled implementations.

## Naming And Taxonomy Workshop

Use this workshop when a system has naming drift, duplicate concepts, or unclear object boundaries.

Sections:

- Current names
- Proposed names
- Naming rules
- Component categories
- Token categories
- What lives where
- Decision log
- Open questions

Rewrite format:

```text
Before:
{current-name}

After:
{proposed-systematic-name}

Reason:
{why this name is clearer, more scalable, or easier to implement}
```

Decision prompts:

- Are we naming by visual style, role, structure, or product usage?
- Are names stable enough for code?
- Are abbreviations allowed?
- Are component names aligned across Figma, code, docs, and CMS?
- What is the difference between a component, pattern, block, and page?
- What gets deprecated versus renamed?
- What belongs in the namespace?
- What belongs in object/category/property/modifier?

## Roadmap Builder

Use the audit to create phased, evidence-backed initiatives.

Recommended phases:

```text
Phase 0: Choose a discrete pilot
Phase 1: Establish shared language and contracts
Phase 2: Audit and normalize token taxonomy
Phase 3: Build or repair the token pipeline
Phase 4: Normalize typography, spacing, grid, and responsive foundations
Phase 5: Audit and rebuild core atoms/components
Phase 6: Prove design-code parity in a coded sandbox
Phase 7: Add accessibility gates and regression checks
Phase 8: Establish docs, governance, and contribution model
Phase 9: Add agentic workflows for audit, implementation, validation, and migration
```

For each phase:

- Goal
- Current evidence
- Decisions needed
- Deliverables
- Risks
- Definition of done
- Owner
- Dependencies
- Keep / cut / change decision

## Pilot Plan

The pilot prevents the roadmap from becoming theoretical.

Pilot requirements:

- Small enough to finish
- Representative enough to test the system
- Uses real tokens
- Uses real components
- Has a coded consumer
- Includes accessibility
- Includes documentation
- Produces a keep/cut/change decision

Example pilot:

```text
Run one page slice or high-traffic component through the full system:
Figma variables -> token package -> component implementation -> documentation -> accessibility checks -> visual regression -> release note.
```

Success criteria:

- No hard-coded values in the slice
- Figma roles map to implementation variables
- Tokens are versioned and installable
- Component has state coverage
- Accessibility checks pass
- Visual baseline exists
- Changelog entry exists
- Decision log is updated

## Pipeline Proposal

The token pipeline should be adapted to the organization. Figma organization, Enterprise access, repository ownership, package registry, and governance maturity all change the implementation.

Generic pipeline:

```text
Figma Variables
-> Raw JSON
-> Normalized token JSON
-> Validation
-> Transform
-> CSS Custom Properties
-> TypeScript Types
-> Package
-> Changelog
-> Consumer Integration
```

Pipeline checks:

- Can variables be fetched through the API?
- Are aliases preserved and resolved correctly?
- Are modes complete?
- Are references valid?
- Are deprecated tokens marked?
- Are units transformed for the web?
- Are typography outputs accessible?
- Is output versioned?
- Is there a changelog?
- Is there CI/CD?
- Is there a consumer test?

## Governance

Governance should make good decisions faster, not slow the team down.

Reusable governance artifacts:

- Glossary
- ADR template
- Contribution guide
- Review cadence
- Token change policy
- Component change policy
- Deprecation policy
- Migration policy
- Exception or snowflake policy
- Allowed properties matrix
- Definition of done
- Changelog format

Key decision:

```text
Where are exceptions allowed, how long do they live, and who approves them?
```

## Agentic Design System Layer

The durable asset is the structured system spec.

Figma is one implementation.
Code is one implementation.
Docs are one implementation.
Storybook is one implementation.
Agents operate against the structured source of truth.

Agent-ready inputs:

- Token schema
- Component metadata
- Variant definitions
- Accessibility rules
- Design annotations
- Code props
- Storybook stories
- Visual regression snapshots
- ADRs
- Changelog
- Usage telemetry
- Naming rules
- Contribution rules

Agent workflows:

- Crawl a Figma library
- Extract variables and components
- Detect naming drift
- Detect redundant tokens
- Detect old-library references
- Compare Figma to code
- Generate migration plans
- Create implementation specs
- Create Storybook stories
- Run accessibility checks
- Create roadmap recommendations
- Generate FigJam audit boards

Principle:

```text
Agents should accelerate the system, not replace craft.
Humans define intent, quality, and taste.
Agents handle repeatable inspection, validation, migration, and scaffolding.
```

## Scoring Model

Score each area from 0 to 3.

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

Example:

```text
Token naming: 1
Reason: Tokens exist, but naming mixes value, intent, and component usage.

Component structure: 2
Reason: Components are mostly reusable, but some are visually composed instead of structurally modeled.

Agent readiness: 1
Reason: Figma is readable, but specs, code contracts, and metadata are not consistently structured.
```

## Brand-Neutralization Rules

When generalizing from a client/system board, replace specific names with placeholders.

Replace source-specific names:

- Client or brand names
- Product names
- Platform names
- Team names
- Package names
- Internal block names
- Internal initiative names
- Internal tool names

With:

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

Keep as reusable:

- Token naming model
- Token layer model
- Atomic/component taxonomy
- Good / bad / ugly audit
- Pilot-first strategy
- Definition-of-done cards
- Decision gates
- ADR pattern
- Pipeline model
- Accessibility gates
- Agentic system model
- Governance and exception policy

Keep as evidence only:

- Brand-specific examples
- Product-specific implementation details
- Team-specific process details
- One-off explorations
- Historical archive notes
