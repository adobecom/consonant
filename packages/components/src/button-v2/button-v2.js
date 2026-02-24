/**
 * Button v2 Component
 *
 * Wrapper around the core Button that bakes in the on-media
 * design (LG size, pill shape) while keeping the same API.
 *
 * This ensures we reuse the existing token-wired Button
 * implementation rather than re-creating markup or styles.
 */

import { Button } from "../button/button.js";

/**
 * @typedef {Object} ButtonV2Props
 * @property {string} [label]
 * @property {'lg'|'xl'|'2xl'} [size]
 * @property {'default'|'disabled'} [state]
 * @property {'accent'|'primary'|'secondary'} [kind]
 * @property {'solid'|'outlined'|'glass'} [background]
 * @property {'default'|'on-media'} [surface]
 * @property {Function} [onClick]
 */

/**
 * Button v2 entry point.
 *
 * Defaults target the Figma on-media LG pill design:
 * - size: "lg"
 * - surface: "on-media"
 * - kind/background chosen per story usage
 *
 * @param {ButtonV2Props} props
 */
export const ButtonV2 = ({
  label = "Label",
  size = "lg",
  state = "default",
  kind = "primary",
  background = "solid",
  surface = "on-media",
  onClick,
} = {}) => {
  return Button({
    label,
    size,
    state,
    kind,
    background,
    surface,
    onClick,
  });
};
