import { html } from "lit";
import { SegmentedControl } from "./SegmentedControl";

export default {
  title: "Atoms/SegmentedControl",
  tags: ["autodocs"],
  render: (args) => SegmentedControl(args),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Pill switcher on a transparent-black-04 wash. The active segment is a fully-rounded
knockout-black pill inset 4px top/bottom with a white label; inactive labels sit at
transparent-black-64.

Figma ships a fixed 3-up set (Selected=1|2|3); this implementation generalizes to any
segment count with the same visual spec. Modeled as a tablist (content switcher) —
swap to radiogroup semantics if capturing a form value. Arrow-key navigation must be
wired by the consumer.

Matches Figma \`SegmentItem\` (10104:100998) + \`SegmentedControl/3-up\` (10104:101023).
        `,
      },
      source: {
        language: "html",
        code: `<div class="c-segmented-control" role="tablist" aria-label="Audience">
  <button class="c-segmented-control__item" role="tab" aria-selected="true">
    <span class="c-segmented-control__cta">Individuals</span>
  </button>
  <button class="c-segmented-control__item" role="tab" aria-selected="false" tabindex="-1">
    <span class="c-segmented-control__cta">Businesses</span>
  </button>
</div>`,
      },
    },
  },
  argTypes: {
    selected: {
      control: { type: "number", min: 0, max: 2, step: 1 },
      description: "Index of the active segment (0-based)",
    },
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default = {
  args: {
    segments: ["Individuals", "Businesses", "AI Pro"],
    selected: 0,
  },
};

export const SecondSelected = {
  args: {
    segments: ["Individuals", "Businesses", "AI Pro"],
    selected: 1,
  },
};

export const ThirdSelected = {
  args: {
    segments: ["Individuals", "Businesses", "AI Pro"],
    selected: 2,
  },
};

export const TwoSegments = {
  args: {
    segments: ["Monthly", "Yearly"],
    selected: 0,
  },
};

/** All three Figma Selected variants side by side. */
export const AllVariants = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; align-items: flex-start;">
      ${[0, 1, 2].map((selected) => SegmentedControl({ selected }))}
    </div>
  `,
};
