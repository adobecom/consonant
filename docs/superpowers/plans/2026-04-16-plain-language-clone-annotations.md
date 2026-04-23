# Plain Language → Panels Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewire the "Generate Blueline (Plain Language)" button to use the panels path (clone + native Figma annotations) instead of the cards path, with a plain-language tone flag threaded through.

**Architecture:** No new functions or message types. Add a `plainLanguage` boolean param to `triggerBluelinePanels` → `generate-blueline-panels` message → `code.ts` handler → `a11y-panels-fill-request` response → `showPanelsFillInstruction`. ~10 lines changed across 2 files.

**Tech Stack:** TypeScript, Figma Plugin API

---

## File Map

| File | Change | What |
|------|--------|------|
| `apps/consonant-specs-plugin/src/ui.ts:705` | Modify | Rewire Plain Language button to call `triggerBluelinePanels(true)` |
| `apps/consonant-specs-plugin/src/ui.ts:708` | Modify | Add `plainLanguage` param to `triggerBluelinePanels()` |
| `apps/consonant-specs-plugin/src/ui.ts:720` | Modify | Pass `plainLanguage` in `generate-blueline-panels` message |
| `apps/consonant-specs-plugin/src/code.ts:1527-1548` | Modify | Read `plainLanguage` from message, pass it back in `a11y-panels-fill-request` |
| `apps/consonant-specs-plugin/src/ui.ts:185-186` | Modify | Pass `plainLanguage` to `showPanelsFillInstruction` |
| `apps/consonant-specs-plugin/src/ui.ts:590` | Modify | Add `plainLanguage` param, append langNote to fill command |

No new files. No changes to the regular Blueline or Panels buttons.

---

### Task 1: Rewire button and thread flag through UI

**Files:**
- Modify: `apps/consonant-specs-plugin/src/ui.ts`

- [ ] **Step 1: Rewire Plain Language button click handler**

Change line 705 from:
```typescript
document.getElementById('generateBluelinePlainBtn')?.addEventListener('click', () => triggerBlueline('copy-plain'));
```
To:
```typescript
document.getElementById('generateBluelinePlainBtn')?.addEventListener('click', () => triggerBluelinePanels(true));
```

- [ ] **Step 2: Add `plainLanguage` param to `triggerBluelinePanels`**

Change line 708 from:
```typescript
function triggerBluelinePanels() {
```
To:
```typescript
function triggerBluelinePanels(plainLanguage = false) {
```

- [ ] **Step 3: Pass `plainLanguage` in the message to code.ts**

Change line 720 from:
```typescript
postToPlugin('generate-blueline-panels', { categories });
```
To:
```typescript
postToPlugin('generate-blueline-panels', { categories, plainLanguage });
```

- [ ] **Step 4: Add `plainLanguage` param to `showPanelsFillInstruction`**

Change line 590 from:
```typescript
function showPanelsFillInstruction(sections: string[], frameName: string, sectionIds: string[]) {
```
To:
```typescript
function showPanelsFillInstruction(sections: string[], frameName: string, sectionIds: string[], plainLanguage = false) {
```

Then change line 592 — prepend langNote to the command string. Change:
```typescript
  const sectionList = sections.join(', ');
  const cmd = `Fill the blueline panels on the current Figma page for "${frameName}". Categories: ${sectionList}.\n\nCall figma_get_blueline_data first — it returns structural data (including nodeIds for all elements) and orchestration instructions. Then call figma_get_knowledge for each agent group to fetch expert knowledge.\n\nDispatch parallel agents. IMPORTANT: Each agent must return items with these additional fields:\n- nodeId (string|null): the node ID from the structural scan that this item refers to. Null if no element match.\n- annotationType ("element"|"region"|"none"): "element" for specific UI elements (buttons, links, inputs), "region" for area-level concepts (landmarks, sections), "none" for abstract/page-level items.\n\nThen call figma_render_blueline with mode: "panels" and all item JSON. The panels have already been scaffolded with cloned designs — the render call will place native Figma annotations on the clones.`;
```
To:
```typescript
  const sectionList = sections.join(', ');
  const langNote = plainLanguage ? ' Use plain language: lead with questions like "What headings does this use?", explain WHY before giving technical detail, include "Why this matters" sections.' : '';
  const cmd = `Fill the blueline panels on the current Figma page for "${frameName}". Categories: ${sectionList}.${langNote}\n\nCall figma_get_blueline_data first — it returns structural data (including nodeIds for all elements) and orchestration instructions. Then call figma_get_knowledge for each agent group to fetch expert knowledge.\n\nDispatch parallel agents. IMPORTANT: Each agent must return items with these additional fields:\n- nodeId (string|null): the node ID from the structural scan that this item refers to. Null if no element match.\n- annotationType ("element"|"region"|"none"): "element" for specific UI elements (buttons, links, inputs), "region" for area-level concepts (landmarks, sections), "none" for abstract/page-level items.\n\nThen call figma_render_blueline with mode: "panels" and all item JSON. The panels have already been scaffolded with cloned designs — the render call will place native Figma annotations on the clones.`;
```

- [ ] **Step 5: Pass `plainLanguage` in the message handler**

Change line 185-186 from:
```typescript
    case 'a11y-panels-fill-request':
      showPanelsFillInstruction(msg.sections as string[], msg.frameName as string, msg.sectionIds as string[]);
```
To:
```typescript
    case 'a11y-panels-fill-request':
      showPanelsFillInstruction(msg.sections as string[], msg.frameName as string, msg.sectionIds as string[], msg.plainLanguage as boolean);
```

---

### Task 2: Thread flag through code.ts handler

**Files:**
- Modify: `apps/consonant-specs-plugin/src/code.ts`

- [ ] **Step 1: Read `plainLanguage` from message and pass it back**

In the `generate-blueline-panels` handler (line 1527), change:
```typescript
    case 'generate-blueline-panels': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a frame first'); break; }
      try {
        const categories = Array.isArray(msg.categories) ? (msg.categories as string[]) : [];
        figma.ui.postMessage({ type: 'a11y-status', message: 'Creating blueline panels...' });
        const result = await generateBluelinePanels(sel[0], categories);

        // Panels always use copy-prompt flow
        figma.ui.postMessage({
          type: 'a11y-panels-fill-request',
          sections: result.sections,
          frameName: sel[0].name,
          sectionIds: result.sectionIds,
        });
```
To:
```typescript
    case 'generate-blueline-panels': {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) { figma.notify('Select a frame first'); break; }
      try {
        const categories = Array.isArray(msg.categories) ? (msg.categories as string[]) : [];
        const plainLanguage = msg.plainLanguage === true;
        figma.ui.postMessage({ type: 'a11y-status', message: 'Creating blueline panels...' });
        const result = await generateBluelinePanels(sel[0], categories);

        figma.ui.postMessage({
          type: 'a11y-panels-fill-request',
          sections: result.sections,
          frameName: sel[0].name,
          sectionIds: result.sectionIds,
          plainLanguage,
        });
```

---

### Task 3: Build and verify

- [ ] **Step 1: Build the plugin**

```bash
cd apps/consonant-specs-plugin && node esbuild.config.mjs
```

Expected: Build completes with no errors.

- [ ] **Step 2: Commit**

```bash
git add apps/consonant-specs-plugin/src/ui.ts apps/consonant-specs-plugin/src/code.ts
git commit -m "feat: plain language button uses panels path with clone + native annotations"
```
