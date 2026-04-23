# Design System Audit FigJam Layout Guide

**Status:** Draft reusable layout system  
**Use with:** `design-system-audit-to-roadmap-framework.md`  
**Purpose:** Make generated audit boards presentation-ready, not just structurally correct

## Goal

The audit board should be clear enough for workshop use and polished enough for presentation.

It should not look like a raw scrape of findings. It should look like a designed narrative:

- What we found
- Why it matters
- What needs to change
- What we should do first
- How the system becomes cleaner, scalable, and agent-ready

## Source Layout Patterns Observed

The `mattjam` crawl showed several repeatable FigJam composition patterns.

### Status Update Board

Pattern:

- One large parent section containing smaller nested sections
- Used for progress reporting and narrative summaries
- Works well for leadership updates

Observed structure:

```text
Large parent section: ~5632 x 5072
Nested sections: 8
Content: title, current state, next steps, simple diagrams
```

Reusable use:

- Executive update
- Current state summary
- Progress report
- Readout after an audit pass

### Small Presentation Cards

Pattern:

- Compact section cards around `1200 x 1024`
- Large bold title at top left
- Supporting paragraph below
- Sticky grid underneath
- Used for `The Gap` and `The Goal`

Observed measurements:

```text
Section: 1200 x 1024
Title: x 64, y 36, font ~40 bold
Body: x 64, y 116, width ~768, font ~24 medium
Sticky size: 240 x 240
Sticky grid x positions: 64, 320, 576
Sticky grid y positions: 128, 328/400, 600
```

Reusable use:

- Good / bad / ugly
- Goals
- Risks
- Quick wins
- Decision clusters

### Wide Flow Diagrams

Pattern:

- Large horizontal sections
- Shape-with-text nodes connected left to right
- Sticky notes underneath nodes for detail
- Used for token strategy and token pipeline

Observed measurements:

```text
Token strategy section: ~8880 x 1487
Token pipeline section: ~10224 x 1520
Node size: 448 x 176
Large taxonomy node: 576 x 176
Horizontal spacing: ~880 to 1000 between major nodes
Detail stickies: 240 x 240 or 240 x 288
```

Reusable use:

- Token pipeline
- System architecture
- Design-code parity flow
- Agentic workflow
- Migration path

### Roadmap Row

Pattern:

- Long horizontal phase model
- Each phase is a column
- Each phase has goal, decisions, deliverables, risks, and definition of done
- Used in the strategy archive and v3 pages

Reusable use:

- Roadmap
- Pilot plan
- Multi-quarter plan
- Initiative sequencing

Recommended measurements:

```text
Phase column width: 416 to 480
Phase gap: 32 to 48
Header height: 60 to 96
Card width: 416
Card height: 240 to 360 depending content
Row gap: 32
```

### ADR / Decision Card

Pattern:

- Single document-like section
- Neutral background
- One large text block
- Used for architecture decision records

Observed measurements:

```text
Section: ~976 x 1632
Padding: 40
Text width: ~896
Text size: ~16
```

Reusable use:

- ADR example
- Decision log
- Governance policy
- Naming decision
- Migration decision

### Architecture Canvas

Pattern:

- Large white canvas
- Colored modules connected by arrows
- Used to explain visual architecture, platform layers, and agentic workflows

Observed measurements:

```text
Section: ~5808 x 3136
Node size: 464 x 154 to 464 x 208
Connector-heavy
Uses color families to indicate layers
```

Reusable use:

- Agentic design system model
- System of record map
- Platform architecture
- Figma/code/docs relationship

## Recommended Board Pages

Use these pages for the generated FigJam.

```text
01 Executive Snapshot
02 System Inventory
03 Good Bad Ugly
04 Token Audit
05 Component Audit
06 Naming Taxonomy
07 Design Code Parity
08 Pipeline Proposal
09 Agentic System Model
10 Roadmap
11 Pilot Plan
12 Decisions ADRs
13 Risks Questions
14 Appendix Raw Findings
```

## Presentation Flow

The board should read left to right and top to bottom.

Recommended narrative:

1. Start with the executive snapshot.
2. Show current system inventory.
3. Show good / bad / ugly.
4. Deep dive into tokens.
5. Deep dive into components.
6. Explain naming and taxonomy.
7. Explain design-code parity gaps.
8. Show the proposed pipeline.
9. Show the agentic future state.
10. End with roadmap, pilot, decisions, and risks.

## Page Layout Recipes

### 01 Executive Snapshot

Use one large canvas with four cards.

Layout:

```text
Section size: 5632 x 2200
Cards: 1200 x 1024
Card gap: 88
Cards per row: 4
```

Cards:

- What this system is
- Current state
- Highest risks
- Recommended first move

### 02 System Inventory

Use a grid of system asset cards.

Layout:

```text
Section size: 5632 x 3200
Card size: 1200 x 640
Cards per row: 4
```

Cards:

- Figma libraries
- Token sources
- Component libraries
- Code repos
- Documentation
- Consumers
- Release process
- Governance

### 03 Good Bad Ugly

Use three large columns.

Layout:

```text
Section size: 4000 x 1800
Column card size: 1200 x 1400
Column gap: 80
Sticky size: 240 x 240
```

Columns:

- The Good
- The Bad
- The Ugly

Use color coding:

- Good: light green
- Bad: light amber
- Ugly: light red/pink

