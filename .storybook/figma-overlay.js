/**
 * Figma Overlay — compare a story against the design it came from, in place.
 *
 * Opacity alone answers "roughly similar?". What a review actually needs is to
 * see WHERE a thing differs and by how much, so this adds:
 *
 *   Wipe        drag a divider across the component: design on the left, the
 *               built component on the right, aligned at the same origin
 *   Fade        cross-dissolve, for catching colour and weight drift
 *   Difference  CSS blend mode — anything identical goes black, so whatever
 *               still glows is the delta
 *
 * ...and a measurement, because "looks close" is not reviewable. The readout
 * compares the built element's box against the design's, in pixels. Sub-pixel
 * colour diffing stays in the CLI eval (npm run eval:visual:contracts), which
 * has Playwright and pixelmatch and can be a gate; this is the human loop.
 *
 * Stories opt in via parameters.figma:
 *   parameters: { figma: { fileKey: 'abc', nodeId: '10715:35477' } }
 * Generated stories carry it automatically — the renderer writes the variant's
 * own node id into each one.
 *
 * Token lives in localStorage under 'figma-overlay-token', never in the repo.
 */

/**
 * Every listener this module adds, owned by THIS copy of the module.
 *
 * Editing this file in dev hot-reloads it, and the old copy does not go away:
 * its listeners stay bound, holding its own `state`. A "bind once" flag then
 * makes it permanent — the new copy sees the flag, skips binding, and the page
 * runs old handlers against new state. That is not hypothetical; it shipped a
 * wipe whose two halves disagreed, because the old copy's drag handler had no
 * idea the new one also moves the component.
 *
 * So binding is idempotent by REPLACEMENT, not by refusal: abort whatever the
 * previous copy registered, then register ours.
 */
const listeners = new AbortController();
if (typeof window !== "undefined") {
  window.__figmaOverlayListeners?.abort();
  window.__figmaOverlayListeners = listeners;
}
const signal = listeners.signal;

const OVERLAY_ID = "figma-design-overlay";
const PANEL_ID = "figma-design-overlay-panel";
const HANDLE_ID = "figma-design-overlay-handle";

const state = { mode: "off", theme: "light", opacity: 50, wipe: 50, fileKey: null, nodeId: null, slug: null, selector: null, cache: {}, natural: null };

/**
 * The repo's own token, injected by .storybook/main.js from .env — but only
 * when running the dev server. A built Storybook is deployed to GitHub Pages,
 * so the token is deliberately absent there and the overlay asks instead.
 */
const getToken = () => {
  const baked = typeof __FIGMA_TOKEN__ === "string" ? __FIGMA_TOKEN__ : "";
  return baked || localStorage.getItem("figma-overlay-token");
};
const remove = () => {
  for (const id of [OVERLAY_ID, PANEL_ID, HANDLE_ID]) document.getElementById(id)?.remove();
};

/**
 * The component itself — not the canvas, and not the wrapper the renderer puts
 * around it. Lit renders into a full-width div, so measuring the first child
 * reported a 1869px-wide button.
 *
 * Our components all carry .c-<slug> by convention, which is exact. A story can
 * override with parameters.figma.selector when it renders something else.
 */
function subject() {
  const root = document.getElementById("storybook-root");
  if (!root) return null;
  const pick = (sel) => (sel ? root.querySelector(sel) : null);
  const el = pick(state.selector) || pick(state.slug ? `.c-${state.slug}` : null) || pick('[class^="c-"]')
    || (root.firstElementChild?.tagName === "STYLE" ? root.children[1] : root.firstElementChild);
  return el instanceof HTMLElement ? el : root;
}

