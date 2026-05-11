# Design Audit Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chrome MV3 extension with a 3-column layout (extract rail | iframe browser | Claude chat) that analyzes live websites, generates prototypes from Figma, and pushes specs to Figma.

**Architecture:** Extension tab (`app.html`) with React shell. Background service worker owns Claude API client and tool executor. Content script reads DOM from iframe via `chrome.scripting.executeScript`. Figma bridge is an HTTP server added to the existing consonant-specs MCP.

**Tech Stack:** React 18, Vite, TypeScript 5, Tailwind CSS 3, `@crxjs/vite-plugin@2.0.0-beta.26`, Anthropic SDK, Vitest, `@testing-library/react`

---

## File Map

### New repo: `/Users/taehoc/Desktop/Taeho/specs-extension/`

*(Folder name is `specs-extension` — note the spelling matches the user's chosen name.)*

```
manifest.json
vite.config.ts
tsconfig.json
package.json
tailwind.config.ts
postcss.config.js
tests/setup.ts                         # chrome API mocks

src/
  shared/
    types.ts                           # All shared TS types + message protocol
    storage.ts                         # chrome.storage wrappers
    extraction-prompts.ts              # System prompts for all 8 modes
    constants.ts                       # Ports, breakpoints, tool names

  background/
    index.ts                           # Service worker entry + message router
    claude-client.ts                   # Anthropic SDK streaming + tool calling
    tool-executor.ts                   # Implements all 8 tools
    dom-bridge.ts                      # executeScript into iframe → DomSnapshot
    header-rules.ts                    # declarativeNetRequest dynamic rules

  content/
    dom-extractor.ts                   # Injected script: serialises DOM → snapshot

  app/
    index.html
    main.tsx
    App.tsx                            # 3-column shell + collapse state
    components/
      LeftRail.tsx                     # 8 extraction modes + collapse
      CenterBrowser.tsx                # URL bar + viewport control + iframe
      RightRail.tsx                    # Claude chat + collapse
      RailFab.tsx                      # Circular FAB when rail is collapsed
      ViewportControl.tsx              # Width presets + custom input
      ChatThread.tsx                   # Scrolling message list
      ChatInput.tsx                    # Textarea + send button
      ChatMessage.tsx                  # Single message bubble
      cards/
        SpecTableCard.tsx
        PreviewTabCard.tsx
        FigmaCard.tsx
        ErrorCard.tsx
        FigmaInputCard.tsx             # Prompt user for Figma node ID
        S2ACard.tsx                    # S2A Align/Match audit results

    hooks/
      useRailState.ts                  # Collapse state + chrome.storage.local
      useConversation.ts               # Message history + streaming
      useBrowserFrame.ts               # iframe ref + frameId + current URL

  sidepanel/
    index.html
    main.tsx
    SidePanel.tsx                      # Reuses ChatThread + ChatInput

tests/
  unit/
    storage.test.ts
    header-rules.test.ts
    dom-bridge.test.ts
    claude-client.test.ts
    tool-executor.test.ts
    extraction-prompts.test.ts
```

### Existing repo: `/Users/taehoc/Desktop/Taeho/consonant/`

```
apps/consonant-specs-plugin/mcp/
  index.ts                             # Add HTTP server on port 9240 (~30 lines)
  http-bridge.test.ts                  # New: tests for HTTP endpoints

apps/s2a-ds-mcp/src/
  tools/audit.ts                       # Modify: export standalone auditCss() function
  http.ts                              # New: HTTP bridge on port 9241 (POST /audit, GET /status)
  http.test.ts                         # New: tests for S2A HTTP bridge
  local.ts                             # Modify: start HTTP bridge alongside stdio server
```

---

## Phase 1 — Extension Shell (Tasks 1–6)
*Deliverable: Extension opens a tab, loads any URL in the iframe, rails collapse.*

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `manifest.json`, `tests/setup.ts`

- [ ] **Step 1: Init repo and wire up GitHub remote**

```bash
mkdir /Users/taehoc/Desktop/Taeho/specs-extension
cd /Users/taehoc/Desktop/Taeho/specs-extension
git init
git remote add origin https://github.com/spicyxshrimp/specs-extension.git
npm init -y
```

- [ ] **Step 2: Install dependencies**

```bash
npm install react react-dom
npm install -D typescript vite @vitejs/plugin-react \
  "@crxjs/vite-plugin@2.0.0-beta.26" \
  tailwindcss postcss autoprefixer \
  @types/react @types/react-dom @types/chrome \
  vitest @vitest/coverage-v8 jsdom \
  @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom
```

- [ ] **Step 3: Write `manifest.json`**

```json
{
  "manifest_version": 3,
  "name": "Design Audit Tool",
  "version": "0.1.0",
  "description": "Analyze websites and build prototypes with Claude",
  "permissions": [
    "declarativeNetRequest",
    "declarativeNetRequestWithHostAccess",
    "scripting",
    "downloads",
    "storage",
    "tabs",
    "sidePanel",
    "activeTab",
    "webNavigation"
  ],
  "host_permissions": ["<all_urls>"],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; connect-src 'self' http://localhost:9240 http://localhost:9241"
  },
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  "action": {
    "default_title": "Design Audit Tool"
  },
  "side_panel": {
    "default_path": "src/sidepanel/index.html"
  },
  "web_accessible_resources": [
    {
      "resources": ["src/content/dom-extractor.ts"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

- [ ] **Step 4: Write `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    globals: true,
  },
});
```

- [ ] **Step 5: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "dist"
  },
  "include": ["src", "tests", "manifest.json"]
}
```

- [ ] **Step 6: Write `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 7: Write `postcss.config.js`**

```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 8: Write `tests/setup.ts`**

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

const _storage: Record<string, unknown> = {};

global.chrome = {
  storage: {
    local: {
      get: vi.fn((keys: string | string[]) => {
        const k = typeof keys === 'string' ? [keys] : keys;
        return Promise.resolve(Object.fromEntries(k.map(key => [key, _storage[key]])));
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(_storage, items);
        return Promise.resolve();
      }),
    },
    sync: {
      get: vi.fn(() => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn() },
    getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
    id: 'test-id',
  },
  tabs: {
    create: vi.fn(),
    query: vi.fn(() => Promise.resolve([])),
    update: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
  },
  declarativeNetRequest: {
    updateDynamicRules: vi.fn(() => Promise.resolve()),
    getDynamicRules: vi.fn(() => Promise.resolve([])),
  },
  downloads: {
    download: vi.fn(),
  },
  sidePanel: {
    open: vi.fn(),
    setOptions: vi.fn(),
  },
} as unknown as typeof chrome;
```

- [ ] **Step 9: Add npm scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```

- [ ] **Step 10: Create `src/app/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Design Audit Tool</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 11: Create placeholder `src/app/main.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><div className="text-white bg-gray-900 h-screen p-4">Design Audit Tool</div></React.StrictMode>
);
```

- [ ] **Step 12: Create `src/app/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 13: Create placeholder `src/background/index.ts`**

```typescript
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('src/app/index.html') });
});
```

- [ ] **Step 14: Build and verify**

```bash
npm run build
```
Expected: `dist/` directory created, no errors.

- [ ] **Step 15: Load in Chrome**
Open `chrome://extensions`, enable Developer Mode, click "Load unpacked", select the `dist/` folder. Click the extension icon — a new tab should open with "Design Audit Tool".

- [ ] **Step 16: Commit and push**

```bash
git add -A
git commit -m "feat: scaffold chrome extension with vite + react + tailwind"
git push -u origin main
```

---

### Task 2: Shared types and storage

**Files:**
- Create: `src/shared/types.ts`, `src/shared/storage.ts`, `src/shared/constants.ts`
- Test: `tests/unit/storage.test.ts`

- [ ] **Step 1: Write failing test for storage**

```typescript
// tests/unit/storage.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRailState, setRailState, getApiKey, setApiKey, getSaveFolder, setSaveFolder, getModel, setModel } from '../../src/shared/storage';

beforeEach(() => { vi.clearAllMocks(); });

describe('getRailState', () => {
  it('returns defaults when storage is empty', async () => {
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});
    const state = await getRailState();
    expect(state).toEqual({ leftOpen: true, rightOpen: true });
  });

  it('returns stored values', async () => {
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      railState: { leftOpen: false, rightOpen: true },
    });
    const state = await getRailState();
    expect(state).toEqual({ leftOpen: false, rightOpen: true });
  });
});

describe('setRailState', () => {
  it('writes to chrome.storage.local', async () => {
    await setRailState({ leftOpen: false, rightOpen: true });
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      railState: { leftOpen: false, rightOpen: true },
    });
  });
});

describe('getApiKey', () => {
  it('returns null when not set', async () => {
    (chrome.storage.sync.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});
    expect(await getApiKey()).toBeNull();
  });
});

describe('setApiKey', () => {
  it('writes to chrome.storage.sync', async () => {
    await setApiKey('sk-ant-test');
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ apiKey: 'sk-ant-test' });
  });
});

describe('getModel', () => {
  it('returns DEFAULT_MODEL when not set', async () => {
    (chrome.storage.sync.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});
    expect(await getModel()).toBe('claude-sonnet-4-6');
  });

  it('returns stored model', async () => {
    (chrome.storage.sync.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ model: 'claude-opus-4-7' });
    expect(await getModel()).toBe('claude-opus-4-7');
  });
});

describe('setModel', () => {
  it('writes model to chrome.storage.sync', async () => {
    await setModel('claude-opus-4-7');
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ model: 'claude-opus-4-7' });
  });
});
```

- [ ] **Step 2: Run — confirm failure**

```bash
npm test tests/unit/storage.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/shared/constants.ts`**

```typescript
export const FIGMA_BRIDGE_URL = 'http://localhost:9240';
export const S2A_BRIDGE_URL = 'http://localhost:9241';
export const VIEWPORT_PRESETS = [
  { label: 'Mobile', width: 375 },
  { label: 'Tablet', width: 768 },
  { label: 'Laptop', width: 1024 },
  { label: 'Desktop', width: 1440 },
  { label: 'Full', width: null },
] as const;
export type ViewportPreset = typeof VIEWPORT_PRESETS[number];

export const MODELS = [
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6', description: 'Fast · everyday tasks' },
  { id: 'claude-opus-4-7',   label: 'Opus 4.7',   description: 'Powerful · heavy analysis' },
] as const;
export type ModelId = typeof MODELS[number]['id'];
export const DEFAULT_MODEL: ModelId = 'claude-sonnet-4-6';
```

- [ ] **Step 4: Write `src/shared/types.ts`**

```typescript
export type ExtractMode =
  | 'designSystem' | 'dsMapping' | 'designStyle' | 'principles'
  | 'animation' | 'localization' | 'a11y' | 'fromFigma';

export interface DomSnapshot {
  url: string;
  title: string;
  html: string;
  stylesheets: string[];
  scripts: string[];
  detectedLibraries: string[];
}

export interface RailState {
  leftOpen: boolean;
  rightOpen: boolean;
}

export interface SpecTableCard {
  type: 'spec-table';
  title: string;
  columns: string[];
  rows: string[][];
}

export interface PreviewTabCard {
  type: 'preview-tab';
  tabId: number;
  summary: string;
}

export interface FigmaCard {
  type: 'figma';
  summary: string;
}

export interface ErrorCard {
  type: 'error';
  message: string;
  recovery?: string;
}

export interface FigmaInputCard {
  type: 'figma-input';
  prompt: string;
}

export type OutputCard = SpecTableCard | PreviewTabCard | FigmaCard | ErrorCard | FigmaInputCard | S2ACard;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  cards: OutputCard[];
  streaming: boolean;
  timestamp: number;
}

// chrome.runtime message protocol
export type ToBackground =
  | { type: 'SEND_MESSAGE'; text: string; frameId: number | null }
  | { type: 'EXTRACT'; mode: ExtractMode; frameId: number | null }
  | { type: 'GET_SNAPSHOT'; frameId: number; includeScripts: boolean }
  | { type: 'SET_HEADER_RULES'; url: string }
  | { type: 'CLEAR_HEADER_RULES' }
  | { type: 'CANCEL_STREAM' }
  | { type: 'REGISTER_FRAME'; iframeUrl: string }
  | { type: 'CREATE_PREVIEW_TAB'; html: string };

export type FromBackground =
  | { type: 'STREAM_CHUNK'; text: string }
  | { type: 'STREAM_CARD'; card: OutputCard }
  | { type: 'STREAM_DONE' }
  | { type: 'STREAM_ERROR'; error: string }
  | { type: 'SNAPSHOT_RESULT'; snapshot: DomSnapshot };
```

- [ ] **Step 5: Write `src/shared/storage.ts`**

