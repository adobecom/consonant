import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";import{a as r,c as i,i as a,n as o,o as s,r as c,s as l,t as u}from"./slide-3-58BvGRVr.js";function d(){return(d=e((()=>{i()})))()}var f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{n(),d(),r(),c(),u(),f=[{quote:`"If it wasn't for Creative Cloud, I don't think I'd be here. I feel like I can create anything."`,attributionName:`Michelle Phan`,attributionRole:`Creator`,ctaLabel:`Learn more`,ctaHref:`#`,imageSrc:s},{quote:`"Adobe tools have transformed the way I tell stories. There's no limit to what I can imagine."`,attributionName:`Jordan Lee`,attributionRole:`Filmmaker`,ctaLabel:`Watch now`,ctaHref:`#`,imageSrc:a},{quote:`"From concept to final cut, Creative Cloud keeps everything connected. It's how I work every single day."`,attributionName:`Priya Nair`,attributionRole:`Motion Designer`,ctaLabel:`Explore`,ctaHref:`#`,imageSrc:o}],p={title:`Cards/QuoteCard`,tags:[`autodocs`],render:e=>l(e),parameters:{layout:`fullscreen`,docs:{description:{component:`<p>Full-bleed quote card for social proof carousels. Desktop 1480x824 — landscape carousel slide. Mobile 375x620 — portrait / narrow contexts. Swap the <code>imageSrc</code> prop to use a different background. Toggle <code>showCta</code> / <code>showAttribution</code> to hide optional slots.</p>`},source:{language:`html`,code:`<div class="c-quote-card">
  <div class="qc-media" aria-hidden="true">
    <img class="qc-media__img" src="photo.jpg" alt="" loading="eager" decoding="async" />
    <div class="qc-media__overlay"></div>
  </div>
  <div class="qc-content">
    <div class="qc-quote">
      <p class="qc-quote__text">"If it wasn't for Creative Cloud, I don't think I'd be here."</p>
    </div>
    <div class="qc-attribution">
      <span class="qc-attribution__name">Michelle Phan</span>
      <span class="qc-attribution__role">Creator</span>
    </div>
    <div class="qc-actions">
      <a class="c-button" data-style="knockout" data-size="md" href="#">Learn more</a>
    </div>
  </div>
</div>`}}},argTypes:{quote:{control:`text`,description:`Quote text including quotation marks`},attributionName:{control:`text`,description:`Name of the person being quoted`},attributionRole:{control:`text`,description:`Role or title of the person`},ctaLabel:{control:`text`,description:`CTA button label`},ctaHref:{control:`text`,description:`CTA destination URL`},showAttribution:{control:`boolean`,description:`Show attribution block`},showCta:{control:`boolean`,description:`Show CTA button`},imageSrc:{control:`text`,description:`Background image URL`},imageAlt:{control:`text`,description:`Alt text for background image (decorative — leave empty for pure presentation)`}},args:{...f[0]}},m={},h={name:`Mobile (375px)`,render:e=>t`
    <div style="width: 375px; margin: 0 auto;">
      ${l(e)}
    </div>
  `,parameters:{viewport:{defaultViewport:`mobile1`}}},g={args:{showAttribution:!1}},_={args:{showCta:!1}},v={args:{showAttribution:!1,showCta:!1}},y={args:{imageSrc:``}},b={name:`All three slides`,render:()=>t`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      ${f.map(e=>l(e))}
    </div>
  `},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "Mobile (375px)",
  render: args => html\`
    <div style="width: 375px; margin: 0 auto;">
      \${QuoteCard(args)}
    </div>
  \`,
  parameters: {
    viewport: {
      defaultViewport: "mobile1"
    }
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    showAttribution: false
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    showCta: false
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    showAttribution: false,
    showCta: false
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    imageSrc: ""
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: "All three slides",
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      \${SAMPLE_SLIDES.map(slide => QuoteCard(slide))}
    </div>
  \`
}`,...b.parameters?.docs?.source}}},x=[`Default`,`Mobile`,`NoAttribution`,`NoCta`,`ContentOnly`,`NoImage`,`AllThree`]})))()}S();export{b as AllThree,v as ContentOnly,m as Default,h as Mobile,g as NoAttribution,_ as NoCta,y as NoImage,x as __namedExportsOrder,p as default};