function injectOverlay() {
  remove();
  const el = subject();
  if (!el) return null;
  const root = document.getElementById("storybook-root");
  if (getComputedStyle(root).position === "static") root.style.position = "relative";

  const box = el.getBoundingClientRect();
  const rootBox = root.getBoundingClientRect();

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = [
    "position:absolute", "pointer-events:none", "z-index:9998", "overflow:visible",
    `left:${box.left - rootBox.left}px`, `top:${box.top - rootBox.top}px`,
    `width:${box.width}px`, `height:${box.height}px`,
  ].join(";");

  const img = document.createElement("img");
  img.alt = "Figma design";
  // The design at its own size, anchored where the component starts — never
  // stretched to the built box. A component that fills its container is
  // 1568px wide in the canvas and 386px in the file; filling the box turned
  // the design into a smear and hid the one fact the overlay exists to show.
  // The Δ readout carries the size difference; the picture stays honest.
  // The export is 2x: the img is sized to the design's CSS size on load, and
  // fills that box — uniform, because the box IS the design's size.
  img.style.cssText = "display:block;max-width:none;object-fit:fill;object-position:left top";
  overlay.appendChild(img);

  // The wipe divider. Outside the clipped overlay, or it would clip itself.
  const handle = document.createElement("div");
  handle.id = HANDLE_ID;
  handle.style.cssText = [
    "position:absolute", "top:0", "bottom:0", "width:var(--s2a-border-width-md)", "background:var(--s2a-color-border-accent)",
    "pointer-events:none", "z-index:9999", "box-shadow:0 0 0 var(--s2a-border-width-sm) var(--s2a-color-border-subtle)",
    "display:none",
  ].join(";");

  root.appendChild(overlay);
  root.appendChild(handle);
  positionHandle();
  applyMode();
  return img;
}

/**
 * Moving the divider must not rebuild anything.
 *
 * It used to call sync() on every input event, which removed the overlay,
 * created a new one and re-requested the image — so the range input was
 * destroyed under the pointer mid-drag (hence "I can't slide it") and the
 * picture flickered. Dragging only ever touches two style properties now.
 */
/**
 * A wipe must SWAP the two, not stack them.
 *
 * Figma exports on transparency and our palette is full of it — a 64% black
 * hover, 8% overlays, an entirely transparent style. Clipping only the design
 * image leaves the built component still painting underneath it, so the
 * "design" half is really design-over-built: every translucent pixel composites
 * twice and comes out darker than either side actually is. Two correct
 * renderings then look like a colour bug.
 *
 * The fix is to make the design half OPAQUE rather than to clip the component
 * underneath it. Painting the page's own background behind the design image
 * hides the built side wherever the design is shown, and composites the
 * design's transparency against exactly the ground the pixel eval flattens
 * onto — so the picture and the numbers agree by construction.
 *
 * Clipping the component instead would work, but it reaches into the story's
 * own DOM: a stale clip survives a re-render, and inset() would also cut off
 * the focus ring, which is painted outside the border box.
 */
/**
 * The ground the component is sitting ON — so a dark story stays dark.
 *
 * Starts at the overlay's own container, NOT at the component. Walking up from
 * the component finds the component's own fill first: a solid Button returned
 * black, so the wipe painted a black rectangle over the design half and the
 * pill appeared to lose its corners. The matrix story hid this by accident —
 * its grid has no background, so the walk fell through to the page anyway.
 */
function pageBackground() {
  const start = document.getElementById("storybook-root") ?? document.body;
  for (let el = start; el; el = el.parentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "transparent" && !/^rgba\(0,\s*0,\s*0,\s*0\)$/.test(bg)) return bg;
  }
  return "var(--s2a-color-surface-default)";
}

function applyMode(cached = null) {
  const ov = document.getElementById(OVERLAY_ID);
  const handle = document.getElementById(HANDLE_ID);
  if (!ov) return;
  const wipe = state.mode === "wipe";
  ov.style.clipPath = wipe ? `inset(0 ${100 - state.wipe}% 0 0)` : "";
  // Fade and difference are cross-dissolves — compositing is the point of them,
  // so only wipe gets the opaque ground.
  ov.style.background = wipe ? pageBackground() : "transparent";
  ov.style.opacity = state.mode === "fade" ? String(state.opacity / 100) : "1";
  ov.style.mixBlendMode = state.mode === "diff" ? "difference" : "";
  if (handle) handle.style.display = wipe ? "block" : "none";
  positionHandle(cached);
}