```typescript
import type { RailState } from './types';
import { DEFAULT_MODEL, type ModelId } from './constants';

export async function getRailState(): Promise<RailState> {
  const result = await chrome.storage.local.get('railState');
  return result.railState ?? { leftOpen: true, rightOpen: true };
}

export async function setRailState(state: RailState): Promise<void> {
  await chrome.storage.local.set({ railState: state });
}

export async function getApiKey(): Promise<string | null> {
  const result = await chrome.storage.sync.get('apiKey');
  return result.apiKey ?? null;
}

export async function setApiKey(key: string): Promise<void> {
  await chrome.storage.sync.set({ apiKey: key });
}

export async function getSaveFolder(): Promise<string | null> {
  const result = await chrome.storage.local.get('saveFolder');
  return result.saveFolder ?? null;
}

export async function setSaveFolder(folder: string): Promise<void> {
  await chrome.storage.local.set({ saveFolder: folder });
}

export async function getViewportWidth(): Promise<number | null> {
  const result = await chrome.storage.local.get('viewportWidth');
  return result.viewportWidth ?? null;
}

export async function setViewportWidth(width: number | null): Promise<void> {
  await chrome.storage.local.set({ viewportWidth: width });
}

export async function getModel(): Promise<ModelId> {
  const result = await chrome.storage.sync.get('model');
  return (result.model as ModelId) ?? DEFAULT_MODEL;
}

export async function setModel(model: ModelId): Promise<void> {
  await chrome.storage.sync.set({ model });
}
```

- [ ] **Step 6: Run tests — confirm pass**

```bash
npm test tests/unit/storage.test.ts
```
Expected: PASS (8 tests).

- [ ] **Step 7: Commit**

```bash
git add src/shared/ tests/unit/storage.test.ts
git commit -m "feat: add shared types, storage utilities, constants"
```

---

### Task 3: App shell — 3-column layout

**Files:**
- Create: `src/app/App.tsx`, `src/app/components/LeftRail.tsx`, `src/app/components/CenterBrowser.tsx`, `src/app/components/RightRail.tsx`
- Modify: `src/app/main.tsx`

- [ ] **Step 1: Write `src/app/App.tsx`**

```typescript
import React, { useEffect, useState } from 'react';
import LeftRail from './components/LeftRail';
import CenterBrowser from './components/CenterBrowser';
import RightRail from './components/RightRail';
import RailFab from './components/RailFab';
import { getRailState, setRailState } from '../shared/storage';

export default function App() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [frameId, setFrameId] = useState<number | null>(null);

  useEffect(() => {
    getRailState().then(s => {
      setLeftOpen(s.leftOpen);
      setRightOpen(s.rightOpen);
    });
  }, []);

  // Blob URLs must be created in a document context (not the service worker).
  // The background tool-executor sends CREATE_PREVIEW_TAB here instead.
  useEffect(() => {
    const handler = (msg: { type: string; html: string }, _sender: chrome.runtime.MessageSender, sendResponse: (r: unknown) => void) => {
      if (msg.type !== 'CREATE_PREVIEW_TAB') return false;
      const blob = new Blob([msg.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      chrome.tabs.create({ url }).then(tab => sendResponse({ tabId: tab.id ?? 0 }));
      return true; // keep channel open for async sendResponse
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  const toggleLeft = () => {
    const next = !leftOpen;
    setLeftOpen(next);
    setRailState({ leftOpen: next, rightOpen });
  };

  const toggleRight = () => {
    const next = !rightOpen;
    setRightOpen(next);
    setRailState({ leftOpen, rightOpen: next });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f0f1a] text-white">
      {/* Left rail */}
      <div
        className="flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden"
        style={{ width: leftOpen ? 200 : 0, opacity: leftOpen ? 1 : 0 }}
      >
        <LeftRail onCollapse={toggleLeft} frameId={frameId} />
      </div>

      {/* Center */}
      <div className="flex-1 relative min-w-0">
        {!leftOpen && (
          <RailFab side="left" onClick={toggleLeft} icon="☰" />
        )}
        {!rightOpen && (
          <RailFab side="right" onClick={toggleRight} icon="💬" />
        )}
        <CenterBrowser onFrameId={setFrameId} />
      </div>

      {/* Right rail */}
      <div
        className="flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden"
        style={{ width: rightOpen ? 280 : 0, opacity: rightOpen ? 1 : 0 }}
      >
        <RightRail onCollapse={toggleRight} frameId={frameId} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/app/components/RailFab.tsx`**

```typescript
import React from 'react';

interface Props {
  side: 'left' | 'right';
  onClick: () => void;
  icon: string;
}

export default function RailFab({ side, onClick, icon }: Props) {
  return (
    <button
      onClick={onClick}
      className="absolute top-12 z-50 w-9 h-9 rounded-full bg-[#6c47ff] shadow-lg flex items-center justify-center text-white text-base hover:bg-[#7c57ff] transition-colors"
      style={{ [side]: 10 }}
      title={side === 'left' ? 'Open extract panel' : 'Open Claude'}
    >
      {icon}
    </button>
  );
}
```

- [ ] **Step 3: Write placeholder `src/app/components/LeftRail.tsx`**

```typescript
import React from 'react';

interface Props {
  onCollapse: () => void;
  frameId: number | null;
}

const MODES = [
  { id: 'designSystem', icon: '🎨', label: 'Design System' },
  { id: 'dsMapping', icon: '🗺', label: 'DS Mapping' },
  { id: 'designStyle', icon: '✏️', label: 'Design Style' },
  { id: 'principles', icon: '📐', label: 'Principles' },
  { id: 'animation', icon: '🎬', label: 'Animation' },
  { id: 'localization', icon: '🌍', label: 'Localization' },
  { id: 'a11y', icon: '♿', label: 'A11y' },
  { id: 'fromFigma', icon: '🔧', label: 'From Figma' },
] as const;

export default function LeftRail({ onCollapse }: Props) {
  return (
    <div className="h-full w-full bg-[#1e1e2e] border-r border-[#2a2a3e] flex flex-col">
      {/* Collapse trigger */}
      <button
        onClick={onCollapse}
        className="flex items-center gap-1.5 px-3 py-2 border-b border-[#2a2a3e] text-[#6c47ff] hover:text-[#9c7fff] transition-colors"
      >
        <span className="text-lg leading-none">‹</span>
        <span className="text-[10px] uppercase tracking-wider text-[#666] hover:text-[#888]">Collapse</span>
      </button>

      {/* Modes */}
      <div className="flex-1 p-3 overflow-y-auto">
        <p className="text-[9px] uppercase tracking-widest text-[#555] mb-2">Extract</p>
        {MODES.map(mode => (
          <button
            key={mode.id}
            className="w-full text-left px-2 py-1.5 rounded text-[#888] hover:bg-[#2a2a3e] hover:text-[#ccc] text-xs mb-1 transition-colors"
          >
            {mode.icon} {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write placeholder `src/app/components/CenterBrowser.tsx`**

```typescript
import React, { useRef, useState } from 'react';

interface Props {
  onFrameId: (id: number | null) => void;
}

export default function CenterBrowser({ onFrameId }: Props) {
  const [url, setUrl] = useState('');
  const [committed, setCommitted] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (target: string) => {
    const full = target.startsWith('http') ? target : `https://${target}`;
    setCommitted(full);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* URL bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f0f0f0] border-b border-[#ddd] flex-shrink-0">
        <input
          className="flex-1 bg-white border border-[#ccc] rounded px-2 py-1 text-xs text-[#333] focus:outline-none focus:border-[#6c47ff]"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && navigate(url)}
          placeholder="Enter URL…"
        />
        <button
          onClick={() => navigate(url)}
          className="px-3 py-1 bg-[#6c47ff] text-white text-xs rounded hover:bg-[#7c57ff]"
        >
          Go
        </button>
      </div>

      {/* iframe */}
      <iframe
        ref={iframeRef}
        src={committed || undefined}
        className="flex-1 w-full border-none"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        title="Browser"
      />
    </div>
  );
}
```

- [ ] **Step 5: Write placeholder `src/app/components/RightRail.tsx`**

```typescript
import React from 'react';

interface Props {
  onCollapse: () => void;
  frameId: number | null;
}

export default function RightRail({ onCollapse }: Props) {
  return (
    <div className="h-full w-full bg-[#1a1a2e] border-l border-[#2a2a3e] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3e] flex-shrink-0">
        <span className="text-sm font-semibold text-[#ccc]">Claude</span>
        <button
          onClick={onCollapse}
          className="flex items-center gap-1.5 text-[#6c47ff] hover:text-[#9c7fff] transition-colors"
        >
          <span className="text-[10px] uppercase tracking-wider text-[#666] hover:text-[#888]">Collapse</span>
          <span className="text-lg leading-none">›</span>
        </button>
      </div>

      {/* Chat area placeholder */}
      <div className="flex-1 flex items-center justify-center text-[#444] text-sm">
        Chat coming in Task 12
      </div>

      {/* Input placeholder */}
      <div className="p-2 border-t border-[#2a2a3e] flex gap-2">
        <input
          className="flex-1 bg-[#2a2a3e] border border-[#444] rounded px-2 py-1.5 text-xs text-[#ccc] placeholder-[#555] focus:outline-none"
          placeholder="Ask Claude…"
          disabled
        />
        <button className="bg-[#6c47ff] text-white rounded px-2 py-1.5 text-xs opacity-50" disabled>↑</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Update `src/app/main.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

- [ ] **Step 7: Build and verify**

```bash
npm run build
```
Reload extension in Chrome, open the tab. Expected: 3-column layout visible, left and right rails show with collapse buttons.

- [ ] **Step 8: Commit**

```bash
git add src/app/
git commit -m "feat: 3-column app shell with placeholder rails"
```

---

### Task 4: Rail collapse and viewport control

**Files:**
- Create: `src/app/components/ViewportControl.tsx`, `src/app/hooks/useRailState.ts`
- Modify: `src/app/components/CenterBrowser.tsx`

- [ ] **Step 1: Write `src/app/hooks/useRailState.ts`**

```typescript
import { useEffect, useState } from 'react';
import { getRailState, setRailState } from '../../shared/storage';
import type { RailState } from '../../shared/types';

export function useRailState() {
  const [state, setState] = useState<RailState>({ leftOpen: true, rightOpen: true });

  useEffect(() => {
    getRailState().then(setState);
  }, []);

  const toggle = (side: 'left' | 'right') => {
    setState(prev => {
      const next = { ...prev, [side === 'left' ? 'leftOpen' : 'rightOpen']: !prev[side === 'left' ? 'leftOpen' : 'rightOpen'] };
      setRailState(next);
      return next;
    });
  };

  return { state, toggle };
}
```

- [ ] **Step 2: Write `src/app/components/ViewportControl.tsx`**

```typescript
import React from 'react';
import { VIEWPORT_PRESETS } from '../../shared/constants';

interface Props {
  width: number | null;
  onChange: (width: number | null) => void;
}

export default function ViewportControl({ width, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      {VIEWPORT_PRESETS.map(preset => (
        <button
          key={preset.label}
          onClick={() => onChange(preset.width)}
          className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
            width === preset.width
              ? 'bg-[#6c47ff] text-white'
              : 'bg-[#e0e0e0] text-[#555] hover:bg-[#d0d0d0]'
          }`}
        >
          {preset.label}
          {preset.width ? ` ${preset.width}` : ''}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Update `src/app/components/CenterBrowser.tsx` to add viewport control**

Replace the entire file:

```typescript
import React, { useEffect, useRef, useState } from 'react';
import ViewportControl from './ViewportControl';
import { getViewportWidth, setViewportWidth } from '../../shared/storage';

interface Props {
  onFrameId: (id: number | null) => void;
}

export default function CenterBrowser({ onFrameId }: Props) {
  const [url, setUrl] = useState('');
  const [committed, setCommitted] = useState('');
  const [viewportWidth, setViewport] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    getViewportWidth().then(w => setViewport(w));
  }, []);

  // After the iframe navigates, ask the background to resolve its frameId
  // via chrome.webNavigation.getAllFrames (requires webNavigation permission)
  const handleIframeLoad = () => {
    const src = iframeRef.current?.src;
    if (!src) return;
    chrome.runtime.sendMessage({ type: 'REGISTER_FRAME', iframeUrl: src })
      .then((res: { frameId: number | null }) => onFrameId(res.frameId))
      .catch(() => onFrameId(null));
  };

  const navigate = (target: string) => {
    const full = target.startsWith('http') ? target : `https://${target}`;
    onFrameId(null); // clear stale frameId while new page loads
    setCommitted(full);
  };

  const handleViewportChange = (w: number | null) => {
    setViewport(w);
    setViewportWidth(w);
  };

  const iframeStyle: React.CSSProperties = viewportWidth
    ? { width: viewportWidth, margin: '0 auto', display: 'block', border: '1px solid #ccc', height: '100%' }
    : { width: '100%', height: '100%' };

  return (
    <div className="flex flex-col h-full bg-[#f7f8fa]">
      {/* URL bar row */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f0f0f0] border-b border-[#ddd] flex-shrink-0 flex-wrap gap-y-1">
        <input
          className="flex-1 min-w-0 bg-white border border-[#ccc] rounded px-2 py-1 text-xs text-[#333] focus:outline-none focus:border-[#6c47ff]"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && navigate(url)}
          placeholder="Enter URL…"
        />
        <button
          onClick={() => navigate(url)}
          className="px-3 py-1 bg-[#6c47ff] text-white text-xs rounded hover:bg-[#7c57ff] flex-shrink-0"
        >
          Go
        </button>
        <ViewportControl width={viewportWidth} onChange={handleViewportChange} />
      </div>

      {/* iframe container */}
      <div className="flex-1 overflow-auto bg-[#e8e8e8]">
        {committed ? (
          <iframe
            ref={iframeRef}
            src={committed}
            style={iframeStyle}
            className="border-none"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="Browser"
            onLoad={handleIframeLoad}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[#999] text-sm">
            Enter a URL above to begin
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```
Reload extension. Verify: clicking ‹ Collapse hides the left rail and shows the ☰ FAB at top-left. Clicking › Collapse hides right rail, shows 💬 FAB. Viewport presets appear in URL bar.

- [ ] **Step 5: Commit**

```bash
git add src/app/
git commit -m "feat: rail collapse with FABs, viewport width control"
```

---

### Task 5: declarativeNetRequest header stripping

**Files:**
- Create: `src/background/header-rules.ts`
- Test: `tests/unit/header-rules.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/unit/header-rules.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setHeaderRulesForUrl, clearHeaderRules } from '../../src/background/header-rules';

beforeEach(() => { vi.clearAllMocks(); });

describe('setHeaderRulesForUrl', () => {
  it('calls updateDynamicRules with removeRuleIds and addRules', async () => {
    await setHeaderRulesForUrl('https://example.com');

    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith(
      expect.objectContaining({
        addRules: expect.arrayContaining([
          expect.objectContaining({
            action: expect.objectContaining({ type: 'modifyHeaders' }),
            condition: expect.objectContaining({ urlFilter: 'https://example.com' }),
          }),
        ]),
      })
    );
  });

  it('strips X-Frame-Options and Content-Security-Policy', async () => {
    await setHeaderRulesForUrl('https://example.com');
    const call = (chrome.declarativeNetRequest.updateDynamicRules as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const headers: string[] = call.addRules[0].action.responseHeaders.map((h: { header: string }) => h.header.toLowerCase());
    expect(headers).toContain('x-frame-options');
    expect(headers).toContain('content-security-policy');
  });
});

describe('clearHeaderRules', () => {
  it('removes all dynamic rules', async () => {
    (chrome.declarativeNetRequest.getDynamicRules as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
    await clearHeaderRules();
    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
      removeRuleIds: [1, 2],
      addRules: [],
    });
  });
});
```

- [ ] **Step 2: Run — confirm failure**

```bash
npm test tests/unit/header-rules.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/background/header-rules.ts`**

```typescript
const RULE_ID = 1000;

export async function setHeaderRulesForUrl(url: string): Promise<void> {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map(r => r.id),
    addRules: [
      {
        id: RULE_ID,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          responseHeaders: [
            { header: 'X-Frame-Options', operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE },
            { header: 'Content-Security-Policy', operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE },
            { header: 'Content-Security-Policy-Report-Only', operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE },
          ],
        },
        condition: {
          urlFilter: url,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.SUB_FRAME],
        },
      },
    ],
  });
}

export async function clearHeaderRules(): Promise<void> {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map(r => r.id),
    addRules: [],
  });
}
```

- [ ] **Step 4: Add enum values to chrome mock in `tests/setup.ts`**

Add inside the `global.chrome` object:

```typescript
declarativeNetRequest: {
  updateDynamicRules: vi.fn(() => Promise.resolve()),
  getDynamicRules: vi.fn(() => Promise.resolve([])),
  RuleActionType: { MODIFY_HEADERS: 'modifyHeaders' },
  HeaderOperation: { REMOVE: 'remove' },
  ResourceType: { SUB_FRAME: 'sub_frame' },
},
```

- [ ] **Step 5: Run — confirm pass**

```bash
npm test tests/unit/header-rules.test.ts
```
Expected: PASS (3 tests).

- [ ] **Step 6: Wire into background service worker `src/background/index.ts`**

```typescript
import { setHeaderRulesForUrl, clearHeaderRules } from './header-rules';
import type { ToBackground } from '../shared/types';

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('src/app/index.html') });
});

