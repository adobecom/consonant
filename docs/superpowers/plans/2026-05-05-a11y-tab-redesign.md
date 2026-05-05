# A11y Tab Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the A11y plugin tab so it is designer-friendly, generates a conversational Claude Code prompt instead of a batch command, and receives results back in the plugin panel via a new bridge MCP tool.

**Architecture:** Plugin UX (Tasks 1–5) lives entirely in `consonant-specs-plugin`; the bridge loop-back (Tasks 6–7) adds a `sendEvent` method to `figma-console-mcp` and a new `bridge_send_a11y_result` MCP tool, then adds the handler in the plugin. Tasks 1–5 are independently shippable if the bridge work is deferred.

**Tech Stack:** TypeScript, esbuild (plugin), tsc (figma-console-mcp), WebSocket (bridge), Zod (MCP tool schema)

---

## Scope note

Tasks 1–5 are all within `consonant-specs-plugin`. They produce a fully usable improvement (better UX + conversational prompt) without touching `figma-console-mcp`. Tasks 6–7 add the bridge results loop-back. Stop after Task 5 if you want to ship the UX improvements first.

---

## File map

| File | Change |
|---|---|
| `apps/consonant-specs-plugin/src/ui.html` | Add descriptions; wrap category section; add confirm panel HTML; add results panel HTML; rename button |
| `apps/consonant-specs-plugin/src/ui.ts` | Smart defaults; showConfirmPanel(); updated showAiFillInstruction(); renderA11yResults(); A11Y_RESULT ws handler |
| `apps/consonant-specs-plugin/src/ui.css` | `.a11y-desc`; `.a11y-show-more`; confirm panel styles; results panel styles |
| `apps/figma-console-mcp/src/core/websocket-server.ts` | Add `sendEvent()` method |
| `apps/figma-console-mcp/src/local.ts` | Register `bridge_send_a11y_result` tool |

**Build commands (used repeatedly throughout plan):**
- Plugin: `cd /Users/taehoc/Desktop/Taeho/consonant/apps/consonant-specs-plugin && node esbuild.config.mjs`
- Plugin type-check: `cd /Users/taehoc/Desktop/Taeho/consonant/apps/consonant-specs-plugin && npx tsc --noEmit`
- figma-console-mcp: `cd /Users/taehoc/Desktop/Taeho/consonant/apps/figma-console-mcp && npm run build:local`

---

## Task 1: Add checkbox descriptions and rename labels

**Files:**
- Modify: `apps/consonant-specs-plugin/src/ui.html:121-145`
- Modify: `apps/consonant-specs-plugin/src/ui.css` (append)

- [ ] **Step 1: Add `.a11y-desc` CSS**

Append to `apps/consonant-specs-plugin/src/ui.css`:
```css
.a11y-desc {
  display: block;
  font-size: 10px;
  color: var(--text-tertiary, #999);
  margin-top: 1px;
  margin-left: 20px;
  line-height: 1.4;
}
```

- [ ] **Step 2: Update Group 1 checkbox labels in `ui.html`**

Replace the entire `<div class="match-checklist" id="a11yItemList">` block (currently lines ~128-137) with:
```html
<div class="match-checklist" id="a11yItemList">
  <label class="match-option a11y-item"><input type="checkbox" id="a11yFocusIndicators" disabled> Focus Indicators<span class="a11y-desc">Do interactive elements have a visible focus ring?</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yFocusOrder" disabled> Focus Order<span class="a11y-desc">Does the keyboard tab order match the visual layout?</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yHeadings" disabled> Heading Hierarchy<span class="a11y-desc">Are headings structured so screen readers can navigate?</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yLandmarksNav" disabled> Landmarks &amp; Navigation<span class="a11y-desc">Are page regions labeled so screen readers can jump to them?</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yNamesAlt" disabled> Names &amp; Alt-Text<span class="a11y-desc">Do images and controls have clear names for assistive tech?</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yColorContrast" disabled> Color Contrast<span class="a11y-desc">Is text readable against its background?</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yAriaKeyboard" disabled> ARIA &amp; Keyboard<span class="a11y-desc">Are custom widgets correctly labeled and keyboard-operable?</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yTargetSize" disabled> Target Size<span class="a11y-desc">Are tap/click targets large enough for motor accessibility?</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yPageSetup" disabled> Page Setup<span class="a11y-desc">Does the page have a title and language declared?</span></label>
</div>
```

- [ ] **Step 3: Update Group 2 checkbox labels in `ui.html`**