function positionHandle(cached = null) {
  const ov = document.getElementById(OVERLAY_ID);
  const handle = document.getElementById(HANDLE_ID);
  const root = document.getElementById("storybook-root");
  if (!ov || !handle || !root) return;
  // During a drag the caller passes the two boxes it measured on pointerdown, so
  // a move only ever writes styles — it never reads layout back, which is what
  // made the divider lag behind the cursor.
  const b = cached?.b ?? ov.getBoundingClientRect();
  const r = cached?.r ?? root.getBoundingClientRect();
  handle.style.left = `${b.left - r.left + (b.width * state.wipe) / 100}px`;
  handle.style.top = `${b.top - r.top}px`;
  handle.style.height = `${b.height}px`;
}

/** A floating strip: the control, and the number. */
function injectPanel(img) {
  const panel = document.createElement("div");
  panel.id = PANEL_ID;
  panel.style.cssText = [
    "position:fixed", "left:50%", "bottom:var(--s2a-spacing-md)", "transform:translateX(-50%)", "z-index:10000",
    "display:flex", "align-items:center", "gap:var(--s2a-spacing-md)",
    "background:var(--s2a-color-surface-default)", "color:var(--s2a-color-content-default)", "border:var(--s2a-border-width-sm) solid var(--s2a-color-border-subtle)",
    "border-radius:var(--s2a-border-radius-sm)", "padding:var(--s2a-spacing-xs) var(--s2a-spacing-md)", "backdrop-filter:blur(var(--s2a-blur-xs))",
    "font:var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body)", "box-shadow:none",
  ].join(";");

  const label = document.createElement("span");
  label.textContent = state.mode === "wipe" ? "design ◀ ▶ built" : state.mode === "fade" ? "design ◀ ▶ built" : "difference";
  label.style.cssText = "color:var(--s2a-color-content-body-subtle);white-space:nowrap";

  const range = document.createElement("input");
  range.type = "range"; range.min = "0"; range.max = "100";
  range.value = String(state.mode === "wipe" ? state.wipe : state.opacity);
  range.style.cssText = "width:200px;accent-color:var(--s2a-color-border-accent)";
  range.addEventListener("input", () => {
    if (state.mode === "wipe") state.wipe = +range.value; else state.opacity = +range.value;
    applyMode();
  });

  const measure = document.createElement("span");
  measure.id = "figma-overlay-measure";
  measure.style.cssText = "white-space:nowrap;font-variant-numeric:tabular-nums";

  panel.append(label);
  if (state.mode !== "diff") panel.append(range);
  panel.append(measure);

  // Only when a token was actually pasted into this browser. A wrong one would
  // otherwise be stuck in localStorage with no way out but devtools — and
  // offering the button when there is nothing stored (the normal case: goldens
  // committed, or the dev token baked from .env) is just noise.
  if (localStorage.getItem("figma-overlay-token")) {
    const clear = document.createElement("button");
    clear.type = "button";
    clear.textContent = "× token";
    clear.title = "Forget the Figma token stored in this browser";
    clear.style.cssText = "background:none;border:0;color:var(--s2a-color-content-body-subtle);cursor:pointer;font:inherit;padding:0 var(--s2a-spacing-3xs)";
    clear.addEventListener("click", () => {
      localStorage.removeItem("figma-overlay-token");
      clear.remove();
    });
    panel.append(clear);
  }

  document.body.appendChild(panel);

  // The measurement: the built box against the design's own dimensions. A
  // button that is 4px wider than its design is a real finding and the kind of
  // thing an opacity blend hides.
  const update = () => {
    const el = subject();
    // An empty strip reads as "the overlay is broken". Say which golden is
    // missing instead — this is the normal state for a theme nobody has shot
    // yet, and silence sends people looking for a bug that is not there.
    if (!el || !img.naturalWidth) {
      const what = state.sheet ? "sheet" : "golden";
      measure.innerHTML = `<span style="color:var(--s2a-color-content-default)">no ${state.theme} ${what}</span>`
        + `<span style="color:var(--s2a-color-content-body-subtle)"> — npm run goldens:sheet -- --slug=${state.slug}`
        + `${state.theme && state.theme !== "light" ? ` --theme=${state.theme}` : ""}</span>`;
      return;
    }
    const b = el.getBoundingClientRect();
    // Figma exports at 2x
    const dw = img.naturalWidth / 2, dh = img.naturalHeight / 2;
    img.style.width = `${dw}px`; img.style.height = `${dh}px`;
    const bw = Math.round(b.width), bh = Math.round(b.height);
    const ddw = bw - Math.round(dw), ddh = bh - Math.round(dh);
    const fmt = (n) => (n === 0 ? "0" : (n > 0 ? "+" : "") + n);
    const off = ddw === 0 && ddh === 0;
    measure.innerHTML =
      `<span style="color:var(--s2a-color-content-body-subtle)">design</span> ${Math.round(dw)}×${Math.round(dh)}  ` +
      `<span style="color:var(--s2a-color-content-body-subtle)">built</span> ${bw}×${bh}  ` +
      `<span style="color:${off ? "var(--s2a-color-content-default)" : "var(--s2a-color-content-utility-error)"}">Δ ${fmt(ddw)}×${fmt(ddh)}</span>`;
  };
  img.addEventListener("load", update);
  update();
  return panel;
}

