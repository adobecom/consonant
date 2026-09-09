import "../control-button/control-button.css";
import "./jump-link.css";

// Same glyph as icons.js's IconArrowRight, inlined as a raw string rather
// than imported — icons.js is lit-based (returns a TemplateResult), and this
// component is framework-free. Matches Button's own inline-icon convention.
const ARROW_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false"><path d="M11.106 5.39376L7.50582 1.79359C7.171 1.45878 6.62859 1.45878 6.29377 1.79359C5.95895 2.12841 5.95895 2.67083 6.29377 3.00564L8.43076 5.14264H1.49997C1.0262 5.14264 0.642822 5.52601 0.642822 5.99978C0.642822 6.47355 1.0262 6.85692 1.49997 6.85692H8.43077L6.29378 8.99392C5.95896 9.32874 5.95896 9.87115 6.29378 10.206C6.46119 10.3734 6.68049 10.4571 6.8998 10.4571C7.11911 10.4571 7.33842 10.3734 7.50583 10.206L11.106 6.6058C11.4408 6.27098 11.4408 5.72858 11.106 5.39376Z" fill="currentColor"/></svg>`;

/**
 * JumpLink — single in-page anchor link.
 * Matches Figma component `JumpLink` (13360:188611), page "↳ JumpLink".
 *
 * The icon chip shares ControlButton's CSS class for visual parity but
 * renders as a non-interactive <span> — nesting ControlButton's real
 * <button> inside this <a> would be invalid, ambiguous-focus markup.
 *
 * Framework-free: builds real DOM via the DOM API, no runtime dependency.
 *
 * @param {Object} args
 * @param {string} args.label - Link text
 * @param {string} args.href - In-page anchor destination, e.g. "#photography"
 * @param {Function} [args.onClick]
 */
export function createJumpLink({ label = "Section", href = "#", onClick } = {}) {
  const el = document.createElement("a");
  el.className = "c-jump-link";
  el.href = href;
  if (onClick) el.addEventListener("click", onClick);

  const icon = document.createElement("span");
  icon.className = "c-control-button";
  icon.dataset.size = "md";
  icon.setAttribute("aria-hidden", "true");

  const iconInner = document.createElement("span");
  iconInner.className = "c-control-button__icon";
  iconInner.innerHTML = ARROW_RIGHT;
  icon.append(iconInner);
  el.append(icon);

  const labelEl = document.createElement("span");
  labelEl.className = "c-jump-link__label";
  labelEl.textContent = label;
  el.append(labelEl);

  return el;
}

/**
 * JumpLinkNav — row (or stack) of JumpLinks.
 * Matches Figma component set `JumpLinkNav` (13371:188842): horizontal 32px
 * gap, vertical 16px gap. `orientation` mirrors Card/ProductLockup's own
 * Orientation prop — same name, values, and default across the system.
 *
 * @param {Object} args
 * @param {Array<{label: string, href: string}>} args.links
 * @param {"horizontal"|"vertical"} [args.orientation]
 * @param {string} [args.ariaLabel] - Accessible name for the nav landmark
 */
export function createJumpLinkNav({
  links = [
    { label: "Photography", href: "#photography" },
    { label: "Video Production", href: "#video-production" },
    { label: "Design", href: "#design" },
  ],
  orientation = "horizontal",
  ariaLabel = "Jump to section",
} = {}) {
  const el = document.createElement("nav");
  el.className = "c-jump-link-nav";
  el.dataset.orientation = orientation;
  el.setAttribute("aria-label", ariaLabel);
  links.forEach((link) => el.append(createJumpLink(link)));
  return el;
}