Replace the entire `<div class="match-checklist" id="a11yConditionalList">` block (currently lines ~140-149) with:
```html
<div class="match-checklist" id="a11yConditionalList">
  <label class="match-option a11y-item"><input type="checkbox" id="a11yForms" disabled> Forms<span class="a11y-desc">Are inputs labeled and error messages clear?</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yCarousel" disabled> Carousel<span class="a11y-desc">Can users navigate slides with keyboard and screen reader?</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yDom" disabled> DOM Strategy<span class="a11y-desc">Does the DOM order support the correct reading sequence?</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yMotionMedia" disabled> Motion &amp; Media<span class="a11y-desc">Can users pause motion and is media accessible?</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yScreenReader" disabled> Screen Reader Notes<span class="a11y-desc">Platform-specific notes for VoiceOver, TalkBack, Narrator</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yReactNative" disabled> React Native<span class="a11y-desc">Accessibility notes specific to the React Native platform</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yTvNote" disabled> TV Note<span class="a11y-desc">Notes for TV/10-foot UI accessibility</span></label>
  <label class="match-option a11y-item"><input type="checkbox" id="a11yGeneralNote" disabled> General Note<span class="a11y-desc">Any other accessibility notes for this frame</span></label>
</div>
```

- [ ] **Step 4: Build and type-check**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/consonant-specs-plugin && npx tsc --noEmit && node esbuild.config.mjs
```
Expected: no TypeScript errors, build succeeds.

- [ ] **Step 5: Visual verify in Figma**

Reload the plugin in Figma (Plugins → Development → Consonant Tools → click plugin name to reopen). Open the A11y tab, connect bridge, select a frame. Confirm each checkbox now shows a grey description line beneath the label.

- [ ] **Step 6: Commit**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant && git add apps/consonant-specs-plugin/src/ui.html apps/consonant-specs-plugin/src/ui.css && git commit -m "feat(a11y): add one-line descriptions to all A11y checkboxes"
```

---

## Task 2: "Show more" toggle for Group 2

**Files:**
- Modify: `apps/consonant-specs-plugin/src/ui.html`
- Modify: `apps/consonant-specs-plugin/src/ui.ts`
- Modify: `apps/consonant-specs-plugin/src/ui.css` (append)

- [ ] **Step 1: Add CSS for show-more button**

Append to `apps/consonant-specs-plugin/src/ui.css`:
```css
.a11y-show-more {
  background: none;
  border: none;
  color: var(--text-tertiary, #999);
  font-size: 11px;
  cursor: pointer;
  padding: 4px 0;
  text-align: left;
  width: 100%;
  margin-top: 4px;
}
.a11y-show-more:hover { color: var(--text-secondary, #666); }
```

- [ ] **Step 2: Wrap Group 2 in collapsible container in `ui.html`**

Find the Group 2 section header div (the one with `<span class="section-title">Accessibility Notes</span>`). Replace it and the `#a11yConditionalList` with:
```html
<!-- Group 2 toggle -->
<button class="a11y-show-more" id="a11yShowMore" style="margin-top:8px;">▸ Show more categories</button>
<div id="a11yConditionalSection" style="display:none;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
    <span class="section-title" style="margin-bottom:0;">Accessibility Notes</span>
    <button id="a11yCheckAllNotes" style="background:none;border:none;color:var(--text-tertiary,#999);font-size:11px;cursor:pointer;padding:2px 0;">Check All</button>
  </div>
  <div class="match-checklist" id="a11yConditionalList">
    <!-- (paste the updated Group 2 checkboxes from Task 1 Step 3 here) -->
  </div>
</div>
```

- [ ] **Step 3: Add toggle handler in `ui.ts`**

Find the existing `document.getElementById('a11yCheckAllNotes')` event listener block. Add this block immediately before it:

```typescript
document.getElementById('a11yShowMore')?.addEventListener('click', () => {
  const section = document.getElementById('a11yConditionalSection');
  const btn = document.getElementById('a11yShowMore');
  if (!section || !btn) return;
  const isHidden = section.style.display === 'none';
  section.style.display = isHidden ? '' : 'none';
  btn.textContent = isHidden ? '▾ Hide extra categories' : '▸ Show more categories';
});
```

- [ ] **Step 4: Build and type-check**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/consonant-specs-plugin && npx tsc --noEmit && node esbuild.config.mjs
```
Expected: no errors.

- [ ] **Step 5: Visual verify in Figma**

Reload plugin. Open A11y tab. Confirm Group 2 is hidden by default and the "Show more categories" button expands/collapses it.

- [ ] **Step 6: Commit**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant && git add apps/consonant-specs-plugin/src/ui.html apps/consonant-specs-plugin/src/ui.ts apps/consonant-specs-plugin/src/ui.css && git commit -m "feat(a11y): collapse Group 2 behind show-more toggle"
```

