## Component Audit · Media & Scrim

This doc captures media containers (images, videos) and their overlay scrims used across the redesign. Media components handle aspect ratios, sizing, and overlay treatments for text readability.

---

## 1. Component Overview

| ID  | Component     | Level    | Semantics (HTML) | Description                                                      |
| --- | ------------- | -------- | ---------------- | ---------------------------------------------------------------- |
| M-1 | Media         | Molecule | `<div>` / `<img>` / `<video>` | Container for images/videos with aspect ratio and sizing controls |
| M-2 | Scrim         | Atom     | `<div>`          | Overlay layer for text readability over media                     |

Notes:

- **Media** wraps images/videos and controls their display (object-fit, aspect-ratio, sizing).
- **Scrim** is a semi-transparent overlay that sits between media and content for contrast.
- Media + Scrim are often composed together in cards, heroes, and feature sections.

---

## 2. Variants by Component

### 2.1 Media (M-1)

Source Figma frames: Various media containers across cards, heroes, feature sections.

| Axis         | Values                                    | Notes                                                                                    |
| ------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| aspectRatio  | `16:9`, `4:3`, `1:1`, `3:2`, `21:9`, `custom` | Common ratios; `custom` allows arbitrary aspect ratios via CSS `aspect-ratio` property. |
| size         | `xs`, `sm`, `md`, `lg`, `xl`, `full`     | T-shirt sizing for media container width/height; `full` = 100% of parent.                |
| objectFit    | `cover`, `contain`, `fill`, `none`        | CSS `object-fit` behavior for how image/video fills container.                           |
| objectPosition| `center`, `top`, `bottom`, `left`, `right`, `top-left`, etc. | CSS `object-position` for image/video alignment within container.                        |
| type         | `image`, `video`                           | Media type affects loading and interaction behavior.                                     |
| lazy         | `true`/`false`                             | Lazy loading for performance; `true` defers loading until in viewport.                   |

**Mobile vs Desktop:**

- **Mobile**: Often uses `aspectRatio: 1:1` or `4:3` for compact layouts; `size: sm` or `md`.
- **Desktop**: Supports wider ratios (`16:9`, `21:9`); `size: lg` or `xl` for hero sections.

**Intended usage:**

- Hero backgrounds, card thumbnails, feature section media, product showcases.
- Always pair with **Scrim (M-2)** when text content overlays the media.

### 2.2 Scrim (M-2)

Source Figma frames: Overlay layers on media containers (hero videos, card images).

| Axis      | Values                        | Notes                                                                                    |
| --------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| intensity | `light`, `medium`, `dark`     | Opacity/color strength; `light` = subtle (10-20%), `medium` = moderate (40-60%), `dark` = strong (70-90%). |
| gradient  | `none`, `top`, `bottom`, `radial` | Gradient direction for scrim fade; `none` = solid overlay.                               |
| color     | `black`, `white`, `brand`     | Base color of scrim; `black` = darken, `white` = lighten, `brand` = tinted overlay.    |

**Mobile vs Desktop:**

- **Mobile**: Often uses `intensity: medium` or `dark` for better text contrast on smaller screens.
- **Desktop**: Can use `intensity: light` or `medium` with gradient fades for subtle effects.

**Intended usage:**

- Applied as an overlay (`::before` or separate `<div>`) on Media containers when text/content needs to be readable.
- Typically positioned absolutely within the Media container, covering the full area.

---

## 3. Composition Examples

### Media + Scrim (Hero Pattern)

```
<Media aspectRatio="16:9" size="full" objectFit="cover" type="video">
  <Scrim intensity="dark" gradient="bottom" color="black" />
  <ContentContainer>...</ContentContainer>
</Media>
```

### Media + Scrim (Card Pattern)

```
<Card>
  <Media aspectRatio="4:3" size="md" objectFit="cover" lazy={true}>
    <Scrim intensity="medium" gradient="bottom" color="black" />
  </Media>
  <CardContent>...</CardContent>
</Card>
```

---

## 4. Open Questions / TODOs

- Define exact opacity values for scrim `intensity` levels (light/medium/dark) as design tokens.
- Determine if scrim should be a separate component or a prop on Media (`hasScrim`, `scrimIntensity`).
- Document responsive aspect ratio changes (e.g., `16:9` desktop → `1:1` mobile).
- Create design tokens for common aspect ratios and media sizes.
