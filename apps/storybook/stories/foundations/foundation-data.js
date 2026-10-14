import primitivesCss from "../../../../dist/packages/tokens/css/dev/tokens.primitives.css?raw";
import semanticCss from "../../../../dist/packages/tokens/css/dev/tokens.semantic.css?raw";
import lightCss from "../../../../dist/packages/tokens/css/dev/tokens.semantic.light.css?raw";
import darkCss from "../../../../dist/packages/tokens/css/dev/tokens.semantic.dark.css?raw";
import smCss from "../../../../dist/packages/tokens/css/dev/tokens.responsive.sm.css?raw";
import mdCss from "../../../../dist/packages/tokens/css/dev/tokens.responsive.md.css?raw";
import lgCss from "../../../../dist/packages/tokens/css/dev/tokens.responsive.lg.css?raw";
import xlCss from "../../../../dist/packages/tokens/css/dev/tokens.responsive.xl.css?raw";
import { parseTokens, resolveToken } from "./token-model.js";

// The isolated grid preview needs the same cascade as the Storybook viewport.
export const documentTokenCss = [primitivesCss, semanticCss, lightCss, darkCss,
  smCss, mdCss, lgCss, xlCss].join("\n");

const primitive = parseTokens(
  primitivesCss,
  "Primitive",
  "tokens.primitives.css",
);
const semantic = parseTokens(semanticCss, "Semantic", "tokens.semantic.css");
const colors = Object.fromEntries(
  Object.entries({ light: lightCss, dark: darkCss }).map(([mode, css]) => {
    const tokens = parseTokens(css, "Semantic", `tokens.semantic.${mode}.css`);
    for (const token of Object.values(tokens)) {
      if (
        !/^--s2a-color-(background|border|content|focus-ring|surface)-/.test(
          token.name,
        )
      )
        token.layer = "Component";
    }
    return [mode, tokens];
  }),
);
export const responsive = Object.fromEntries(
  Object.entries({ sm: smCss, md: mdCss, lg: lgCss, xl: xlCss }).map(
    ([mode, css]) => [
      mode,
      parseTokens(css, "Responsive", `tokens.responsive.${mode}.css`),
    ],
  ),
);
export const ranges = Object.entries({
  sm: smCss,
  md: mdCss,
  lg: lgCss,
  xl: xlCss,
}).map(([id, css]) => ({
  id,
  min: Number(css.match(/width\s*>=\s*(\d+)px/)?.[1] ?? 0),
}));
export const modes = ranges.map((r) => r.id);
export function tokensFor(theme = "light", mode = "lg") {
  const tokens = { ...primitive, ...semantic, ...colors[theme] };
  for (const id of modes.slice(0, modes.indexOf(mode) + 1))
    Object.assign(tokens, responsive[id]);
  return tokens;
}
export function modeStyles(mode) {
  const styles = {};
  for (const id of modes.slice(0, modes.indexOf(mode) + 1)) {
    for (const token of Object.values(responsive[id]))
      styles[token.name] = token.value;
  }
  return styles;
}
export const valueOf = (name, theme = "light", mode = "lg") =>
  resolveToken(name, tokensFor(theme, mode));
export const shortName = (name) => name.replace("--s2a-", "");
export const readable = (name) => shortName(name).replace(/-/g, " ");
export const figmaUrl = (node) =>
  `https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/CPro?node-id=${node.replace(":", "-")}`;
export const guideUrl = (topic) =>
  `./?path=/story/foundations-${topic === "start" ? "start-here" : topic}--guide`;

