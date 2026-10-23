import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{n as r,t as i}from"./text-card-BRyUmLWH.js";function a(){return(a=e((()=>{r()})))()}var o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{n(),a(),o=[{headline:`Adobe apps are top choice for Sundance filmmakers.`,body:`85% of Sundance Filmmakers Choose Adobe as Company Releases New AI Video Innovations and $10M in Creator Grants.`,ctaLabel:`Read story`,ctaHref:`#`},{headline:`Adobe MAX 2025: Everything announced in one place.`,body:`New generative AI tools, Firefly updates, and a completely redesigned Premiere Pro headline this year's creative conference.`,ctaLabel:`See highlights`,ctaHref:`#`},{headline:`Creative Cloud now includes 2TB of cloud storage.`,body:`All Creative Cloud plans include doubled cloud storage, plus new collaboration features for teams working across time zones.`,ctaLabel:`Learn more`,ctaHref:`#`}],s={title:`Cards/TextCard`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`padded`,docs:{description:{component:`<p>Text-only news/content card. Headline, optional body copy, and an inline action CTA with trailing chevron. No media. Designed for 3-up news grids on light surfaces. The card has no background of its own — place it on a light page or section background.</p>`},source:{language:`html`,code:`<div class="c-text-card">
  <div class="tc-headline-body">
    <p class="tc-headline">Adobe apps are top choice for Sundance filmmakers.</p>
    <p class="tc-body">85% of Sundance Filmmakers Choose Adobe as Company Releases New AI Video Innovations and $10M in Creator Grants.</p>
  </div>
  <a class="tc-cta" href="#">
    <span class="tc-cta__label">Read story</span>
    <span class="tc-cta__icon" aria-hidden="true"><!-- chevron-right SVG --></span>
  </a>
</div>`}}},argTypes:{headline:{control:`text`,description:`Card headline`},body:{control:`text`,description:`Body copy (optional)`},ctaLabel:{control:`text`,description:`CTA link label`},ctaHref:{control:`text`,description:`CTA destination URL`},showBody:{control:`boolean`,description:`Show body copy`},showCta:{control:`boolean`,description:`Show action CTA`}},args:{...o[0]}},c={},l={name:`No CTA`,args:{showCta:!1}},u={name:`No body`,args:{showBody:!1}},d={name:`Headline only`,args:{showBody:!1,showCta:!1}},f={name:`3-up grid`,render:()=>t`
    <div style="
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--s2a-spacing-lg);
      max-width: 1200px;
      background: var(--s2a-color-surface-subtle);
      padding: var(--s2a-spacing-xl);
      border-radius: var(--s2a-border-radius-md);
    ">
      ${o.map(e=>t`
        <div style="background: var(--s2a-color-surface-default); border-radius: var(--s2a-border-radius-md);">
          ${i(e)}
        </div>
      `)}
    </div>
  `,parameters:{layout:`fullscreen`}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "No CTA",
  args: {
    showCta: false
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "No body",
  args: {
    showBody: false
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "Headline only",
  args: {
    showBody: false,
    showCta: false
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "3-up grid",
  render: () => html\`
    <div style="
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--s2a-spacing-lg);
      max-width: 1200px;
      background: var(--s2a-color-surface-subtle);
      padding: var(--s2a-spacing-xl);
      border-radius: var(--s2a-border-radius-md);
    ">
      \${SAMPLE_CARDS.map(card => html\`
        <div style="background: var(--s2a-color-surface-default); border-radius: var(--s2a-border-radius-md);">
          \${TextCard(card)}
        </div>
      \`)}
    </div>
  \`,
  parameters: {
    layout: "fullscreen"
  }
}`,...f.parameters?.docs?.source}}},p=[`Default`,`NoCta`,`NoBody`,`HeadlineOnly`,`ThreeUp`]})))()}m();export{c as Default,d as HeadlineOnly,u as NoBody,l as NoCta,f as ThreeUp,p as __namedExportsOrder,s as default};