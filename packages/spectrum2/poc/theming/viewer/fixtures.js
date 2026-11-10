// One fixture per component: the markup an author writes, the cases to render, and the element to
// measure. Shared by step-components.mjs (in Chromium) and the viewer, so both look at the same thing.
const IMG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#7aa7d9"/><circle cx="20" cy="16" r="7" fill="#fff"/><rect x="8" y="26" width="24" height="14" rx="7" fill="#fff"/></svg>');
const GLYPH = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 2a5 5 0 0 0-5 5v2H4v9h12V9h-1V7a5 5 0 0 0-5-5Zm-3 7V7a3 3 0 0 1 6 0v2Z"/></svg>';
const block = (cls, inner) => { const el = document.createElement('div'); el.className = cls; el.innerHTML = inner; return el; };

export const FIXTURES = {
  button: {
    dir: (b) => b, text: true, label: (c) => [c.variant, c.fillStyle, c.size].filter(Boolean).join(' '),
    cases: [...['primary', 'secondary', 'accent', 'negative'].flatMap((variant) => ['fill', 'outline'].map((fillStyle) => ({ variant, fillStyle }))), ...['s', 'l', 'xl'].map((size) => ({ variant: 'primary', fillStyle: 'fill', size }))],
    mount(lib, c, host) { const s = document.createElement('strong'); s.innerHTML = '<a href="#">Label</a>'; host.append(s); lib.default(host, { variant: c.variant, fillStyle: c.fillStyle === 'outline' ? 'outline' : undefined, size: c.size }); return host.querySelector('a'); },
  },
  badge: {
    dir: (b) => `badge-${b}`, text: true, label: (c) => [c.variant, c.style, c.size].filter(Boolean).join(' '),
    cases: [...['neutral', 'accent', 'informative', 'negative', 'positive', 'notice'].flatMap((variant) => ['fill', 'subtle', 'outline'].map((style) => ({ variant, style }))), ...['red', 'celery', 'purple'].map((variant) => ({ variant, style: 'fill' })), ...['m', 'l', 'xl'].map((size) => ({ variant: 'neutral', style: 'fill', size }))],
    mount(lib, c, host) { const el = block(['badge', c.variant, c.size, c.style === 'fill' ? '' : c.style].filter(Boolean).join(' '), '<div></div><div>Label</div>'); host.append(el); lib.default(el); return el; },
  },
  avatar: {
    dir: (b) => `avatar-${b}`, text: false, label: (c) => `size ${c.size}${c.outline ? ' outline' : ''}`,
    cases: [{ size: '50' }, { size: '500' }, { size: '1000' }, { size: '1500' }, { size: '500', outline: true }, { size: '1000', outline: true }],
    mount(lib, c, host) { const el = block(['avatar', c.size === '500' ? '' : `size-${c.size}`, c.outline ? 'outline' : ''].filter(Boolean).join(' '), `<div><img src="${IMG}" alt=""></div>`); host.append(el); lib.default(el); return el; },
    inner: (el) => el.querySelector('.image') ?? el,
  },
  divider: {
    dir: (b) => `divider-${b}`, text: false, label: (c) => [c.size ?? 'm', c.vertical ? 'vertical' : '', c.staticColor ?? ''].filter(Boolean).join(' '),
    cases: [{ size: 's' }, {}, { size: 'l' }, { vertical: true }, { size: 'l', vertical: true }, { staticColor: 'white' }, { size: 'l', staticColor: 'black' }],
    mount(lib, c, host) { host.style.cssText = `display:flex;${c.vertical ? 'height:48px;' : 'width:220px;'}${c.staticColor === 'white' ? 'background:#333;padding:6px;' : ''}`; host.innerHTML = '<hr>'; lib.default(host, { size: c.size, vertical: c.vertical, staticColor: c.staticColor }); return host.querySelector('hr'); },
  },
  'button-group': {
    dir: (b) => `button-group-${b}`, text: false, label: (c) => [c.size ?? 'm', c.orientation ?? ''].filter(Boolean).join(' '),
    cases: [{}, { size: 's' }, { orientation: 'vertical' }],
    mount(lib, c, host) { const el = block(['button-group', c.size, c.orientation].filter(Boolean).join(' '), '<span style="display:inline-block;width:56px;height:24px;background:#bbb;border-radius:12px"></span>'.repeat(3)); host.append(el); lib.default(el); return el; },
  },
  icon: {
    dir: (b) => `icon-${b}`, text: false, label: (c) => `size ${c.size ?? 'm'}`,
    cases: [{ size: 'xs' }, { size: 's' }, {}, { size: 'l' }, { size: 'xl' }],
    mount(lib, c, host) { host.style.color = 'rgb(200, 60, 0)'; host.innerHTML = `<span class="icon icon-lock">${GLYPH}</span>`; lib.default(host, { size: c.size }); return host.querySelector('span.icon'); },
  },
};

/** Computed look of one rendered case. `bc` is the custom property a component paints its border from. */
export function measure(el, bc) {
  const s = getComputedStyle(el); const box = el.getBoundingClientRect();
  let border = null;
  if (bc) { const probe = document.createElement('i'); probe.style.color = `var(${bc}, transparent)`; el.append(probe); border = getComputedStyle(probe).color; probe.remove(); }
  return {
    bg: s.backgroundColor, color: s.color, border, outline: s.outlineStyle === 'none' ? null : `${s.outlineWidth} ${s.outlineColor}`,
    radius: [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius].join(' '),
    w: Math.round(box.width * 10) / 10, h: Math.round(box.height * 10) / 10, gap: s.columnGap,
    font: s.fontFamily.split(',')[0].replace(/"/g, ''), fs: s.fontSize, lh: s.lineHeight, fw: s.fontWeight, ls: s.letterSpacing, tt: s.textTransform,
    clipped: el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1,
  };
}
