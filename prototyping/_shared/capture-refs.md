# Capturing Figma Reference Images

This is a Claude-assisted workflow — you don't run a script, you ask Claude.

## How to capture refs for a prototype

1. Have the Figma file open with the S2A toolkit bridge running
2. Copy the node ID from Figma (right-click a frame → Copy link, or use Inspect panel)
3. Tell Claude:

   > "Capture refs for matthew-huntsberry/router-marquee from Figma node 1234:5678"

Claude will:
- Export the frame at each breakpoint viewport width (390 / 1024 / 1280 / 1440px)
- Save the PNGs to `matthew-huntsberry/router-marquee/refs/{sm,md,lg,xl}.png`

Once refs exist, the **Ref** button in the browser overlay will load them automatically.

## How the agent correction loop works

1. You have refs captured from Figma
2. Ask Claude: "compare and fix parity for matthew-huntsberry/router-marquee"
3. Claude will:
   - Run `node _shared/screenshot.js` from your prototype folder
   - Read both the ref PNG and the screenshot PNG side-by-side (multimodal)
   - Identify layout, spacing, color, and typography differences
   - Edit your CSS/HTML to close the gap
   - Re-screenshot and repeat until parity is reached (or flag what's not fixable in CSS)

## Breakpoint viewport widths used for capture

| Token bp | Viewport width | Figma canvas size |
|---|---|---|
| sm  | 390px  | mobile frame |
| md  | 1024px | tablet frame |
| lg  | 1280px | desktop frame |
| xl  | 1440px | wide desktop frame |

## Component-level parity

Works the same way — just point Claude at a component frame node ID instead of a page frame.
The screenshot tool will capture at the component's natural width.
