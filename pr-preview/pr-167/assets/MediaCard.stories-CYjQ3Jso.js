import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";import{i,r as a}from"./app-icon-kJOUm1g_.js";import{r as o,t as s}from"./unsafe-html-K3HXmifv.js";import{n as c,t as l}from"./arrow-right-CbD2Dsf5.js";var u,d,f,p;function m(){return(m=e((()=>{r(),s(),i(),c(),u=new Set([`card`,`feature`]),d=(e,t,n)=>t.has(e)?e:n,f=()=>n`<span class="c-media-card__cta-arrow" aria-hidden="true">${o(l)}</span>`,p=({size:e=`card`,app:r=`experience-cloud`,showIcon:i=!0,mediaSrc:o,mediaAlt:s=``,mediaTemplate:c,title:l=``,body:p=``,ctaLabel:m=``,ctaHref:h,onClick:g}={})=>{let _=d(e,u,`card`),v=c??(o?n`<img class="c-media-card__media-img" src=${o} alt=${s} loading="lazy" decoding="async" />`:n`<span class="c-media-card__media-placeholder" aria-hidden="true"></span>`),y=m?h?n`<a class="c-media-card__cta" href=${h}><span class="c-media-card__cta-label">${m}</span>${f()}</a>`:n`<button class="c-media-card__cta" type="button" @click=${g??t}><span class="c-media-card__cta-label">${m}</span>${f()}</button>`:t;return n`
    <div class="c-media-card" data-size=${_}>
      <div class="c-media-card__media">
        ${v}
        ${i?n`<span class="c-media-card__icon" aria-hidden="true">${a({app:r,size:`md`})}</span>`:t}
      </div>
      <div class="c-media-card__copy">
        <div class="c-media-card__headline-body">
          ${l?n`<p class="c-media-card__title">${l}</p>`:t}
          ${p?n`<p class="c-media-card__body">${p}</p>`:t}
        </div>
        ${y}
      </div>
    </div>
  `}})))()}function h(){return(h=e((()=>{m()})))()}function g(){return(g=e((()=>{h()})))()}var _,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{r(),g(),_=`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1480&q=80`,v=`https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=488&q=80`,y=`https://images.unsplash.com/photo-1601342630314-8427c38bf5e6?auto=format&fit=crop&w=488&q=80`,b=`https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=488&q=80`,x={title:`Cards/MediaCard`,tags:[`autodocs`],render:e=>n`
    <div style="max-width: 488px; padding: 24px;">
      ${p(e)}
    </div>
  `,parameters:{layout:`fullscreen`,docs:{description:{component:`
Media-forward content card. Two sizes:
- **card** (default) — 488×366 aspect, column copy. Use in 3-up grids.
- **feature** — 1480×670 aspect, row copy (headline left, CTA right). Use as a full-width hero card above the grid.

Both variants use \`aspect-ratio\` so the media scales with the container. At ≤599px both switch to a fixed 245px media height and column copy.

**Figma:** [elastic-card-updates node 4068:719651](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=4068-719651)
        `},source:{language:`html`,code:`<!-- Card variant (4:3 aspect, column copy) -->
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
</div>`}}},argTypes:{size:{control:{type:`select`},options:[`card`,`feature`],description:`card: 4:3 aspect, column copy · feature: 16:7 aspect, row copy`},app:{control:`text`,description:`App slug for the icon badge`},showIcon:{control:`boolean`},mediaSrc:{control:`text`},mediaAlt:{control:`text`},title:{control:`text`},body:{control:`text`},ctaLabel:{control:`text`},ctaHref:{control:`text`}},args:{size:`card`,app:`acrobat`,showIcon:!0,mediaSrc:v,mediaAlt:``,title:`Work smarter than ever with documents.`,body:`Trusted PDF tools, now with AI for editing, insights, and content creation.`,ctaLabel:`Explore Acrobat`,ctaHref:`#`}},S={name:`Card (4:3)`,render:e=>n`
    <div style="max-width: 488px; padding: 24px;">
      ${p(e)}
    </div>
  `},C={name:`Feature (16:7)`,render:e=>n`
    <div style="max-width: 1480px; padding: 24px;">
      ${p(e)}
    </div>
  `,args:{size:`feature`,app:`firefly`,mediaSrc:_,title:`Upscale images instantly with AI.`,body:`Improve resolution, clarity, and sharpness while preserving detail—perfect for photos, designs, and creatives.`,ctaLabel:`Explore Firefly`,ctaHref:`#`}},w={name:`3-Up Grid (homepage pattern)`,render:()=>n`
    <div style="padding: 24px;">
      <div style="display: flex; gap: 8px; align-items: flex-start; width: 100%;">
        ${p({size:`card`,app:`acrobat`,mediaSrc:v,title:`Work smarter than ever with documents.`,body:`Trusted PDF tools, now with AI for editing, insights, and content creation.`,ctaLabel:`Explore Acrobat`,ctaHref:`#`})}
        ${p({size:`card`,app:`firefly`,mediaSrc:y,title:`Generate with top AI models in one place.`,body:`Access Gemini, GPT Image, Runway, FLUX, Luma AI, and more.`,ctaLabel:`Explore Firefly`,ctaHref:`#`})}
        ${p({size:`card`,app:`photoshop`,mediaSrc:b,title:`Blend images seamlessly with Harmonize.`,body:`Combine people and objects into any background instantly.`,ctaLabel:`Explore Photoshop`,ctaHref:`#`})}
      </div>
    </div>
  `},T={name:`Full Section (homepage)`,parameters:{layout:`fullscreen`},render:()=>n`
    <div style="
      display: flex;
      flex-direction: column;
      gap: 64px;
      padding: 80px 120px;
      background: #fff;
      width: 100%;
      box-sizing: border-box;
    ">
      ${p({size:`feature`,app:`firefly`,mediaSrc:_,title:`Upscale images instantly with AI.`,body:`Improve resolution, clarity, and sharpness while preserving detail—perfect for photos, designs, and creatives.`,ctaLabel:`Explore Premiere`,ctaHref:`#`})}
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        ${p({size:`card`,app:`acrobat`,mediaSrc:v,title:`Work smarter than ever with documents.`,body:`Trusted PDF tools, now with AI for editing, insights, and content creation.`,ctaLabel:`Explore Acrobat`,ctaHref:`#`})}
        ${p({size:`card`,app:`firefly`,mediaSrc:y,title:`Generate with top AI models in one place.`,body:`Access Gemini, GPT Image, Runway, FLUX, Luma AI, and more.`,ctaLabel:`Explore Firefly`,ctaHref:`#`})}
        ${p({size:`card`,app:`photoshop`,mediaSrc:b,title:`Blend images seamlessly with Harmonize.`,body:`Combine people and objects into any background instantly.`,ctaLabel:`Explore Photoshop`,ctaHref:`#`})}
      </div>
    </div>
  `},E={name:`No Icon`,args:{showIcon:!1,mediaSrc:b,title:`Blend images seamlessly with Harmonize.`,body:`Combine people and objects into any background instantly.`,ctaLabel:`Explore Photoshop`,ctaHref:`#`},render:e=>n`
    <div style="max-width: 488px; padding: 24px;">
      ${p(e)}
    </div>
  `},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: "Card (4:3)",
  render: args => html\`
    <div style="max-width: 488px; padding: 24px;">
      \${MediaCard(args)}
    </div>
  \`
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D=[`Card`,`Feature`,`ThreeUpGrid`,`FullSection`,`NoIcon`]})))()}O();export{S as Card,C as Feature,T as FullSection,E as NoIcon,w as ThreeUpGrid,D as __namedExportsOrder,x as default};