### 04 Token Audit

Use a combination of overview cards and token flow.

Top row:

- Token architecture score
- Naming score
- Redundancy score
- Pipeline readiness score

Main flow:

```text
Raw values -> Primitives -> Semantic aliases -> Component tokens -> Output
```

Use node size:

```text
448 x 176
```

Use detail stickies under each node.

### 05 Component Audit

Use taxonomy lanes.

Lanes:

- Foundations
- Atoms
- Components
- Patterns
- Blocks
- Templates
- Pages

Each lane should include:

- What exists
- What is duplicated
- What is missing
- What needs code parity

### 06 Naming Taxonomy

Use before/after rewrite cards.

Card pattern:

```text
Before
{current-name}

After
{proposed-name}

Reason
{why this is clearer}
```

Also include the naming stack:

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

### 07 Design Code Parity

Use two-column comparison.

Columns:

- Design source
- Code source

Rows:

- Tokens
- Components
- Variants
- States
- Accessibility
- Documentation
- Release process

Add a third lane for drift:

- Missing mapping
- Hard-coded value
- Old token reference
- Component mismatch
- Missing state

### 08 Pipeline Proposal

Use a wide horizontal flow.

Flow:

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

Use:

```text
Section: ~10224 x 1520
Node: 448 x 176
Detail sticky: 240 x 240
Connector arrows between stages
```

### 09 Agentic System Model

Use layered architecture.

Layers:

- Spec layer
- Token layer
- Component metadata layer
- Figma implementation
- Code implementation
- Documentation implementation
- Validation layer
- Agent operations layer

Message:

```text
Figma is an implementation.
Code is an implementation.
Docs are an implementation.
The durable asset is the structured spec.
```

### 10 Roadmap

Use horizontal phase columns.

Phases:

```text
Phase 0: Choose a discrete pilot
Phase 1: Shared language and contracts
Phase 2: Token taxonomy
Phase 3: Token pipeline
Phase 4: Foundations cleanup
Phase 5: Component rebuild
Phase 6: Coded sandbox
Phase 7: Accessibility and regression gates
Phase 8: Governance
Phase 9: Agentic workflows
```

Each phase card:

- Goal
- Decisions
- Deliverables
- Risks
- Definition of done

### 11 Pilot Plan

Use a single focused section.

Cards:

- Pilot name
- Why this pilot
- Scope
- Out of scope
- Success criteria
- Decision gate

### 12 Decisions ADRs

Use document-like ADR cards.

Card structure:

```text
Title
Status
Context
Decision
Consequences
Alternatives
Owner
Date
```

### 13 Risks Questions

Use issue triage layout.

Columns:

- Risks
- Open questions
- Assumptions
- Decisions needed

### 14 Appendix Raw Findings

Use lower-polish evidence storage.

Include:

- Raw crawler summaries
- Screenshots
- Links
- Full text extracts
- Parking lot items

## Visual Style Guidance

### Canvas Backgrounds

Use soft, low-saturation backgrounds for large sections.

Recommended neutral colors:

```text
Neutral canvas: #F8F8F8
White canvas: #FFFFFF
Soft blue: #C2E5FF
Soft green: #EBFFEE
Soft pink: #FFF0FA
Soft amber: #FFECC0
Soft purple: #DCCBFF
Soft red: #FFD3C2
```

Use color semantically:

- Blue: process, taxonomy, structure
- Green: goals, success, healthy areas
- Amber: risk, decisions, caution
- Red/pink: gaps, ugly, urgent issues
- Purple: components/patterns/system layers
- Gray: raw values, infrastructure, neutral process

### Type

Observed source board uses Inter. For reusable output, use the file default if generating inside FigJam.

Recommended hierarchy:

```text
Page title: 56-72 bold
Section title: 40 bold
Card title: 24-32 bold
Body: 18-24 medium/regular
Small metadata: 14-16 regular
```

### Spacing

Use consistent spacing so generated boards feel intentional.

```text
Outer page margin: 80
Section padding: 64
Card gap: 32-88 depending scale
Sticky grid gap: 16-32
Flow node gap: 400-900 depending connector length
```

### Cards And Stickies

Use stickies for raw findings and workshop material.

Use custom card sections/shapes for polished presentation content.

Suggested rule:

- Sticky = evidence, raw finding, workshop note
- Card = synthesized recommendation
- Diagram node = system concept or pipeline stage
- ADR card = decision record

## Auto-Generation Rules

When generating a new FigJam from a crawl:

1. Create pages in narrative order.
2. Put one major topic per page.
3. Use large parent sections for each page.
4. Use consistent section sizes.
5. Do not dump all findings into one area.
6. Put raw findings in the appendix.
7. Put synthesized findings in presentation pages.
8. Use color to show meaning, not decoration.
9. Keep client-specific names only in evidence, never in reusable framework labels.
10. Add a decision-needed card wherever the roadmap depends on team alignment.

## Layout Data To Capture During Future Crawls

The crawler should capture:

- Page names
- Top-level sections
- Section bounds
- Section fills
- Section child counts
- Child node types
- Text samples
- Sticky sizes
- Shape sizes
- Diagram node sizes
- Connector presence
- Repeated spatial patterns
- Repeated color patterns
- Repeated title/body typography

This is separate from content extraction. Content tells us what to say; layout tells us how to present it.