chrome.runtime.onMessage.addListener((msg: ToBackground, _sender, sendResponse) => {
  if (msg.type === 'SET_HEADER_RULES') {
    setHeaderRulesForUrl(msg.url).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'CLEAR_HEADER_RULES') {
    clearHeaderRules().then(() => sendResponse({ ok: true }));
    return true;
  }
});
```

- [ ] **Step 7: Wire navigate in CenterBrowser to send SET_HEADER_RULES**

Add to `navigate()` function in `src/app/components/CenterBrowser.tsx`:

```typescript
const navigate = (target: string) => {
  const full = target.startsWith('http') ? target : `https://${target}`;
  chrome.runtime.sendMessage({ type: 'SET_HEADER_RULES', url: full });
  setCommitted(full);
};
```

- [ ] **Step 8: Commit**

```bash
git add src/background/ tests/unit/header-rules.test.ts
git commit -m "feat: declarativeNetRequest header stripping for iframe embedding"
```

---

### Task 6: DOM content script and bridge

**Files:**
- Create: `src/content/dom-extractor.ts`, `src/background/dom-bridge.ts`
- Test: `tests/unit/dom-bridge.test.ts`

- [ ] **Step 1: Write `src/content/dom-extractor.ts`**

```typescript
// Injected into the iframe via chrome.scripting.executeScript
// Returns a DomSnapshot — must be self-contained (no imports).
// Must be async because it fetches linked stylesheets.
(async function () {
  const stylesheets: string[] = [];
  document.querySelectorAll<HTMLStyleElement>('style').forEach(s => {
    stylesheets.push(s.textContent ?? '');
  });
  // Attempt to fetch linked stylesheets so audit tools have full CSS coverage.
  // Cross-origin sheets will fail (CORS); those get a placeholder comment instead.
  for (const l of Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))) {
    try {
      const res = await fetch(l.href, { cache: 'force-cache' });
      if (res.ok) stylesheets.push(await res.text());
      else stylesheets.push(`/* linked: ${l.href} */`);
    } catch {
      stylesheets.push(`/* linked: ${l.href} */`);
    }
  }

  const scripts: string[] = [];
  document.querySelectorAll<HTMLScriptElement>('script:not([src])').forEach(s => {
    scripts.push(s.textContent ?? '');
  });

  const libPatterns: [string, RegExp][] = [
    ['framer-motion', /framer.motion/i],
    ['gsap', /gsap|TweenMax|TweenLite/i],
    ['react', /__reactFiber|__reactProps/],
    ['vue', /__vue__|__Vue__/],
    ['tailwind', /tailwind/i],
    ['bootstrap', /bootstrap/i],
  ];
  const detectedLibraries: string[] = [];
  const bodyText = document.body?.innerHTML ?? '';
  for (const [name, pattern] of libPatterns) {
    if (pattern.test(bodyText) || pattern.test(document.head?.innerHTML ?? '')) {
      detectedLibraries.push(name);
    }
  }

  return {
    url: location.href,
    title: document.title,
    html: document.documentElement.outerHTML.slice(0, 500_000),
    stylesheets,
    scripts,
    detectedLibraries,
  };
})();
```

- [ ] **Step 2: Write failing test for dom-bridge**

```typescript
// tests/unit/dom-bridge.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDomSnapshot } from '../../src/background/dom-bridge';

beforeEach(() => { vi.clearAllMocks(); });

it('executes script in the given frame and returns snapshot', async () => {
  const fakeSnapshot = {
    url: 'https://example.com', title: 'Test', html: '<html></html>',
    stylesheets: [], scripts: [], detectedLibraries: [],
  };
  (chrome.scripting.executeScript as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
    { result: fakeSnapshot },
  ]);

  const result = await getDomSnapshot(42, false);
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
    expect.objectContaining({ target: { tabId: expect.any(Number), frameIds: [42] } })
  );
  expect(result).toEqual(fakeSnapshot);
});

it('throws when executeScript returns empty results', async () => {
  (chrome.scripting.executeScript as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);
  await expect(getDomSnapshot(42, false)).rejects.toThrow('No result');
});
```

- [ ] **Step 3: Run — confirm failure**

```bash
npm test tests/unit/dom-bridge.test.ts
```

- [ ] **Step 4: Write `src/background/dom-bridge.ts`**

```typescript
import type { DomSnapshot } from '../shared/types';

export async function getDomSnapshot(frameId: number, _includeScripts: boolean): Promise<DomSnapshot> {
  const tabId = await getActiveTabId();
  const results = await chrome.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    func: extractDom,
  });

  if (!results || results.length === 0 || !results[0].result) {
    throw new Error('No result from DOM extraction');
  }
  return results[0].result as DomSnapshot;
}

async function getActiveTabId(): Promise<number> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.id ?? 0;
}

function extractDom(): DomSnapshot {
  const stylesheets: string[] = [];
  document.querySelectorAll<HTMLStyleElement>('style').forEach(s => {
    stylesheets.push(s.textContent ?? '');
  });
  // Attempt to fetch linked stylesheets so audit tools have full CSS coverage.
  // Cross-origin sheets will fail (CORS); those get a placeholder comment instead.
  for (const l of Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))) {
    try {
      const res = await fetch(l.href, { cache: 'force-cache' });
      if (res.ok) stylesheets.push(await res.text());
      else stylesheets.push(`/* linked: ${l.href} */`);
    } catch {
      stylesheets.push(`/* linked: ${l.href} */`);
    }
  }

  const scripts: string[] = [];
  document.querySelectorAll<HTMLScriptElement>('script:not([src])').forEach(s => {
    scripts.push(s.textContent ?? '');
  });

  const libPatterns: Array<[string, RegExp]> = [
    ['framer-motion', /framer.motion/i],
    ['gsap', /gsap|TweenMax|TweenLite/i],
    ['react', /__reactFiber|__reactProps/],
    ['vue', /__vue__|__Vue__/],
    ['tailwind', /tailwind/i],
    ['bootstrap', /bootstrap/i],
  ];
  const detectedLibraries: string[] = [];
  const bodyText = document.body?.innerHTML ?? '';
  for (const [name, pattern] of libPatterns) {
    if (pattern.test(bodyText) || pattern.test(document.head?.innerHTML ?? '')) {
      detectedLibraries.push(name);
    }
  }

  return {
    url: location.href,
    title: document.title,
    html: document.documentElement.outerHTML.slice(0, 500_000),
    stylesheets,
    scripts,
    detectedLibraries,
  };
}

// Re-export type for background message handler
export type { DomSnapshot };
```

- [ ] **Step 5: Run — confirm pass**

```bash
npm test tests/unit/dom-bridge.test.ts
```
Expected: PASS (2 tests).

- [ ] **Step 6: Add GET_SNAPSHOT handler to `src/background/index.ts`**

```typescript
import { getDomSnapshot } from './dom-bridge';

// inside the onMessage listener, add:
if (msg.type === 'GET_SNAPSHOT') {
  getDomSnapshot(msg.frameId, msg.includeScripts)
    .then(snapshot => sendResponse({ type: 'SNAPSHOT_RESULT', snapshot }))
    .catch(err => sendResponse({ type: 'STREAM_ERROR', error: err.message }));
  return true;
}
```

- [ ] **Step 7: Commit**

```bash
git add src/content/ src/background/dom-bridge.ts src/background/index.ts tests/unit/dom-bridge.test.ts
git commit -m "feat: DOM content script + background bridge"
```

---

## Phase 2 — Claude Integration (Tasks 7–13)
*Deliverable: Full Claude chat, extraction modes, output cards, streaming.*

---

### Task 7: Extraction system prompts

**Files:**
- Create: `src/shared/extraction-prompts.ts`
- Test: `tests/unit/extraction-prompts.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/unit/extraction-prompts.test.ts
import { describe, it, expect } from 'vitest';
import { getSystemPrompt, getExtractionUserMessage } from '../../src/shared/extraction-prompts';

describe('getSystemPrompt', () => {
  it('returns a non-empty string for each mode', () => {
    const modes = ['designSystem','dsMapping','designStyle','principles','animation','localization','a11y','fromFigma'] as const;
    for (const mode of modes) {
      expect(getSystemPrompt(mode).length).toBeGreaterThan(100);
    }
  });
});

