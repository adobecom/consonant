# Q2 Wishlist - North Star Acceleration

> What would make the biggest difference in Q2 to advance the compiler-style design system?

---

## 🎯 Top Priority Wishes

### 1. **Guardrail CI Enforcement**
**What:** Automated lint rules that block PRs if guardrails are violated  
**Why:** Without enforcement, guardrails are just suggestions. CI makes them non-negotiable.  
**Impact:** Prevents drift, ensures quality, makes automation credible  
**Effort:** Medium (need to write rules, integrate with CI)  
**Owner:** Design System team + Platform engineering

---

### 2. **Complete Atomic Component Library**
**What:** 5-10 core atomic components (Button ✅, Product Lockup ✅, plus: Input, Card, Tag, Icon, Link, etc.)  
**Why:** Demo showed we need more building blocks. Can't build molecules without atoms.  
**Impact:** Enables faster block generation, proves the system works  
**Effort:** High (but can be parallelized)  
**Owner:** DS Design + Design Engineer

---

### 3. **Educational Video Series**
**What:** Short videos (5-10 min) on: Guardrails, Token Pipeline, Story UI workflow, Component contracts  
**Why:** Dakota's note - "super useful to be able to embed on any page or share via Slack"  
**Impact:** Reduces onboarding time, enables self-service, scales knowledge  
**Effort:** Medium (scripting + recording)  
**Owner:** Docs/DevEx lead

---

### 4. **C2 Page Templates** (Josh's request via Takahiro)
**What:** Pre-made page templates with frequently used blocks  
**Why:** Accelerates authoring, shows system in action, reduces decision fatigue  
**Impact:** Faster page creation, better consistency, proves value  
**Effort:** Medium (need to define templates, build examples)  
**Owner:** DS Design + Milo partner

---

## 🚀 Automation & Tooling Wishes

### 5. **Figma MCP Auto-Sync**
**What:** Automated sync from Figma Variables → s2a-tokens (no manual coordination)  
**Why:** Current state: "every drop requires manual coordination, so drift and delays creep in"  
**Impact:** Eliminates drift, speeds up token updates, reduces manual work  
**Effort:** High (requires Figma API integration)  
**Owner:** Token pipeline lead + Platform engineering

---

### 6. **Story UI Prompt Library**
**What:** Curated, tested prompts for common block patterns (hero, cards, CTAs, etc.)  
**Why:** Demo showed iteration is needed. Pre-tested prompts = faster generation  
**Impact:** Reduces prompt iterations, improves output quality, enables self-service  
**Effort:** Low-Medium (documentation + testing)  
**Owner:** Design Engineer + Docs lead

---

### 7. **Component Spec Generator**
**What:** Tool that generates YAML specs from Figma components (via MCP)  
**Why:** Manual spec writing is slow. Automation = faster component onboarding  
**Impact:** Speeds up component creation, ensures consistency, reduces errors  
**Effort:** High (requires MCP integration + spec generation logic)  
**Owner:** Design Engineer + Architect

---

### 8. **Telemetry MVP**
**What:** Basic tracking of: which blocks/components are used, variant usage, adoption metrics  
**Why:** "We can't measure design-system adoption today" - need data for governance  
**Impact:** Enables data-driven decisions, shows ROI, identifies gaps  
**Effort:** Medium (requires Milo integration + dashboard)  
**Owner:** Platform engineering + DS team

---

## 📚 Documentation & Enablement Wishes

### 9. **Component Playground**
**What:** Interactive Storybook environment where designers/PMs can experiment  
**Why:** Enables safe experimentation, reduces "can we do X?" questions  
**Impact:** Faster ideation, better understanding of system capabilities  
**Effort:** Medium (enhance existing Storybook)  
**Owner:** Design Engineer + Docs lead

---

### 10. **Migration Guide: C1 → C2**
**What:** Step-by-step guide for converting Consonant 1 blocks to C2  
**Why:** Need clear path for existing content, supports deprecation plan  
**Impact:** Enables systematic migration, reduces risk, speeds adoption  
**Effort:** Medium (documentation + examples)  
**Owner:** Docs lead + Design Engineer

---

### 11. **Designer-Facing Component Docs**
**What:** Figma-based documentation showing: variants, usage, token bindings, constraints  
**Why:** Designers need to understand components in their tool, not just code  
**Impact:** Better design decisions, fewer handoff issues, self-service  
**Effort:** Medium (Figma plugin or frames)  
**Owner:** DS Design + Figma builder

---

## 🔧 Process & Workflow Wishes

### 12. **Formalized Handoff Process**
**What:** Clear checklist/contract for each phase (Design → FigmaLint → MCP → Storybook → Milo)  
**Why:** "Every handoff is bespoke" - need standardization  
**Impact:** Predictable workflow, fewer blockers, faster delivery  
**Effort:** Low (documentation + templates)  
**Owner:** System Architect + Process lead