---

## Task 3: Smart defaults on bridge connect

**Files:**
- Modify: `apps/consonant-specs-plugin/src/ui.ts` (function `updateA11yBridgeState`)

- [ ] **Step 1: Update `updateA11yBridgeState` to pre-check 4 defaults**

Find `updateA11yBridgeState()` in `ui.ts` (around line 479). In the `if (bridgeConnected)` branch, after `checkboxes.forEach(cb => cb.disabled = false);`, add:

```typescript
// Apply smart defaults only if no categories are currently checked
const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
if (!anyChecked) {
  const defaults = ['a11yFocusIndicators', 'a11yFocusOrder', 'a11yColorContrast', 'a11yNamesAlt'];
  defaults.forEach(id => {
    const cb = document.getElementById(id) as HTMLInputElement;
    if (cb) cb.checked = true;
  });
}
```

The full updated `if (bridgeConnected)` block becomes:
```typescript
if (bridgeConnected) {
  if (badge) { badge.textContent = '✓ bridge connected'; badge.classList.add('connected'); }
  items.forEach(el => el.classList.add('enabled'));
  checkboxes.forEach(cb => cb.disabled = false);
  const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
  if (!anyChecked) {
    const defaults = ['a11yFocusIndicators', 'a11yFocusOrder', 'a11yColorContrast', 'a11yNamesAlt'];
    defaults.forEach(id => {
      const cb = document.getElementById(id) as HTMLInputElement;
      if (cb) cb.checked = true;
    });
  }
}
```

- [ ] **Step 2: Build and type-check**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/consonant-specs-plugin && npx tsc --noEmit && node esbuild.config.mjs
```
Expected: no errors.

- [ ] **Step 3: Visual verify in Figma**

Reload plugin. Connect bridge. Open A11y tab, select a frame. Confirm Focus Indicators, Focus Order, Color Contrast, and Names & Alt-Text are pre-checked. Uncheck some, disconnect bridge, reconnect — confirm unchecking is preserved (the `anyChecked` guard prevents re-defaulting if user has already made choices).

- [ ] **Step 4: Commit**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant && git add apps/consonant-specs-plugin/src/ui.ts && git commit -m "feat(a11y): pre-check 4 default categories on bridge connect"
```

---

## Task 4: State 2 confirm screen and button rename

**Files:**
- Modify: `apps/consonant-specs-plugin/src/ui.html`
- Modify: `apps/consonant-specs-plugin/src/ui.ts`
- Modify: `apps/consonant-specs-plugin/src/ui.css` (append)

- [ ] **Step 1: Rename button in `ui.html` and wrap category section**

In `ui.html`, find the `#a11yControls` div. Wrap everything inside it **except `#a11yStatus`** in a new `#a11yCategoryView` div. Also rename the main button:

```html
<div id="a11yControls" style="display:none;">
  <div id="a11yCategoryView">
    <!-- AI-assisted header, Check All, #a11yItemList, show-more button, #a11yConditionalSection -->
    <!-- ... all existing content up to and including the buttons ... -->
    <button class="btn" id="a11yStartBtn" style="margin-top:12px;">Start A11y Review</button>
    <button class="btn btn-secondary" id="generateBluelinePanelsBtn" style="margin-top:4px;">Generate Blueline Panels</button>
  </div>
  <div id="a11yStatus" style="margin-top:12px;"></div>
</div>
```

Remove the old `<button ... id="generateBluelineBtn">Generate Blueline</button>` line. The `generateBluelinePanelsBtn` stays as-is.

- [ ] **Step 2: Add confirm panel CSS**

Append to `apps/consonant-specs-plugin/src/ui.css`:
```css
.a11y-confirm-panel {
  padding: 12px;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 6px;
  border-left: 3px solid var(--accent, #1473E6);
}
.a11y-confirm-panel h4 {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #222);
  margin: 0 0 6px 0;
}
.a11y-confirm-panel .a11y-confirm-categories {
  font-size: 11px;
  color: var(--text-secondary, #555);
  margin-bottom: 8px;
  line-height: 1.6;
}
.a11y-confirm-panel .a11y-confirm-note {
  font-size: 11px;
  color: var(--text-tertiary, #999);
  margin-bottom: 10px;
  font-style: italic;
}
.a11y-confirm-actions { display: flex; gap: 6px; }
.a11y-confirm-actions .btn { flex: 1; }
```