/**
 * Drag anywhere on the component to move the divider.
 *
 * Three things keep it smooth: the box is measured once on pointerdown rather
 * than on every move, the position is written in a rAF so a fast drag coalesces
 * to one paint per frame, and the listener is bound once instead of being
 * re-attached by every rebuild.
 */
function enableDrag() {
  const root = document.getElementById("storybook-root");
  if (!root) return;

  // Both boxes, measured once per drag. `moved` exists only to tell a drag from
  // a click, so the click that ends a drag can be swallowed.
  let boxes = null, moved = false;

  const move = (e) => {
    if (!boxes) return;
    const { b } = boxes;
    if (e.type === "pointermove") moved = true;
    state.wipe = Math.max(0, Math.min(100, ((e.clientX - b.left) / b.width) * 100));
    applyMode(boxes);
    const r = document.querySelector(`#${PANEL_ID} input[type=range]`);
    if (r && state.mode === "wipe") r.value = String(Math.round(state.wipe));
  };

  root.addEventListener("pointerdown", (e) => {
    if (state.mode !== "wipe") return;
    const ov = document.getElementById(OVERLAY_ID);
    if (!ov) return;
    // Measure once. Reading getBoundingClientRect on every pointermove forces a
    // layout each time, which is what made the drag feel steppy.
    boxes = { b: ov.getBoundingClientRect(), r: root.getBoundingClientRect() };
    moved = false;
    // Move first, capture second. setPointerCapture throws NotFoundError for a
    // pointer the browser does not consider active, and an exception here would
    // abort the handler before the divider ever moved — capture is a nicety
    // (it keeps the drag alive outside the element), not a prerequisite.
    move(e);
    try { root.setPointerCapture?.(e.pointerId); } catch { /* drag still works */ }
    e.preventDefault();
  }, { signal });
  root.addEventListener("pointermove", move, { signal });
  // Dragging the divider must not also operate the component. Without this the
  // press puts a real <button> into :active and :focus-visible, so the thing
  // being compared changes under the cursor — read as the overlay "jumping".
  // preventDefault on pointerdown does not cover this: mousedown is what grants
  // focus and starts a text selection, and click fires regardless.
  root.addEventListener("mousedown", (e) => { if (state.mode === "wipe") e.preventDefault(); }, { signal });
  root.addEventListener("click", (e) => {
    if (state.mode === "wipe" && moved) { e.preventDefault(); e.stopPropagation(); }
  }, { capture: true, signal });

  const end = (e) => { boxes = null; try { root.releasePointerCapture?.(e.pointerId); } catch { /* never captured */ } };
  root.addEventListener("pointerup", end, { signal });
  root.addEventListener("pointercancel", end, { signal });
}

