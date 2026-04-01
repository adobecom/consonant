# S2A Design System MCP — Roadmap

**Status:** Proposed
**Owner:** TBD
**Last updated:** 2026-03-27

---

## What this is

A local-first MCP server (`s2a-ds-mcp`) that makes the S2A design system a queryable, enforceable API for any AI agent or IDE extension. It reads from existing build artifacts — no new pipeline needed.

The MCP converts the design system from a **reference** into an **enforcer**. Every engineer, every AI tool, every CI job gets the same system knowledge without having to discover it from scratch.

---

## Business case

### The core problem

The design system is only as valuable as how consistently it gets used. Every engineer and every AI tool that touches the codebase has to discover the system from scratch, every session, every PR. That discovery cost compounds across every person, every day.

**The micro-decision tax:** Every engineer writing a component makes a series of decisions — which token for this background, does a component exist for this pattern, is this spacing value a token or a magic number? Each takes 30 seconds to 2 minutes. At 50 engineers doing this 10 times a day, that's 8–17 engineer-hours lost to lookup and discovery daily.

**The wrong-decision tax:** A hardcoded `#1473e6` means the component won't respond to dark mode. A one-off `padding: 12px` instead of `var(--s2a-spacing-sm)` means a manual update when the spacing token changes. These are the class of bug that design system teams spend most of their review bandwidth catching — after the work is already done.

---

### Value by audience

#### Engineering leadership
- Fewer design review cycles per component (current: 2–3 rounds catching token violations; target: 0–1)
- CI gate on token compliance means violations never reach review
- New engineer onboarding: "learn the token system over 2 weeks" → "ask the agent, get the right answer on day 1"

#### Design system team
- Engineers stop filing "which token should I use for X" questions
- Component anatomy and usage docs become machine-readable — the spec doesn't just live in Figma, it's queryable by any AI tool
- Breaking changes in a token release are flagged in CI automatically before consuming teams hit them
- Feedback loop: log which tokens get searched for that don't exist (gap signal), which validations fail most (documentation failure signal)

#### Product teams consuming the system
- Faster to use the correct token than a hardcoded value — the right answer is one tool call away
- AI-assisted development (Cursor, Claude Code, Copilot) generates compliant code the first time
- No "fix the tokens" round trip. No "this doesn't match the spec" feedback after implementation

#### Designers
- `diff_design_vs_code` makes the gap between Figma spec and shipped code visible and measurable
- Component anatomy sheets built in Figma feed directly into the MCP — the spec you write becomes the spec the AI coding agent reads
- Design intent doesn't stop at a handoff document; it becomes part of how the code gets written

#### The organization
- Consistency at scale is a competitive advantage — the MCP is infrastructure for that
- AI-assisted development is the direction the industry is moving. Organizations with machine-readable design systems will ship faster and more consistently than those without
- The MCP is the mechanism that makes S2A AI-native

---

### Investment vs. return

| | |
|---|---|
| **Investment** | One-time build (4 weeks, phased), ~2hrs/week maintenance |
| **Per engineer** | ~30min/day saved in lookup + decision overhead |
| **Per PR** | 1–2 fewer review cycles on token violations |
| **Per onboard** | 1–2 weeks faster ramp on design system knowledge |
| **Risk reduction** | Zero hardcoded values in new code; breaking token changes caught before release |
| **Multiplier** | Every new AI tool engineers adopt gets S2A knowledge for free — the MCP is the integration point |

---

## Technical spec

### Package

```
Name:     @adobecom/s2a-ds-mcp
Location: apps/s2a-ds-mcp/
Stack:    TypeScript, @modelcontextprotocol/sdk, Zod
          (same stack as apps/figma-console-mcp)
Modes:    stdio (Claude Code, Cursor) / HTTP+SSE (remote agents, CI)
```

### Repository location