---

### 13. **Weekly Design System Office Hours**
**What:** Open session for questions, demos, feedback on components/workflow  
**Why:** Reduces ad-hoc questions, builds community, surfaces issues early  
**Impact:** Better communication, faster problem-solving, increased adoption  
**Effort:** Low (just time commitment)  
**Owner:** DS team (rotating)

---

### 14. **Component Request Queue**
**What:** Public backlog of component requests with prioritization criteria  
**Why:** Transparent prioritization, reduces "when will X be ready?" questions  
**Impact:** Better planning, stakeholder alignment, clear expectations  
**Effort:** Low (GitHub issues or similar)  
**Owner:** System Architect

---

## 🎨 Design System Foundation Wishes

### 15. **Token Coverage Audit**
**What:** Automated check: which tokens are used, which are missing, which are deprecated  
**Why:** Need visibility into token health, identify gaps, prevent drift  
**Impact:** Better token management, identifies needs, prevents issues  
**Effort:** Medium (scripting + reporting)  
**Owner:** Token pipeline lead

---

### 16. **Component Dependency Graph**
**What:** Visual map showing: which components depend on which, build order, impact analysis  
**Why:** "Order work bottom-up so molecules reuse approved atoms" - need visibility  
**Impact:** Better planning, prevents blockers, shows relationships  
**Effort:** Medium (tooling + visualization)  
**Owner:** Design Engineer

---

### 17. **Accessibility Test Suite**
**What:** Automated a11y checks that run on every component/block  
**Why:** "Storybook guardrails run a11y/visual checks" - need comprehensive coverage  
**Impact:** Catches issues early, ensures compliance, builds confidence  
**Effort:** Medium (test setup + CI integration)  
**Owner:** Design Engineer + A11y DRI

---

## 🏗️ Infrastructure Wishes

### 18. **Milo Integration Sandbox**
**What:** Isolated environment for testing Milo blocks before production  
**Why:** Need safe space to test, reduces risk, enables experimentation  
**Impact:** Faster iteration, fewer production issues, better testing  
**Effort:** Medium (environment setup)  
**Owner:** Milo/Platform team

---

### 19. **Design Token Versioning Dashboard**
**What:** Visual tool showing: token versions, migration paths, breaking changes  
**Why:** Need to track token evolution, manage migrations, prevent breakage  
**Impact:** Safer updates, clear migration paths, better planning  
**Effort:** High (dashboard + versioning system)  
**Owner:** Token pipeline lead + Platform engineering

---

### 20. **Storybook Visual Regression Testing**
**What:** Automated visual diffs for all component variants  
**Why:** "Visual regression" mentioned in workflow - need automation  
**Impact:** Catches visual drift, ensures parity, builds confidence  
**Effort:** Medium (tooling setup + CI integration)  
**Owner:** Design Engineer + Platform engineering

---

## 💡 "Nice to Have" Wishes

### 21. **Component Usage Analytics**
**What:** Track which components are used where, how often, in what contexts  
**Why:** Data-driven component decisions, identify unused components  
**Impact:** Better prioritization, identifies gaps, shows value  
**Effort:** High (requires telemetry + analytics)

---

### 22. **AI-Powered Component Suggestions**
**What:** Story UI suggests components based on design intent  
**Why:** Accelerates discovery, reduces learning curve  
**Impact:** Faster ideation, better component usage  
**Effort:** High (requires ML/AI work)

---

### 23. **Design System Health Score**
**What:** Dashboard showing: token coverage, component completeness, guardrail compliance  
**Why:** At-a-glance system health, identifies issues early  
**Impact:** Proactive management, clear metrics, better planning  
**Effort:** Medium (dashboard + metrics)

---

## 🎯 Prioritization Framework

**Rate each wish by:**
- **Impact:** High / Medium / Low
- **Effort:** High / Medium / Low
- **Dependencies:** What needs to exist first?
- **Q2 Alignment:** Does it support Q2 goals?

**Q2 Focus Areas:**
1. Guardrail GA + Atomic Kits
2. Milo Production Loop prep
3. Redesign intake support

**Top 5 for Q2 (recommended):**
1. Guardrail CI Enforcement (#1)
2. Complete Atomic Component Library (#2)
3. Educational Video Series (#3)
4. C2 Page Templates (#4)
5. Story UI Prompt Library (#6)

---

## 📝 How to Use This Wishlist

1. **Review with team** - What's missing? What's not needed?
2. **Prioritize** - Use impact/effort matrix
3. **Assign owners** - Each wish needs an owner
4. **Connect to roadmap** - How do wishes support Q2 goals?
5. **Track progress** - Update quarterly

---

_Last updated: Q1 2026_
