/**
 * Figma Overlay Decorator
 * Fetches a Figma node screenshot and overlays it on the live story
 * for pixel-perfect design comparison.
 *
 * Stories opt in via parameters.figma:
 *   parameters: { figma: { fileKey: 'abc123', nodeId: '4274:30919' } }
 *
 * Token is stored in localStorage under 'figma-overlay-token'.
 * First use prompts for a Figma personal access token.
 */

const OVERLAY_ID = "figma-design-overlay";

const state = {
  active: false,
  opacity: 40,
  fileKey: null,
  nodeId: null,
  cache: {},
};

function getToken() {
  return localStorage.getItem("figma-overlay-token");
}

function removeOverlay() {
  document.getElementById(OVERLAY_ID)?.remove();
}

function injectOverlay(opacity) {
  removeOverlay();

  const root = document.getElementById("storybook-root");
  if (!root) return null;

  if (getComputedStyle(root).position === "static") {
    root.style.position = "relative";
  }

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = [
    "position: absolute",
    "inset: 0",
    "pointer-events: none",
    "z-index: 9999",
    `opacity: ${opacity / 100}`,
    "display: flex",
    "align-items: flex-start",
    "justify-content: flex-start",
  ].join(";");

  const img = document.createElement("img");
  img.alt = "Figma design overlay";
  img.style.cssText = [
    "max-width: 100%",
    "max-height: 100%",
    "object-fit: contain",
    "object-position: top left",
  ].join(";");

  overlay.appendChild(img);
  root.appendChild(overlay);
  return img;
}

async function fetchFigmaImage(fileKey, nodeId) {
  const cacheKey = `${fileKey}:${nodeId}`;
  if (state.cache[cacheKey]) return state.cache[cacheKey];

  let token = getToken();
  if (!token) {
    token = window.prompt(
      "Enter your Figma personal access token to enable the design overlay.\n" +
        "It will be stored in localStorage — never committed to the repo.",
    );
    if (!token) return null;
    localStorage.setItem("figma-overlay-token", token);
  }

  // Figma API uses colon-separated IDs; normalize from dash format if needed
  const apiNodeId = nodeId.includes(":") ? nodeId : nodeId.replace("-", ":");
  const encodedId = encodeURIComponent(apiNodeId);

  try {
    const res = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?ids=${encodedId}&format=png&scale=2`,
      { headers: { "X-Figma-Token": token } },
    );
    if (!res.ok) throw new Error(`Figma API ${res.status}`);
    const data = await res.json();
    const url =
      data.images?.[apiNodeId] || Object.values(data.images || {})[0];
    if (url) state.cache[cacheKey] = url;
    return url || null;
  } catch (err) {
    console.warn("[figma-overlay] fetch failed:", err.message);
    return null;
  }
}

async function syncOverlay() {
  if (!state.active || !state.fileKey || !state.nodeId) {
    removeOverlay();
    return;
  }

  const img = injectOverlay(state.opacity);
  if (!img) return;

  const url = await fetchFigmaImage(state.fileKey, state.nodeId);
  if (url && img.isConnected) img.src = url;
}

export function withFigmaOverlay(story, context) {
  const { globals, parameters } = context;

  state.active = !!globals.figmaOverlay;
  state.opacity = globals.figmaOpacity ?? 40;
  state.fileKey = parameters.figma?.fileKey ?? null;
  state.nodeId = parameters.figma?.nodeId ?? null;

  // Run after the story's DOM has settled
  requestAnimationFrame(() => syncOverlay());

  return story();
}

export const figmaOverlayGlobals = {
  figmaOverlay: { name: "Figma Overlay", defaultValue: false },
  figmaOpacity: { name: "Overlay Opacity", defaultValue: 40 },
};
