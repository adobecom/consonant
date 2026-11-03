import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";import{r as i,t as a}from"./unsafe-html-K3HXmifv.js";import{n as o,t as s}from"./chevron-right-C2fDtaFH.js";var c,l;function u(){return(u=e((()=>{r(),a(),o(),c=()=>i(s),l=({headline:e=``,body:r=``,ctaLabel:i=`Read story`,ctaHref:a=`#`,showBody:o=!0,showCta:s=!0}={})=>n`
  <div class="c-text-card">
    <div class="tc-headline-body">
      <p class="tc-headline">${e}</p>
      ${o&&r?n`<p class="tc-body">${r}</p>`:t}
    </div>
    ${s&&i?n`
          <a class="tc-cta" href=${a}>
            <span class="tc-cta__label">${i}</span>
            <span class="tc-cta__icon" aria-hidden="true">${c()}</span>
          </a>
        `:t}
  </div>
`})))()}function d(){return(d=e((()=>{u()})))()}var f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{r(),d(),f=[{headline:`Adobe apps are top choice for Sundance filmmakers.`,body:`85% of Sundance Filmmakers Choose Adobe as Company Releases New AI Video Innovations and $10M in Creator Grants.`,ctaLabel:`Read story`,ctaHref:`#`},{headline:`Adobe MAX 2025: Everything announced in one place.`,body:`New generative AI tools, Firefly updates, and a completely redesigned Premiere Pro headline this year's creative conference.`,ctaLabel:`See highlights`,ctaHref:`#`},{headline:`Creative Cloud now includes 2TB of cloud storage.`,body:`All Creative Cloud plans include doubled cloud storage, plus new collaboration features for teams working across time zones.`,ctaLabel:`Learn more`,ctaHref:`#`}],p={title:`Cards/TextCard`,tags:[`autodocs`],render:e=>l(e),parameters:{layout:`padded`,docs:{description:{component:`<p>Text-only news/content card. Headline, optional body copy, and an inline action CTA with trailing chevron. No media. Designed for 3-up news grids on light surfaces. The card has no background of its own — place it on a light page or section background.</p>`},source:{language:`html`,code:`<div class="c-text-card">
  <div class="tc-headline-body">
    <p class="tc-headline">Adobe apps are top choice for Sundance filmmakers.</p>
    <p class="tc-body">85% of Sundance Filmmakers Choose Adobe as Company Releases New AI Video Innovations and $10M in Creator Grants.</p>
  </div>
  <a class="tc-cta" href="#">
    <span class="tc-cta__label">Read story</span>
    <span class="tc-cta__icon" aria-hidden="true"><!-- chevron-right SVG --></span>
  </a>
</div>`}}},argTypes:{headline:{control:`text`,description:`Card headline`},body:{control:`text`,description:`Body copy (optional)`},ctaLabel:{control:`text`,description:`CTA link label`},ctaHref:{control:`text`,description:`CTA destination URL`},showBody:{control:`boolean`,description:`Show body copy`},showCta:{control:`boolean`,description:`Show action CTA`}},args:{...f[0]}},m={},h={name:`No CTA`,args:{showCta:!1}},g={name:`No body`,args:{showBody:!1}},_={name:`Headline only`,args:{showBody:!1,showCta:!1}},v={name:`3-up grid`,render:()=>n`
    <div style="
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 1200px;
      background: #f5f5f5;
      padding: 32px;
      border-radius: 16px;
    ">
      ${f.map(e=>n`
        <div style="background: #fff; border-radius: 16px;">
          ${l(e)}
        </div>
      `)}
    </div>
  `,parameters:{layout:`fullscreen`}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "No CTA",
  args: {
    showCta: false
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "No body",
  args: {
    showBody: false
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: "Headline only",
  args: {
    showBody: false,
    showCta: false
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y=[`Default`,`NoCta`,`NoBody`,`HeadlineOnly`,`ThreeUp`]})))()}b();export{m as Default,_ as HeadlineOnly,g as NoBody,h as NoCta,v as ThreeUp,y as __namedExportsOrder,p as default};