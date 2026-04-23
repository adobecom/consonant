# MattJam Design System Framework Crawl Report

**Status:** Source crawl summary  
**Source:** FigJam board `mattjam`  
**File key:** `YfKMCRYvZhPbK87aQKE9Qg`  
**Purpose:** Document what was crawled and how reusable framework material was extracted

## Crawl Scope

The FigJam board was crawled through the Figma Desktop Bridge.

The crawl processed all pages and all text-bearing nodes exposed by the bridge:

- Pages
- Sections
- Text nodes
- Sticky notes
- Shape-with-text nodes
- Code blocks
- Tables/table cells
- Connector labels where exposed
- Link previews and embeds as context

## Board Totals

The board contains:

- 15 pages
- 280 sections
- 8,888 readable text-bearing nodes
- 1,305 sticky notes
- 659 shape-with-text nodes
- 226 code blocks

## Layout Coverage

The crawl included both content and layout structure. Layout data inspected included:

- Page names
- Top-level section names
- Section bounds
- Section fills for representative sections
- Section child counts
- Child node type mix
- Sticky positions and sizes
- Shape-with-text positions and sizes
- Representative typography
- Connector-heavy diagram sections
- Roadmap row structures
- ADR/document card structures

Reusable layout patterns from the board were extracted into `design-system-audit-figjam-layout-guide.md`.

The board is large enough that raw extraction output is not practical as a checked-in document. Instead, this report captures page-level coverage, high-signal patterns, and the reusable framework distilled from the crawl.

## Pages Crawled

### Status Updates

Role in framework:

- Progress/status reporting pattern
- Token pipeline summary
- Foundations update structure
- Large parent section with nested section cards

Reusable signals:

- Define what the foundation library is
- Show current state
- Show next steps
- Explain token pipeline in plain language
- Report what is ready, what is in progress, and what needs approval

Brand-specific terms found:

- `S2A`
- `Adobe`
- `Milo`
- `Spectrum`
- `adobe.com`

Framework action:

- Keep the status-update format.
- Replace brand/system names with `{system}`, `{namespace}`, `{platform}`, and `{consumer}`.

### Token Pipeline

Role in framework:

- Main reusable token pipeline model
- Naming and taxonomy overview
- Design-code parity framing
- Pipeline output model
- Wide horizontal flow diagram pattern

Reusable signals:

- The gap: design-code drift, hard-coded values, inconsistent implementation, manual handoff friction
- The goal: parity between design and code, scalable theming, accessibility, cross-platform output
- Token layers: primitives, semantic aliases, component tokens
- Component taxonomy: atoms, components, patterns, blocks, pages
- Pipeline stages: Figma Variables, REST/API fetch, raw JSON, validation, transformation, CSS output, package, versioning, changelog
- Governance checks: breaking changes, deprecations, migration paths, naming conventions, completeness validation

Brand-specific terms found:

- `S2A`
- `Milo`
- `Adobe`
- `Spectrum`

Framework action:

- Keep the pipeline stages.
- Keep the token naming principles.
- Replace package/platform names with `{token-package}`, `{platform}`, and `{consumer}`.

### 0 - North Star (2026)

Role in framework:

- Future-state and agentic design system model
- Team workflow model
- Guardrails and cautionary notes
- Agent-ready system framing

Reusable signals:

- AI should not replace people.
- AI should not be trusted as the accessibility authority.
- Messy design files create messy agent/code output.
- Components need clean structure, not visual annotation layers baked into UI.
- Agents need clean, machine-readable inputs.
- The future model is a design system where tokens, specs, components, docs, and code are structured enough for agents to audit, validate, generate, and migrate.

Brand-specific terms found:

- `Adobe`
- `Consonant`
- `C1`
- `C2`
- `Milo`
- `Radley`
- `Elliot`
- `Story UI`
- `Spectrum`

Framework action:

- Keep the agentic design system thesis.
- Keep the "clean inputs produce clean outputs" warning.
- Replace team/platform names with generic placeholders.

### Taxonmy Workshop - 02/25/26

Role in framework:

- Component and naming taxonomy workshop pattern
- Component anatomy and object structure exploration
- Variant/property naming exploration

Reusable signals:

- Taxonomy must be workshopped, not assumed.
- Component names need to align across design, code, docs, and platform.
- Variant axes need explicit values.
- Component anatomy should distinguish content, action, header, icon, CTA, variant, enum, and slot-like structures.

Brand-specific terms found:

- Mostly component and workshop content; brand-specific value is lower than structural value.

Framework action:

- Keep as a workshop method.
- Use as the basis for `Current Names -> Proposed Names -> Decision -> Definition` exercises.

### How we AI

Role in framework:

- Agentic workflow sequence

Reusable signals:

- Sub-atoms/tokens first
- Token pipeline before component generation
- Atoms built in Figma with variants
- Lint/check best practices before codegen
- Molecules compose atoms
- Organisms compose molecules
- Figma MCP can generate components
- Claude/Cursor can generate stories, tests, and accessibility checks
- Storybook/docs become handoff and validation
- Prototyping becomes iterative

Framework action:

- Keep the sequencing.
- Make it tool-agnostic where possible, while allowing tool-specific implementation notes.

### Strategy (v3)

Role in framework:

- Detailed strategy iteration
- Deep token exploration
- Roadmap evolution
- Naming and redundancy investigation
- Accessibility and type-system concerns

Reusable signals:

- Token exploration should inspect categories like color, data visualization, border, shadow, opacity, spacing, typography, z-index, and animation.
- Typography needs special treatment because Figma often stores px values while web output may need rem, em, ratios, or clamp.
- Redundancy and naming decisions are not cosmetic; they determine whether the system is governable.
- Roadmaps should evolve as evidence is gathered.
- A good roadmap is not a checklist; it needs decisions, deliverables, risks, and definitions of done.

Brand-specific terms found:

- `Consonant`
- `C1`
- `C2`
- `Milo`
- `S2A`
- `Adobe`

Framework action:

- Keep the detailed phase model.
- Keep the token category audit model.
- Parameterize brand/platform names.

### Q1 Action Plan

Role in framework:

- Action-plan structure
- Legend and sticky categories
- Month-one insight pattern

Reusable signals:

- Summarize sources reviewed.
- Separate strengths from challenges.
- Propose a potential path forward, not a fixed plan.
- Use sticky categories like goal, decisions, deliverables, risks, info, questions, concerns, assumption, and definition of done.

Framework action:

- Keep the action-plan card taxonomy.
- Use it as the standard phase card structure.

### The Future -ARCHIVED

Role in framework:

- Future-state system architecture
- Agentic/spec-driven design system framing
- Token-driven platform model
- Naming migration model

Reusable signals:

- Build a token-driven design system behind the product/platform implementation.
- Figma, tokens, and product implementation should align.
- Authors/users can keep simple mental models while the system provides structure behind the scenes.
- AI can generate, migrate, and audit only when the system is machine-readable.
- Naming migration should move opaque codes into structured semantic taxonomy.

Brand-specific terms found:

- `Milo`
- `Consonant`
- `s2a`
- `Adobe`

Framework action:

- Keep the future-state model.
- Replace platform-specific language with `{platform}`, `{consumer}`, and `{implementation}`.

### Strategy Initiative - ARCHIVED

Role in framework:

- Original phase model
- ADR pattern
- Pilot-first approach
- Definitions of done
- Governance and snowflake policy
- Roadmap row layout
- Document-like ADR layout

Reusable signals:

- Pick a discrete pilot.
- Establish shared language and contracts.
- Build token taxonomy and pipeline.
- Add accessible typography and component foundations.
- Prove with Storybook or equivalent.
- Integrate into a real product/platform sandbox.
- Add governance and exception policy.
- Use ADRs to record system-critical decisions.
- Use keep/cut/change gates after pilots.

Brand-specific terms found:

- `Consonant`
- `Milo`
- `C1`
- `C2`
- `Radley`
- `Spectrum`

Framework action:

- Keep the roadmap pattern.
- Keep the ADR pattern.
- Keep the pilot-first operating model.
- Parameterize all system names.

## Brand-Specific Terms To Wash Out

The crawl identified repeated brand/platform terms that should not appear in reusable framework text except as source evidence:

- `Adobe`
- `S2A`
- `s2a`
- `Consonant`
- `C2`
- `C1`
- `Milo`
- `Radley`
- `Elliot`
- `Story UI`
- `GWP`
- `Spectrum`
- `A.com`
- `adobe.com`

Use replacements:

- `{client}`
- `{system}`
- `{namespace}`
- `{platform}`
- `{consumer}`
- `{repo}`
- `{token-package}`
- `{component-library}`
- `{documentation-site}`
- `{product}`

## High-Signal Reusable Patterns

### Audit Pattern

```text
System Snapshot
Good / Bad / Ugly
Unknowns
Risks
Quick Wins
Strategic Initiatives
Roadmap
Pilot
Decisions
Definition of Done
```

### Token Pattern

```text
Primitive tokens
Semantic aliases
Component tokens
Modes/themes
Responsive foundations
Pipeline output
Validation
Versioning
Changelog
Migration
```

### Naming Pattern

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

### Component Pattern

```text
Foundations
Atoms
Components
Patterns
Blocks
Templates
Pages
```

### Pipeline Pattern

```text
Figma Variables
-> Raw JSON
-> Normalized JSON
-> Validation
-> Transform
-> CSS Custom Properties
-> TypeScript Types
-> Package
-> Changelog
-> Consumer Integration
```

### Roadmap Pattern

```text
Phase
Goal
Current Evidence
Decisions Needed
Deliverables
Risks
Definition of Done
Owner
Dependencies
Keep / Cut / Change Decision
```

### Agentic Pattern

```text
Structured specs first
Figma as implementation
Code as implementation
Docs as implementation
Agents as operators
Humans keep intent and craft
Agents handle inspection, validation, migration, and scaffolding
```

## References

- Nathan Curtis, "Naming Tokens in Design Systems": <https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676>
- Brad Frost, "Atomic Design": <https://bradfrost.com/blog/post/atomic-web-design/>