- [ ] **Step 3: Add label map constant and `showConfirmPanel()` in `ui.ts`**

Above `getCheckedA11yCategories()` in `ui.ts`, add:

```typescript
const A11Y_LABELS: Record<string, string> = {
  a11yFocusIndicators: 'Focus Indicators',
  a11yFocusOrder: 'Focus Order',
  a11yHeadings: 'Heading Hierarchy',
  a11yLandmarksNav: 'Landmarks & Navigation',
  a11yNamesAlt: 'Names & Alt-Text',
  a11yColorContrast: 'Color Contrast',
  a11yAriaKeyboard: 'ARIA & Keyboard',
  a11yTargetSize: 'Target Size',
  a11yPageSetup: 'Page Setup',
  a11yForms: 'Forms',
  a11yCarousel: 'Carousel',
  a11yDom: 'DOM Strategy',
  a11yMotionMedia: 'Motion & Media',
  a11yScreenReader: 'Screen Reader Notes',
  a11yReactNative: 'React Native',
  a11yTvNote: 'TV Note',
  a11yGeneralNote: 'General Note',
};

function getCheckedA11yCheckboxIds(): string[] {
  return Object.keys(A11Y_LABELS).filter(
    id => (document.getElementById(id) as HTMLInputElement)?.checked
  );
}

function showConfirmPanel(checkedIds: string[], frameName: string | undefined) {
  const categoryView = document.getElementById('a11yCategoryView');
  const statusEl = document.getElementById('a11yStatus');
  if (!statusEl) return;
  if (categoryView) categoryView.style.display = 'none';
  const labels = checkedIds.map(id => A11Y_LABELS[id] || id).join(', ');
  const frameLabel = frameName ? `"${frameName}"` : 'the selected frame';
  statusEl.innerHTML = `
    <div class="a11y-confirm-panel">
      <h4>Create ${checkedIds.length} annotation card${checkedIds.length === 1 ? '' : 's'} for ${esc(frameLabel)}</h4>
      <div class="a11y-confirm-categories">${esc(labels)}</div>
      <div class="a11y-confirm-note">Claude will ask you questions before filling any cards. Empty cards are normal — they mean Claude needs more information from you.</div>
      <div class="a11y-confirm-actions">
        <button class="btn btn-secondary" id="a11yConfirmBack">Back</button>
        <button class="btn" id="a11yConfirmGo">Confirm &amp; Create Cards</button>
      </div>
    </div>`;
  document.getElementById('a11yConfirmBack')?.addEventListener('click', () => {
    statusEl.innerHTML = '';
    if (categoryView) categoryView.style.display = '';
  });
  document.getElementById('a11yConfirmGo')?.addEventListener('click', () => {
    statusEl.innerHTML = '';
    postToPlugin('generate-blueline', { categories: getCheckedA11yCategories() });
  });
}
```

- [ ] **Step 4: Update button wiring in `ui.ts`**

Find the existing `generateBluelineBtn` event listener:
```typescript
document.getElementById('generateBluelineBtn')?.addEventListener('click', () => triggerBlueline());
```

Replace with:
```typescript
document.getElementById('a11yStartBtn')?.addEventListener('click', () => {
  const checkedIds = getCheckedA11yCheckboxIds();
  if (checkedIds.length === 0) {
    updateA11yStatus('Select at least one category.');
    return;
  }
  const frameName = currentSelection.count > 0 ? (document.querySelector('#a11yControls') as HTMLElement)?.dataset.frameName : undefined;
  showConfirmPanel(checkedIds, frameName);
});
```

- [ ] **Step 5: Pass frame name to #a11yControls via `updateA11yControls`**

Find the `updateA11yControls()` function (or where `a11yControls` is shown). When the frame is selected, set `data-frame-name` on `#a11yControls`:

Find where `controls.style.display = 'block'` is called for the a11y section (in `updateA11yControls()` or `updateSelectionInfo()`). After that line, add:
```typescript
const a11yControlsEl = document.getElementById('a11yControls');
if (a11yControlsEl && msg?.selection?.name) {
  a11yControlsEl.dataset.frameName = msg.selection.name;
}
```

Then in `showConfirmPanel`, read it as:
```typescript
const frameName = (document.getElementById('a11yControls') as HTMLElement)?.dataset.frameName;
```
(Remove the `currentSelection` reference from Step 4 — `dataset.frameName` is cleaner.)

- [ ] **Step 6: Also update `updateA11yBridgeState` to reference new button ID**

