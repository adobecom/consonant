# Reduced Motion

Animation handling for users who prefer reduced motion. Use this as the primary reference when filling the Reduced Motion card.

---

## Core Rule (WCAG 2.3.3)

When `prefers-reduced-motion: reduce` is active, non-essential animations MUST be disabled or minimized.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Essential vs. Decorative Animations

**Essential (keep running):**
- Progress bars filling
- Loading spinners (functional, communicates state)
- Drag-and-drop position feedback
- Skeleton loading states

**Decorative (disable):**
- Page transition animations (slide, fade)
- Hover effects with movement (scale, rotate)
- Parallax scrolling effects
- Background animations
- Bouncing/pulsing attention-grabbers
- Scroll-triggered reveal animations
- Lottie/SVG decorative animations

**Replace, don't remove:**
- Slide transitions → instant swap or short crossfade (150ms max)
- Carousel sliding → instant swap
- Modal slide-up → instant appear
- Page transitions → instant swap

## No Flashing (WCAG 2.3.1)

Content MUST NOT flash more than **3 times per second**. This applies regardless of motion preferences — it's a seizure risk.

**Always avoid:**
- Rapidly flashing backgrounds
- Strobe effects
- Blinking text (except `<blink>` is deprecated anyway)
- Rapid color alternation

## Auto-Playing Content

- Auto-playing animations longer than 5 seconds need pause/stop control
- Carousel auto-rotation must stop on `prefers-reduced-motion: reduce`
- Background video loops should pause on reduced motion
- Auto-scrolling marquees need stop control

## Detection Heuristics for Figma

- Look for animation indicators in layer names ("anim", "motion", "transition")
- Check for carousel/slideshow components (have auto-rotation)
- Look for prototype connections with animation settings
- Check for video backgrounds or Lottie placeholders
- Look for parallax-style layered backgrounds
- Check for hover state variants with scale/rotate transforms
- Look for loading/skeleton states

## Design Annotation Format

For each animation in the design, specify:
1. What the animation does
2. Whether it's essential or decorative
3. What the reduced-motion alternative is

Example: "Hero fade-in — decorative. Reduced motion: instant appear, no fade."

## Blueline Card Output

- Title = animation/effect name (e.g. "Page transitions", "Hero parallax", "Card hover scale")
- Desc = classification and alternative (e.g. "Decorative — disable on prefers-reduced-motion. Replace with instant appear.")
- Notes = cite WCAG 2.3.3 Animation from Interactions, 2.3.1 Three Flashes
- Warnings = auto-playing animations without pause control, potential flash/strobe effects
