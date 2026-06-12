/**
 * Storybook Manager — S2A theme + Figma Overlay toolbar controls
 */

import React, { useCallback } from "react";
import { addons, types, useGlobals } from "storybook/manager-api";
import { create } from "storybook/theming";
import { IconButton } from "storybook/internal/components";

addons.setConfig({
  theme: create({
    base: "light",
    // Warm off-white brand surface — matches the plugin UI palette
    colorPrimary: "#1a1a1a",
    colorSecondary: "#e84830",   // Adobe brand red — used sparingly for active states

    // UI chrome
    appBg: "#faf9f7",
    appContentBg: "#ffffff",
    appBorderColor: "rgba(0,0,0,0.08)",
    appBorderRadius: 10,

    // Toolbar
    barBg: "#faf9f7",
    barTextColor: "#333333",
    barSelectedColor: "#1a1a1a",
    barHoverColor: "#1a1a1a",

    // Typography
    fontBase: '"Adobe Clean", adobe-clean, "Trebuchet MS", -apple-system, sans-serif',
    fontCode: '"Fira Code", "JetBrains Mono", monospace',

    // Text
    textColor: "#1a1a1a",
    textInverseColor: "#ffffff",
    textMutedColor: "rgba(0,0,0,0.5)",

    // Inputs
    inputBg: "#ffffff",
    inputBorder: "rgba(0,0,0,0.12)",
    inputTextColor: "#1a1a1a",
    inputBorderRadius: 6,

    brandTitle: "S2A Design System",
    brandUrl: "https://adobecom.github.io/consonant",
    brandTarget: "_blank",
  }),
});

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