In `updateA11yBridgeState()`, change:
```typescript
const genBtn = document.getElementById('generateBluelineBtn') as HTMLButtonElement;
```
to:
```typescript
const genBtn = document.getElementById('a11yStartBtn') as HTMLButtonElement;
```

- [ ] **Step 7: Build and type-check**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/consonant-specs-plugin && npx tsc --noEmit && node esbuild.config.mjs
```
Expected: no errors.

- [ ] **Step 8: Visual verify in Figma**

Reload plugin. Connect bridge, select a frame. Confirm:
- Button now says "Start A11y Review"
- Clicking it shows the confirm panel with category names and the explanation text
- "Back" restores the category list
- "Confirm & Create Cards" creates blueline cards (cards appear in Figma canvas)

- [ ] **Step 9: Commit**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant && git add apps/consonant-specs-plugin/src/ui.html apps/consonant-specs-plugin/src/ui.ts apps/consonant-specs-plugin/src/ui.css && git commit -m "feat(a11y): add State 2 confirm screen and rename main button"
```

---

## Task 5: Conversational prompt in `showAiFillInstruction()`

**Files:**
- Modify: `apps/consonant-specs-plugin/src/ui.ts` (function `showAiFillInstruction`)

- [ ] **Step 1: Replace `showAiFillInstruction()` body**

Find `showAiFillInstruction(mode?: string, sections?: string[], frameName?: string)` in `ui.ts` (around line 502). Replace the entire function body with:

```typescript
function showAiFillInstruction(mode?: string, sections?: string[], frameName?: string) {
  const categoryList = sections && sections.length > 0 ? sections.join(', ') : 'all categories';
  const frame = frameName ? `"${frameName}"` : 'the selected frame';
  const bridgeNote = bridgeConnected ? '' : '\n\n⚠ Bridge offline — paste this in Claude Code manually.';

  let cmd: string;
  if (mode === 'sections') {
    cmd = `Fill the blueline cards on the current Figma page. Call figma_get_blueline_data first — it returns structural data and orchestration instructions. Then call figma_get_knowledge for each agent group to fetch expert knowledge. Dispatch parallel agents, then call figma_render_blueline with all card JSON.`;
  } else {
    cmd = `Start an A11y review conversation for the frame ${frame}.

Categories to review: ${categoryList}

Step 1 — Ground yourself:
Call figma_get_blueline_data. It returns the structural scan (a hidden text node named .structural-scan), a screenshot, and per-agent orchestration instructions. Read the structural scan carefully. Do not infer elements that are not present in it.

Step 2 — Ask questions first (REQUIRED before any rendering):
Before calling figma_render_blueline, ask the designer 1–3 clarifying questions about things you genuinely need to know to be accurate — e.g. intended interaction pattern, whether a visual-only element is intentional, context of use. If you have no real questions, say so briefly and proceed.
Wait for the designer's answers before continuing.

Step 3 — Analyze:
For each selected category, call figma_get_knowledge for its agent group. Use the structural scan + screenshot + designer answers to assess each category.
Before filling a category, check whether the structural scan contains elements that match it:
- "autoRotation" (Carousel) → skip if no carousel/slider elements in scan
- "forms" → skip if no input/select/textarea elements in scan
- "reducedMotion"/"media"/"reflow" → skip if no animation or media elements in scan
If a category has no matching elements, skip it and note: "Skipped [category] — no matching elements found."

Step 4 — Render:
Call figma_render_blueline with the cards object. For confident items: write the issue or passing note, WCAG criterion, and a plain-language suggestion in desc. For uncertain items: pass an empty string for desc and put the open question in notes (e.g. "notes": "Need to know: is this button keyboard-only or also touch?").

Step 5 — Send summary to plugin:
After figma_render_blueline completes, call bridge_send_a11y_result with:
{
  "frameName": ${frame},
  "issues": [{ "category": "...", "description": "..." }],
  "needs_input": [{ "category": "...", "question": "..." }],
  "suggestions": [{ "category": "...", "description": "..." }]
}
This updates the plugin panel so the designer can see results without hunting the Figma canvas.${bridgeNote}`;
  }

  const el = document.getElementById('a11yStatus');
  if (el) {
    el.innerHTML = `
      <div style="padding:10px;background:var(--bg-secondary,#f5f5f5);border-radius:6px;border-left:3px solid var(--accent,#1473E6);">
        <div style="font-weight:600;font-size:11px;color:var(--accent,#1473E6);margin-bottom:4px;">Cards created &#x2714; — waiting for Claude</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">Paste this in Claude Code to start the review:</div>
        <code id="fillCmdText" style="display:block;background:var(--bg,#fff);padding:6px 8px;border-radius:4px;font-size:10px;border:1px solid var(--border,#e5e5e5);line-height:1.4;white-space:pre-wrap;">${esc(cmd)}</code>
        <button class="btn btn-secondary" id="copyFillCmd" style="margin-top:6px;padding:4px 8px;font-size:10px;width:100%;">Copy</button>
        <div style="font-size:10px;color:var(--text-tertiary,#999);margin-top:6px;">Results will appear here when Claude finishes.</div>
      </div>`;
    document.getElementById('copyFillCmd')?.addEventListener('click', async () => {
      await copyToClipboard(cmd);
      const btn = document.getElementById('copyFillCmd');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
    });
  }
}
```

