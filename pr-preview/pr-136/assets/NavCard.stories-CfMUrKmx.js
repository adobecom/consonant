import{x as r}from"./iframe-DGf3QGPt.js";import{N as o}from"./nav-card-LTMOezrb.js";import"./preload-helper-DCUR1HYs.js";import"./unsafe-html-BaoeYJW3.js";import"./directive-DoeGSK_T.js";import"./nav-card-shell-Dib68pjW.js";import"./nav-card-button-DeH6lYwC.js";import"./chevron-right-CnbUzkxe.js";const m={title:"Organisms/NavCard/Promo",tags:["autodocs"],render:n=>r`
    <div style="padding: 32px; background: #f5f5f5; display: inline-flex;">
      ${o(n)}
    </div>
  `,parameters:{docs:{description:{component:`
Promotional card used in Global Navigation to highlight an audience segment or product category.
Default state is white; hovering transitions to a knockout black surface.

Figma: [NavCard — Navigation A.com](https://www.figma.com/design/8CRIbATawRV1jWh8RAC5ZJ/Navigation-%E2%80%94-A.com?node-id=3872-5442)
        `},source:{language:"html",code:`<div class="c-nav-card">
  <div class="c-nav-card__top">
    <p class="c-nav-card__eyebrow">Creative Professionals</p>
    <div class="c-nav-card__content">
      <h3 class="c-nav-card__title">Craft at the highest level of creative.</h3>
      <div class="c-nav-card__body-area">
        <p class="c-nav-card__body">Create designs, photo, video, and more with AI in Creative Cloud apps.</p>
        <a class="c-nav-card__cta-link" href="#">
          See plans
          <svg width="6" height="10" viewBox="0 0 6 10" fill="none" aria-hidden="true">…</svg>
        </a>
      </div>
    </div>
  </div>
  <div class="c-nav-card__bottom">
    <a class="c-nav-card-button" href="#">Explore</a>
  </div>
</div>`}}},argTypes:{eyebrow:{control:"text",description:"Audience/category label above the title"},title:{control:"text",description:"Primary heading"},body:{control:"text",description:"Supporting body copy"},ctaLinkLabel:{control:"text",description:"Text link label"},ctaLinkHref:{control:"text",description:"Text link URL"},ctaButtonLabel:{control:"text",description:"Pill button label"},ctaButtonHref:{control:"text",description:"Pill button URL"}},args:{eyebrow:"Creative Professionals",title:"Craft at the highest level of creative.",body:"Create designs, photo, video, and more with AI in Creative Cloud apps.",ctaLinkLabel:"See plans",ctaLinkHref:"#",ctaButtonLabel:"Explore",ctaButtonHref:"#"}},t={},e={parameters:{docs:{description:{story:"Forced hover state — mirrors what the card looks like on cursor-over. In the canvas, hover the card to see the live transition."}},pseudo:{hover:!0}}},a={render:()=>r`
    <div style="display: flex; gap: 24px; padding: 32px; background: #f5f5f5; flex-wrap: wrap; align-items: flex-start;">
      ${o({eyebrow:"No CTA link",title:"Card with button only.",body:"CTA link is omitted when ctaLinkLabel or ctaLinkHref is empty.",ctaButtonLabel:"Explore",ctaButtonHref:"#"})}
      ${o({eyebrow:"No button",title:"Card with link only.",body:"Pill button is omitted when ctaButtonLabel is empty.",ctaLinkLabel:"See plans",ctaLinkHref:"#",ctaButtonLabel:""})}
    </div>
  `};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};const h=["Default","HoverState","EmptyStates"];export{t as Default,a as EmptyStates,e as HoverState,h as __namedExportsOrder,m as default};
