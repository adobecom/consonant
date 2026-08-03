// Canonical S2A conventions the scorers enforce. Single source of truth so
// the rules live in one place (and match the team's CLAUDE.md + the hard-won
// lessons from real sessions — e.g. variant values are lowercase-kebab, and
// component definitions must be modeless).

// Variant axis order — see CLAUDE.md "Variant axis order".
export const VARIANT_AXIS_ORDER = [
  "State",
  "Size",
  "Style",
  "Intent",
  "Context",
  "Orientation",
  "Breakpoint",
];

// The Theme collection that drives Light/Dark. A component *definition* should
// never pin this — mode comes from the surface the component is placed on.
export const THEME_COLLECTION_HINT = "Theme"; // matched against collectionName

// Tokens that are intentionally the same in light and dark (frozen on purpose,
// e.g. an always-white active pill on media). light === dark is expected here
// and must NOT be flagged as "doesn't adapt".
export const FROZEN_TOKEN_HINTS = [
  "knockout",
  "on-media",
  "/active", // router-nav-item/*/active etc.
  "accent", // brand accent (e.g. #3b63fb) is intentionally the same in both modes
  "brand",
  "transparent", // translucent overlays (transparent/black/12, transparent/white/24) are mode-invariant by design
];

// Property NAMES are Title Case ("Show Icon Start"). Variant VALUES are
// lowercase-kebab ("on-light", "sm", "default") — always, even Default/True.
export const isTitleCase = (s) =>
  typeof s === "string" && /^[A-Z][A-Za-z0-9]*(?: [A-Z][A-Za-z0-9]*)*$/.test(s);

export const isKebab = (s) =>
  typeof s === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);

// A bound token is "semantic" (allowed in production) when it's not a raw
// value, not a primitive, and not a designOnly primitive that leaked into CSS.
export const isFrozenToken = (name = "") =>
  FROZEN_TOKEN_HINTS.some((h) => name.toLowerCase().includes(h));