```
apps/s2a-ds-mcp/
├── src/
│   ├── index.ts              # Entry: registers all tool groups
│   ├── local.ts              # stdio mode (Claude Code / NPX)
│   ├── server.ts             # HTTP/SSE mode (remote)
│   ├── cache.ts              # File-watch + TTL cache
│   ├── tools/
│   │   ├── tokens.ts         # Token resolution + search
│   │   ├── components.ts     # Component inventory + schema
│   │   ├── validate.ts       # Code + design linting
│   │   ├── figma-bridge.ts   # Figma node ↔ component mapping
│   │   ├── scaffold.ts       # Code generation + templates
│   │   └── changelog.ts      # Breaking change + version diffs
│   ├── loaders/
│   │   ├── token-loader.ts   # Reads packages/tokens/json/*.json
│   │   ├── css-loader.ts     # Reads packages/tokens/css/**/*.css
│   │   └── component-loader.ts
│   └── types.ts
└── wrangler.jsonc            # Cloudflare deployment config
```

### Data sources (read-only)

| Source | Powers |
|---|---|
| `packages/tokens/json/*.json` | Token resolution, search, type info |
| `packages/tokens/css/dev/*.css` | CSS variable names, values per breakpoint |
| `packages/components/src/**/*.js` | Prop schemas, defaults, slot structure |
| `packages/components/src/**/*.css` | Token usage per component |
| `docs/components/*.md` | Usage rules, do/don't |
| `apps/storybook/stories/*.stories.js` | Story variants as examples |

---

## Tool inventory

### Group 1 — Tokens

#### `resolve_token`
Resolve a token name to its values across all modes.

```
Input:  { token: string }
        e.g. "s2a/color/background/default"

Output: {
  name, cssVar, type,
  values: { light?, dark?, desktop?, mobile?, tablet? },
  description?, designOnly, figmaCodeSyntax?
}
```

#### `search_tokens`
Fuzzy search across token names, CSS vars, descriptions, and hex values.

```
Input:  { query, type?, collection?, limit? }
Output: TokenResult[]  — sorted by relevance
```

#### `get_token_collection`
All tokens in a collection with full values.

```
Input:  { collection: string }
Output: { tokens, count, modes }
```

#### `check_token_exists`
Does this token exist and ship in CSS output?

```
Input:  { token: string }
Output: { exists, cssVar?, reason? }
        reason: "not found" | "design-only — not in CSS output" | "deprecated"
```

#### `get_token_aliases`
Find all tokens that reference a given primitive.

```
Input:  { primitive: string }  e.g. "spacing.16"
Output: { aliases, count }
```

---

### Group 2 — Components

#### `get_component`
Full schema — props, variants, CSS tokens used, Figma node ID.

```
Input:  { name: string }  e.g. "RouterCard" or "router-card"

Output: {
  name, cssClass, figmaNodeId, figmaFileKey,
  props, variants, dataAttributes, tokensUsed,
  slots, cssSource, jsSource, storyUrl, docs?
}
```

#### `list_components`
Full inventory with summary info.

```
Input:  { filter?: string }
Output: { components: ComponentSummary[], count }
```

#### `find_component_for_use_case`
Given a description of what you're building, return the right component(s).

```
Input:  { description: string }
Output: { matches: [{ component, confidence, reason }] }
```

#### `get_component_tokens`
All tokens a component uses, with resolved values and where they're used.

```
Input:  { name: string }
Output: { tokens: [{ cssVar, tokenPath, usedIn, resolvedValue }] }
```

---

### Group 3 — Validation

#### `validate_css`
Lint a CSS snippet against design system rules.

```
Input:  { css: string, strict?: boolean }

Output: {
  valid, score (0–100),
  violations: [{
    line, type, value, suggestion?, severity
  }]
}

Violation types:
  hardcoded-hex | hardcoded-px | unknown-token |
  non-token-color | raw-font-size
```

#### `validate_component_usage`
Check that a component is used with valid prop combinations.

```
Input:  { component: string, props: Record<string, unknown> }
Output: { valid, errors, warnings }
```

#### `check_token_in_css`
Given a CSS file path, flag missing, deprecated, or hardcoded values.

```
Input:  { filePath: string }
Output: { found, missing, deprecated, hardcoded }
```

---

### Group 4 — Figma Bridge

#### `get_figma_mapping`
Map a Figma node ID to its code component.

```
Input:  { nodeId: string }  e.g. "4006:461133"
Output: { nodeId, component?, cssClass?, storyUrl?, unmapped }
```

#### `get_component_figma_node`
Reverse — find the Figma node ID for a code component.

