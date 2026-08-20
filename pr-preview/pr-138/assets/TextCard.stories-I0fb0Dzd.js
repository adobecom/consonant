import{E as i,x as a}from"./iframe-BF3kBnV_.js";import{o as f}from"./unsafe-html-KEEgFXCO.js";import{c as g}from"./chevron-right-CnbUzkxe.js";import"./preload-helper-DJf2C9PT.js";import"./directive-DoeGSK_T.js";const y=()=>f(g),l=({headline:e="",body:d="",ctaLabel:c="Read story",ctaHref:m="#",showBody:u=!0,showCta:h=!0}={})=>a`
  <div class="c-text-card">
    <div class="tc-headline-body">
      <p class="tc-headline">${e}</p>
      ${u&&d?a`<p class="tc-body">${d}</p>`:i}
    </div>
    ${h&&c?a`
          <a class="tc-cta" href=${m}>
            <span class="tc-cta__label">${c}</span>
            <span class="tc-cta__icon" aria-hidden="true">${y()}</span>
          </a>
        `:i}
  </div>
`,p=[{headline:"Adobe apps are top choice for Sundance filmmakers.",body:"85% of Sundance Filmmakers Choose Adobe as Company Releases New AI Video Innovations and $10M in Creator Grants.",ctaLabel:"Read story",ctaHref:"#"},{headline:"Adobe MAX 2025: Everything announced in one place.",body:"New generative AI tools, Firefly updates, and a completely redesigned Premiere Pro headline this year's creative conference.",ctaLabel:"See highlights",ctaHref:"#"},{headline:"Creative Cloud now includes 2TB of cloud storage.",body:"All Creative Cloud plans include doubled cloud storage, plus new collaboration features for teams working across time zones.",ctaLabel:"Learn more",ctaHref:"#"}],A={title:"Cards/TextCard",tags:["autodocs"],render:e=>l(e),parameters:{layout:"padded",docs:{description:{component:"<p>Text-only news/content card. Headline, optional body copy, and an inline action CTA with trailing chevron. No media. Designed for 3-up news grids on light surfaces. The card has no background of its own — place it on a light page or section background.</p>"},source:{language:"html",code:`<div class="c-text-card">
  <div class="tc-headline-body">
    <p class="tc-headline">Adobe apps are top choice for Sundance filmmakers.</p>
    <p class="tc-body">85% of Sundance Filmmakers Choose Adobe as Company Releases New AI Video Innovations and $10M in Creator Grants.</p>
  </div>
  <a class="tc-cta" href="#">
    <span class="tc-cta__label">Read story</span>
    <span class="tc-cta__icon" aria-hidden="true"><!-- chevron-right SVG --></span>
  </a>
</div>`}}},argTypes:{headline:{control:"text",description:"Card headline"},body:{control:"text",description:"Body copy (optional)"},ctaLabel:{control:"text",description:"CTA link label"},ctaHref:{control:"text",description:"CTA destination URL"},showBody:{control:"boolean",description:"Show body copy"},showCta:{control:"boolean",description:"Show action CTA"}},args:{...p[0]}},o={},r={name:"No CTA",args:{showCta:!1}},s={name:"No body",args:{showBody:!1}},n={name:"Headline only",args:{showBody:!1,showCta:!1}},t={name:"3-up grid",render:()=>a`
    <div style="
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 1200px;
      background: #f5f5f5;
      padding: 32px;
      border-radius: 16px;
    ">
      ${p.map(e=>a`
        <div style="background: #fff; border-radius: 16px;">
          ${l(e)}
        </div>
      `)}
    </div>
  `,parameters:{layout:"fullscreen"}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: "No CTA",
  args: {
    showCta: false
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "No body",
  args: {
    showBody: false
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "Headline only",
  args: {
    showBody: false,
    showCta: false
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "3-up grid",
  render: () => html\`
    <div style="
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 1200px;
      background: #f5f5f5;
      padding: 32px;
      border-radius: 16px;
    ">
      \${SAMPLE_CARDS.map(card => html\`
        <div style="background: #fff; border-radius: 16px;">
          \${TextCard(card)}
        </div>
      \`)}
    </div>
  \`,
  parameters: {
    layout: "fullscreen"
  }
}`,...t.parameters?.docs?.source}}};const S=["Default","NoCta","NoBody","HeadlineOnly","ThreeUp"];export{o as Default,n as HeadlineOnly,s as NoBody,r as NoCta,t as ThreeUp,S as __namedExportsOrder,A as default};