- [ ] **Step 2: Build and type-check**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/consonant-specs-plugin && npx tsc --noEmit && node esbuild.config.mjs
```
Expected: no errors.

- [ ] **Step 3: Visual verify in Figma**

Reload plugin. Connect bridge, select a frame, check some categories, click "Start A11y Review" → "Confirm & Create Cards". Confirm:
- After cards are created, the command box shows the new conversational prompt (not the old batch command)
- The prompt includes "Step 1 — Ground yourself", "Step 2 — Ask questions first", etc.
- The "Copy" button works
- If bridge is disconnected, the `⚠ Bridge offline` note appears at the end

- [ ] **Step 4: Commit**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant && git add apps/consonant-specs-plugin/src/ui.ts && git commit -m "feat(a11y): replace batch command with conversational prompt template"
```

---

## Task 6: Bridge loop-back — `sendEvent()` + `bridge_send_a11y_result` tool

**Files:**
- Modify: `apps/figma-console-mcp/src/core/websocket-server.ts`
- Modify: `apps/figma-console-mcp/src/local.ts`

- [ ] **Step 1: Add `sendEvent()` to `websocket-server.ts`**

Open `apps/figma-console-mcp/src/core/websocket-server.ts`. Find the end of the `sendCommand()` method (around line 668 — ends with `logger.debug(...)` line and closing `})`). Add the following method immediately after the closing `}` of `sendCommand`:

```typescript
/**
 * Send a fire-and-forget event to the active plugin client.
 * Unlike sendCommand, this does not register a pending response.
 */
sendEvent(type: string, data: unknown): void {
  const fileKey = this._activeFileKey;
  if (!fileKey) return;
  const client = this.clients.get(fileKey);
  if (!client || client.ws.readyState !== WebSocket.OPEN) return;
  try {
    client.ws.send(JSON.stringify({ type, data }));
  } catch {
    // best-effort — do not throw if the send fails
  }
}
```

- [ ] **Step 2: Build figma-console-mcp to verify no TypeScript errors**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/figma-console-mcp && npm run build:local
```
Expected: no errors, `dist/local.js` is updated.

- [ ] **Step 3: Register `bridge_send_a11y_result` tool in `local.ts`**

Open `apps/figma-console-mcp/src/local.ts`. Find the last `this.server.tool(...)` call in `registerTools()`. Add the following as a new tool registration **after** the last existing tool:

```typescript
this.server.tool(
  "bridge_send_a11y_result",
  "Send an A11y review result summary back to the Consonant plugin panel (State 3). Call this after figma_render_blueline completes. The plugin will display issues, needs-input, and suggestions in three colour-coded sections.",
  {
    frameName: z.string().describe("The name of the frame that was reviewed"),
    issues: z.array(
      z.object({
        category: z.string().describe("Category slug (e.g. 'colorContrast')"),
        description: z.string().describe("Plain-language description of the issue"),
      })
    ).describe("WCAG violations found"),
    needs_input: z.array(
      z.object({
        category: z.string().describe("Category slug"),
        question: z.string().describe("The specific question Claude needs answered to complete this card"),
      })
    ).describe("Cards left blank because Claude needs more information"),
    suggestions: z.array(
      z.object({
        category: z.string().describe("Category slug"),
        description: z.string().describe("Improvement suggestion that is not a hard violation"),
      })
    ).describe("Non-blocking improvements noticed during review"),
  },
  async (args) => {
    this.wsServer.sendEvent('A11Y_RESULT', args);
    return {
      content: [{ type: "text" as const, text: `A11y result sent to plugin for frame "${args.frameName}": ${args.issues.length} issues, ${args.needs_input.length} needs input, ${args.suggestions.length} suggestions.` }],
    };
  }
);
```

- [ ] **Step 4: Build figma-console-mcp**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/figma-console-mcp && npm run build:local
```
Expected: no TypeScript errors, `dist/local.js` updated.