export function tokenPurpose(name) {
  const families = [
    ["color-background-", "Background color"],
    ["color-content-", "Text and icon color"],
    ["color-border-", "Boundary color"],
    ["color-focus-ring-", "Keyboard focus indicator"],
    ["color-surface-", "Surface color"],
    ["color-button-", "Button treatment"],
    ["typography-font-size-", "Responsive text size"],
    ["typography-line-height-", "Responsive line height"],
    ["typography-letter-spacing-", "Responsive letter spacing"],
    ["section-spacing-", "Space between page sections"],
    ["spacing-", "Space inside or between elements"],
    ["border-radius-", "Corner radius"],
    ["border-width-", "Boundary width"],
    ["font-family-", "Typeface role"],
    ["font-weight-", "Text weight"],
    ["blur-", "Background blur"],
    ["opacity-", "Layer opacity"],
    ["layout-guide-", "Layout guide spacing"],
    ["layout-", "Large-scale layout spacing"],
  ];
  const key = shortName(name);
  const family = families.find(([prefix]) => key.startsWith(prefix));
  return family ? family[1] : "Component styling role";
}

export const topics = [
  {
    id: "start",
    title: "Start Here",
    node: "5392:44706",
    label: "A shared language for every interface.",
    intro:
      "Foundations connect design decisions to the interfaces we build. Explore the roles, try the examples, and find the tokens that bring them together.",
    summary: "Understand how the system fits together.",
    demoTitle: "Follow a token into the interface",
    demoIntro:
      "Choose a property to see the aliases behind it. The path follows the shipped tokens, including direct references to a primitive.",
    token: "--s2a-color-content-heading",
    related: ["color", "spacing", "theming"],
    tips: [
      [
        "Choose a role first",
        "Start with the purpose: heading, surface, spacing, or action. Use a semantic or component token that describes that purpose.",
      ],
      [
        "Keep references connected",
        "Use the token name in code. Copying its resolved value disconnects the interface from future theme and scale changes.",
      ],
      [
        "Check the context",
        "Try both themes and the relevant viewport sizes. A token is one part of a usable composition.",
      ],
    ],
  },
  {
    id: "color",
    title: "Color",
    node: "5392:65979",
    label: "Give color a clear purpose.",
    intro:
      "Use color roles to distinguish surfaces, content, boundaries, and actions. A role communicates intent and can adapt when the theme changes.",
    summary: "Choose colors by what they do.",
    demoTitle: "Explore color in context",
    demoIntro:
      "Select a role to highlight it in the example and inspect its token. Use the theme control to compare its resolved value.",
    token: "--s2a-color-background-default",
    related: ["theming", "border"],
    tips: [
      [
        "Pair content with its surface",
        "Evaluate text and icons against the background they actually sit on. A color alone does not establish readable contrast.",
      ],
      [
        "Make meaning explicit",
        "Pair status colors with clear text or an icon. Color should support the message, not carry it alone.",
      ],
      [
        "Use emphasis deliberately",
        "Reserve accent and brand colors for the roles defined by the system. Give the main action a clear visual priority.",
      ],
    ],
  },
  {
    id: "typography",
    title: "Typography",
    node: "5392:63252",
    label: "Make the hierarchy easy to read.",
    intro:
      "Typography helps people scan, understand, and act. Choose a text role, then let its size, weight, and spacing create a consistent rhythm.",
    summary: "Build hierarchy with text roles.",
    demoTitle: "Try a text role",
    demoIntro:
      "Edit the specimen and compare responsive modes. The example uses the role’s font size, line height, and letter spacing from the current token build.",
    token: "--s2a-typography-font-size-heading-2",
    related: ["responsive", "spacing"],
    tips: [
      [
        "Lead with the useful words",
        "Use short, descriptive headings and sentence case. Put the words that distinguish a section near the beginning.",
      ],
      [
        "Separate meaning from size",
        "Choose heading levels by document structure. Use the appropriate visual role without skipping semantic heading levels.",
      ],
      [
        "Test real content",
        "Check long titles, translated text, and zoom. Allow text to wrap and grow instead of fixing the height of its container.",
      ],
    ],
  },
  {
    id: "spacing",
    title: "Spacing",
    node: "5392:64241",
    label: "Give relationships room to show.",
    intro:
      "Use space to group related content and separate distinct sections. Choose the spacing role that matches the relationship you want people to see.",
    summary: "Create grouping and rhythm.",
    demoTitle: "See the space between things",
    demoIntro:
      "Adjust padding and gap independently. The highlighted regions show space inside the card and between its content.",
    token: "--s2a-spacing-lg",
    related: ["layout", "responsive"],
    tips: [
      [
        "Group related content",
        "Use tighter spacing within a group and more space between different groups. Keep that relationship consistent across the page.",
      ],
      [
        "Distinguish padding from gap",
        "Padding separates content from its container. Gap separates sibling elements. Choose each based on the relationship it expresses.",
      ],
      [
        "Use section spacing for page rhythm",
        "Section spacing can change with the responsive mode. Check the resolved values; size labels alone do not guarantee increasing values.",
      ],
    ],
  },
  {
    id: "border",
    title: "Border",
    node: "5392:64965",
    label: "Define edges with intention.",
    intro:
      "Borders separate content, reveal interactive boundaries, and shape surfaces. Use width, color, and radius together to create a clear treatment.",
    summary: "Shape surfaces and boundaries.",
    demoTitle: "Compare border treatments",
    demoIntro:
      "Change the radius and width on the same surface. Keep the content constant so the effect of each decision is easy to compare.",
    token: "--s2a-border-radius-sm",
    related: ["color", "effects"],
    tips: [
      [
        "Start with the boundary",
        "Use a border when people need to distinguish an edge. Spacing may be enough to separate non-interactive content.",
      ],
      [
        "Match the component",
        "Use the component’s prescribed radius and width. A foundation specimen is a reference, not an invitation to restyle every instance.",
      ],
      [
        "Preserve focus visibility",
        "A subtle surface border and a focus indicator serve different purposes. Keep keyboard focus visible in both themes.",
      ],
    ],
  },
  {
    id: "effects",
    title: "Effects",
    node: "5392:66780",
    label: "Add emphasis with restraint.",
    intro:
      "Effects can soften background detail or change visual prominence. Use them to support a clear relationship while preserving readable content.",
    summary: "Understand blur and opacity.",
    demoTitle: "Explore blur and opacity",
    demoIntro:
      "Compare the shipped semantic blur and opacity tokens. The effect applies to decorative artwork; the text stays sharp and readable.",
    token: "--s2a-blur-xs",
    related: ["color", "border"],
    tips: [
      [
        "Keep content readable",
        "Apply blur to decorative or background layers. Do not blur the text or controls people need to understand.",
      ],
      [
        "Use opacity in context",
        "Opacity changes the final color through blending. Check the result on the actual underlying surface.",
      ],
      [
        "Keep state and behavior aligned",
        "Reduced opacity can signal a disabled state, but it does not disable an element. Use the component’s disabled behavior as well.",
      ],
    ],
  },
  {
    id: "responsive",
    title: "Responsive",
    node: "5392:73854",
    label: "Adapt without losing the hierarchy.",
    intro:
      "Responsive tokens change selected design values at defined viewport widths. Compare the modes to understand what changes and what stays consistent.",
    summary: "Follow values across viewports.",
    demoTitle: "Watch a token change with width",
    demoIntro:
      "Move the viewport control to see the active token mode. The chart uses the exact media-query boundaries and resolved values in the shipped CSS.",
    token: "--s2a-typography-font-size-heading-2",
    related: ["typography", "layout", "spacing"],
    tips: [
      [
        "Design for the content",
        "Use breakpoint modes as a starting point. Check the widths between them and allow content to wrap naturally.",
      ],
      [
        "Treat mode changes as steps",
        "These token files change values at media-query boundaries. The chart shows those steps without implying fluid interpolation.",
      ],
      [
        "Check layout behavior separately",
        "Tokens and layout rules have related responsibilities. Use the existing Grid conformance page to inspect differences between their boundaries.",
      ],
    ],
  },
  {
    id: "icons",
    title: "Icons",
    node: "2142:53775",
    label: "Make small signals unmistakable.",
    intro:
      "Icons reinforce actions and help people recognize familiar patterns. Pair them with clear labels and preserve the shape of the source artwork.",
    summary: "Choose a recognizable signal.",
    demoTitle: "Find an icon and see it in context",
    demoIntro:
      "Search the SVG assets shipped with the components. Select an icon to compare its source artwork with a labeled action.",
    token: "--s2a-color-content-default",
    related: ["color", "typography"],
    tips: [
      [
        "Name the action",
        "Use a visible label when the meaning might be unfamiliar. Give icon-only controls an accessible name that describes the action.",
      ],
      [
        "Inherit the intended color",
        "Keep icon color connected to the surrounding content or component state. In code, currentColor supports that relationship.",
      ],
      [
        "Preserve the artwork",
        "Use the source SVG and its viewBox. Do not redraw icons from text characters or stretch them out of proportion.",
      ],
    ],
  },
  {
    id: "layout",
    title: "Layout",
    node: "104:26144",
    label: "Give every element a place.",
    intro:
      "Containers, columns, and gutters establish shared alignment. Use the layout system to organize content while keeping its reading order clear.",
    summary: "Align content across the page.",
    demoTitle: "Reveal the structure",
    demoIntro:
      "Compare the grid modes and toggle the column overlay. This proportional diagram uses the column counts and gutters recorded in the grid contract.",
    token: "--s2a-layout-guide-gap",
    related: ["responsive", "spacing"],
    tips: [
      [
        "Establish a shared edge",
        "Align related sections to the same container. Consistent edges make a page easier to scan.",
      ],
      [
        "Let content determine composition",
        "Choose a grid that supports the content. Avoid forcing text or controls into fixed heights to match a diagram.",
      ],
      [
        "Preserve reading order",
        "Keep the DOM order meaningful when the layout changes. Visual positioning should support keyboard and screen-reader navigation.",
      ],
    ],
  },
  {
    id: "theming",
    title: "Theming",
    node: "11851:211568",
    label: "Keep the role. Change the expression.",
    intro:
      "Themes assign different values to shared color roles. Keep components connected to those roles so the interface adapts as a whole.",
    summary: "Compare light and dark roles.",
    demoTitle: "One interface, two themes",
    demoIntro:
      "Compare the same content in both modes. Select a color role to inspect its light and dark values and the aliases behind them.",
    token: "--s2a-color-content-heading",
    related: ["color", "effects"],
    tips: [
      [
        "Use theme-aware roles",
        "Use semantic and component tokens for surfaces, content, and controls. Their values can change together when the theme changes.",
      ],
      [
        "Recognize fixed treatments",
        "Some knockout and inverse treatments intentionally stay fixed. Inspect both mode values instead of assuming every color flips.",
      ],
      [
        "Check the whole composition",
        "Review icons, borders, focus indicators, and imagery alongside text. Switching a background alone does not create a complete theme.",
      ],
    ],
  },
];

export const topicById = Object.fromEntries(
  topics.map((topic) => [topic.id, topic]),
);
export function belongsTo(name, topic) {
  const matchers = {
    color: /^--s2a-color-(background|content|border|focus-ring|surface)-/,
    theming: /^--s2a-color-(background|content|border|focus-ring|surface)-/,
    typography:
      /^--s2a-(typography-|font-family-|font-weight-(body|heading|caption|label|eyebrow)$)/,
    spacing: /^--s2a-(spacing-|section-spacing-)/,
    border: /^--s2a-border-/,
    effects: /^--s2a-(blur-|opacity-)/,
    responsive: /^--s2a-(typography-|section-spacing-|layout-guide-)/,
    icons: /^--s2a-color-(content|focus-ring)-/,
    layout: /^--s2a-(layout-|section-spacing-)/,
  };
  return !matchers[topic] || matchers[topic].test(name);
}
