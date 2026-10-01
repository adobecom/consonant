# The S2A MCP — who it serves, and how

The MCP lets a consumer ask the design system a question **without cloning it**. It
ships a bundled snapshot of the tokens and component specs, so there is nothing to
point at and no repo checkout required.

That is the whole design. **It exists for people who cannot see our repo.**

Diagram: [Agentic S2A board → "The MCP — who it serves, and how"](https://www.figma.com/board/YfKMCRYvZhPbK87aQKE9Qg/Agentic-S2A?node-id=1992-4556)

---

## The question this answers first

> Is it for engineers to render our specs into components and blocks at build time,
> or while they are authoring?

**Authoring.** The MCP is a live server that answers one question at a time, in a
conversation. A build cannot have a conversation — it needs something deterministic,
offline and checksummed.

Build-time consumption is a *different channel*: pull the published package and read
the JSON. Milo already does exactly this for tokens.

---

## Three channels, and the MCP is only one

| | When | What | Agent involved |
|---|---|---|---|
| **1 · Authoring** | engineer is mid-task in their editor | **the MCP** | yes |
| **2 · Build time** | CI or local build | the published packages, read as files | no |
| **3 · CI** | every change | evals + `@adobecom/s2a-validators` as a gate | no |

Channel 2 is how a component or block actually gets built. Channel 1 is how the
person writing it avoids guessing. Channel 3 is how we find out if they drifted.

**Nothing in any channel generates a consumer's component from a contract.** The
contract is a treaty, not a compiler — see `docs/future-notes/` and the Agentic S2A
board for why that is deliberate.

---

## Who it serves, ranked by how much it helps

### 1. Milo engineer — highest value
**Where:** Milo's repo, in Cursor or Claude Code.
**Why:** no S2A checkout, cannot read our tokens or specs. This is the reason the
snapshot is bundled.

Typical asks:
- "Is `--s2a-color-gray-100` a real token?" → `check_token_exists`
- "What is the semantic alias for this primitive?" → `get_token_aliases`
- "Validate this CSS before I open a PR." → `validate_css`

### 2. Forge engineer
**Where:** Forge, on its own stack.
**Why:** same position as Milo, different framework. Needs the contract and the
tokens, not our components.

Typical asks:
- "Give me the contract for Button." → `get_component_spec`
- "What props and states must I support?" → `get_component`
- "Which tokens does this component bind?" → `get_component_tokens`

### 3. Product engineer
**Where:** Storybook and component code.
**Why:** has the repo but not the whole system in their head. Uses it to *check*
work rather than to look things up.

Typical asks:
- "Audit this stylesheet for violations." → `audit_css`
- "Does my markup match the spec?" → `validate_component_usage`
- "Which components already exist for this?" → `find_component_for_use_case`

### 4. The S2A team — lowest value, and that is fine
**Where:** this repo, with Figma open.
**Why:** with repo and Figma access the sources beat the snapshot. Over a full day of
design-system work on this project the MCP was never the fastest answer. Read the
repo, query Figma variables, run the validators package.

If you do reach for it, set `DS_ROOT` so it reads live sources instead of the bundle.

---

## Authoring walkthrough — a Milo engineer, start to finish

**1. Wire it up once**

```json
{
  "mcpServers": {
    "s2a-ds": { "command": "npx", "args": ["-y", "@adobecom/s2a-ds-mcp"] }
  }
}
```

`.mcp.json` for Claude Code, `.cursor/mcp.json` for Cursor. Runs via `npx`, data is
bundled, no repo checkout. Needs a `read:packages` token for `@adobecom` — see the
package README.

**2. Ask instead of guess**

Mid-task the agent calls `resolve_token` or `get_component_spec` and gets the real
value and the real API back, not a plausible guess at a token name.

**3. Check before committing**

`validate_css` or `audit_css` on the file. Primitives used where a semantic belongs,
hardcoded hex, raw px — flagged while it is still cheap to fix.

**4. CI confirms it**

The same rules run again in the gate, from the same `@adobecom/s2a-validators`
package. Nothing new to learn, and no second opinion about what counts as valid.

---

## Where the MCP is the wrong tool

- **Not a build step.** Use the published package (channel 2).
- **Not a code generator.** It returns facts about the system; it does not write
  your component.
- **Not for us, mostly.** Direct access beats the snapshot.

---

## What caps its value today

**It serves what we have, not what we want.** The spec tools answer from 37
hand-written specs, and only 4 have a curated contract behind them. Until coverage
moves, the MCP distributes the artifact the contract system is meant to replace.

**It had drifted.** `validate_css` could not detect primitive tokens at all — the one
thing it is most often told to do — and flagged a component's own local aliases as
unknown. Fixed 2026-09-28 by pointing it at `@adobecom/s2a-validators`. A bug that
specific means nobody was leaning on it.

**The tools it still needs** are contract-aware ones: fetch a component's contract,
and check whether an implementation has drifted from it. That is what a Milo or Forge
engineer actually needs at the moment they are writing code.

---

## Tool reference

Full list in [`apps/s2a-ds-mcp/README.md`](../../apps/s2a-ds-mcp/README.md). Grouped:

- **Tokens** — `resolve_token` · `search_tokens` · `get_token_collection` ·
  `list_token_collections` · `check_token_exists` · `get_token_aliases`
- **Components** — `get_component` · `list_components` · `get_component_tokens` ·
  `find_component_for_use_case`
- **Specs** — `get_component_spec` · `validate_spec` · `list_spec_coverage`
- **Validation** — `validate_css` · `check_token_in_css` · `validate_component_usage`
- **Audit** — `audit_css` · `validate_figma_health`