- [ ] **Step 5: Restart the MCP server to load the new tool**

The figma-console MCP server runs via `.mcp.json`. Claude Code must restart to pick up the new `dist/local.js`. Run:
```bash
# In Claude Code: /mcp or restart the session to reload the MCP servers
```
Alternatively, instruct the user: "Type `/mcp` in Claude Code and confirm `bridge_send_a11y_result` appears in the figma-console tool list."

- [ ] **Step 6: Commit**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant && git add apps/figma-console-mcp/src/core/websocket-server.ts apps/figma-console-mcp/src/local.ts apps/figma-console-mcp/dist/local.js && git commit -m "feat(bridge): add bridge_send_a11y_result MCP tool and sendEvent() method"
```

---

## Task 7: State 3 results panel and `A11Y_RESULT` handler

**Files:**
- Modify: `apps/consonant-specs-plugin/src/ui.ts`
- Modify: `apps/consonant-specs-plugin/src/ui.css` (append)

- [ ] **Step 1: Add State 3 CSS**

Append to `apps/consonant-specs-plugin/src/ui.css`:
```css
/* A11y State 3 — results panel */
.a11y-results { margin-top: 8px; }
.a11y-results-section { margin-bottom: 10px; }
.a11y-results-section-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 4px;
}
.a11y-results-section-title.issues { color: #dc2626; }
.a11y-results-section-title.needs-input { color: #d97706; }
.a11y-results-section-title.suggestions { color: #2563eb; }
.a11y-result-item {
  font-size: 11px;
  color: var(--text-secondary, #555);
  padding: 4px 6px;
  border-radius: 4px;
  margin-bottom: 3px;
  line-height: 1.4;
}
.a11y-result-item.issue { background: rgba(220,38,38,0.07); border-left: 2px solid #dc2626; }
.a11y-result-item.needs { background: rgba(217,119,6,0.07); border-left: 2px solid #d97706; }
.a11y-result-item.suggestion { background: rgba(37,99,235,0.07); border-left: 2px solid #2563eb; }
.a11y-result-item strong { font-weight: 600; }
.a11y-results-empty { font-size: 11px; color: var(--text-tertiary, #999); font-style: italic; }
```

- [ ] **Step 2: Add `renderA11yResults()` function in `ui.ts`**

Add this function after `showAiFillInstruction()` in `ui.ts`:

```typescript
interface A11yResultItem { category: string; description: string; }
interface A11yNeedsInputItem { category: string; question: string; }
interface A11yResultPayload {
  frameName: string;
  issues: A11yResultItem[];
  needs_input: A11yNeedsInputItem[];
  suggestions: A11yResultItem[];
}

function renderA11yResults(data: A11yResultPayload) {
  const el = document.getElementById('a11yStatus');
  if (!el) return;

  function section(title: string, cls: string, items: Array<{ label: string; text: string }>, itemCls: string) {
    if (items.length === 0) return '';
    const rows = items.map(i =>
      `<div class="a11y-result-item ${itemCls}"><strong>${esc(i.label)}</strong> — ${esc(i.text)}</div>`
    ).join('');
    return `<div class="a11y-results-section">
      <div class="a11y-results-section-title ${cls}">${title} (${items.length})</div>
      ${rows}
    </div>`;
  }

  const issueItems = data.issues.map(i => ({ label: i.category, text: i.description }));
  const needsItems = data.needs_input.map(i => ({ label: i.category, text: i.question }));
  const suggItems  = data.suggestions.map(i => ({ label: i.category, text: i.description }));

  const empty = issueItems.length === 0 && needsItems.length === 0 && suggItems.length === 0;

  el.innerHTML = `
    <div style="padding:10px;background:var(--bg-secondary,#f5f5f5);border-radius:6px;border-left:3px solid var(--accent,#1473E6);">
      <div style="font-weight:600;font-size:11px;color:var(--accent,#1473E6);margin-bottom:8px;">Review complete — ${esc(data.frameName)}</div>
      <div class="a11y-results">
        ${empty
          ? '<div class="a11y-results-empty">No issues or suggestions returned.</div>'
          : section('Issues', 'issues', issueItems, 'issue') +
            section('Needs your input', 'needs-input', needsItems, 'needs') +
            section('Suggestions', 'suggestions', suggItems, 'suggestion')
        }
      </div>
      <button class="btn btn-secondary" id="a11yContinueBtn" style="margin-top:8px;font-size:10px;width:100%;">Continue in Claude Code</button>
    </div>`;

  document.getElementById('a11yContinueBtn')?.addEventListener('click', async () => {
    const cmdEl = document.getElementById('fillCmdText');
    if (cmdEl) {
      await copyToClipboard(cmdEl.textContent || '');
      const btn = document.getElementById('a11yContinueBtn');
      if (btn) { btn.textContent = 'Copied — paste in Claude Code'; setTimeout(() => { btn.textContent = 'Continue in Claude Code'; }, 2000); }
    }
  });
}
```

- [ ] **Step 3: Add `A11Y_RESULT` handler in `ws.onmessage` in `ui.ts`**

Find `attachBridgeWsHandlers` in `ui.ts` (around line 908). Inside `ws.onmessage`, find this block:

```typescript
// Handle server identity
if (message.type === 'SERVER_HELLO' && message.data) {
  appendBridgeLog('Server v' + (message.data.serverVersion || '?') + ' on port ' + port);
  return;
}

// Ignore pong or other non-command messages
if (!message.id || !message.method) return;
```

Add the A11Y_RESULT handler **between** the SERVER_HELLO block and the `!message.id` line:

```typescript
// Handle A11y results loop-back from bridge_send_a11y_result MCP tool
if (message.type === 'A11Y_RESULT' && message.data) {
  renderA11yResults(message.data as A11yResultPayload);
  return;
}
```

The block should now read:
```typescript
// Handle server identity
if (message.type === 'SERVER_HELLO' && message.data) {
  appendBridgeLog('Server v' + (message.data.serverVersion || '?') + ' on port ' + port);
  return;
}

// Handle A11y results loop-back from bridge_send_a11y_result MCP tool
if (message.type === 'A11Y_RESULT' && message.data) {
  renderA11yResults(message.data as A11yResultPayload);
  return;
}

// Ignore pong or other non-command messages
if (!message.id || !message.method) return;
```

- [ ] **Step 4: Build and type-check**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/consonant-specs-plugin && npx tsc --noEmit && node esbuild.config.mjs
```
Expected: no TypeScript errors.

- [ ] **Step 5: End-to-end verify in Figma**

This step requires the figma-console MCP (Task 6) to already be running with the new `bridge_send_a11y_result` tool.

1. Reload the plugin in Figma.
2. Connect bridge, select a frame, start an A11y review through the full flow.
3. In Claude Code, after the cards are created, call `bridge_send_a11y_result` manually to test the loop-back:
```
bridge_send_a11y_result({
  "frameName": "Test Frame",
  "issues": [{ "category": "colorContrast", "description": "Text on button fails 4.5:1 contrast ratio." }],
  "needs_input": [{ "category": "focusOrder", "question": "Is the tab order on this form intentional?" }],
  "suggestions": [{ "category": "targetSize", "description": "Consider increasing button height to 44px for touch targets." }]
})
```
4. Confirm the plugin panel updates to show State 3 with the three colour-coded sections.
5. Confirm the "Continue in Claude Code" button copies the command to clipboard.

- [ ] **Step 6: Commit**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant && git add apps/consonant-specs-plugin/src/ui.ts apps/consonant-specs-plugin/src/ui.css && git commit -m "feat(a11y): add State 3 results panel and A11Y_RESULT bridge handler"
```

---

## Self-review against spec

| Spec requirement | Task that covers it |
|---|---|
| State 1: plain labels with descriptions | Task 1 |
| State 1: smart defaults pre-checked | Task 3 |
| State 1: Group 2 collapsed behind "Show more" | Task 2 |
| State 1: single CTA "Start A11y Review" | Task 4 |
| State 2: confirm panel with categories list | Task 4 |
| State 2: "Claude will ask questions" explanation | Task 4 |
| State 2: Confirm & Back buttons | Task 4 |
| State 3: issues / needs-input / suggestions sections | Task 7 |
| State 3: "Continue in Claude Code" button | Task 7 |
| Bridge offline fallback | Task 5 (note in command) |
| Generated prompt: conversational opener | Task 5 |
| Generated prompt: keep figma_get_blueline_data pipeline | Task 5 |
| Generated prompt: ask questions before rendering | Task 5 |
| Generated prompt: call bridge_send_a11y_result at end | Task 5 |
| Smart category detection (skip irrelevant categories) | Task 5 (in prompt) |
| sendEvent() in websocket-server.ts | Task 6 |
| bridge_send_a11y_result MCP tool | Task 6 |
| A11Y_RESULT ws handler in plugin | Task 7 |

All spec requirements are covered.
