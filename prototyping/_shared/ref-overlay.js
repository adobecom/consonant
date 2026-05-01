/**
 * S2A Reference Overlay
 * Overlays a Figma ref PNG on top of the live prototype for parity checking.
 *
 * Controls live in a pill toolbar at bottom-right, just above the BP toolbar:
 *   [ Ref  |  ━━━  |  Diff ]
 *
 * Keyboard: R = toggle ref,  D = toggle diff
 */

const BPS = [
  { name: 'xl', min: 1441 },
  { name: 'lg', min: 1280 },
  { name: 'md', min: 1024 },
  { name: 'sm', min:    0 },
];

function getBp() {
  return [...BPS].find(bp => window.innerWidth >= bp.min) || BPS[BPS.length - 1];
}

function refsBase() {
  const p = window.location.pathname;
  const dir = p.endsWith('/') ? p : p.slice(0, p.lastIndexOf('/') + 1);
  return dir + 'refs/';
}

// Matches the grid-overlay pill style exactly
const PILL = `
  position: fixed; bottom: 51px; right: 16px;
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

const CELL = `
  display: flex; align-items: center; justify-content: center;
  padding: 6px 10px;
  border: none; outline: none;
  background: transparent;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
`;

function build() {
  // ── Ref image ───────────────────────────────────────────────────────────────
  const img = document.createElement('img');
  img.id = 's2a-ref-img';
  Object.assign(img.style, {
    position: 'fixed', top: '0', left: '50%',
    transform: 'translateX(-50%)',
    width: '100%', maxWidth: '100vw', height: 'auto',
    pointerEvents: 'none', zIndex: '9997',
    display: 'none', opacity: '0.5',
  });
  document.body.appendChild(img);

  // ── Pill toolbar ─────────────────────────────────────────────────────────────
  const toolbar = document.createElement('div');
  toolbar.id = 's2a-ref-toolbar';
  toolbar.setAttribute('style', PILL);
  document.body.appendChild(toolbar);

  function sep() {
    const d = document.createElement('div');
    d.setAttribute('style', 'width:1px; background:rgba(255,255,255,0.1); flex-shrink:0;');
    return d;
  }

  // Ref toggle
  const refBtn = document.createElement('button');
  refBtn.setAttribute('style', CELL);
  refBtn.textContent = 'Ref';
  toolbar.appendChild(refBtn);

  toolbar.appendChild(sep());

  // Opacity slider cell
  const sliderCell = document.createElement('div');
  sliderCell.setAttribute('style', CELL + 'cursor:default; padding:6px 8px; gap:6px;');
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0'; slider.max = '100'; slider.value = '50';
  Object.assign(slider.style, {
    width: '64px', cursor: 'pointer',
    accentColor: 'rgba(0,180,130,0.9)',
    verticalAlign: 'middle',
  });
  sliderCell.appendChild(slider);
  toolbar.appendChild(sliderCell);

  toolbar.appendChild(sep());

  // Diff toggle
  const diffBtn = document.createElement('button');
  diffBtn.setAttribute('style', CELL);
  diffBtn.textContent = 'Diff';
  toolbar.appendChild(diffBtn);

  // ── State ────────────────────────────────────────────────────────────────────
  let on       = localStorage.getItem('s2a-ref') === 'on';
  let diffMode = localStorage.getItem('s2a-ref-diff') === 'on';
  let opacity  = parseFloat(localStorage.getItem('s2a-ref-opacity') ?? '0.5');
  let loadedBp = null;

  slider.value = Math.round(opacity * 100);

  function loadRef(bp) {
    if (loadedBp === bp.name) return;
    const url = refsBase() + bp.name + '.png';
    img.src = url;
    img.onload  = () => { loadedBp = bp.name; };
    img.onerror = () => {
      loadedBp = null;
      refBtn.title = `${bp.name}.png not found`;
    };
  }

  function render() {
    const bp = getBp();
    if (on) loadRef(bp);

    img.style.display  = on ? 'block' : 'none';
    img.style.opacity  = diffMode ? '1' : opacity;
    img.style.mixBlendMode = diffMode ? 'difference' : 'normal';
    img.style.filter   = diffMode ? 'invert(1)' : 'none';

    // Ref button — green when on
    Object.assign(refBtn.style, on ? {
      color: '#fff',
      background: 'rgba(0,180,130,0.7)',
    } : {
      color: 'rgba(255,255,255,0.5)',
      background: 'transparent',
    });
    refBtn.textContent = on && loadedBp ? `Ref: ${loadedBp}` : 'Ref';

    // Slider + Diff — dimmed when ref is off
    const inactive = !on;
    sliderCell.style.opacity      = inactive ? '0.35' : '1';
    sliderCell.style.pointerEvents = inactive ? 'none' : 'auto';
    diffBtn.style.opacity         = inactive ? '0.35' : '1';
    diffBtn.style.pointerEvents    = inactive ? 'none' : 'auto';

    // Diff button — red when active
    Object.assign(diffBtn.style, diffMode && on ? {
      color: '#fff',
      background: 'rgba(220,80,80,0.7)',
    } : {
      color: 'rgba(255,255,255,0.5)',
      background: 'transparent',
    });
  }

  function toggleRef() {
    on = !on;
    localStorage.setItem('s2a-ref', on ? 'on' : 'off');
    render();
  }

  function toggleDiff() {
    if (!on) return;
    diffMode = !diffMode;
    localStorage.setItem('s2a-ref-diff', diffMode ? 'on' : 'off');
    render();
  }

  refBtn.addEventListener('click', toggleRef);
  diffBtn.addEventListener('click', toggleDiff);

  slider.addEventListener('input', () => {
    opacity = slider.value / 100;
    localStorage.setItem('s2a-ref-opacity', opacity);
    if (!diffMode) img.style.opacity = opacity;
  });

  window.addEventListener('resize', () => { if (on) { loadedBp = null; loadRef(getBp()); } });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === 'r') toggleRef();
    if (e.key === 'd') toggleDiff();
  });

  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', build);
} else {
  build();
}