/** The cursor only says "draggable" in the mode where dragging does something. */
function setCursor() {
  const root = document.getElementById("storybook-root");
  if (root) root.style.cursor = state.mode === "wipe" ? "ew-resize" : "";
}

/**
 * A golden committed in the repo, served by Storybook from
 * evals/datasets/contracts/golden. This is the path that needs no Figma token,
 * which is what makes the overlay work in a deployed Storybook and for anyone
 * who has only cloned the repo. Refresh them with:
 *   npm run eval:visual:contracts -- --refresh-goldens
 *
 * Named by node id, because that is what identifies a *variant* — a story id
 * would silently keep serving the old picture when a story is renamed.
 */
async function localGolden(slug, nodeId, sheet = false, theme = "light") {
  if (!slug || (!nodeId && !sheet)) return null;
  // light is the default theme and keeps the unsuffixed name, so existing
  // goldens are untouched.
  const suffix = theme && theme !== "light" ? `.${theme}` : "";
  const base = sheet ? "sheet" : String(nodeId).replace(":", "-");
  const url = `/figma-goldens/${slug}/${base}${suffix}.png`;
  try {
    // HEAD, not GET: the <img> fetches the bytes itself a moment later and hits
    // the HTTP cache, so this only has to answer "is it there?".
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return null;
    // A dev server that rewrites unknown paths to index.html answers 200 with
    // HTML, which would set the <img> src to a page and render as broken.
    const type = res.headers.get("content-type") ?? "";
    if (type && !type.startsWith("image/")) return null;
    return url;
  } catch {
    return null; // offline, or the static mount is not configured
  }
}

async function fetchImage(fileKey, nodeId) {
  const key = `${fileKey}:${state.sheet ? "sheet" : nodeId}:${state.theme}`;
  if (state.cache[key]) return state.cache[key];

  const local = await localGolden(state.slug, nodeId, state.sheet, state.theme);
  if (local) { state.cache[key] = local; return local; }

  // Deliberately no fallback to another theme's golden. Showing the light
  // artwork behind a dark story looks like a working comparison and is not one.
  if (state.theme && state.theme !== "light") {
    const flag = ` --theme=${state.theme}`;
    console.warn(`[figma-overlay] no ${state.theme} golden for "${state.slug}". Shoot one with:\n`
      + `  node evals/visual/sheet.mjs --slug=${state.slug}${flag}\n`
      + `  (the Figma set must be in ${state.theme} mode — the shooter checks)`);
    return null;
  }

  // The whole-set sheet is a composite; the API has no node that renders it.
  if (state.sheet) {
    console.warn(`[figma-overlay] no sheet for "${state.slug}". Composite one with:\n`
      + `  node evals/visual/sheet.mjs --slug=${state.slug}`);
    return null;
  }

  let token = getToken();
  if (!token) {
    token = window.prompt(
      "No committed golden for this story, and no Figma token.\n\n" +
      "Either capture it — npm run eval:visual:contracts -- --refresh-goldens —\n" +
      "or paste a Figma personal access token (stored in this browser only).",
    );
    if (!token) return null;
    localStorage.setItem("figma-overlay-token", token);
  }
  const apiId = nodeId.includes(":") ? nodeId : nodeId.replace("-", ":");
  try {
    const res = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(apiId)}&format=png&scale=2`,
      { headers: { "X-Figma-Token": token } });
    if (!res.ok) throw new Error(`Figma API ${res.status}`);
    const data = await res.json();
    const url = data.images?.[apiId] || Object.values(data.images || {})[0];
    if (url) state.cache[key] = url;
    return url || null;
  } catch (err) {
    console.warn("[figma-overlay]", err.message);
    return null;
  }
}

async function sync() {
  // A sheet story has no single node id — the sheet IS its subject.
  if (state.mode === "off" || !state.fileKey || (!state.nodeId && !state.sheet)) {
    remove();
    const root = document.getElementById("storybook-root");
    if (root) { root.style.cursor = ""; root.onpointerdown = null; }
    return;
  }
  const img = injectOverlay();
  if (!img) return;
  injectPanel(img);
  enableDrag();
  setCursor();
  const url = await fetchImage(state.fileKey, state.nodeId);
  if (url && img.isConnected) img.src = url;
}

// Arrow keys nudge the divider; shift for a bigger step. A slider you can only
// drag is hard to land on an exact edge.
if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    if (state.mode === "off" || !document.getElementById(OVERLAY_ID)) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const step = (e.shiftKey ? 10 : 2) * (e.key === "ArrowRight" ? 1 : -1);
    const key = state.mode === "fade" ? "opacity" : "wipe";
    state[key] = Math.max(0, Math.min(100, state[key] + step));
    applyMode();
    const r = document.querySelector(`#${PANEL_ID} input[type=range]`);
    if (r) r.value = String(state[key]);
    e.preventDefault();
  }, { signal });
}

