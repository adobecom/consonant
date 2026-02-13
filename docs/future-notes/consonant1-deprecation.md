# Deprecating Consonant 1 Blocks (Future Notes)

These notes capture early thinking about how to retire Consonant 1 once Consonant 2 + Milo guardrails are production ready. Use this as a parking lot for risks, decisions, and owners as the roadmap matures.

## Goal

Run Consonant 1 and Consonant 2 in parallel long enough to migrate high-value pages, then formally turn off C1 blocks without breaking Milo experiences or design parity.

## Assumptions

- C2 guardrail loop (Figma → `s2a-tokens` → Story UI → Milo) is stable and delivers atomic components for all tier-1 blocks.
- Milo platform can load both block libraries during the overlap period.
- Design + engineering bandwidth exists for audits, migration plans, and QA.

## Key Questions To Answer

1. **Inventory:** What C1 blocks are still referenced in Milo? Capture code pointers + owning teams.
2. **Parity:** Do we have a C2 equivalent (or better) for each C1 block? If not, what is missing?
3. **Telemetry:** How do we detect C1 usage at runtime so we know when we can turn it off?
4. **Migration Windows:** Can we schedule page-level migrations per BU, or do we need a global cutover?
5. **Governance:** Who has authority to block new C1 usage once C2 is GA?

## Proposed Phases

1. **Audit + Mapping (Pre-Q4 2026)**
   - Generate C1 block inventory from Milo repo + telemetry.
   - Create mapping doc: `C1 block → C2 replacement` with parity notes and blockers.
   - Decide on “no new C1 blocks” gate.

2. **Dual Run / Feature Flags (Q4 2026)**
   - Load both libraries in Milo staging.
   - Allow teams to opt into C2 via feature flags or YAML config.
   - Measure layout drift via Storybook visual regression + Milo overlay tools.

3. **Migration Sprints (Q1 2027)**
   - Prioritize top traffic pages/components.
   - Provide scripts/CLI to swap YAML + tokens automatically.
   - Guardrail lint rejects C1 imports in new code paths.

4. **Sunset (Post-Q1 2027)**
   - Remove C1 packages from Consonant repo + Milo build once telemetry shows <5% usage.
   - Archive documentation with clear “read-only” banner.
   - Communicate final cutoff to Design Ops, Milo, and stakeholder teams.

## Risks / Mitigations

- **Partial Parity:** Some C1 patterns may not exist in C2 yet. Mitigate by creating temporary shims or prioritizing missing atoms.
- **Runtime Debt:** Running both block libraries doubles CSS/JS payload. Mitigate with per-page flags and bundling analysis.
- **Org Adoption:** Teams may ignore C2 unless forced. Mitigate with governance (no-primitives lint, design review checklists, leadership OKRs).

## Open Tasks

- [ ] Define telemetry hooks to tag C1 vs C2 blocks in Milo.
- [ ] Draft communication plan with Product Ops (who informs BUs?).
- [ ] Align with Storybook team on how/when C1 stories become read-only.
- [ ] Create deprecation checklist template (owner, pages, QA sign-off).

_Add more notes here as the roadmap evolves._