```
Input:  { name: string }
Output: { nodeId, figmaUrl, figmaFileKey }
```

#### `diff_design_vs_code`
Compare Figma token values for a component against its CSS. Surface parity gaps.

```
Input:  { component: string }

Output: {
  inSync,
  gaps: [{
    property, figmaToken, figmaValue,
    codeToken, codeValue
  }]
}
```

---

### Group 5 — Scaffolding

#### `scaffold_component`
Generate a new component following S2A conventions.

```
Input:  { name, figmaNodeId?, tokens?, variants? }

Output: {
  css,        — BEM structure, token-wired
  js,         — Lit html functional component
  indexJs,
  storiesJs,
  cssClass
}
```

#### `get_component_template`
Return canonical boilerplate for a given component pattern.

```
Input:  { pattern: "card" | "button" | "media" | "lockup" | "list-item" }
Output: { css, js, description }
```

---

### Group 6 — Changelog & Governance

#### `get_token_changelog`
What changed between two token package versions.

```
Input:  { from: string, to?: string }  e.g. "0.0.11", "0.0.12"
Output: { added, removed, changed, breakingChanges }
```

#### `check_breaking_changes`
Given tokens used in a file, flag any removed or renamed in a target version.

```
Input:  { tokensUsed: string[], targetVersion: string }
Output: { safe, broken, replacements }
```

---

## MCP Resources

Read-only documents agents can fetch directly (no tool call needed):

```
s2a-ds://tokens/semantic-colors          full semantic color token tree (JSON)
s2a-ds://tokens/spacing                  spacing scale
s2a-ds://tokens/typography               type scale
s2a-ds://components/{name}/css           raw CSS source
s2a-ds://components/{name}/js            raw JS source
s2a-ds://components/{name}/docs          markdown usage doc
s2a-ds://guidelines/do-dont              full do/don't usage rules
s2a-ds://changelog                       full CHANGELOG.md
```

---

## Caching

All data is cached in memory with file-watch invalidation.

- Cold start (first call): ~200ms to load all tokens + component CSS
- Warm calls: <5ms
- TTL fallback: 30s local dev, 5min CI

---

## Error conventions

Every tool returns a consistent shape, never throws:

```ts
{
  success: false,
  error: "token_not_found" | "component_not_found" | "parse_error" | "file_not_found",
  message: string,
  suggestion?: string
}
```

---

## Integration

### Claude Code (`.claude/settings.json`)

```json
{
  "mcpServers": {
    "s2a-ds": {
      "command": "node",
      "args": ["apps/s2a-ds-mcp/dist/local.js"],
      "env": { "DS_ROOT": "/path/to/consonant-2" }
    }
  }
}
```

### Once published (NPX)

```json
{
  "command": "npx",
  "args": ["-y", "@adobecom/s2a-ds-mcp"],
  "env": { "DS_ROOT": "." }
}
```

### CI (GitHub Actions)

```yaml
- name: Validate token usage
  run: npx @adobecom/s2a-ds-mcp validate --file packages/components/src/**/*.css
```

---

## Hosting options

### Recommendation: start local, then deploy to Cloudflare

Build and validate the server locally first (Option A). Once it's useful, promote to Cloudflare Workers (Option B) for team-wide access — the repo already has everything needed for that deploy. Don't spend time on infrastructure before the tool is working.

---

### Option A — Local stdio (start here, free, zero infrastructure)
Runs as a child process via Claude Code's MCP config. No server, no port, no auth, no deploy. The `figma-console-mcp` already uses this exact pattern with `src/local.ts`.

```json
// .claude/settings.json
{
  "mcpServers": {
    "s2a-ds": {
      "command": "node",
      "args": ["apps/s2a-ds-mcp/dist/local.js"],
      "env": { "DS_ROOT": "/path/to/consonant-2" }
    }
  }
}
```

**Best for:** Individual developer sessions, local Cursor/Claude Code. The right default until the team needs shared access.

---

### Option B — Cloudflare Workers (free, team-wide)
`figma-console-mcp` already has `wrangler.jsonc` and the full Worker setup. The DS MCP becomes a second Worker, same pattern.

```
URL:   https://s2a-ds-mcp.{subdomain}.workers.dev
Cost:  Free tier — 100,000 requests/day, no credit card required
Auth:  DS_API_KEY env var, checked in the Worker's fetch() handler
```

