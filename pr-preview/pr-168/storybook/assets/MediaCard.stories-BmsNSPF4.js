import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{n as r,t as i}from"./media-card-DSkRbFsg.js";function a(){return(a=e((()=>{r()})))()}function o(){return(o=e((()=>{a()})))()}var s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{n(),o(),s=`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1480&q=80`,c=`https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=488&q=80`,l=`https://images.unsplash.com/photo-1601342630314-8427c38bf5e6?auto=format&fit=crop&w=488&q=80`,u=`https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=488&q=80`,d={title:`Cards/MediaCard`,tags:[`autodocs`],render:e=>t`
    <div style="max-width: 488px; padding: var(--s2a-spacing-lg);">
      ${i(e)}
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
      <span class="c-app-icon" data-size="24">…</span>
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
</div>`}}},argTypes:{size:{control:{type:`select`},options:[`card`,`feature`],description:`card: 4:3 aspect, column copy · feature: 16:7 aspect, row copy`},app:{control:`text`,description:`App slug for the icon badge`},showIcon:{control:`boolean`},mediaSrc:{control:`text`},mediaAlt:{control:`text`},title:{control:`text`},body:{control:`text`},ctaLabel:{control:`text`},ctaHref:{control:`text`}},args:{size:`card`,app:`acrobat`,showIcon:!0,mediaSrc:c,mediaAlt:``,title:`Work smarter than ever with documents.`,body:`Trusted PDF tools, now with AI for editing, insights, and content creation.`,ctaLabel:`Explore Acrobat`,ctaHref:`#`}},f={name:`Card (4:3)`,render:e=>t`
    <div style="max-width: 488px; padding: var(--s2a-spacing-lg);">
      ${i(e)}
    </div>
  `},p={name:`Feature (16:7)`,render:e=>t`
    <div style="max-width: 1480px; padding: var(--s2a-spacing-lg);">
      ${i(e)}
    </div>
  `,args:{size:`feature`,app:`firefly`,mediaSrc:s,title:`Upscale images instantly with AI.`,body:`Improve resolution, clarity, and sharpness while preserving detail—perfect for photos, designs, and creatives.`,ctaLabel:`Explore Firefly`,ctaHref:`#`}},m={name:`3-Up Grid (homepage pattern)`,render:()=>t`
    <div style="padding: var(--s2a-spacing-lg);">
      <div style="display: flex; gap: var(--s2a-spacing-xs); align-items: flex-start; width: 100%;">
        ${i({size:`card`,app:`acrobat`,mediaSrc:c,title:`Work smarter than ever with documents.`,body:`Trusted PDF tools, now with AI for editing, insights, and content creation.`,ctaLabel:`Explore Acrobat`,ctaHref:`#`})}
        ${i({size:`card`,app:`firefly`,mediaSrc:l,title:`Generate with top AI models in one place.`,body:`Access Gemini, GPT Image, Runway, FLUX, Luma AI, and more.`,ctaLabel:`Explore Firefly`,ctaHref:`#`})}
        ${i({size:`card`,app:`photoshop`,mediaSrc:u,title:`Blend images seamlessly with Harmonize.`,body:`Combine people and objects into any background instantly.`,ctaLabel:`Explore Photoshop`,ctaHref:`#`})}
      </div>
    </div>
  `},h={name:`Full Section (homepage)`,parameters:{layout:`fullscreen`},render:()=>t`
    <div style="
      display: flex;
      flex-direction: column;
      gap: var(--s2a-spacing-4xl);
      padding: var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);
      background: var(--s2a-color-surface-default);
      width: 100%;
      box-sizing: border-box;
    ">
      ${i({size:`feature`,app:`firefly`,mediaSrc:s,title:`Upscale images instantly with AI.`,body:`Improve resolution, clarity, and sharpness while preserving detail—perfect for photos, designs, and creatives.`,ctaLabel:`Explore Premiere`,ctaHref:`#`})}
      <div style="display: flex; gap: var(--s2a-spacing-xs); align-items: flex-start;">
        ${i({size:`card`,app:`acrobat`,mediaSrc:c,title:`Work smarter than ever with documents.`,body:`Trusted PDF tools, now with AI for editing, insights, and content creation.`,ctaLabel:`Explore Acrobat`,ctaHref:`#`})}
        ${i({size:`card`,app:`firefly`,mediaSrc:l,title:`Generate with top AI models in one place.`,body:`Access Gemini, GPT Image, Runway, FLUX, Luma AI, and more.`,ctaLabel:`Explore Firefly`,ctaHref:`#`})}
        ${i({size:`card`,app:`photoshop`,mediaSrc:u,title:`Blend images seamlessly with Harmonize.`,body:`Combine people and objects into any background instantly.`,ctaLabel:`Explore Photoshop`,ctaHref:`#`})}
      </div>
    </div>
  `},g={name:`No Icon`,args:{showIcon:!1,mediaSrc:u,title:`Blend images seamlessly with Harmonize.`,body:`Combine people and objects into any background instantly.`,ctaLabel:`Explore Photoshop`,ctaHref:`#`},render:e=>t`
    <div style="max-width: 488px; padding: var(--s2a-spacing-lg);">
      ${i(e)}
    </div>
  `},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "Card (4:3)",
  render: args => html\`
    <div style="max-width: 488px; padding: var(--s2a-spacing-lg);">
      \${MediaCard(args)}
    </div>
  \`
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "Feature (16:7)",
  render: args => html\`
    <div style="max-width: 1480px; padding: var(--s2a-spacing-lg);">
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "3-Up Grid (homepage pattern)",
  render: () => html\`
    <div style="padding: var(--s2a-spacing-lg);">
      <div style="display: flex; gap: var(--s2a-spacing-xs); align-items: flex-start; width: 100%;">
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "Full Section (homepage)",
  parameters: {
    layout: "fullscreen"
  },
  render: () => html\`
    <div style="
      display: flex;
      flex-direction: column;
      gap: var(--s2a-spacing-4xl);
      padding: var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);
      background: var(--s2a-color-surface-default);
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
      <div style="display: flex; gap: var(--s2a-spacing-xs); align-items: flex-start;">
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
    <div style="max-width: 488px; padding: var(--s2a-spacing-lg);">
      \${MediaCard(args)}
    </div>
  \`
}`,...g.parameters?.docs?.source}}},_=[`Card`,`Feature`,`ThreeUpGrid`,`FullSection`,`NoIcon`]})))()}v();export{f as Card,p as Feature,h as FullSection,g as NoIcon,m as ThreeUpGrid,_ as __namedExportsOrder,d as default};