describe('getExtractionUserMessage', () => {
  it('includes the URL in the message', () => {
    const msg = getExtractionUserMessage('animation', 'https://stripe.com', '<html></html>', []);
    expect(msg).toContain('https://stripe.com');
  });
});
```

- [ ] **Step 2: Run — confirm failure**

```bash
npm test tests/unit/extraction-prompts.test.ts
```

- [ ] **Step 3: Write `src/shared/extraction-prompts.ts`**

```typescript
import type { ExtractMode } from './types';

const BASE = `You are a design analyst embedded in a browser extension. The user has loaded a live website and wants structured analysis. Respond with clear, engineering-ready output. When you produce a data table, format it as JSON with keys "columns" (string[]) and "rows" (string[][]). When you want to push data to Figma, call the push_to_figma tool.`;

const PROMPTS: Record<ExtractMode, string> = {
  designSystem: `${BASE}

Your task: Extract the complete design system from the page's CSS and DOM.
Return a JSON spec with these sections:
- colors: all unique hex/rgb values with their CSS variable name or class
- typography: font families, sizes, weights, line heights in use
- spacing: spacing scale values (padding, margin, gap patterns)
- borderRadius: all radius values in use
- elevation: box-shadow values
- iconSet: detected icon library name if any

After the JSON, write a short human-readable summary (3-5 sentences).`,

  dsMapping: `${BASE}

Your task: Map the page's design patterns to known design systems.
Identify: which design system this most resembles (Spectrum, Material, Fluent, Tailwind, custom).
For each match, provide a confidence score (0–100) and evidence (class names, token patterns, component shapes).
Return a JSON array: [{ system, confidence, evidence[] }]
Then explain your reasoning in 2-3 sentences.`,

  designStyle: `${BASE}

Your task: Analyse the visual language and brand personality of this page.
Cover: tone (minimal/expressive/corporate/playful), color mood, typographic personality, layout density, whitespace usage, imagery style.
Return a JSON object with these keys: tone, colorMood, typographicPersonality, layoutDensity, whitespaceUsage, imageryStyle.
Each value is a short phrase (3-8 words). Then write a 2-paragraph narrative.`,

  principles: `${BASE}

Your task: Infer the design principles at work on this page from observable UI patterns.
Name 3-5 principles. For each, provide: name, evidence (2-3 specific UI choices that demonstrate it), implication for engineers.
Return as JSON: [{ name, evidence[], implication }]`,

  animation: `${BASE}

Your task: Extract all animation and motion data from this page's CSS and detected JS libraries.
Return a JSON spec table: columns = ["Property", "Value", "Element", "Trigger", "Notes"]
Include: CSS transitions, @keyframes, detected animation library patterns (Framer Motion, GSAP, etc.), timing functions, durations.
After the table, note any prefers-reduced-motion support found.`,

  localization: `${BASE}

Your task: Audit this page for localization readiness.
Find: hardcoded strings vs i18n keys, date/number/currency format patterns, RTL support evidence, locale-specific images or content.
Return a JSON report: { hardcodedStrings: string[], i18nKeys: string[], dateFormats: string[], rtlSupport: boolean, issues: string[], suggestions: string[] }`,

  a11y: `${BASE}

Your task: Perform an accessibility audit of this page against WCAG 2.2 AA.
Check: heading hierarchy, landmark regions, ARIA roles and labels, alt text, color contrast (flag elements that look low-contrast), keyboard navigation patterns, focus management, form labels.
Return a JSON report: { issues: [{wcagSC, element, description}], suggestions: [{element, description}], passes: string[] }
Reference WCAG SC codes (e.g. "1.3.1", "2.4.6") for each issue.`,

  fromFigma: `${BASE}

Your task: Build a working HTML/CSS prototype from a Figma design.
You will receive a design tree from the Figma file. Convert it to clean, semantic HTML5 and CSS.
Use CSS custom properties for colors and spacing. Make it responsive where possible.
Return the complete HTML as a single self-contained file (inline all CSS in a <style> block).
Then call preview_in_tab with the HTML string.`,
};

export function getSystemPrompt(mode: ExtractMode): string {
  return PROMPTS[mode];
}

export function getExtractionUserMessage(
  mode: ExtractMode,
  url: string,
  html: string,
  stylesheets: string[]
): string {
  const cssPreview = stylesheets.slice(0, 3).join('\n').slice(0, 10_000);
  const htmlPreview = html.slice(0, 20_000);

  return `Page URL: ${url}

=== HTML (truncated) ===
${htmlPreview}

=== CSS (truncated) ===
${cssPreview}

Please perform the ${mode} extraction now.`;
}
```

- [ ] **Step 4: Run — confirm pass**

```bash
npm test tests/unit/extraction-prompts.test.ts
```
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/shared/extraction-prompts.ts tests/unit/extraction-prompts.test.ts
git commit -m "feat: system prompts for all 8 extraction modes"
```

---

### Task 8: Claude API client

**Files:**
- Create: `src/background/claude-client.ts`
- Test: `tests/unit/claude-client.test.ts`

- [ ] **Step 1: Install Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

- [ ] **Step 2: Write failing test**

```typescript
// tests/unit/claude-client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClaudeClient } from '../../src/background/claude-client';

beforeEach(() => { vi.clearAllMocks(); });

it('throws when API key is not set', async () => {
  (chrome.storage.sync.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});
  const client = createClaudeClient();
  await expect(
    client.sendMessage('hello', [], vi.fn(), vi.fn(), vi.fn())
  ).rejects.toThrow('API key not set');
});
```

- [ ] **Step 3: Run — confirm failure**

```bash
npm test tests/unit/claude-client.test.ts
```

- [ ] **Step 4: Write `src/background/claude-client.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { getApiKey, getModel } from '../shared/storage';
import type { OutputCard, ChatMessage } from '../shared/types';

export interface ClaudeClient {
  sendMessage(
    text: string,
    history: ChatMessage[],
    systemPrompt: string,
    onChunk: (text: string) => void,
    onCard: (card: OutputCard) => void,
    onDone: () => void,
    onError: (err: string) => void,
  ): Promise<void>;
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'read_page',
    description: 'Get the full DOM snapshot of the current page in the iframe.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'preview_in_tab',
    description: 'Open a new Chrome tab with the provided HTML as a Blob URL.',
    input_schema: {
      type: 'object' as const,
      properties: { html: { type: 'string', description: 'Complete HTML to preview' } },
      required: ['html'],
    },
  },
  {
    name: 'save_files',
    description: 'Save one or more files to the user\'s designated folder.',
    input_schema: {
      type: 'object' as const,
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['name', 'content'],
          },
        },
      },
      required: ['files'],
    },
  },
  {
    name: 'push_to_figma',
    description: 'Push a spec or design data to Figma via the Consonant bridge.',
    input_schema: {
      type: 'object' as const,
      properties: {
        method: { type: 'string', description: 'Figma bridge method name' },
        params: { type: 'object', description: 'Method parameters' },
      },
      required: ['method', 'params'],
    },
  },
  {
    name: 'read_figma_design',
    description: 'Read a Figma design tree by node ID via the Consonant bridge.',
    input_schema: {
      type: 'object' as const,
      properties: { nodeId: { type: 'string', description: 'Figma node ID or URL' } },
      required: ['nodeId'],
    },
  },
  {
    name: 'navigate',
    description: 'Navigate the iframe to a new URL.',
    input_schema: {
      type: 'object' as const,
      properties: { url: { type: 'string' } },
      required: ['url'],
    },
  },
  {
    name: 'screenshot',
    description: 'Capture a screenshot of the current iframe for visual context.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
];

export function createClaudeClient(): ClaudeClient {
  return {
    async sendMessage(text, history, systemPrompt, onChunk, onCard, onDone, onError) {
      const [apiKey, model] = await Promise.all([getApiKey(), getModel()]);
      if (!apiKey) throw new Error('API key not set. Open Settings and enter your Anthropic API key.');

      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

      const messages: Anthropic.MessageParam[] = [
        ...history.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user', content: text },
      ];

      try {
        const stream = client.messages.stream({
          model,
          max_tokens: 8192,
          system: systemPrompt,
          tools: TOOLS,
          messages,
        });

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            onChunk(event.delta.text);
          }
          if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
            // Tool calls are handled after stream ends via finalMessage
          }
        }

        const final = await stream.finalMessage();
        for (const block of final.content) {
          if (block.type === 'tool_use') {
            // Signal tool call to executor via a card — executor handles async
            onCard({ type: 'figma-input', prompt: `Calling tool: ${block.name}` });
          }
        }

        onDone();
      } catch (err) {
        onError(err instanceof Error ? err.message : String(err));
      }
    },
  };
}
```

- [ ] **Step 5: Run — confirm pass**

```bash
npm test tests/unit/claude-client.test.ts
```
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add src/background/claude-client.ts tests/unit/claude-client.test.ts
git commit -m "feat: Claude streaming client — Sonnet 4.6 default, Opus 4.7 user-selectable"
```

---

### Task 9: Tool executor

**Files:**
- Create: `src/background/tool-executor.ts`
- Test: `tests/unit/tool-executor.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/unit/tool-executor.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeTool } from '../../src/background/tool-executor';

beforeEach(() => { vi.clearAllMocks(); });

describe('preview_in_tab', () => {
  it('creates a new tab with a blob URL', async () => {
    (chrome.tabs.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 5 });
    const result = await executeTool('preview_in_tab', { html: '<html><body>Test</body></html>' }, null);
    expect(chrome.tabs.create).toHaveBeenCalledWith(
      expect.objectContaining({ url: expect.stringContaining('blob:') })
    );
    expect(result).toMatchObject({ type: 'preview-tab', tabId: 5 });
  });
});

describe('navigate', () => {
  it('sends SET_HEADER_RULES and returns navigation confirmation', async () => {
    (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });
    const result = await executeTool('navigate', { url: 'https://example.com' }, null);
    expect(result).toMatchObject({ navigated: true });
  });
});

describe('push_to_figma', () => {
  it('returns error card when bridge is unreachable', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const result = await executeTool('push_to_figma', { method: 'figma_execute', params: {} }, null);
    expect(result).toMatchObject({ type: 'error', message: expect.stringContaining('Figma') });
  });
});
```

- [ ] **Step 2: Run — confirm failure**

```bash
npm test tests/unit/tool-executor.test.ts
```

- [ ] **Step 3: Write `src/background/tool-executor.ts`**

```typescript
import { FIGMA_BRIDGE_URL } from '../shared/constants';
import type { OutputCard, DomSnapshot } from '../shared/types';