**The one constraint:** Cloudflare Workers have no filesystem access. Token JSON and component CSS can't be read from disk at runtime. Two ways to handle this:

**Approach 1 — Bundle at deploy time (simpler to build first)**
A pre-deploy script reads all token JSON files and component CSS from the repo, serializes them into a generated TypeScript module, and bundles them into the Worker. Tokens are "baked in" at deploy. Add the deploy step to your existing token build pipeline so the Worker stays current automatically.

```js
// scripts/bundle-ds-data.js — runs before wrangler deploy
// reads packages/tokens/json/*.json + packages/components/src/**/*.{js,css}
// writes src/ds-data.generated.ts into the Worker bundle
```

**Approach 2 — Fetch from GitHub at runtime (always current)**
The Worker fetches token JSON directly from GitHub's raw content URLs with a 5-minute Cloudflare cache. No redeploy needed when tokens change — the Worker picks up updates automatically on the next cache miss.

```ts
const tokens = await fetch(
  'https://raw.githubusercontent.com/adobecom/consonant/main/packages/tokens/json/s2a-semantic-color-theme-...light.json',
  { cf: { cacheTtl: 300 } }
).then(r => r.json());
```

Start with Approach 1 (simpler), migrate to Approach 2 if you want zero-redeploy freshness.

**Deploy:**
```bash
cd apps/s2a-ds-mcp
wrangler deploy
```

**Starting point:** Copy `apps/figma-console-mcp/wrangler.jsonc` as the base config — the Worker architecture is identical.

**Best for:** Shared team access, remote AI tools, CI pipelines.

---

### Option C — Railway / Fly.io (not needed unless you add write tools)
Only relevant if the server needs persistent state or long-running jobs — e.g. if mutation tools are added later (writing token suggestions back to Figma, watching files across sessions). Railway's free tier was removed in 2023; Fly.io has a free allowance (3 shared VMs).

**Skip this until there's a specific reason to need it.**

---

### Option D — GitHub Actions sidecar (CI enforcement only)
No persistent server. Run `validate_css` and `check_breaking_changes` as job steps in your PR workflow. The MCP binary becomes a CLI.

```yaml
- name: Validate token usage
  run: npx @adobecom/s2a-ds-mcp validate --file packages/components/src/**/*.css
```

This is Phase 3 of the build plan, not a hosting decision.

---

## Build phases

### Phase 1 — Token tools (Week 1)
`resolve_token`, `search_tokens`, `check_token_exists`, `get_token_aliases`
stdio mode only. No CI integration yet.

**Done when:** Any Claude Code session in the repo can answer "what's the CSS var for s2a/spacing/md" without reading a file.

---

### Phase 2 — Component tools (Week 2)
`get_component`, `list_components`, `find_component_for_use_case`, `get_component_tokens`

**Done when:** Any agent knows the full component inventory and can return prop schemas, CSS source, and Figma node IDs on demand.

---

### Phase 3 — Validation + CI gate (Week 3)
`validate_css`, `check_token_in_css`, `validate_component_usage`
Wire `validate_css` into GitHub Actions as a required check.

**Done when:** PRs with hardcoded hex or unknown tokens are blocked before review.

---

### Phase 4 — Figma bridge + team deploy (Week 4)
`get_figma_mapping`, `diff_design_vs_code`, `get_component_figma_node`
Cloudflare Worker deploy. Team-wide access.

**Done when:** Any team member's AI tool has S2A knowledge. Designers can request a parity check at handoff.

---

### Phase 5 — Scaffolding + governance (Later)
`scaffold_component`, `get_token_changelog`, `check_breaking_changes`
MCP resource endpoints.

**Done when:** New components are scaffolded to spec automatically. Token upgrades have automated impact analysis before release.

---

## Success metrics

| Metric | Baseline | Target |
|---|---|---|
| Design review cycles per component | 2–3 | 0–1 |
| Hardcoded values caught in PR | Manual review | CI automated |
| Time to first correct token usage (new engineer) | ~2 weeks | Day 1 |
| "Which token" questions to DS team | Ongoing | Measurable drop |
| Parity gaps caught before ship | Sporadic | Every PR |
