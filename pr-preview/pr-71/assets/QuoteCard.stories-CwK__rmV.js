import{x as d}from"./iframe-Cs-hM5Vi.js";import{Q as c}from"./quote-card-BSy3-k2E.js";import"./preload-helper-Be0hcNGP.js";import"./button-khbSzUeu.js";import"./unsafe-html-B7b2yAPF.js";import"./chevron-down-Bqt06uWP.js";const n="https://www.figma.com/api/mcp/asset/3e068178-dbaf-423e-a9f6-cff0bf406f38",l=[{quote:"“If it wasn’t for Creative Cloud, I don’t think I’d be here. I feel like I can create anything.”",attributionName:"Michelle Phan",attributionRole:"Creator",ctaLabel:"Learn more",ctaHref:"#",imageSrc:n},{quote:"“Adobe tools have transformed the way I tell stories. There’s no limit to what I can imagine.”",attributionName:"Jordan Lee",attributionRole:"Filmmaker",ctaLabel:"Watch now",ctaHref:"#",imageSrc:n},{quote:"“From concept to final cut, Creative Cloud keeps everything connected. It’s how I work every single day.”",attributionName:"Priya Nair",attributionRole:"Motion Designer",ctaLabel:"Explore",ctaHref:"#",imageSrc:n}],b={title:"Organisms/QuoteCard",tags:["autodocs"],render:i=>c(i),parameters:{layout:"fullscreen",docs:{description:{component:"<p>Full-bleed quote card for social proof carousels. Desktop 1480×824 — landscape carousel slide. Mobile 375×620 — portrait / narrow contexts. Swap the <code>imageSrc</code> prop to use a different background. Toggle <code>showCta</code> / <code>showAttribution</code> to hide optional slots.</p>"},source:{language:"html",code:`<div class="c-quote-card">
  <div class="qc-media" aria-hidden="true">
    <img class="qc-media__img" src="photo.jpg" alt="" loading="lazy" decoding="async" />
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
</div>`}}},argTypes:{quote:{control:"text",description:"Quote text including quotation marks"},attributionName:{control:"text",description:"Name of the person being quoted"},attributionRole:{control:"text",description:"Role or title of the person"},ctaLabel:{control:"text",description:"CTA button label"},ctaHref:{control:"text",description:"CTA destination URL"},showAttribution:{control:"boolean",description:"Show attribution block"},showCta:{control:"boolean",description:"Show CTA button"},imageSrc:{control:"text",description:"Background image URL"},imageAlt:{control:"text",description:"Alt text for background image (decorative — leave empty for pure presentation)"}},args:{...l[0]}},e={},t={args:{showAttribution:!1}},o={args:{showCta:!1}},a={args:{showAttribution:!1,showCta:!1}},r={args:{imageSrc:""}},s={name:"All three slides",render:()=>d`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      ${l.map(i=>c(i))}
    </div>
  `};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    showAttribution: false
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    showCta: false
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    showAttribution: false,
    showCta: false
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    imageSrc: ""
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "All three slides",
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      \${SAMPLE_SLIDES.map(slide => QuoteCard(slide))}
    </div>
  \`
}`,...s.parameters?.docs?.source}}};const v=["Default","NoAttribution","NoCta","ContentOnly","NoImage","AllThree"];export{s as AllThree,a as ContentOnly,e as Default,t as NoAttribution,o as NoCta,r as NoImage,v as __namedExportsOrder,b as default};
