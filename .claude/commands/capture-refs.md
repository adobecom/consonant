# capture-refs

Capture Figma reference images for a prototype at all 4 S2A breakpoints.

## Usage

```
/capture-refs <prototype-path> <figma-node-id>
```

Example:
```
/capture-refs matthew-huntsberry/router-marquee 1234:5678
```

## What this does

1. Connects to the open Figma file via Desktop Bridge
2. Finds the frame at `<figma-node-id>`
3. Exports it as PNG at each breakpoint viewport width:
   - sm  → 390px wide
   - md  → 1024px wide
   - lg  → 1280px wide
   - xl  → 1440px wide
4. Saves to `apps/prototyping/<prototype-path>/refs/{sm,md,lg,xl}.png`

The ref-overlay.js in the browser will pick them up automatically on next load.

## Agent steps

1. Use figma_execute to find the node and export at each scale:
   ```js
   const node = await figma.getNodeByIdAsync('NODE_ID');
   const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'WIDTH', value: VIEWPORT_WIDTH } });
   // return bytes as base64
   ```
2. Write each PNG to `apps/prototyping/<path>/refs/<bp>.png` using Bash base64 decode
3. Confirm each file was written

## Notes

- Figma bridge must be connected (S2A toolkit running)
- Works on any node type: FRAME, COMPONENT, COMPONENT_SET, GROUP
- For full-page captures, target the outermost frame
