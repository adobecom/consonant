# Q1 Retro and Learnings Framework

## Retro Structure: Start, Stop, Continue

### 🟢 Start (What should we begin doing?)

**Questions to ask:**
- What's missing that would accelerate the north star work?
- What processes/tools would help?
- What would make the workflow smoother?

**Examples to prompt discussion:**
- Educational videos/documentation (Dakota's note)
- C2 Page Templates (Takahiro's note - Josh's request)
- More atomic component examples
- Better Figma MCP documentation
- Automated guardrail checks in CI

---

### 🔴 Stop (What should we stop doing?)

**Questions to ask:**
- What's slowing us down?
- What manual work should be automated?
- What processes aren't working?

**Examples to prompt discussion:**
- Manual token coordination
- Rebuilding components from scratch
- Ad-hoc guardrail checks
- One-off handoffs without contracts

---

### 🟡 Continue (What's working well?)

**Questions to ask:**
- What should we keep doing?
- What processes are effective?
- What tools/approaches are paying off?

**Examples to prompt discussion:**
- Demo approach (proving concept with partial system)
- Guardrail documentation structure
- Story UI iteration process
- Component-first thinking

---

## Key Areas to Retro On

### 1. **Guardrail-Driven Workflow**
- How well did the guardrails work?
- What guardrails are missing?
- Were the docs (`docs/guardrails/`, `story-ui-docs/`) sufficient?
- What would make guardrails more effective?

### 2. **Token Pipeline**
- How smooth was the s2a-tokens workflow?
- Where did drift/delays happen?
- What would improve token handoff?
- Are tokens ready for MCP consumption?

### 3. **Component Development**
- Button + Product Lockup: What worked? What didn't?
- How easy was it to make components atomic?
- What made FigmaLint validation easier/harder?
- What components should we prioritize next?

### 4. **Demo/Proof of Concept**
- Did the demo effectively show the concept?
- What was most convincing?
- What gaps did the demo reveal?
- What would make the demo stronger?

### 5. **AI/MCP Integration**
- How well did Figma MCP work?
- Story UI: What prompts worked best?
- What context was missing?
- How many iterations were needed? (Too many? Just right?)

### 6. **Documentation & Enablement**
- What docs were most useful?
- What's missing?
- Educational videos (Dakota's note) - what topics?
- How can we make onboarding easier?

### 7. **Cross-Functional Collaboration**
- How was the handoff between design/engineering?
- Where did communication break down?
- What would improve collaboration?
- Who needs to be involved earlier?

---

## Q1 Wins (Celebrate!)

**What went well:**
- [ ] Built atomic components (Button, Product Lockup)
- [ ] Created guardrail documentation
- [ ] Proved the workflow with demo
- [ ] Established token pipeline foundation
- [ ] Created north star presentation
- [ ] [Add your wins]

---

## Q1 Challenges (Learn from)

**What was hard:**
- [ ] Non-atomic components made demo harder
- [ ] Token coordination required manual work
- [ ] Missing guardrails in some areas
- [ ] [Add your challenges]

**What we learned:**
- [ ] Atomic foundation is critical
- [ ] Guardrails need to be in CI
- [ ] [Add your learnings]

---

## Q2 Wishlist (Connect to Roadmap)

**From retro → Q2 priorities:**

1. **Educational Videos** (Dakota's note)
   - What topics? (Guardrails? Token pipeline? Story UI?)
   - Where should they live?
   - Who creates them?

2. **C2 Page Templates** (Takahiro's note - Josh's request)
   - How does this fit into the north star?
   - What blocks should be included?
   - How do templates use the atomic components?

3. **Guardrail CI Enforcement**
   - Block violations in CI
   - Automated checks
   - What gates are needed?

4. **More Atomic Components**
   - What's next? (Based on redesign needs)
   - How do we prioritize?

5. **Better MCP/Story UI Context**
   - What docs are missing?
   - How can we improve prompts?

---

## Retro Questions for Team

### For Designers:
- What would make Figma → Code handoff smoother?
- Are the guardrails clear enough?
- What components do you need most?

### For Engineers:
- What would make Storybook → Milo handoff easier?
- Are the specs clear enough?
- What automation would help most?

### For Product/PM:
- What would make the workflow more predictable?
- What metrics matter most?
- What blockers need to be removed?

---

## Action Items Template

**From retro → action items:**

| Learning | Action | Owner | Timeline |
|----------|--------|-------|----------|
| Educational videos are useful | Create video on [topic] | [Name] | [Date] |
| C2 Page Templates needed | Define template structure | [Name] | [Date] |
| Guardrails need CI enforcement | Set up lint rules | [Name] | [Date] |
| [Add more] | | | |

---

## Retro Facilitation Tips

1. **Time-box each section** (Start/Stop/Continue: 15 min each)
2. **Use sticky notes** (one idea per note)
3. **Group similar ideas** after everyone contributes
4. **Vote on priorities** (dot voting on most important items)
5. **Connect to Q2 roadmap** (make sure learnings inform planning)
6. **Assign owners** (every action item needs an owner)
7. **Follow up** (schedule check-in on action items)

---

## Questions to Close the Retro

1. **What's the #1 thing we should focus on in Q2?**
2. **What's the biggest risk to the north star?**
3. **What would make the biggest difference if we fixed it?**
4. **Who needs to be involved that isn't yet?**
