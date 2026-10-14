/**
 * Storybook Manager — S2A theme.
 *
 * The design-overlay toolbar control is NOT here. It is a globalType declared
 * in .storybook/figma-overlay.js and registered through preview.js, which is
 * what gives it the Off/Wipe/Fade/Difference dropdown.
 *
 * There used to be a second, custom tool in this file from when the overlay was
 * just an on/off blend. It wrote a BOOLEAN into `figmaOverlay` — the same global
 * the overlay now reads as a mode string — so pressing it set the mode to
 * `true`, which matches none of the modes, and the toolbar silently did
 * nothing. Its opacity slider wrote `figmaOpacity`, which nothing reads. One
 * control per global; the dropdown is the one.
 */

import { addons } from "storybook/manager-api";
import { tokenTheme } from "./token-theme.js";
import "./manager.css";

document.documentElement.dataset.theme = "light";
addons.setConfig({ theme: tokenTheme("light") });
