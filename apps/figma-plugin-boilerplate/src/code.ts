// This is the main plugin code that runs in the Figma sandbox environment

figma.showUI(__html__, { width: 400, height: 300 });

figma.ui.onmessage = async (msg) => {
  if (!msg) {
    return;
  }

  switch (msg.type) {
    case 'ui-ready': {
      // Plugin UI is ready
      figma.ui.postMessage({ type: 'ready', payload: { message: 'Plugin loaded' } });
      break;
    }

    case 'create-rectangle': {
      // Example: Create a rectangle
      const rect = figma.createRectangle();
      rect.x = 0;
      rect.y = 0;
      rect.resize(100, 100);
      rect.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 1 } }];
      
      figma.currentPage.appendChild(rect);
      figma.currentPage.selection = [rect];
      figma.viewport.scrollAndZoomIntoView([rect]);
      
      figma.ui.postMessage({ type: 'rectangle-created', payload: { id: rect.id } });
      break;
    }

    case 'close': {
      figma.closePlugin();
      break;
    }

    default:
      console.warn('Unknown message type:', msg.type);
  }
};