type ToolResult = OutputCard | Record<string, unknown>;

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  frameId: number | null,
): Promise<ToolResult> {
  switch (name) {
    case 'read_page':
      return readPage(frameId);

    case 'read_page_scripts':
      return readPage(frameId);

    case 'preview_in_tab': {
      // Blob URLs created in a service worker are not accessible from a real tab.
      // Forward the HTML to the app shell (a document context) which creates the Blob URL there.
      const html = input.html as string;
      const response = await chrome.runtime.sendMessage({ type: 'CREATE_PREVIEW_TAB', html });
      return { type: 'preview-tab', tabId: response.tabId ?? 0, summary: 'Opened preview in new tab' } satisfies OutputCard;
    }

    case 'save_files': {
      const files = input.files as Array<{ name: string; content: string }>;
      for (const file of files) {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        await chrome.downloads.download({ url, filename: file.name, saveAs: files.length === 1 });
      }
      return { saved: true, count: files.length };
    }

    case 'push_to_figma':
      return pushToFigma(input.method as string, input.params as Record<string, unknown>);

    case 'read_figma_design':
      return readFigmaDesign(input.nodeId as string);

    case 'navigate': {
      const url = input.url as string;
      chrome.runtime.sendMessage({ type: 'SET_HEADER_RULES', url });
      return { navigated: true, url };
    }

    case 'screenshot': {
      if (frameId === null) {
        return { type: 'error', message: 'No active page — navigate to a URL first.', recovery: 'Enter a URL in the address bar.' } satisfies OutputCard;
      }
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const windowId = tabs[0]?.windowId;
        if (windowId === undefined) throw new Error('No active window');
        const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' });
        return { screenshot: dataUrl };
      } catch (err) {
        return {
          type: 'error',
          message: 'Screenshot failed — the extension tab must be active and its window focused.',
          recovery: 'Click the Design Audit Tool tab to bring it to the front, then try again.',
        } satisfies OutputCard;
      }
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

async function readPage(frameId: number | null): Promise<DomSnapshot | { error: string }> {
  if (frameId === null) return { error: 'No active frame. Navigate to a page first.' };
  try {
    const { getDomSnapshot } = await import('./dom-bridge');
    return await getDomSnapshot(frameId, false);
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

async function pushToFigma(method: string, params: Record<string, unknown>): Promise<ToolResult> {
  try {
    const res = await fetch(`${FIGMA_BRIDGE_URL}/figma`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, params }),
    });
    if (!res.ok) throw new Error(`Bridge HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return { type: 'figma', summary: `${method} completed successfully` } satisfies OutputCard;
  } catch (err) {
    return {
      type: 'error',
      message: `Figma bridge error: ${err instanceof Error ? err.message : String(err)}. Is the Consonant plugin open in Figma?`,
      recovery: 'Open Figma Desktop, load your file, and ensure the Consonant plugin is running.',
    } satisfies OutputCard;
  }
}

async function readFigmaDesign(nodeId: string): Promise<ToolResult> {
  // Figma URLs encode node IDs as "node-id=123-456" (hyphens), but the Plugin API
  // requires colon format "123:456". Convert after extraction.
  let cleanId = nodeId.trim();
  if (cleanId.includes('figma.com')) {
    const raw = new URL(cleanId).searchParams.get('node-id') ?? cleanId;
    cleanId = raw.replace(/-/g, ':'); // "123-456" → "123:456"
  }
  if (!cleanId || !/\d+:\d+/.test(cleanId)) {
    return {
      type: 'error',
      message: `Could not parse a Figma node ID from: "${nodeId}". Expected a node ID like "123:456" or a Figma URL containing "?node-id=123-456".`,
      recovery: 'Paste a Figma share URL or a raw node ID (e.g. 123:456).',
    } satisfies OutputCard;
  }

  try {
    const fileRes = await fetch(`${FIGMA_BRIDGE_URL}/figma`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'figma_get_file_data', params: { nodeId: cleanId, depth: 4 } }),
    });
    const fileData = await fileRes.json();
    const detailRes = await fetch(`${FIGMA_BRIDGE_URL}/figma`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'figma_get_component_details', params: { nodeId: cleanId } }),
    });
    const detail = await detailRes.json();
    return { fileData: fileData.result, detail: detail.result };
  } catch (err) {
    return {
      type: 'error',
      message: `Could not read Figma design: ${err instanceof Error ? err.message : String(err)}`,
      recovery: 'Ensure the Consonant plugin is open in Figma Desktop.',
    } satisfies OutputCard;
  }
}
```

- [ ] **Step 4: Run — confirm pass**

```bash
npm test tests/unit/tool-executor.test.ts
```
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/background/tool-executor.ts tests/unit/tool-executor.test.ts
git commit -m "feat: tool executor for all 8 Claude tools"
```

---

### Task 10: Background message router (wire Claude + tools)

**Files:**
- Modify: `src/background/index.ts`

- [ ] **Step 1: Replace `src/background/index.ts` with full router**

```typescript
import { setHeaderRulesForUrl, clearHeaderRules } from './header-rules';
import { getDomSnapshot } from './dom-bridge';
import { createClaudeClient } from './claude-client';
import { executeTool } from './tool-executor';
import { getSystemPrompt } from '../shared/extraction-prompts';
import type { ToBackground, ChatMessage } from '../shared/types';

const claudeClient = createClaudeClient();
const history: ChatMessage[] = [];
let activeFrameId: number | null = null;

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('src/app/index.html') });
});

// Non-streaming messages (header rules, snapshots, frame registration)
chrome.runtime.onMessage.addListener((msg: ToBackground, _sender, sendResponse) => {
  if (msg.type === 'SET_HEADER_RULES') {
    setHeaderRulesForUrl(msg.url).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'CLEAR_HEADER_RULES') {
    clearHeaderRules().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'GET_SNAPSHOT') {
    activeFrameId = msg.frameId;
    getDomSnapshot(msg.frameId, msg.includeScripts)
      .then(snapshot => sendResponse({ type: 'SNAPSHOT_RESULT', snapshot }))
      .catch(err => sendResponse({ type: 'STREAM_ERROR', error: err.message }));
    return true;
  }
  if (msg.type === 'REGISTER_FRAME') {
    // Find the iframe's frameId by matching its URL in webNavigation frame list
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tabId = tabs[0]?.id;
      if (!tabId) { sendResponse({ frameId: null }); return; }
      chrome.webNavigation.getAllFrames({ tabId }, frames => {
        const match = frames?.find(f => f.frameId > 0 && f.url.startsWith(msg.iframeUrl.split('?')[0]));
        activeFrameId = match?.frameId ?? null;
        sendResponse({ frameId: activeFrameId });
      });
    });
    return true;
  }
});

// Streaming messages use a long-lived port so chunks can be pushed to the UI
chrome.runtime.onConnect.addListener(port => {
  if (port.name !== 'claude-stream') return;

  port.onMessage.addListener((msg: ToBackground) => {
    if (msg.type !== 'SEND_MESSAGE' && msg.type !== 'EXTRACT') return;

    if (msg.frameId !== null) activeFrameId = msg.frameId;
    const systemPrompt = msg.type === 'EXTRACT'
      ? getSystemPrompt(msg.mode)
      : 'You are a helpful design assistant embedded in a browser extension. You can read the current page, generate code, and push specs to Figma.';
    const userText = msg.type === 'SEND_MESSAGE' ? msg.text : `Please perform the ${msg.mode} extraction on the current page.`;

    claudeClient.sendMessage(
      userText,
      history,
      systemPrompt,
      chunk => port.postMessage({ type: 'STREAM_CHUNK', text: chunk }),
      card  => port.postMessage({ type: 'STREAM_CARD',  card }),
      ()    => port.postMessage({ type: 'STREAM_DONE' }),
      err   => port.postMessage({ type: 'STREAM_ERROR', error: err }),
    );
  });
});
```

- [ ] **Step 2: Build**

```bash
npm run build
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/background/index.ts
git commit -m "feat: background message router wiring Claude + tools"
```

---

### Task 11: Chat UI with streaming

**Files:**
- Create: `src/app/hooks/useConversation.ts`, `src/app/components/ChatThread.tsx`, `src/app/components/ChatMessage.tsx`, `src/app/components/ChatInput.tsx`, `src/app/components/cards/SpecTableCard.tsx`, `src/app/components/cards/PreviewTabCard.tsx`, `src/app/components/cards/FigmaCard.tsx`, `src/app/components/cards/ErrorCard.tsx`
- Modify: `src/app/components/RightRail.tsx`

- [ ] **Step 1: Write `src/app/hooks/useConversation.ts`**

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage, OutputCard, FromBackground } from '../../shared/types';

let msgId = 0;
const nextId = () => `msg-${++msgId}`;

export function useConversation(frameId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const streamingMsgId = useRef<string | null>(null);
  // Long-lived port for streaming — chunks are pushed, not polled
  const portRef = useRef<chrome.runtime.Port | null>(null);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'claude-stream' });
    portRef.current = port;

    port.onMessage.addListener((msg: FromBackground) => {
      if (msg.type === 'STREAM_CHUNK') {
        setMessages(prev => prev.map(m =>
          m.id === streamingMsgId.current
            ? { ...m, content: m.content + msg.text }
            : m
        ));
      }
      if (msg.type === 'STREAM_CARD') {
        setMessages(prev => prev.map(m =>
          m.id === streamingMsgId.current
            ? { ...m, cards: [...m.cards, msg.card] }
            : m
        ));
      }
      if (msg.type === 'STREAM_DONE') {
        setMessages(prev => prev.map(m =>
          m.id === streamingMsgId.current ? { ...m, streaming: false } : m
        ));
        setStreaming(false);
        streamingMsgId.current = null;
      }
      if (msg.type === 'STREAM_ERROR') {
        const errCard: OutputCard = { type: 'error', message: msg.error };
        setMessages(prev => prev.map(m =>
          m.id === streamingMsgId.current
            ? { ...m, streaming: false, cards: [...m.cards, errCard] }
            : m
        ));
        setStreaming(false);
        streamingMsgId.current = null;
      }
    });

    return () => port.disconnect();
  }, []);

  const sendMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = { id: nextId(), role: 'user', content: text, cards: [], streaming: false, timestamp: Date.now() };
    const assistantMsg: ChatMessage = { id: nextId(), role: 'assistant', content: '', cards: [], streaming: true, timestamp: Date.now() };
    streamingMsgId.current = assistantMsg.id;
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setStreaming(true);
    portRef.current?.postMessage({ type: 'SEND_MESSAGE', text, frameId });
  }, [frameId]);

  const extract = useCallback((mode: string) => {
    const assistantMsg: ChatMessage = { id: nextId(), role: 'assistant', content: '', cards: [], streaming: true, timestamp: Date.now() };
    streamingMsgId.current = assistantMsg.id;
    setMessages(prev => [...prev, assistantMsg]);
    setStreaming(true);
    portRef.current?.postMessage({ type: 'EXTRACT', mode, frameId });
  }, [frameId]);

  return { messages, streaming, sendMessage, extract };
}
```

- [ ] **Step 2: Write output card components**

```typescript
// src/app/components/cards/SpecTableCard.tsx
import React from 'react';
import type { SpecTableCard as T } from '../../../shared/types';

export default function SpecTableCard({ card }: { card: T }) {
  return (
    <div className="mt-2 rounded border border-[#3a3a4e] overflow-hidden text-xs">
      <div className="bg-[#2a2a3e] px-3 py-1.5 flex items-center justify-between">
        <span className="text-[#9c88ff] font-semibold">📋 {card.title}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#333]">
              {card.columns.map(col => (
                <th key={col} className="text-left px-3 py-1.5 text-[#666] font-normal">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {card.rows.map((row, i) => (
              <tr key={i} className="border-b border-[#222]">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-1.5 text-[#aaa]">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

```typescript
// src/app/components/cards/PreviewTabCard.tsx
import React from 'react';
import type { PreviewTabCard as T } from '../../../shared/types';

