import{x as l}from"./iframe-BJqC41-z.js";import{s as p,a as m,b as u,Q as c}from"./slide-3-D1-VqQ3p.js";import"./preload-helper-Bwrcx2VV.js";import"./button-Cjq5L1h3.js";const d=[{quote:`"If it wasn't for Creative Cloud, I don't think I'd be here. I feel like I can create anything."`,attributionName:"Michelle Phan",attributionRole:"Creator",ctaLabel:"Learn more",ctaHref:"#",imageSrc:p},{quote:`"Adobe tools have transformed the way I tell stories. There's no limit to what I can imagine."`,attributionName:"Jordan Lee",attributionRole:"Filmmaker",ctaLabel:"Watch now",ctaHref:"#",imageSrc:m},{quote:`"From concept to final cut, Creative Cloud keeps everything connected. It's how I work every single day."`,attributionName:"Priya Nair",attributionRole:"Motion Designer",ctaLabel:"Explore",ctaHref:"#",imageSrc:u}],v={title:"Organisms/QuoteCard",tags:["autodocs"],render:e=>c(e),parameters:{layout:"fullscreen",docs:{description:{component:"<p>Full-bleed quote card for social proof carousels. Desktop 1480x824 — landscape carousel slide. Mobile 375x620 — portrait / narrow contexts. Swap the <code>imageSrc</code> prop to use a different background. Toggle <code>showCta</code> / <code>showAttribution</code> to hide optional slots.</p>"},source:{language:"html",code:`<div class="c-quote-card">
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
      <a class="c-button" data-background="solid" data-context="on-dark" data-size="md" href="#">Learn more</a>
    </div>
  </div>
</div>`}}},argTypes:{quote:{control:"text",description:"Quote text including quotation marks"},attributionName:{control:"text",description:"Name of the person being quoted"},attributionRole:{control:"text",description:"Role or title of the person"},ctaLabel:{control:"text",description:"CTA button label"},ctaHref:{control:"text",description:"CTA destination URL"},showAttribution:{control:"boolean",description:"Show attribution block"},showCta:{control:"boolean",description:"Show CTA button"},imageSrc:{control:"text",description:"Background image URL"},imageAlt:{control:"text",description:"Alt text for background image (decorative — leave empty for pure presentation)"}},args:{...d[0]}},t={},o={name:"Mobile (375px)",render:e=>l`
    <div style="width: 375px; margin: 0 auto;">
      ${c(e)}
    </div>
  `,parameters:{viewport:{defaultViewport:"mobile1"}}},a={args:{showAttribution:!1}},r={args:{showCta:!1}},s={args:{showAttribution:!1,showCta:!1}},i={args:{imageSrc:""}},n={name:"All three slides",render:()=>l`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      ${d.map(e=>c(e))}
    </div>
  `};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    showAttribution: false
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    showCta: false
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    showAttribution: false,
    showCta: false
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    imageSrc: ""
  }
}`,...i.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "All three slides",
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      \${SAMPLE_SLIDES.map(slide => QuoteCard(slide))}
    </div>
  \`
}`,...n.parameters?.docs?.source}}};const w=["Default","Mobile","NoAttribution","NoCta","ContentOnly","NoImage","AllThree"];export{n as AllThree,s as ContentOnly,t as Default,o as Mobile,a as NoAttribution,r as NoCta,i as NoImage,w as __namedExportsOrder,v as default};
