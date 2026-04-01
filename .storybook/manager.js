/**
 * Storybook Manager — Figma Overlay toolbar controls
 *
 * Adds a toolbar toggle button and opacity slider to the Storybook UI.
 * Toggle: show/hide the Figma design overlay on the active story.
 * Slider: adjust overlay transparency (10–90%).
 */

import React, { useCallback } from "react";
import { addons, types, useGlobals } from "storybook/manager-api";
import { IconButton } from "storybook/internal/components";

const ADDON_ID = "figma-overlay";
const TOOL_ID = `${ADDON_ID}/tool`;

function FigmaOverlayTool() {
  const [globals, updateGlobals] = useGlobals();
  const isActive = !!globals.figmaOverlay;
  const opacity = globals.figmaOpacity ?? 40;

  const toggle = useCallback(() => {
    updateGlobals({ figmaOverlay: !isActive });
  }, [isActive, updateGlobals]);

  const handleOpacity = useCallback(
    (e) => {
      updateGlobals({ figmaOpacity: Number(e.target.value) });
    },
    [updateGlobals],
  );

  const clearToken = useCallback(() => {
    localStorage.removeItem("figma-overlay-token");
    alert("Figma token cleared. You will be prompted again on next overlay use.");
  }, []);

  return React.createElement(
    React.Fragment,
    null,
    // Toggle button
    React.createElement(
      IconButton,
      {
        active: isActive,
        title: isActive ? "Hide Figma overlay" : "Show Figma overlay",
        onClick: toggle,
        style: { fontSize: "16px" },
      },
      "⬚",
    ),
    // Opacity slider — only shown when overlay is active
    isActive &&
      React.createElement(
        "label",
        {
          title: `Overlay opacity: ${opacity}%`,
          style: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 8px",
            fontSize: "11px",
            color: "inherit",
            cursor: "default",
          },
        },
        React.createElement("input", {
          type: "range",
          min: 10,
          max: 90,
          step: 5,
          value: opacity,
          onChange: handleOpacity,
          style: { width: "72px", cursor: "pointer" },
        }),
        `${opacity}%`,
      ),
    // Clear token link — always visible so user can reset if token expires
    React.createElement(
      "button",
      {
        onClick: clearToken,
        title: "Clear stored Figma token",
        style: {
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "10px",
          opacity: 0.5,
          padding: "0 4px",
          color: "inherit",
        },
      },
      "× token",
    ),
  );
}

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: "Figma Overlay",
    match: ({ viewMode }) => viewMode === "story",
    render: () => React.createElement(FigmaOverlayTool),
  });
});