export default function PreviewTabCard({ card }: { card: T }) {
  const focus = () => chrome.tabs.update(card.tabId, { active: true });
  return (
    <div className="mt-2 rounded border border-[#3a3a4e] overflow-hidden text-xs bg-[#1a2a3e]">
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-[#88ccff] font-semibold">👁 Preview opened</span>
        <button onClick={focus} className="text-[#6c47ff] hover:text-[#9c7fff]">Compare tabs ↗</button>
      </div>
      <p className="px-3 pb-2 text-[#888]">{card.summary}</p>
    </div>
  );
}
```

```typescript
// src/app/components/cards/FigmaCard.tsx
import React from 'react';
import type { FigmaCard as T } from '../../../shared/types';

export default function FigmaCard({ card }: { card: T }) {
  return (
    <div className="mt-2 rounded border border-[#3a3a4e] bg-[#1a2e1a] text-xs px-3 py-2">
      <span className="text-[#88ffcc] font-semibold">✦ Created in Figma</span>
      <p className="text-[#888] mt-1">{card.summary}</p>
    </div>
  );
}
```

```typescript
// src/app/components/cards/ErrorCard.tsx
import React from 'react';
import type { ErrorCard as T } from '../../../shared/types';

export default function ErrorCard({ card }: { card: T }) {
  return (
    <div className="mt-2 rounded border border-[#ff5f57] bg-[#2a1a1a] text-xs px-3 py-2">
      <span className="text-[#ff8a80] font-semibold">⚠ Error</span>
      <p className="text-[#aaa] mt-1">{card.message}</p>
      {card.recovery && <p className="text-[#888] mt-1 italic">{card.recovery}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Write `src/app/components/ChatMessage.tsx`**

```typescript
import React from 'react';
import type { ChatMessage as T, OutputCard } from '../../shared/types';
import SpecTableCard from './cards/SpecTableCard';
import PreviewTabCard from './cards/PreviewTabCard';
import FigmaCard from './cards/FigmaCard';
import ErrorCard from './cards/ErrorCard';

function Card({ card }: { card: OutputCard }) {
  if (card.type === 'spec-table') return <SpecTableCard card={card} />;
  if (card.type === 'preview-tab') return <PreviewTabCard card={card} />;
  if (card.type === 'figma') return <FigmaCard card={card} />;
  if (card.type === 'error') return <ErrorCard card={card} />;
  return null;
}

export default function ChatMessage({ msg }: { msg: T }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`mb-3 ${isUser ? 'text-right' : 'text-left'}`}>
      <div className={`inline-block max-w-[90%] rounded-lg px-3 py-2 text-xs ${
        isUser ? 'bg-[#3a2a4e] text-[#ccc]' : 'bg-[#2a2a3e] text-[#bbb]'
      }`}>
        {msg.content}
        {msg.streaming && <span className="animate-pulse ml-1">▊</span>}
      </div>
      {msg.cards.map((card, i) => <Card key={i} card={card} />)}
    </div>
  );
}
```

- [ ] **Step 4: Write `src/app/components/ChatThread.tsx`**

```typescript
import React, { useEffect, useRef } from 'react';
import type { ChatMessage as T } from '../../shared/types';
import ChatMessage from './ChatMessage';

export default function ChatThread({ messages }: { messages: T[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  return (
    <div className="flex-1 overflow-y-auto px-3 py-3">
      {messages.length === 0 && (
        <p className="text-[#444] text-xs text-center mt-8">Ask Claude anything about the page, or use the extraction modes on the left.</p>
      )}
      {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
      <div ref={bottomRef} />
    </div>
  );
}
```

- [ ] **Step 5: Write `src/app/components/ChatInput.tsx`**

```typescript
import React, { useRef, useState } from 'react';

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };
  return (
    <div className="flex gap-2 p-2 border-t border-[#2a2a3e] flex-shrink-0">
      <textarea
        className="flex-1 bg-[#2a2a3e] border border-[#444] rounded px-2 py-1.5 text-xs text-[#ccc] placeholder-[#555] focus:outline-none focus:border-[#6c47ff] resize-none"
        rows={2}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        placeholder="Ask Claude… (Enter to send, Shift+Enter for newline)"
        disabled={disabled}
      />
      <button
        onClick={send}
        disabled={disabled || !text.trim()}
        className="bg-[#6c47ff] text-white rounded px-3 text-sm self-end disabled:opacity-40 hover:bg-[#7c57ff] transition-colors"
      >↑</button>
    </div>
  );
}
```

- [ ] **Step 6: Update `src/app/components/RightRail.tsx`**

```typescript
import React from 'react';
import ChatThread from './ChatThread';
import ChatInput from './ChatInput';
import { useConversation } from '../hooks/useConversation';

interface Props {
  onCollapse: () => void;
  frameId: number | null;
}

export default function RightRail({ onCollapse, frameId }: Props) {
  const { messages, streaming, sendMessage } = useConversation(frameId);
  return (
    <div className="h-full w-full bg-[#1a1a2e] border-l border-[#2a2a3e] flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3e] flex-shrink-0">
        <span className="text-sm font-semibold text-[#ccc]">Claude</span>
        <button onClick={onCollapse} className="flex items-center gap-1.5 hover:text-[#9c7fff] transition-colors">
          <span className="text-[10px] uppercase tracking-wider text-[#666]">Collapse</span>
          <span className="text-[#6c47ff] text-lg leading-none">›</span>
        </button>
      </div>
      <ChatThread messages={messages} />
      <ChatInput onSend={sendMessage} disabled={streaming} />
    </div>
  );
}
```

- [ ] **Step 7: Wire extraction modes in `src/app/components/LeftRail.tsx`**

Replace the MODES map button click handler:

```typescript
// add import at top
import { useConversation } from '../hooks/useConversation';

// update Props
interface Props {
  onCollapse: () => void;
  frameId: number | null;
}

// inside component, add:
const { extract } = useConversation(frameId);

// update button onClick:
onClick={() => extract(mode.id)}
```

- [ ] **Step 8: Build and smoke-test**

```bash
npm run build
```
Reload extension. Open a URL in the iframe, type a message in the right rail, verify streaming response appears.

- [ ] **Step 9: Commit**

```bash
git add src/app/
git commit -m "feat: full Claude chat UI with streaming, output cards, extraction modes"
```

---

### Task 12: API key settings UI

**Files:**
- Create: `src/app/components/SettingsModal.tsx`
- Modify: `src/app/components/RightRail.tsx`

- [ ] **Step 1: Write `src/app/components/SettingsModal.tsx`**

```typescript
import React, { useEffect, useState } from 'react';
import { getApiKey, setApiKey, getModel, setModel } from '../../shared/storage';
import { MODELS, type ModelId } from '../../shared/constants';

interface Props { onClose: () => void }

export default function SettingsModal({ onClose }: Props) {
  const [key, setKey] = useState('');
  const [model, setModelState] = useState<ModelId>('claude-sonnet-4-6');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([getApiKey(), getModel()]).then(([k, m]) => {
      setKey(k ?? '');
      setModelState(m);
    });
  }, []);

  const save = async () => {
    await Promise.all([setApiKey(key.trim()), setModel(model)]);
    setSaved(true);
    setTimeout(onClose, 800);
  };

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1e1e2e] border border-[#3a3a4e] rounded-lg p-5 w-72">
        <h2 className="text-sm font-semibold text-[#ccc] mb-4">Settings</h2>

        <label className="text-[10px] uppercase tracking-wider text-[#666] mb-1 block">Anthropic API Key</label>
        <input
          type="password"
          className="w-full bg-[#2a2a3e] border border-[#444] rounded px-2 py-1.5 text-xs text-[#ccc] focus:outline-none focus:border-[#6c47ff] mb-4"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="sk-ant-..."
        />

        <label className="text-[10px] uppercase tracking-wider text-[#666] mb-2 block">Model</label>
        <div className="flex flex-col gap-1.5 mb-4">
          {MODELS.map(m => (
            <label key={m.id} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="model"
                value={m.id}
                checked={model === m.id}
                onChange={() => setModelState(m.id as ModelId)}
                className="accent-[#6c47ff]"
              />
              <span className="text-xs text-[#ccc]">{m.label}</span>
              <span className="text-[10px] text-[#555]">{m.description}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 text-xs text-[#666] hover:text-[#aaa]">Cancel</button>
          <button onClick={save} className="px-3 py-1 text-xs bg-[#6c47ff] text-white rounded hover:bg-[#7c57ff]">
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add settings button to RightRail header**

In `src/app/components/RightRail.tsx`, add settings state and button:

```typescript
// add imports
import SettingsModal from './SettingsModal';
import { getModel } from '../../shared/storage';
import type { ModelId } from '../../shared/constants';

// add state inside component
const [showSettings, setShowSettings] = useState(false);
const [activeModel, setActiveModel] = useState<ModelId>('claude-sonnet-4-6');

useEffect(() => { getModel().then(setActiveModel); }, []);

// Refresh badge when settings close
const handleSettingsClose = () => {
  setShowSettings(false);
  getModel().then(setActiveModel);
};

// update header div to include model badge, settings button, and collapse
<span className="text-sm font-semibold text-[#ccc]">Claude</span>
<div className="flex items-center gap-2">
  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2a2a3e] text-[#6c47ff] font-mono leading-none">
    {activeModel === 'claude-opus-4-7' ? 'Opus' : 'Sonnet'}
  </span>
  <button onClick={() => setShowSettings(true)} className="text-[#555] hover:text-[#888] text-sm" title="Settings">⚙</button>
  <button onClick={onCollapse} className="flex items-center gap-1.5 hover:text-[#9c7fff] transition-colors">
    <span className="text-[10px] uppercase tracking-wider text-[#666]">Collapse</span>
    <span className="text-[#6c47ff] text-lg leading-none">›</span>
  </button>
</div>

// add modal below header (inside the outer div, before ChatThread)
{showSettings && <SettingsModal onClose={handleSettingsClose} />}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```
Reload extension. Click ⚙, enter an API key. Switch model to Opus 4.7, save. Verify: the "Opus" badge appears in the rail header. Reopen settings — model radio should still show Opus. Switch back to Sonnet to confirm "Sonnet" badge updates.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/SettingsModal.tsx src/app/components/RightRail.tsx
git commit -m "feat: settings modal — API key + model selector (Sonnet/Opus) with badge in header"
```

---

## Phase 3 — Side Panel Fallback + Figma Bridge (Tasks 13–16)

---

### Task 13: Side panel fallback mode

**Files:**
- Create: `src/sidepanel/index.html`, `src/sidepanel/main.tsx`, `src/sidepanel/SidePanel.tsx`
- Modify: `src/app/components/CenterBrowser.tsx`

- [ ] **Step 1: Create `src/sidepanel/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8" /><title>Claude</title></head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Write `src/sidepanel/SidePanel.tsx`**

```typescript
import React from 'react';
import ChatThread from '../app/components/ChatThread';
import ChatInput from '../app/components/ChatInput';
import { useConversation } from '../app/hooks/useConversation';

export default function SidePanel() {
  const { messages, streaming, sendMessage } = useConversation(null);
  return (
    <div className="h-screen flex flex-col bg-[#1a1a2e] text-white">
      <div className="px-3 py-2 border-b border-[#2a2a3e] flex-shrink-0">
        <span className="text-sm font-semibold text-[#ccc]">Claude — Side Panel Mode</span>
        <p className="text-[10px] text-[#555] mt-0.5">Viewing site in real tab. Use left rail overlay to extract.</p>
      </div>
      <ChatThread messages={messages} />
      <ChatInput onSend={sendMessage} disabled={streaming} />
    </div>
  );
}
```

- [ ] **Step 3: Write `src/sidepanel/main.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../app/index.css';
import SidePanel from './SidePanel';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><SidePanel /></React.StrictMode>
);
```

- [ ] **Step 4: Add iframe error detection to `CenterBrowser.tsx`**

Add to the component state and iframe element:

```typescript
const [iframeBlocked, setIframeBlocked] = useState(false);

// on iframe load, check if it loaded or was blocked
const handleLoad = () => {
  try {
    // If we can access contentDocument, it loaded fine
    if (iframeRef.current?.contentDocument?.body === null) {
      setIframeBlocked(true);
    }
  } catch {
    setIframeBlocked(true);
  }
};

const openSidePanel = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.id) {
    await chrome.tabs.update(tabs[0].id, { url: committed });
    await chrome.sidePanel.open({ tabId: tabs[0].id });
  }
};

// Add to iframe element:
// onLoad={handleLoad}

// Add error banner above iframe when blocked:
{iframeBlocked && (
  <div className="bg-[#2a1a1a] border-b border-[#ff5f57] px-3 py-2 flex items-center justify-between text-xs flex-shrink-0">
    <span className="text-[#ff8a80]">This site blocks embedding.</span>
    <button
      onClick={openSidePanel}
      className="bg-[#6c47ff] text-white px-2 py-1 rounded hover:bg-[#7c57ff]"
    >
      Switch to Side Panel mode
    </button>
  </div>
)}
```

- [ ] **Step 5: Build and verify**

```bash
npm run build
```
Reload extension. Try loading a strict-CSP site (e.g., `https://github.com`). Verify the error banner appears with the Side Panel mode button.

- [ ] **Step 6: Commit**

```bash
git add src/sidepanel/ src/app/components/CenterBrowser.tsx
git commit -m "feat: side panel fallback mode for strict-CSP sites"
```

---

### Task 14: Figma HTTP bridge (consonant repo modification)

**Files — consonant repo:**
- Modify: `apps/consonant-specs-plugin/mcp/index.ts` (add ~30 lines)
- Create: `apps/consonant-specs-plugin/mcp/http-bridge.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// apps/consonant-specs-plugin/mcp/http-bridge.test.ts
import { describe, it, expect, vi } from 'vitest';

// We test the handler function in isolation — not the full server
// The handler calls sendCommand and returns JSON

describe('HTTP bridge handler', () => {
  it('returns { result } on success', async () => {
    const mockSendCommand = vi.fn().mockResolvedValueOnce({ ok: true });
    const result = await handleBridgeRequest({ method: 'figma_get_status', params: {} }, mockSendCommand);
    expect(result).toEqual({ result: { ok: true } });
  });

  it('returns { error } when sendCommand throws', async () => {
    const mockSendCommand = vi.fn().mockRejectedValueOnce(new Error('Plugin disconnected'));
    const result = await handleBridgeRequest({ method: 'figma_execute', params: {} }, mockSendCommand);
    expect(result).toEqual({ error: 'Plugin disconnected' });
  });
});

// Extracted handler function — will be added to index.ts
async function handleBridgeRequest(
  body: { method: string; params: Record<string, unknown>; timeout?: number },
  sendCommand: (method: string, params: Record<string, unknown>, timeout?: number) => Promise<unknown>
): Promise<{ result: unknown } | { error: string }> {
  try {
    const result = await sendCommand(body.method, body.params, body.timeout);
    return { result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
```

- [ ] **Step 2: Run — confirm tests pass (self-contained handler test)**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant
npx vitest run apps/consonant-specs-plugin/mcp/http-bridge.test.ts
```
Expected: PASS (2 tests — the handler function is defined inline in the test file).

- [ ] **Step 3: Add HTTP bridge server to `apps/consonant-specs-plugin/mcp/index.ts`**

After line 1482 (`const wsPort = await startWsServer();`) and before line 1486 (`const transport = new StdioServerTransport();`), add:

```typescript
// ── HTTP Bridge for Chrome Extension ──────────────────────────────────────────
// Accepts POST /figma { method, params, timeout? } → routes to sendCommand
// Accepts GET /status → returns connection status
// Runs on port 9240 alongside the WS server (ports 9220-9222) and stdio MCP

const HTTP_BRIDGE_PORT = 9240;

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ connected: !!(pluginSocket && pluginSocket.readyState === 1), port: connectedPort }));
    return;
  }

  if (req.method === 'POST' && req.url === '/figma') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { method, params, timeout } = JSON.parse(body);
        const result = await sendCommand(method, params, timeout);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result }));
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
}).listen(HTTP_BRIDGE_PORT, '127.0.0.1', () => {
  log(`HTTP bridge listening on port ${HTTP_BRIDGE_PORT}`);
});
```

- [ ] **Step 4: Rebuild the MCP server**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/consonant-specs-plugin/mcp
npm run build 2>/dev/null || npx tsc
```
Expected: `dist/index.js` updated, no errors.

