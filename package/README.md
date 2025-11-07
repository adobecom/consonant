# Consonant Design Tokens

Compiled CSS custom properties generated from the Consonant token pipeline. Everything in this package lives under `build/css` in the source repo; the tarball simply copies those files into `package/css`.

## File map

- `css/tokens-base.css` – primitive palette and foundational primitives (spacing, typography, radii, elevation, motion). The values mirror the `primitives-core` + `primitives-color` collections in Figma and should be loaded first.
- `css/tokens-light.css` – semantic aliases for the light UI theme. Reference these tokens in product code when the UI runs in light mode.
- `css/tokens-dark.css` – semantic aliases for the dark UI theme. Pair with a dark-mode media query or theme toggle.
- `css/tokens-mobile.css` – responsive overrides targeting the mobile breakpoint. Import inside your mobile media query (`@media (max-width: …) { @import ".../tokens-mobile.css"; }`).
- `css/tokens-desktop.css` – desktop defaults from the responsive collection.
- `css/tokens-desktop-wide.css` – large-screen overrides for wide monitors. Import only inside the matching breakpoint to avoid overriding desktop/mobile unintentionally.

All files define CSS custom properties on `:root`. If you need to scope tokens to a component, wrap the import in a selector or post-process with your build system.

## Install & use

```bash
npm install ./consonant-design-tokens-0.0.1.tgz
```

Then import the files you need, e.g.

```css
@import "consonant-design-tokens/css/tokens-base.css";
@import "consonant-design-tokens/css/tokens-light.css";
```

Layer responsive files inside your breakpoint rules and switch between `tokens-light.css` / `tokens-dark.css` based on your runtime theme.
