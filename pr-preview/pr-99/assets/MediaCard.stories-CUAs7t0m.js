import{x as e,E as r}from"./iframe-DZgISn7u.js";import{o as z}from"./unsafe-html-C-AlLM3e.js";import{A as S}from"./app-icon-Big8W178.js";import{a as G}from"./arrow-right-Do-kvyXB.js";import"./preload-helper-Bxbgpdb-.js";import"./directive-DoeGSK_T.js";const L=new Set(["card","feature"]),M=(a,c,l)=>c.has(a)?a:l,b=()=>e`<span class="c-media-card__cta-arrow" aria-hidden="true">${z(G)}</span>`,t=({size:a="card",app:c="experience-cloud",showIcon:l=!0,mediaSrc:f,mediaAlt:v="",mediaTemplate:w,title:g="",body:u="",ctaLabel:p="",ctaHref:y,onClick:I}={})=>{const A=M(a,L,"card"),C=w??(f?e`<img class="c-media-card__media-img" src=${f} alt=${v} loading="lazy" decoding="async" />`:e`<span class="c-media-card__media-placeholder" aria-hidden="true"></span>`),$=!!p?y?e`<a class="c-media-card__cta" href=${y}><span class="c-media-card__cta-label">${p}</span>${b()}</a>`:e`<button class="c-media-card__cta" type="button" @click=${I??r}><span class="c-media-card__cta-label">${p}</span>${b()}</button>`:r;return e`
    <div class="c-media-card" data-size=${A}>
      <div class="c-media-card__media">
        ${C}
        ${l?e`<span class="c-media-card__icon" aria-hidden="true">${S({app:c,size:"md"})}</span>`:r}
      </div>
      <div class="c-media-card__copy">
        <div class="c-media-card__headline-body">
          ${g?e`<p class="c-media-card__title">${g}</p>`:r}
          ${u?e`<p class="c-media-card__body">${u}</p>`:r}
        </div>
        ${$}
      </div>
    </div>
  `},_="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1480&q=80",m="https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=488&q=80",x="https://images.unsplash.com/photo-1601342630314-8427c38bf5e6?auto=format&fit=crop&w=488&q=80",h="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=488&q=80",R={title:"Molecules/MediaCard",tags:["autodocs"],render:a=>e`
    <div style="max-width: 488px; padding: 24px;">
      ${t(a)}
    </div>
  `,parameters:{layout:"fullscreen",docs:{description:{component:`
Media-forward content card. Two sizes:
- **card** (default) — 488×366 aspect, column copy. Use in 3-up grids.
- **feature** — 1480×670 aspect, row copy (headline left, CTA right). Use as a full-width hero card above the grid.

Both variants use \`aspect-ratio\` so the media scales with the container. At ≤599px both switch to a fixed 245px media height and column copy.

**Figma:** [elastic-card-updates node 4068:719651](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=4068-719651)
        `},source:{language:"html",code:`<!-- Card variant (4:3 aspect, column copy) -->
<div class="c-media-card" data-size="card">
  <div class="c-media-card__media">
    <img class="c-media-card__media-img" src="…" alt="…" loading="lazy" />
    <span class="c-media-card__icon" aria-hidden="true">
      <span class="c-app-icon" data-size="md">…</span>
    </span>
  </div>
  <div class="c-media-card__copy">
    <div class="c-media-card__headline-body">
      <p class="c-media-card__title">Stunning content made easy</p>
      <p class="c-media-card__body">Quickly create and edit images, video, and audio with creative AI.</p>
    </div>
    <a class="c-media-card__cta" href="/destination">
      <span class="c-media-card__cta-label">Learn more</span>
    </a>
  </div>
</div>

<!-- Feature variant (16:7 aspect, row copy) -->
<div class="c-media-card" data-size="feature">
  <div class="c-media-card__media">…</div>
  <div class="c-media-card__copy">
    <div class="c-media-card__headline-body">
      <p class="c-media-card__title">Feature card heading</p>
      <p class="c-media-card__body">Supporting copy sits left; CTA anchors right.</p>
    </div>
    <a class="c-media-card__cta" href="/destination">
      <span class="c-media-card__cta-label">Learn more</span>
    </a>
  </div>
</div>`}}},argTypes:{size:{control:{type:"select"},options:["card","feature"],description:"card: 4:3 aspect, column copy · feature: 16:7 aspect, row copy"},app:{control:"text",description:"App slug for the icon badge"},showIcon:{control:"boolean"},mediaSrc:{control:"text"},mediaAlt:{control:"text"},title:{control:"text"},body:{control:"text"},ctaLabel:{control:"text"},ctaHref:{control:"text"}},args:{size:"card",app:"acrobat",showIcon:!0,mediaSrc:m,mediaAlt:"",title:"Work smarter than ever with documents.",body:"Trusted PDF tools, now with AI for editing, insights, and content creation.",ctaLabel:"Explore Acrobat",ctaHref:"#"}},i={name:"Card (4:3)",render:a=>e`
    <div style="max-width: 488px; padding: 24px;">
      ${t(a)}
    </div>
  `},n={name:"Feature (16:7)",render:a=>e`
    <div style="max-width: 1480px; padding: 24px;">
      ${t(a)}
    </div>
  `,args:{size:"feature",app:"firefly",mediaSrc:_,title:"Upscale images instantly with AI.",body:"Improve resolution, clarity, and sharpness while preserving detail—perfect for photos, designs, and creatives.",ctaLabel:"Explore Firefly",ctaHref:"#"}},s={name:"3-Up Grid (homepage pattern)",render:()=>e`
    <div style="padding: 24px;">
      <div style="display: flex; gap: 8px; align-items: flex-start; width: 100%;">
        ${t({size:"card",app:"acrobat",mediaSrc:m,title:"Work smarter than ever with documents.",body:"Trusted PDF tools, now with AI for editing, insights, and content creation.",ctaLabel:"Explore Acrobat",ctaHref:"#"})}
        ${t({size:"card",app:"firefly",mediaSrc:x,title:"Generate with top AI models in one place.",body:"Access Gemini, GPT Image, Runway, FLUX, Luma AI, and more.",ctaLabel:"Explore Firefly",ctaHref:"#"})}
        ${t({size:"card",app:"photoshop",mediaSrc:h,title:"Blend images seamlessly with Harmonize.",body:"Combine people and objects into any background instantly.",ctaLabel:"Explore Photoshop",ctaHref:"#"})}
      </div>
    </div>
  `},o={name:"Full Section (homepage)",parameters:{layout:"fullscreen"},render:()=>e`
    <div style="
      display: flex;
      flex-direction: column;
      gap: 64px;
      padding: 80px 120px;
      background: #fff;
      width: 100%;
      box-sizing: border-box;
    ">
      ${t({size:"feature",app:"firefly",mediaSrc:_,title:"Upscale images instantly with AI.",body:"Improve resolution, clarity, and sharpness while preserving detail—perfect for photos, designs, and creatives.",ctaLabel:"Explore Premiere",ctaHref:"#"})}
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        ${t({size:"card",app:"acrobat",mediaSrc:m,title:"Work smarter than ever with documents.",body:"Trusted PDF tools, now with AI for editing, insights, and content creation.",ctaLabel:"Explore Acrobat",ctaHref:"#"})}
        ${t({size:"card",app:"firefly",mediaSrc:x,title:"Generate with top AI models in one place.",body:"Access Gemini, GPT Image, Runway, FLUX, Luma AI, and more.",ctaLabel:"Explore Firefly",ctaHref:"#"})}
        ${t({size:"card",app:"photoshop",mediaSrc:h,title:"Blend images seamlessly with Harmonize.",body:"Combine people and objects into any background instantly.",ctaLabel:"Explore Photoshop",ctaHref:"#"})}
      </div>
    </div>
  `},d={name:"No Icon",args:{showIcon:!1,mediaSrc:h,title:"Blend images seamlessly with Harmonize.",body:"Combine people and objects into any background instantly.",ctaLabel:"Explore Photoshop",ctaHref:"#"},render:a=>e`
    <div style="max-width: 488px; padding: 24px;">
      ${t(a)}
    </div>
  `};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "Card (4:3)",
  render: args => html\`
    <div style="max-width: 488px; padding: 24px;">
      \${MediaCard(args)}
    </div>
  \`
}`,...i.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "Feature (16:7)",
  render: args => html\`
    <div style="max-width: 1480px; padding: 24px;">
      \${MediaCard(args)}
    </div>
  \`,
  args: {
    size: "feature",
    app: "firefly",
    mediaSrc: IMG_WIDE,
    title: "Upscale images instantly with AI.",
    body: "Improve resolution, clarity, and sharpness while preserving detail—perfect for photos, designs, and creatives.",
    ctaLabel: "Explore Firefly",
    ctaHref: "#"
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "3-Up Grid (homepage pattern)",
  render: () => html\`
    <div style="padding: 24px;">
      <div style="display: flex; gap: 8px; align-items: flex-start; width: 100%;">
        \${MediaCard({
    size: "card",
    app: "acrobat",
    mediaSrc: IMG_CARD_1,
    title: "Work smarter than ever with documents.",
    body: "Trusted PDF tools, now with AI for editing, insights, and content creation.",
    ctaLabel: "Explore Acrobat",
    ctaHref: "#"
  })}
        \${MediaCard({
    size: "card",
    app: "firefly",
    mediaSrc: IMG_CARD_2,
    title: "Generate with top AI models in one place.",
    body: "Access Gemini, GPT Image, Runway, FLUX, Luma AI, and more.",
    ctaLabel: "Explore Firefly",
    ctaHref: "#"
  })}
        \${MediaCard({
    size: "card",
    app: "photoshop",
    mediaSrc: IMG_CARD_3,
    title: "Blend images seamlessly with Harmonize.",
    body: "Combine people and objects into any background instantly.",
    ctaLabel: "Explore Photoshop",
    ctaHref: "#"
  })}
      </div>
    </div>
  \`
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Full Section (homepage)",
  parameters: {
    layout: "fullscreen"
  },
  render: () => html\`
    <div style="
      display: flex;
      flex-direction: column;
      gap: 64px;
      padding: 80px 120px;
      background: #fff;
      width: 100%;
      box-sizing: border-box;
    ">
      \${MediaCard({
    size: "feature",
    app: "firefly",
    mediaSrc: IMG_WIDE,
    title: "Upscale images instantly with AI.",
    body: "Improve resolution, clarity, and sharpness while preserving detail—perfect for photos, designs, and creatives.",
    ctaLabel: "Explore Premiere",
    ctaHref: "#"
  })}
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        \${MediaCard({
    size: "card",
    app: "acrobat",
    mediaSrc: IMG_CARD_1,
    title: "Work smarter than ever with documents.",
    body: "Trusted PDF tools, now with AI for editing, insights, and content creation.",
    ctaLabel: "Explore Acrobat",
    ctaHref: "#"
  })}
        \${MediaCard({
    size: "card",
    app: "firefly",
    mediaSrc: IMG_CARD_2,
    title: "Generate with top AI models in one place.",
    body: "Access Gemini, GPT Image, Runway, FLUX, Luma AI, and more.",
    ctaLabel: "Explore Firefly",
    ctaHref: "#"
  })}
        \${MediaCard({
    size: "card",
    app: "photoshop",
    mediaSrc: IMG_CARD_3,
    title: "Blend images seamlessly with Harmonize.",
    body: "Combine people and objects into any background instantly.",
    ctaLabel: "Explore Photoshop",
    ctaHref: "#"
  })}
      </div>
    </div>
  \`
}`,...o.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "No Icon",
  args: {
    showIcon: false,
    mediaSrc: IMG_CARD_3,
    title: "Blend images seamlessly with Harmonize.",
    body: "Combine people and objects into any background instantly.",
    ctaLabel: "Explore Photoshop",
    ctaHref: "#"
  },
  render: args => html\`
    <div style="max-width: 488px; padding: 24px;">
      \${MediaCard(args)}
    </div>
  \`
}`,...d.parameters?.docs?.source}}};const U=["Card","Feature","ThreeUpGrid","FullSection","NoIcon"];export{i as Card,n as Feature,o as FullSection,d as NoIcon,s as ThreeUpGrid,U as __namedExportsOrder,R as default};