- [ ] **Step 5: Manual verify (with Figma plugin running)**

```bash
curl http://localhost:9240/status
```
Expected (with plugin connected): `{"connected":true,"port":9220}`
Expected (without plugin): `{"connected":false,"port":null}`

- [ ] **Step 6: Commit to consonant repo**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant
git add apps/consonant-specs-plugin/mcp/index.ts apps/consonant-specs-plugin/mcp/http-bridge.test.ts
git commit -m "feat(mcp): add HTTP bridge on port 9240 for Chrome extension Figma access"
```

---

### Task 15: Run all tests + final build verification

- [ ] **Step 1: Run all tests in design-audit-tool repo**

```bash
cd /Users/taehoc/Desktop/Taeho/specs-extension
npm test
```
Expected: All tests pass. 0 failures.

- [ ] **Step 2: Final build**

```bash
npm run build
```
Expected: `dist/` built cleanly, no TypeScript errors.

- [ ] **Step 3: Manual smoke test checklist**

Load the extension in Chrome and verify:
- [ ] Extension opens full-screen tab on icon click
- [ ] URL bar navigates an iframe to a site
- [ ] Viewport presets resize the iframe correctly
- [ ] Left rail collapses with ☰ FAB appearing top-left of browser
- [ ] Right rail collapses with 💬 FAB appearing top-right of browser
- [ ] FABs re-expand their rail on click
- [ ] Rail state persists across tab close/reopen
- [ ] Settings ⚙ opens modal, saves API key
- [ ] With API key set, typing in Claude chat returns a streaming response
- [ ] Clicking an extraction mode (e.g., Animation) sends an extraction request
- [ ] Strict-CSP site (e.g., `https://github.com`) shows fallback banner
- [ ] 🎯 S2A Align produces an audit card with violation count and compliance score
- [ ] "Apply Match →" in the audit card opens a corrected prototype in a new tab

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final build verification — all tests pass"
```

---

---

### Task 16: S2A Align/Match mode

**Files:**
- Modify: `apps/s2a-ds-mcp/src/tools/audit.ts` — export standalone `auditCss()` function
- Create: `apps/s2a-ds-mcp/src/http.ts` — HTTP bridge on port 9241
- Modify: `apps/s2a-ds-mcp/src/local.ts` — start HTTP bridge alongside stdio server
- Create: `apps/s2a-ds-mcp/src/http.test.ts`
- Modify: `src/shared/types.ts` — add `s2aAlign`, `s2aMatch` modes + `S2ACard`, `AuditViolation` types
- Modify: `src/shared/constants.ts` — add `S2A_BRIDGE_URL`
- Modify: `src/shared/extraction-prompts.ts` — add S2A align and match prompts
- Modify: `src/background/tool-executor.ts` — add `audit_s2a` tool
- Modify: `tests/unit/tool-executor.test.ts` — add `audit_s2a` test
- Create: `src/app/components/cards/S2ACard.tsx`
- Modify: `src/app/components/LeftRail.tsx` — add 9th mode button

- [ ] **Step 1: Export standalone auditCss function from audit.ts**

The existing `registerAuditTools` handler in `apps/s2a-ds-mcp/src/tools/audit.ts` contains a single large `for (const decl of decls)` loop (lines ~619–869) that does all violation detection inline. All the helper utilities it calls (`loadTokens`, `buildColorMap`, `buildDimensionMap`, `buildFontFamilyMap`, `parseDeclarations`, `isColorProp`, `colorNamespace`) are already at module scope and already exported.

The real `Violation` interface (lines 557–575) has a richer shape than what the HTTP bridge needs to return. The `auditCss` function runs the same loop and maps results to the simpler `AuditViolation` shape.

**Step 1a: Extract the loop body** — Move the `for (const decl of decls)` block (and the `violations` array, `seen` Set, and `return` statement) from the handler closure into a new module-level function `runAuditViolations`. Have the existing MCP handler call `runAuditViolations(css, dsRoot, categories)` instead of inlining the loop. This preserves MCP behavior exactly.

```typescript
// In apps/s2a-ds-mcp/src/tools/audit.ts:
// 1. Cut the for-loop body out of registerAuditTools (lines ~616–869)
// 2. Add this function above registerAuditTools:

export function runAuditViolations(
  css: string,
  dsRoot: string,
  categories?: string[],
): Violation[] {
  const index = loadTokens(dsRoot);
  const colorMap = buildColorMap(dsRoot, index);
  const dimMap = buildDimensionMap(dsRoot);
  const fontFamilyMap = buildFontFamilyMap(dsRoot);
  const decls = parseDeclarations(css);
  const activeCategories = new Set<string>(
    categories ?? ["color","spacing","border-radius","border-width","font-size","line-height","letter-spacing","font-weight","font-family","blur"]
  );
  const violations: Violation[] = [];
  const seen = new Set<string>();

  // ── paste the existing for (const decl of decls) { ... } loop here verbatim ──

  return violations;
}

// 3. Inside registerAuditTools, replace the inlined loop with:
//    const violations = runAuditViolations(css, dsRoot, categories);
```

**Step 1b: Add the public `auditCss` export and the `AuditViolation` / `AuditResult` types** at the bottom of `audit.ts`:

```typescript
export interface AuditViolation {
  property: string;
  value: string;
  suggestedToken: string; // maps from Violation.resolution.token ?? ''
  tokenValue: string;     // maps from Violation.resolution.resolvedValue ?? value
  category: 'color' | 'spacing' | 'radius' | 'border' | 'blur' | 'typography';
  exact: boolean;         // true when resolution.confidence === 'high'
}

export interface AuditResult {
  violations: AuditViolation[];
  summary: string;
  score: number; // 0–100
}

// Maps the rich internal Category to the simpler HTTP-bridge category
function mapCategory(c: Category): AuditViolation['category'] {
  if (c === 'color') return 'color';
  if (c === 'spacing') return 'spacing';
  if (c === 'border-radius') return 'radius';
  if (c === 'border-width') return 'border';
  if (c === 'blur') return 'blur';
  return 'typography'; // font-size, line-height, letter-spacing, font-weight, font-family
}

export function auditCss(css: string, dsRoot: string): AuditResult {
  const raw = runAuditViolations(css, dsRoot);

  const violations: AuditViolation[] = raw.map(v => ({
    property: v.property,
    value: v.value,
    suggestedToken: v.resolution.token ?? '',
    tokenValue: v.resolution.resolvedValue ?? v.value,
    category: mapCategory(v.category),
    exact: v.resolution.confidence === 'high',
  }));

  const totalDeclarations = Math.max(parseDeclarations(css).length, violations.length);
  const score = totalDeclarations > 0
    ? Math.round(((totalDeclarations - violations.length) / totalDeclarations) * 100)
    : 100;

  const summary = violations.length === 0
    ? 'No violations — prototype already uses S2A tokens.'
    : `${violations.length} violation${violations.length !== 1 ? 's' : ''} found across ${[...new Set(violations.map(v => v.category))].join(', ')}.`;

  return { violations, summary, score };
}
```

- [ ] **Step 2: Add vitest to s2a-ds-mcp (it has no test framework yet)**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/s2a-ds-mcp
npm install -D vitest
```

Add a test script to `apps/s2a-ds-mcp/package.json` (inside `"scripts"`):
```json
"test": "vitest run"
```

Confirm vitest is available:
```bash
npx vitest --version
```
Expected: prints a version number (e.g. `2.x.x`).

- [ ] **Step 2b: Confirm no TypeScript errors after audit.ts refactor**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/s2a-ds-mcp
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Write the HTTP bridge test first**

Create `apps/s2a-ds-mcp/src/http.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startHttpBridge } from './http.js';
import type { Server } from 'http';

const DS_ROOT = process.env.DS_ROOT ?? '/Users/taehoc/Desktop/Taeho/consonant';
const TEST_PORT = 9242; // use a different port in tests to avoid conflicts

let server: Server;

beforeAll(() => {
  server = startHttpBridge(DS_ROOT, TEST_PORT);
});

afterAll(() => {
  server.close();
});

describe('POST /audit', () => {
  it('returns violations for hardcoded hex color', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/audit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ css: '.btn { color: #1473e6; }' }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.violations).toBeDefined();
    expect(data.score).toBeGreaterThanOrEqual(0);
    expect(data.score).toBeLessThanOrEqual(100);
  });

  it('returns score 100 for clean CSS using s2a vars', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/audit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ css: '.btn { color: var(--s2a-color-accent-default); }' }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.violations.length).toBe(0);
  });

  it('returns 400 for missing css field', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/audit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /status', () => {
  it('returns running status', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/status`);
    const data = await res.json();
    expect(data.running).toBe(true);
    expect(data.port).toBe(TEST_PORT);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/s2a-ds-mcp
npx vitest run src/http.test.ts 2>&1 | head -20
```
Expected: FAIL — `./http.js` not found.

- [ ] **Step 5: Create apps/s2a-ds-mcp/src/http.ts**

```typescript
import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'http';
import { auditCss } from './tools/audit.js';

const S2A_HTTP_PORT = 9241;

function cors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res: ServerResponse, status: number, data: unknown) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export function startHttpBridge(dsRoot: string, port = S2A_HTTP_PORT): Server {
  const server = createServer(async (req, res) => {
    if (req.method === 'OPTIONS') { cors(res); res.writeHead(204).end(); return; }

    if (req.method === 'GET' && req.url === '/status') {
      return json(res, 200, { running: true, port });
    }

    if (req.method === 'POST' && req.url === '/audit') {
      try {
        const raw = await readBody(req);
        const body = JSON.parse(raw);
        if (typeof body.css !== 'string') {
          return json(res, 400, { error: 'css field required (string)' });
        }
        const result = await auditCss(body.css, dsRoot);
        return json(res, 200, result);
      } catch (err) {
        return json(res, 500, { error: String(err) });
      }
    }

    return json(res, 404, { error: 'not found' });
  });

  server.listen(port, '127.0.0.1', () => {
    process.stderr.write(`[s2a-ds-mcp] HTTP bridge listening on :${port}\n`);
  });

  return server;
}
```

- [ ] **Step 6: Modify apps/s2a-ds-mcp/src/local.ts to start HTTP bridge**

Add after `registerAuditTools(server, DS_ROOT);`:

```typescript
import { startHttpBridge } from './http.js';

// After registerAuditTools line:
startHttpBridge(DS_ROOT);
```

- [ ] **Step 7: Run tests — expect pass**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/s2a-ds-mcp
npx vitest run src/http.test.ts
```
Expected: all 4 tests pass.

- [ ] **Step 8: Build s2a-ds-mcp to confirm no TS errors**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant/apps/s2a-ds-mcp
npm run build 2>/dev/null || npx tsc --noEmit
```
Expected: clean build.

- [ ] **Step 9: Commit s2a-ds-mcp changes**

```bash
cd /Users/taehoc/Desktop/Taeho/consonant
git add apps/s2a-ds-mcp/src/tools/audit.ts apps/s2a-ds-mcp/src/http.ts apps/s2a-ds-mcp/src/local.ts apps/s2a-ds-mcp/src/http.test.ts
git commit -m "feat(s2a-ds-mcp): add HTTP bridge on port 9241 for S2A audit from Chrome extension"
```

- [ ] **Step 10: Add types and constants in specs-extension repo**

Modify `src/shared/types.ts` — update `ExtractMode` union, add `S2ACard` type, and **add `S2ACard` to the `OutputCard` union** (the union was originally defined in Task 2 and must be extended here):

```typescript
// Update ExtractMode union:
export type ExtractMode = 'designSystem'|'dsMapping'|'designStyle'|'principles'|'animation'|'localization'|'a11y'|'fromFigma'|'s2aAlign'|'s2aMatch';

// Update OutputCard union — add | S2ACard:
export type OutputCard = SpecTableCard | PreviewTabCard | FigmaCard | ErrorCard | FigmaInputCard | S2ACard;

// Add new violation and card types:
export interface AuditViolation {
  property: string;
  value: string;
  suggestedToken: string;
  tokenValue: string;
  category: 'color' | 'spacing' | 'radius' | 'border' | 'blur' | 'typography';
  exact: boolean;
}

