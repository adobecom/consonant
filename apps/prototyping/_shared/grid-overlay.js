/**
 * S2A Grid Overlay + Breakpoint Switcher
 *
 * Grid breakpoints (from packages/grid):
 *   <768px   6 cols, full width, 16px side padding
 *   ≥768px  12 cols, 83.4% centered, max 1440px
 *
 * Token breakpoints (badge + switcher):
 *   sm <1024 · md 1024 · lg 1280 · xl 1441
 *
 * BP buttons open a correctly-sized popup so CSS media queries fire for real.
 * Popup dimensions compensate for browser chrome so viewport is accurate.
 *
 * Keyboard: G = toggle grid
 */

const BREAKPOINTS = [
  { name: 'sm', min:    0, w:  390, h:  844 },
  { name: 'md', min: 1024, w: 1024, h:  768 },
  { name: 'lg', min: 1280, w: 1280, h:  900 },
  { name: 'xl', min: 1441, w: 1440, h:  900 },
];

const COL_FILL   = 'rgba(123, 58, 237, 0.08)';
const COL_BORDER = 'rgba(123, 58, 237, 0.22)';

const TOOLBAR_BASE = `
  position: fixed; bottom: 16px; right: 16px;
  z-index: 9999;
  display: flex; align-items: stretch;
  background: rgba(0,0,0,0.75);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  overflow: hidden;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.03em;
  line-height: 1;
  user-select: none;
`;

const CELL_BASE = `
  display: flex; align-items: center; justify-content: center;
  padding: 6px 10px;
  border: none; outline: none;
  background: transparent;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
`;

function getActiveBp() {
  return [...BREAKPOINTS].reverse().find(bp => window.innerWidth >= bp.min) || BREAKPOINTS[0];
}

function getGridColumns() {
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue('--s2a-grid-columns').trim();
  return parseInt(val) || (window.innerWidth >= 768 ? 12 : 6);
}

function openAtBreakpoint(bp) {
  // Compensate for browser chrome so the *viewport* lands at the target size
  const chromeW = window.outerWidth  - window.innerWidth;
  const chromeH = window.outerHeight - window.innerHeight;
  const winW = bp.w + chromeW;
  const winH = bp.h + chromeH;
  // Center on screen
  const left = Math.round((screen.width  - winW) / 2);
  const top  = Math.round((screen.height - winH) / 2);
  window.open(
    location.href,
    `s2a-bp-${bp.name}`,
    `width=${winW},height=${winH},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );
}

function build() {
  // ── Grid overlay ────────────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 's2a-grid-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0',
    pointerEvents: 'none', zIndex: '9998',
    display: 'none',
  });
  const colGrid = document.createElement('div');
  overlay.appendChild(colGrid);
  document.body.appendChild(overlay);

  // ── Toolbar ─────────────────────────────────────────────────────────────────
  const toolbar = document.createElement('div');
  toolbar.id = 's2a-toolbar';
  toolbar.setAttribute('style', TOOLBAR_BASE);
  document.body.appendChild(toolbar);

  function sep() {
    const d = document.createElement('div');
    d.setAttribute('style', 'width:1px; background:rgba(255,255,255,0.1); flex-shrink:0;');
    return d;
  }

  // BP buttons (sm / md / lg / xl)
  const bpBtns = {};
  BREAKPOINTS.forEach((bp, i) => {
    if (i > 0) toolbar.appendChild(sep());
    const btn = document.createElement('button');
    btn.setAttribute('style', CELL_BASE);
    btn.textContent = bp.name;
    btn.title = `Open at ${bp.w}×${bp.h}px`;
    btn.addEventListener('click', () => openAtBreakpoint(bp));
    bpBtns[bp.name] = btn;
    toolbar.appendChild(btn);
  });

  // Separator before badge
  toolbar.appendChild(sep());

  // Badge (viewport readout — not a button)
  const badge = document.createElement('div');
  badge.id = 's2a-vp-badge';
  badge.setAttribute('style', CELL_BASE + 'cursor:default; min-width:90px;');
  toolbar.appendChild(badge);

  // Separator before Grid button
  toolbar.appendChild(sep());

  // Grid toggle button
  const gridBtn = document.createElement('button');
  gridBtn.id = 's2a-grid-btn';
  gridBtn.textContent = 'Grid';
  gridBtn.setAttribute('style', CELL_BASE);
  toolbar.appendChild(gridBtn);

  // ── State ────────────────────────────────────────────────────────────────────
  let gridOn = localStorage.getItem('s2a-grid') === 'on';
  let lastCols = -1;

  function render() {
    const w    = window.innerWidth;
    const bp   = getActiveBp();
    const cols = getGridColumns();
    const isMobile = w < 768;

    // Badge text
    badge.textContent = `${bp.name} · ${w}px`;

    // Highlight active bp button
    Object.values(bpBtns).forEach(b => {
      const isActive = b.textContent === bp.name;
      b.style.color = isActive ? '#fff' : 'rgba(255,255,255,0.65)';
      b.style.background = isActive ? 'rgba(123,58,237,0.5)' : 'transparent';
    });

    // Grid columns
    if (lastCols !== cols) {
      colGrid.innerHTML = '';
      for (let i = 0; i < cols; i++) {
        const col = document.createElement('div');
        col.style.cssText = `
          background: ${COL_FILL};
          box-shadow: inset 1px 0 0 0 ${COL_BORDER}, inset -1px 0 0 0 ${COL_BORDER};
          height: 100vh;
        `;
        colGrid.appendChild(col);
      }
      lastCols = cols;
    }

    Object.assign(colGrid.style, {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      columnGap: 'var(--s2a-grid-gutter, 8px)',
      width: isMobile ? '100%' : 'var(--s2a-grid-container-width, 83.4%)',
      maxWidth: isMobile ? '100%' : 'var(--s2a-grid-max-width, 1440px)',
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft:  isMobile ? 'var(--s2a-spacing-lg, 16px)' : '0',
      paddingRight: isMobile ? 'var(--s2a-spacing-lg, 16px)' : '0',
      height: '100vh',
      boxSizing: 'border-box',
    });

    // Grid overlay visibility
    overlay.style.display = gridOn ? 'block' : 'none';

    // Grid button style
    Object.assign(gridBtn.style, gridOn ? {
      color: '#fff',
      background: 'rgba(123,58,237,0.5)',
    } : {
      color: 'rgba(255,255,255,0.65)',
      background: 'transparent',
    });
  }

  function toggleGrid() {
    gridOn = !gridOn;
    localStorage.setItem('s2a-grid', gridOn ? 'on' : 'off');
    render();
  }

  gridBtn.addEventListener('click', toggleGrid);
  window.addEventListener('resize', render);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'g' || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    toggleGrid();
  });

  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', build);
} else {
  build();
}