export function withFigmaOverlay(story, context) {
  const { globals, parameters } = context;
  state.mode = globals.figmaOverlay ?? "off";
  // The design has themes too. A dark story compared against the light artwork
  // is not a comparison — it reports every colour in the component as drifted,
  // and buries any real difference under that. The golden has to come from the
  // same theme the story is rendering in.
  state.theme = globals.theme ?? document.documentElement.getAttribute("data-theme") ?? "light";
  state.fileKey = parameters.figma?.fileKey ?? null;
  state.nodeId = parameters.figma?.nodeId ?? null;
  // A sheet story compares the WHOLE set at once — every variant, every state,
  // on one grid — so its golden is the composited sheet rather than one
  // variant's artwork. There is no single node to fall back to for it: the
  // sheet only exists because something composited it.
  state.sheet = parameters.figma?.sheet === true;
  // "generated-button--style-solid" -> "button": which folder the golden is in.
  // ?? and || cannot be mixed without parentheses — JS calls that a SyntaxError,
  // and a syntax error in a decorator takes the whole preview down with it.
  state.selector = parameters.figma?.selector ?? null;
  state.slug = parameters.figma?.slug ?? (String(context.id ?? "").replace(/^generated-/, "").split("--")[0] || null);
  // After the story's DOM — and its webfonts — have settled, or the measurement
  // reads a pre-swap width.
  //
  // Not requestAnimationFrame: rAF is suspended whenever the frame is not being
  // painted (a background tab, a hidden iframe), so the overlay simply never
  // appeared. setTimeout still fires, throttled at worst, which is what "do
  // this once the story has rendered" actually needs.
  setTimeout(() => {
    Promise.resolve(document.fonts?.ready).then(() => sync()).catch(() => sync());
  }, 0);
  return story();
}

export const figmaOverlayGlobals = {
  figmaOverlay: {
    name: "Design overlay",
    description: "Compare this story against its Figma source",
    defaultValue: "off",
    toolbar: {
      title: "Design",
      icon: "transfer",
      items: [
        { value: "off", title: "Off", icon: "eyeclose" },
        { value: "wipe", title: "Wipe", icon: "transfer" },
        { value: "fade", title: "Fade", icon: "contrast" },
        { value: "diff", title: "Difference", icon: "lightning" },
      ],
      dynamicTitle: true,
    },
  },
};
