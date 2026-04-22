import{x as o}from"./iframe-BVlFFcJY.js";import{N as t}from"./nav-card-BFGz7L7v.js";import"./preload-helper-BSds_FOV.js";import"./nav-card-shell-DRkwr_hQ.js";import"./nav-card-button-EMhNaINR.js";const c=`/* ─── Component tokens ──────────────────────────────────────────────────────── */
.c-nav-card {
  --c-nav-card-bg:            var(--s2a-color-background-default, #ffffff);
  --c-nav-card-eyebrow-color: var(--s2a-color-transparent-black-64, rgba(0, 0, 0, 0.64));
  --c-nav-card-title-color:   var(--s2a-color-content-default, #000000);
  --c-nav-card-body-color:    var(--s2a-color-transparent-black-64, rgba(0, 0, 0, 0.64));
  --c-nav-card-link-color:    var(--s2a-color-content-default, #000000);
  --c-nav-card-shell-bg:      var(--c-nav-card-bg);
}

.c-nav-card:hover {
  --c-nav-card-bg:            var(--s2a-color-background-knockout, #000000);
  --c-nav-card-eyebrow-color: var(--s2a-color-transparent-white-64, rgba(255, 255, 255, 0.64));
  --c-nav-card-title-color:   var(--s2a-color-content-knockout, #ffffff);
  --c-nav-card-body-color:    var(--s2a-color-transparent-white-64, rgba(255, 255, 255, 0.64));
  --c-nav-card-link-color:    var(--s2a-color-content-knockout, #ffffff);

}

/* ─── Root ──────────────────────────────────────────────────────────────────── */
.c-nav-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  transition:
    background-color 200ms ease,
    color 200ms ease;
}

/* ─── Top content ────────────────────────────────────────────────────────────── */
.c-nav-card__top {
  display: flex;
  flex-direction: column;
  gap: var(--s2a-spacing-md, 16px);
}

/* ─── Eyebrow ────────────────────────────────────────────────────────────────── */
.c-nav-card__eyebrow {
  margin: 0;
  font-family: var(--s2a-font-family-adobe-clean, "Adobe Clean", sans-serif);
  font-weight: var(--s2a-font-weight-adobe-clean-bold, 700);
  font-size: var(--s2a-typography-font-size-label, 14px);
  line-height: var(--s2a-typography-line-height-label, 18px);
  letter-spacing: var(--s2a-typography-letter-spacing-label, 0px);
  color: var(--c-nav-card-eyebrow-color);
  transition: color 200ms ease;
  /* Match Figma's "Vertical trim: Cap height" — removes leading above cap and below baseline */
  text-box-trim: trim-both;
  text-box-edge: cap alphabetic;
}

/* ─── Content stack (title + body + cta-link) ────────────────────────────────── */
.c-nav-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--s2a-spacing-xs, 8px);
}

/* ─── Title ──────────────────────────────────────────────────────────────────── */
.c-nav-card__title {
  margin: 0;
  font-family: var(--s2a-font-family-adobe-clean-display, "Adobe Clean Display", sans-serif);
  font-weight: var(--s2a-font-weight-adobe-clean-display-black, 900);
  font-size: var(--s2a-typography-font-size-title-4, 24px);
  line-height: var(--s2a-typography-line-height-title-4, 24px);
  letter-spacing: var(--s2a-typography-letter-spacing-title-4, -0.48px);
  color: var(--c-nav-card-title-color);
  transition: color 200ms ease;
}

/* ─── Body area (body copy + cta-link) ───────────────────────────────────────── */
.c-nav-card__body-area {
  display: flex;
  flex-direction: column;
  gap: var(--s2a-spacing-md, 16px);
}

/* ─── Body copy ──────────────────────────────────────────────────────────────── */
.c-nav-card__body {
  margin: 0;
  font-family: var(--s2a-font-family-adobe-clean, "Adobe Clean", sans-serif);
  font-weight: var(--s2a-font-weight-adobe-clean-regular, 400);
  font-size: var(--s2a-typography-font-size-body-sm, 14px);
  line-height: var(--s2a-typography-line-height-body-sm, 18px);
  letter-spacing: var(--s2a-typography-letter-spacing-body-sm, 0.16px);
  color: var(--c-nav-card-body-color);
  transition: color 200ms ease;
}

/* ─── CTA link ───────────────────────────────────────────────────────────────── */
.c-nav-card__cta-link {
  display: inline-flex;
  align-items: center;
  gap: var(--s2a-spacing-xs, 8px);
  font-family: var(--s2a-font-family-adobe-clean, "Adobe Clean", sans-serif);
  font-weight: var(--s2a-font-weight-adobe-clean-bold, 700);
  font-size: var(--s2a-typography-font-size-label, 14px);
  line-height: var(--s2a-typography-line-height-label, 18px);
  letter-spacing: var(--s2a-typography-letter-spacing-label, 0px);
  color: var(--c-nav-card-link-color);
  text-decoration: none;
  transition: color 200ms ease;
}

.c-nav-card__cta-link:focus-visible {
  outline: var(--s2a-border-width-sm, 1px) solid var(--s2a-color-focus-ring-default, #1473e6);
  outline-offset: 2px;
  border-radius: 2px;
}

.c-nav-card__cta-link__label {
  /* Match Figma's "Vertical trim: Cap height" on the link label text */
  text-box-trim: trim-both;
  text-box-edge: cap alphabetic;
}

.c-nav-card__cta-link__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* ─── Non-interactive variant — suppresses card-level hover ─────────────────── */
/* pointer-events: none can't prevent :hover when a child has pointer-events: auto.
   Instead, reset every hover token back to its default value so the :hover rule
   fires but produces no visible change. Also suppress the button's own hover/active
   backgrounds so even the button appears static. */
.c-nav-card[data-interactive="false"]:hover {
  --c-nav-card-bg:            var(--s2a-color-background-default, #ffffff);
  --c-nav-card-eyebrow-color: var(--s2a-color-transparent-black-64, rgba(0, 0, 0, 0.64));
  --c-nav-card-title-color:   var(--s2a-color-content-default, #000000);
  --c-nav-card-body-color:    var(--s2a-color-transparent-black-64, rgba(0, 0, 0, 0.64));
  --c-nav-card-link-color:    var(--s2a-color-content-default, #000000);
}

.c-nav-card:hover .c-nav-card-button__button {
  background-color: var(--s2a-color-background-default, #ffffff);
  border-color: var(
    --s2a-color-transparent-white-00,
    rgba(255, 255, 255, 0)
  );
  color: var(--s2a-color-content-default, #000000);
}

.c-nav-card[data-interactive="false"]:hover .c-nav-card-button__button {
  background-color: var(--s2a-color-background-default, #ffffff);
  border-color: var(--s2a-color-content-default, #000000);
  color: var(--s2a-color-content-default, #000000);
}
`,v={title:"Navigation/Nav Card/Promo",tags:["autodocs"],render:r=>o`
    <div style="padding: 32px; background: #f5f5f5; display: inline-flex;">
      ${t(r)}
    </div>
  `,parameters:{docs:{description:{component:`
Promotional card used in Global Navigation to highlight an audience segment or product category.
Default state is white; hovering transitions to a knockout black surface.

Figma: [NavCard — Navigation A.com](https://www.figma.com/design/8CRIbATawRV1jWh8RAC5ZJ/Navigation-%E2%80%94-A.com?node-id=3872-5442)

\`\`\`css
${c}
\`\`\`
        `}}},argTypes:{eyebrow:{control:"text",description:"Audience/category label above the title"},title:{control:"text",description:"Primary heading"},body:{control:"text",description:"Supporting body copy"},ctaLinkLabel:{control:"text",description:"Text link label"},ctaLinkHref:{control:"text",description:"Text link URL"},ctaButtonLabel:{control:"text",description:"Pill button label"},ctaButtonHref:{control:"text",description:"Pill button URL"}},args:{eyebrow:"Creative Professionals",title:"Craft at the highest level of creative.",body:"Create designs, photo, video, and more with AI in Creative Cloud apps.",ctaLinkLabel:"See plans",ctaLinkHref:"#",ctaButtonLabel:"Explore",ctaButtonHref:"#"}},a={},n={parameters:{docs:{description:{story:"Forced hover state — mirrors what the card looks like on cursor-over. In the canvas, hover the card to see the live transition."}},pseudo:{hover:!0}}},e={render:()=>o`
    <div style="display: flex; gap: 24px; padding: 32px; background: #f5f5f5; flex-wrap: wrap; align-items: flex-start;">
      ${t({eyebrow:"No CTA link",title:"Card with button only.",body:"CTA link is omitted when ctaLinkLabel or ctaLinkHref is empty.",ctaButtonLabel:"Explore",ctaButtonHref:"#"})}
      ${t({eyebrow:"No button",title:"Card with link only.",body:"Pill button is omitted when ctaButtonLabel is empty.",ctaLinkLabel:"See plans",ctaLinkHref:"#",ctaButtonLabel:""})}
    </div>
  `};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Forced hover state — mirrors what the card looks like on cursor-over. In the canvas, hover the card to see the live transition."
      }
    },
    pseudo: {
      hover: true
    }
  }
}`,...n.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: 24px; padding: 32px; background: #f5f5f5; flex-wrap: wrap; align-items: flex-start;">
      \${NavCard({
    eyebrow: "No CTA link",
    title: "Card with button only.",
    body: "CTA link is omitted when ctaLinkLabel or ctaLinkHref is empty.",
    ctaButtonLabel: "Explore",
    ctaButtonHref: "#"
  })}
      \${NavCard({
    eyebrow: "No button",
    title: "Card with link only.",
    body: "Pill button is omitted when ctaButtonLabel is empty.",
    ctaLinkLabel: "See plans",
    ctaLinkHref: "#",
    ctaButtonLabel: ""
  })}
    </div>
  \`
}`,...e.parameters?.docs?.source}}};const f=["Default","HoverState","EmptyStates"];export{a as Default,e as EmptyStates,n as HoverState,f as __namedExportsOrder,v as default};
