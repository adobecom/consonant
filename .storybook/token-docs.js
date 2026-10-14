import React, { useLayoutEffect, useState } from "react";
import { DocsContainer } from "@storybook/addon-docs/blocks";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { tokenTheme } from "./token-theme.js";

export function TokenDocsContainer(props) {
  const [mode, setMode] = useState(
    () => document.documentElement.dataset.theme || "light",
  );
  useLayoutEffect(() => {
    const root = document.documentElement;
    const channel = props.context.channel;
    // Standalone MDX has no story decorator. Read the current globals and watch
    // subsequent toolbar changes so it uses the same token mode as live stories.
    const applyGlobals = ({ globals } = {}) => {
      if (!globals?.theme) return;
      const theme = globals.theme === "dark" ? "dark" : "light";
      root.dataset.theme = theme;
      setMode(theme);
    };
    channel.on(GLOBALS_UPDATED, applyGlobals);
    channel.on(SET_GLOBALS, applyGlobals);
    applyGlobals(
      channel.last(GLOBALS_UPDATED)?.[0] || channel.last(SET_GLOBALS)?.[0],
    );
    const observer = new MutationObserver(() =>
      setMode(root.dataset.theme || "light"),
    );
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      observer.disconnect();
      channel.off(GLOBALS_UPDATED, applyGlobals);
      channel.off(SET_GLOBALS, applyGlobals);
    };
  }, [props.context.channel]);
  return React.createElement(DocsContainer, {
    ...props,
    theme: tokenTheme(mode),
  });
}
