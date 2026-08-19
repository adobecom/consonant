import{E as a,x as o}from"./iframe-DxmRE__P.js";import{A as x,b as f}from"./app-icon-DbeS6ToX.js";import"./preload-helper-FNQQAYUb.js";const u=({app:e="creative-cloud",showIcon:b=!0,imageSrc:g,imageAlt:v="",heading:m="",body:h="",onClick:r}={})=>{const c=!!g;return o`
    <div
      class="c-product-card"
      data-has-image=${c||a}
      role=${r?"button":a}
      tabindex=${r?"0":a}
      @click=${r??a}
      @keydown=${r?l=>(l.key==="Enter"||l.key===" ")&&r(l):a}
    >
      ${c?o`<img class="c-product-card__image" src=${g} alt=${v} loading="lazy" decoding="async" />`:a}
      ${c?o`<span class="c-product-card__scrim" aria-hidden="true"></span>`:a}
      ${b?o`<span class="c-product-card__icon" aria-hidden="true">${x({app:e,size:"sm"})}</span>`:a}
      <div class="c-product-card__text">
        ${m?o`<p class="c-product-card__heading">${m}</p>`:a}
        ${h?o`<p class="c-product-card__body">${h}</p>`:a}
      </div>
    </div>
  `},w=f.map(e=>e.slug),y="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=976&q=80",A="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=976&q=80",C="https://images.unsplash.com/photo-1561736778-92e52a7769ef?auto=format&fit=crop&w=976&q=80",P=e=>o`
  <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:inline-flex;align-items:flex-start;justify-content:flex-start;">
    <div style="width:488px;">
      ${e}
    </div>
  </div>
`,$={title:"Molecules/ProductCard",tags:["autodocs"],render:e=>P(u(e)),parameters:{layout:"centered",backgrounds:{default:"dark",values:[{name:"dark",value:"#1a1a1a"}]},docs:{description:{component:`
Dark-surface product card. Fixed height (172px), fluid width. Two states:

- **Default** — ghost white/08 surface, app icon top-left, heading + body bottom-left.
- **Hover** — background image fades in with a gradient scrim, text/icon remain readable.

Provide \`imageSrc\` to enable the hover image reveal. Without it the card stays as a flat ghost tile.

**Props:**
- \`app\` — Adobe app icon slug
- \`showIcon\` — toggles the 32px app icon slot
- \`imageSrc\` — hover background image URL
- \`heading\` — card heading (heading-5, white)
- \`body\` — supporting copy (body-md, white/64)
- \`onClick\` — optional click handler; makes the card keyboard-accessible

**Figma:** [elastic-card-updates — Cards page](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=4053-701585)
        `}}},argTypes:{app:{control:{type:"select"},options:w,description:"Adobe app icon slug"},showIcon:{control:"boolean",description:"Show / hide the app icon"},imageSrc:{control:"text",description:"Hover background image URL (optional)"},imageAlt:{control:"text",description:"Alt text for hover image"},heading:{control:"text",description:"Card heading"},body:{control:"text",description:"Supporting copy"}},args:{app:"creative-cloud",showIcon:!0,imageSrc:"",imageAlt:"",heading:"Creative Cloud",body:"All your creative tools in one place."}},t={},i={name:"Hover — with image",args:{imageSrc:y,imageAlt:"Abstract colorful design",heading:"Creative Cloud",body:"All your creative tools in one place."}},n={name:"No icon",args:{showIcon:!1}},d={name:"Long copy",args:{heading:"Adobe Experience Cloud",body:"Deliver exceptional customer experiences at every touchpoint with AI-powered tools."}},s={name:"All apps — 3-up grid",render:()=>o`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:grid;grid-template-columns:repeat(3,488px);gap:16px;">
      ${[{app:"creative-cloud",heading:"Creative Cloud",body:"All your creative apps.",imageSrc:y},{app:"photoshop",heading:"Photoshop",body:"Professional image editing.",imageSrc:A},{app:"premiere-pro",heading:"Premiere Pro",body:"Powerful video editing, everywhere.",imageSrc:C}].map(e=>u(e))}
    </div>
  `},p={name:"Ghost tiles — no image",render:()=>o`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:grid;grid-template-columns:repeat(3,488px);gap:16px;">
      ${[{app:"creative-cloud",heading:"Creative Cloud",body:"All your creative apps."},{app:"experience-cloud",heading:"Experience Cloud",body:"Customer experience tools."},{app:"document-cloud",heading:"Document Cloud",body:"PDF and e-sign solutions."}].map(e=>u(e))}
    </div>
  `};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Hover — with image',
  args: {
    imageSrc: IMG_1,
    imageAlt: 'Abstract colorful design',
    heading: 'Creative Cloud',
    body: 'All your creative tools in one place.'
  }
}`,...i.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: 'No icon',
  args: {
    showIcon: false
  }
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Long copy',
  args: {
    heading: 'Adobe Experience Cloud',
    body: 'Deliver exceptional customer experiences at every touchpoint with AI-powered tools.'
  }
}`,...d.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'All apps — 3-up grid',
  render: () => html\`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:grid;grid-template-columns:repeat(3,488px);gap:16px;">
      \${[{
    app: 'creative-cloud',
    heading: 'Creative Cloud',
    body: 'All your creative apps.',
    imageSrc: IMG_1
  }, {
    app: 'photoshop',
    heading: 'Photoshop',
    body: 'Professional image editing.',
    imageSrc: IMG_2
  }, {
    app: 'premiere-pro',
    heading: 'Premiere Pro',
    body: 'Powerful video editing, everywhere.',
    imageSrc: IMG_3
  }].map(props => ProductCard(props))}
    </div>
  \`
}`,...s.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Ghost tiles — no image',
  render: () => html\`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:grid;grid-template-columns:repeat(3,488px);gap:16px;">
      \${[{
    app: 'creative-cloud',
    heading: 'Creative Cloud',
    body: 'All your creative apps.'
  }, {
    app: 'experience-cloud',
    heading: 'Experience Cloud',
    body: 'Customer experience tools.'
  }, {
    app: 'document-cloud',
    heading: 'Document Cloud',
    body: 'PDF and e-sign solutions.'
  }].map(props => ProductCard(props))}
    </div>
  \`
}`,...p.parameters?.docs?.source}}};const k=["Default","WithImage","NoIcon","LongCopy","AllApps","GhostGrid"];export{s as AllApps,t as Default,p as GhostGrid,d as LongCopy,n as NoIcon,i as WithImage,k as __namedExportsOrder,$ as default};
