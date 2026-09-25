import { html, nothing } from "lit";

import { SectionHeader } from "./SectionHeader";
import { createButton as Button } from "../../../packages/components/src/button/button.js";

// dark = pin the surface's theme mode (data-theme="dark"); the header reads theme tokens inside it.
const section = (bg, content, dark = false) => html`
  <div data-theme=${dark ? "dark" : nothing} style="
    width: 100%;
    box-sizing: border-box;
    padding: 80px 120px;
    background: ${bg};
    display: flex;
    flex-direction: column;
    align-items: center;
  ">
    ${content}
  </div>
`;

export default {
  title: "Molecules/SectionHeader",
  tags: ["autodocs"],
  render: (args) => section("#ffffff", SectionHeader(args)),
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Centered section-level heading block — eyebrow + heading-2 title + optional body. A thin, named wrapper around RichContent with \`justifyContent=center\` and \`measure=wide\` locked in.

**Figma:** [elastic-card-updates node 3774-4410](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=3774-4410)
        `,
      },
      source: {
        language: "html",
        code: `<div class="c-section-header">
  <div class="c-rich-content" data-density="tight" data-justify="center" data-measure="wide">
    <div class="c-rich-content__text">
      <p class="c-rich-content__eyebrow">Optimized Workflows</p>
      <h2 class="c-rich-content__title">Everything you need to make anything.</h2>
      <p class="c-rich-content__body">Bring any idea to life with industry-leading creative tools.</p>
    </div>
  </div>
</div>`,
      },
    },
  },
  argTypes: {
    eyebrow: { control: "text", description: "Optional eyebrow label above the title" },
    showEyebrow: { control: "boolean" },
    title: { control: "text" },
    body: { control: "text", description: "Optional body paragraph below title" },
    showActions: { control: "boolean" },
  },
  args: {
    eyebrow: "Optimized Workflows",
    showEyebrow: true,
    title: "Everything you need to make anything.",
    body: "Bring any idea to life with industry-leading creative tools, AI-powered features, and a seamless ecosystem built for every creator.",
    showActions: false,
  },
};

export const OnLight = {
  name: "On Light",
  render: (args) => section("#ffffff", SectionHeader(args)),
};

export const OnDark = {
  name: "On Dark",
  render: (args) => section("#0f0d0c", SectionHeader(args), true),
};

export const WithActions = {
  name: "With Actions",
  render: (args) =>
    section(
      "#ffffff",
      SectionHeader({
        ...args,
        showActions: true,
        actions: html`
          ${Button({ label: "Get started", style: "solid" })}
          ${Button({ label: "Learn more", style: "outlined" })}
        `,
      })
    ),
};

export const OnDarkWithActions = {
  name: "On Dark — With Actions",
  render: (args) =>
    section(
      "#0f0d0c",
      SectionHeader({
        ...args,
        showActions: true,
        actions: html`
          ${Button({ label: "Get started", style: "knockout" })}
          ${Button({ label: "Learn more", style: "outline-inverse" })}
        `,
      }),
      true
    ),
};

export const TitleOnly = {
  name: "Title Only",
  render: () =>
    section(
      "#f8f8f8",
      SectionHeader({
        showEyebrow: false,
        title: "Everything you need to make anything.",
      })
    ),
};