export interface S2AAuditResult {
  violations: AuditViolation[];
  summary: string;
  score: number;
}

export interface S2ACard {
  type: 's2aAudit';
  audit: S2AAuditResult;
  matchApplied: boolean; // true if Match mode already ran
}
```

Modify `src/shared/constants.ts` — add:

```typescript
export const S2A_BRIDGE_URL = 'http://localhost:9241';
```

- [ ] **Step 11: Add audit_s2a tool to tool-executor.ts**

Add to `src/background/tool-executor.ts`:

```typescript
import { S2A_BRIDGE_URL } from '../shared/constants';

// Inside executeTool switch/if chain, add:
case 'audit_s2a': {
  const { css } = params as { css: string };
  const res = await fetch(`${S2A_BRIDGE_URL}/audit`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ css }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'unknown' }));
    return { error: err.error ?? `HTTP ${res.status}` };
  }
  return res.json();
}
```

- [ ] **Step 12: Write tool-executor audit_s2a test**

Add to `tests/unit/tool-executor.test.ts`:

```typescript
describe('audit_s2a', () => {
  it('POSTs css to S2A bridge and returns audit result', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        violations: [{ property: 'color', value: '#1473e6', suggestedToken: '--s2a-color-accent-default', tokenValue: '#1473e6', category: 'color', exact: true }],
        summary: '1 violation found across color.',
        score: 50,
      }),
    } as Response);

    const result = await executeTool('audit_s2a', { css: '.btn { color: #1473e6; }' });
    expect(result.violations).toHaveLength(1);
    expect(result.score).toBe(50);
    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0])
      .toBe('http://localhost:9241/audit');
  });

  it('returns error when bridge is unreachable', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ error: 'bridge offline' }),
    } as Response);

    const result = await executeTool('audit_s2a', { css: '.btn {}' });
    expect(result.error).toBeDefined();
  });
});
```

- [ ] **Step 13: Run tool-executor tests**

```bash
cd /Users/taehoc/Desktop/Taeho/specs-extension
npx vitest run tests/unit/tool-executor.test.ts
```
Expected: all tests pass including the 2 new ones.

- [ ] **Step 14: Add S2A extraction prompts**

Add to `src/shared/extraction-prompts.ts`:

```typescript
export const S2A_ALIGN_PROMPT = `You are an S2A design system auditor. The user has loaded a prototype in the browser.

Your job:
1. Call read_page() to get all CSS from the prototype.
2. Call audit_s2a(css) with the full CSS string. This checks every hardcoded color, spacing value, border radius, typography value, and blur against the S2A design system token library.
3. Present the results as a structured audit table. For each violation show: the CSS property, the hardcoded value, the recommended S2A token name, and whether the token value is an exact match.
4. Include the compliance score (percentage of declarations already using S2A tokens).
5. Do NOT modify the prototype in Align mode — analysis only.

If the audit_s2a tool returns an error, tell the user the s2a-ds MCP server may not be running and explain how to start it via Claude Code.`;

export const S2A_MATCH_PROMPT = `You are an S2A design system auditor and CSS fixer. The user has loaded a prototype in the browser.

Your job:
1. Call read_page() to get the full HTML + CSS of the prototype.
2. Collect ALL CSS: the full text of every <style> block from the HTML, and ALL inline style="" attributes on elements. Concatenate them as one string and call audit_s2a(css) with it.
3. Rewrite the prototype's CSS in two passes:
   a. In every <style> block: replace hardcoded values with S2A CSS custom properties (e.g. \`color: #1473e6\` → \`color: var(--s2a-color-accent-default)\`). For violations with no exact token match, use the closest semantic token and add a \`/* s2a: approximate */\` comment.
   b. In every inline style="" attribute: apply the same replacements directly to the attribute value strings.
4. Return EXACTLY the HTML you received from read_page(), modified ONLY in step 3a and 3b — do not regenerate, reformat, reorder, or simplify any other markup, text, attributes, or whitespace.
5. If the stylesheets array contains any entries starting with "/* linked:", warn the user: "Note: [n] linked external stylesheet(s) could not be rewritten — only inline <style> blocks and style attributes were corrected."
6. Call preview_in_tab(html) with the fully reconstructed HTML.
7. Report the before/after compliance score.

If the audit_s2a tool returns an error, tell the user the s2a-ds MCP server may not be running and explain how to start it via Claude Code.`;
```

Update `EXTRACTION_PROMPTS` map to include the two new modes:

```typescript
export const EXTRACTION_PROMPTS: Record<ExtractMode, string> = {
  // ... existing entries ...
  s2aAlign: S2A_ALIGN_PROMPT,
  s2aMatch: S2A_MATCH_PROMPT,
};
```

- [ ] **Step 15: Create S2ACard component**

Create `src/app/components/cards/S2ACard.tsx`:

```typescript
import React from 'react';
import type { S2ACard as S2ACardType } from '../../../shared/types';

const CATEGORY_COLORS: Record<string, string> = {
  color: 'bg-red-900/40 text-red-300',
  spacing: 'bg-orange-900/40 text-orange-300',
  radius: 'bg-yellow-900/40 text-yellow-300',
  border: 'bg-yellow-900/40 text-yellow-300',
  blur: 'bg-purple-900/40 text-purple-300',
  typography: 'bg-blue-900/40 text-blue-300',
};

interface Props {
  card: S2ACardType;
  onApplyMatch?: () => void;
  onSaveCsv?: () => void;
  onSaveMarkdown?: () => void;
}

export default function S2ACard({ card, onApplyMatch, onSaveCsv, onSaveMarkdown }: Props) {
  const { audit, matchApplied } = card;

  return (
    <div className="rounded-lg border border-[#3a3a4a] overflow-hidden text-[11px]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e2e] border-b border-[#3a3a4a]">
        <span className="font-semibold text-[#ccc]">S2A Audit</span>
        <div className="flex items-center gap-2">
          <span className="text-[#888]">{audit.violations.length} violation{audit.violations.length !== 1 ? 's' : ''}</span>
          <span className={`font-bold ${audit.score >= 80 ? 'text-green-400' : audit.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {audit.score}% compliant
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="px-3 py-2 bg-[#16162a] text-[#888] border-b border-[#3a3a4a]">
        {audit.summary}
      </div>

      {/* Violation table */}
      {audit.violations.length > 0 && (
        <div className="overflow-x-auto max-h-48 overflow-y-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-[#1e1e2e] text-[#666] uppercase tracking-wider">
                <th className="px-2 py-1 text-left">Property</th>
                <th className="px-2 py-1 text-left">Current</th>
                <th className="px-2 py-1 text-left">S2A Token</th>
                <th className="px-2 py-1 text-left">Category</th>
              </tr>
            </thead>
            <tbody>
              {audit.violations.map((v, i) => (
                <tr key={i} className="border-t border-[#2a2a3e] hover:bg-[#1a1a2e]">
                  <td className="px-2 py-1 text-[#aaa] font-mono">{v.property}</td>
                  <td className="px-2 py-1 font-mono text-red-400">{v.value}</td>
                  <td className="px-2 py-1 font-mono text-green-400">{v.suggestedToken}</td>
                  <td className="px-2 py-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${CATEGORY_COLORS[v.category] ?? 'bg-[#2a2a3e] text-[#888]'}`}>
                      {v.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 px-3 py-2 bg-[#1e1e2e] border-t border-[#3a3a4a]">
        {!matchApplied && onApplyMatch && (
          <button
            onClick={onApplyMatch}
            className="px-2 py-1 bg-[#6c47ff] text-white rounded text-[10px] hover:bg-[#7b5fff] transition-colors"
          >
            Apply Match →
          </button>
        )}
        {matchApplied && (
          <span className="text-green-400 text-[10px] flex items-center gap-1">✓ Match applied</span>
        )}
        <button onClick={onSaveCsv} className="px-2 py-1 bg-[#2a2a3e] text-[#ccc] rounded text-[10px] hover:bg-[#3a3a4e] transition-colors">
          Save as CSV ↗
        </button>
        <button onClick={onSaveMarkdown} className="px-2 py-1 bg-[#2a2a3e] text-[#ccc] rounded text-[10px] hover:bg-[#3a3a4e] transition-colors">
          Save as Markdown ↗
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 16: Add S2A Align button to LeftRail.tsx**

In `src/app/components/LeftRail.tsx`, add the 9th mode entry to the modes array:

```typescript
const MODES: { mode: ExtractMode; label: string; emoji: string }[] = [
  { mode: 'designSystem',  label: 'Design System',  emoji: '🎨' },
  { mode: 'dsMapping',     label: 'DS Mapping',     emoji: '🗺' },
  { mode: 'designStyle',   label: 'Design Style',   emoji: '✏️' },
  { mode: 'principles',    label: 'Principles',     emoji: '📐' },
  { mode: 'animation',     label: 'Animation',      emoji: '🎬' },
  { mode: 'localization',  label: 'Localization',   emoji: '🌍' },
  { mode: 'a11y',          label: 'A11y',           emoji: '♿' },
  { mode: 'fromFigma',     label: 'From Figma',     emoji: '🔧' },
  { mode: 's2aAlign',      label: 'S2A Align',      emoji: '🎯' },
];
```

Add a visual separator before the S2A Align button (it belongs to a different category — system tools vs. extraction tools):

```typescript
{MODES.map((m, idx) => (
  <React.Fragment key={m.mode}>
    {idx === 8 && (
      <div className="border-t border-[#2a2a3e] my-1" />
    )}
    <button ... >
      {m.emoji} {m.label}
    </button>
  </React.Fragment>
))}
```

The `s2aMatch` mode is triggered from the S2A Audit Card's "Apply Match →" button (not a separate left-rail button).

- [ ] **Step 17: Wire S2ACard into ChatMessage renderer**

In `src/app/components/ChatMessage.tsx`, add the S2A card render case:

```typescript
import S2ACard from './cards/S2ACard';

// Inside card renderer:
case 's2aAudit':
  return (
    <S2ACard
      card={card}
      onApplyMatch={() => onTriggerMode('s2aMatch')}
      onSaveCsv={() => saveCsv(card.audit.violations)}
      onSaveMarkdown={() => saveMarkdown(card.audit.violations)}
    />
  );
```

The `onTriggerMode` callback sends a new extraction message to Claude with the `s2aMatch` system prompt.

- [ ] **Step 18: Build and verify**

```bash
cd /Users/taehoc/Desktop/Taeho/specs-extension
npm run build
```
Expected: clean build, no TypeScript errors.

- [ ] **Step 19: Manual smoke test**

1. Start s2a-ds MCP server via Claude Code (or `node apps/s2a-ds-mcp/dist/local.js`)
2. Confirm bridge is up: `curl http://localhost:9241/status` → `{"running":true,"port":9241}`
3. Load a vibe-coded prototype in the extension (e.g., one with `color: #1473e6`)
4. Click **🎯 S2A Align** in the left rail
5. Verify an S2A Audit Card appears with violation rows and a compliance score
6. Click **Apply Match →**
7. Verify a preview tab opens with corrected CSS using `var(--s2a-color-accent-default)` etc.

- [ ] **Step 20: Run all tests**

```bash
cd /Users/taehoc/Desktop/Taeho/specs-extension
npm test
```
Expected: all tests pass.

- [ ] **Step 21: Commit**

```bash
cd /Users/taehoc/Desktop/Taeho/specs-extension
git add src/shared/types.ts src/shared/constants.ts src/shared/extraction-prompts.ts \
  src/background/tool-executor.ts src/app/components/cards/S2ACard.tsx \
  src/app/components/LeftRail.tsx src/app/components/ChatMessage.tsx \
  tests/unit/tool-executor.test.ts
git commit -m "feat: S2A Align/Match mode — audit and force-align prototype CSS to S2A tokens"
```

---

## Implementation Notes

**Port conflicts:** If port 9240 is in use, change `HTTP_BRIDGE_PORT` in `apps/consonant-specs-plugin/mcp/index.ts` and `FIGMA_BRIDGE_URL` in `src/shared/constants.ts` to match.

**iframe frameId:** The `frameId` needed for `chrome.scripting.executeScript` is the iframe's frame ID, not the tab's frame ID. To get it: listen for `chrome.webNavigation.onCommitted` in the background with `frameId > 0` for the iframe's URL. Wire this into `useBrowserFrame.ts` — send a message to background to register the current iframe URL, background finds the matching frame and returns its ID.

**`@crxjs/vite-plugin` fallback:** If `@crxjs/vite-plugin@2.0.0-beta.26` fails to install or build, fall back to manual Vite multi-page config with separate entry points for `app`, `sidepanel`, and `background`. The `manifest.json` would point to the built output paths directly.
