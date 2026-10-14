import { create } from "storybook/theming";
import values from "./token-theme.generated.json";

export const tokenTheme = (mode = "light") =>
  create({
    ...values[mode === "dark" ? "dark" : "light"],
    brandTitle: "S2A Design System",
    brandUrl: "https://adobecom.github.io/consonant",
    brandTarget: "_blank",
  });
