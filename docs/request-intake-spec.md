# S2A Request Intake — Minimal Spec

**Goal:** anyone can request a token / component / change from inside Figma; the DS team approves or denies; approved requests become linked, tracked work. **No custom database** — GitHub Issues *is* the store and the state machine.

## The flow

```
Plugin "Request" tab ──POST──▶ Worker ──▶ GitHub issue  (labels: s2a-request, needs-triage)
                                                │
                                       team triages: add label
                                    ┌───────────┴────────────┐
                              "approved"                 "declined"
                                    │                         │
                     Action: create linked Jira    Action: close w/ reason
                     ticket + add to roadmap board  + notify requester
```

Every state is a **label on the issue**. No separate storage, no admin UI to build.

---

## Piece 1 — GitHub Issue Form (`.github/ISSUE_TEMPLATE/s2a-request.yml`)

The schema *and* a zero-install fallback (people without the plugin file it on github.com; the plugin just pre-fills the same fields).

```yaml
name: S2A Request
description: Request a token, component, or change to the S2A design system
title: "[Request]: "
labels: ["s2a-request", "needs-triage"]
body:
  - type: dropdown
    id: kind
    attributes:
      label: What are you requesting?
      options: [New token, Token change, New component, Component change, Bug]
    validations: { required: true }
  - type: textarea
    id: summary
    attributes: { label: What do you need?, placeholder: One or two sentences. }
    validations: { required: true }
  - type: textarea
    id: use_case
    attributes: { label: Use case — why, and where is it used? }
    validations: { required: true }
  - type: dropdown
    id: priority
    attributes: { label: Priority, options: [Nice to have, Needed soon, Blocking] }
  - type: input
    id: figma
    attributes: { label: Figma link (node URL) }
  - type: textarea
    id: context
    attributes: { label: Screenshot / extra context }
```

## Piece 2 — Plugin "Request" tab (the smart front door)

This is where the plugin earns its keep: it **auto-captures Figma context** a generic form can't. On the current selection it grabs:

| Captured automatically | Source |
|---|---|
| Node name + type | `figma.currentPage.selection[0]` |
| Deep-link node URL | `figma.com/design/{fileKey}/…?node-id={id}` |
| File key + name + page | `figma.fileKey`, `figma.root.name`, `figma.currentPage.name` |
| Requester | `figma.currentUser.name` |
| Bound token (if on one) | the node's `boundVariables` → variable name |
| Screenshot *(optional, v2)* | `node.exportAsync({ format: 'JPG' })` → base64 |

Plus the form fields (kind / summary / use case / priority). On submit → `POST` to the Worker:

```jsonc
{ "kind": "New token", "summary": "...", "useCase": "...", "priority": "Blocking",
  "figmaUrl": "https://figma.com/design/…?node-id=…", "fileName": "…", "page": "…",
  "nodeName": "…", "tokenName": "s2a/color/…", "requester": "Jane D." }
```
Response `{ url, number }` → show "Filed as #123 ↗" in the panel. Add the Worker's domain to the plugin `manifest.json` `networkAccess.allowedDomains`.

## Piece 3 — Worker endpoint (holds the GitHub credential so users need no GitHub account)

Cloudflare Worker or Vercel function — ~30 lines:

```js
export default {
  async fetch(req, env) {
    if (req.method !== "POST") return new Response("POST only", { status: 405 });
    if (req.headers.get("x-intake-secret") !== env.INTAKE_SECRET) return new Response("no", { status: 401 });
    const p = await req.json();
    const body = [
      `**Requested by:** ${p.requester}`, `**Type:** ${p.kind} · **Priority:** ${p.priority}`,
      ``, `### What`, p.summary, ``, `### Use case`, p.useCase,
      ``, `**Figma:** ${p.figmaUrl}`, p.tokenName ? `**Token:** \`${p.tokenName}\`` : ``,
      `**File / page:** ${p.fileName} › ${p.page}  ·  **Node:** ${p.nodeName}`,
    ].join("\n");
    const r = await fetch(`https://api.github.com/repos/${env.REPO}/issues`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.GH_TOKEN}`, "User-Agent": "s2a-intake", Accept: "application/vnd.github+json" },
      body: JSON.stringify({ title: `[Request] ${p.summary.slice(0, 60)}`, body, labels: ["s2a-request", "needs-triage", p.kind] }),
    });
    const issue = await r.json();
    return Response.json({ url: issue.html_url, number: issue.number });
  },
};
```
`GH_TOKEN` = a GitHub **App installation token** (or fine-grained PAT) with `issues:write` on the repo. `INTAKE_SECRET` = a shared secret the plugin sends so randoms can't spam it.

## Piece 4 — Triage + approved Action (`.github/workflows/request-triage.yml`)

Triage = a human adds `approved` or `declined`. The Action reacts:

```yaml
on: { issues: { types: [labeled] } }
jobs:
  route:
    if: github.event.label.name == 'approved' || github.event.label.name == 'declined'
    runs-on: ubuntu-latest   # (see the Jira caveat below)
    steps:
      - name: Declined → close
        if: github.event.label.name == 'declined'
        run: gh issue close ${{ github.event.issue.number }} --comment "Declined after triage — see thread for rationale."
        env: { GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} }
      - name: Approved → Jira + roadmap
        if: github.event.label.name == 'approved'
        run: |
          # create linked Jira ticket, comment the link, add to the roadmap Project
          # (Jira step depends on the caveat below)
```

## The one real constraint: Jira is internal

`jira.corp.adobe.com` is **not reachable** from GitHub-hosted runners or Cloudflare — same VPN wall we hit with the corp-jira MCP. So the "approved → Jira ticket" hop needs one of:
- a **self-hosted GitHub Actions runner** on the corp network, or
- a tiny **corp-network poller** that watches for `approved` issues and files the Jira ticket (reusing the exact corp-jira PAT setup we already have), commenting the ticket link back.

The **GitHub issue is the source of truth**; the Jira ticket is the delivery mirror, linked by URL/key in both directions.

## MVP vs. later

**v1 (ship first — ~1–2 weeks):** issue form + plugin Request tab + Worker + **GitHub-only** triage (`approved` → roadmap Project + notify; `declined` → close). This already kills the "I don't know how to ask" problem.

**v2:** the **Jira mirror** (once a corp runner/poller exists), **LLM triage** (auto-classify / dedupe against existing issues / draft an assessment), and the **screenshot upload**.

## Effort

| Piece | Effort |
|---|---|
| Issue form (`.yml`) | hours |
| Plugin Request tab | ~2–3 days |
| Worker endpoint | ~1 day |
| Triage Action (GitHub-only) | ~1 day |
| Jira mirror | gated on the corp runner/poller |

**Net:** a real, tracked, approve-gated intake in a week or two — not a quarter — because the tracker *is* the database.
