import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";import{i,n as a,r as o}from"./app-icon-kJOUm1g_.js";import{t as s}from"./AppIcon-BgmWtDpL.js";var c;function l(){return(l=e((()=>{r(),i(),c=({app:e=`creative-cloud`,showIcon:r=!0,imageSrc:i,imageAlt:a=``,heading:s=``,body:c=``,onClick:l}={})=>{let u=!!i;return n`
    <div
      class="c-product-card"
      data-has-image=${u||t}
      role=${l?`button`:t}
      tabindex=${l?`0`:t}
      @click=${l??t}
      @keydown=${l?e=>(e.key===`Enter`||e.key===` `)&&l(e):t}
    >
      ${u?n`<img class="c-product-card__image" src=${i} alt=${a} loading="lazy" decoding="async" />`:t}
      ${u?n`<span class="c-product-card__scrim" aria-hidden="true"></span>`:t}
      ${r?n`<span class="c-product-card__icon" aria-hidden="true">${o({app:e,size:`sm`})}</span>`:t}
      <div class="c-product-card__text">
        ${s?n`<p class="c-product-card__heading">${s}</p>`:t}
        ${c?n`<p class="c-product-card__body">${c}</p>`:t}
      </div>
    </div>
  `}})))()}function u(){return(u=e((()=>{l()})))()}var d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{r(),u(),s(),d=a.map(e=>e.slug),f=`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=976&q=80`,p=`https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=976&q=80`,m=`https://images.unsplash.com/photo-1561736778-92e52a7769ef?auto=format&fit=crop&w=976&q=80`,h=e=>n`
  <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:inline-flex;align-items:flex-start;justify-content:flex-start;">
    <div style="width:488px;">
      ${e}
    </div>
  </div>
`,g={title:`Cards/ProductCard`,tags:[`autodocs`],render:e=>h(c(e)),parameters:{layout:`centered`,backgrounds:{default:`dark`,values:[{name:`dark`,value:`#1a1a1a`}]},docs:{description:{component:`
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
        `}}},argTypes:{app:{control:{type:`select`},options:d,description:`Adobe app icon slug`},showIcon:{control:`boolean`,description:`Show / hide the app icon`},imageSrc:{control:`text`,description:`Hover background image URL (optional)`},imageAlt:{control:`text`,description:`Alt text for hover image`},heading:{control:`text`,description:`Card heading`},body:{control:`text`,description:`Supporting copy`}},args:{app:`creative-cloud`,showIcon:!0,imageSrc:``,imageAlt:``,heading:`Creative Cloud`,body:`All your creative tools in one place.`}},_={},v={name:`Hover — with image`,args:{imageSrc:f,imageAlt:`Abstract colorful design`,heading:`Creative Cloud`,body:`All your creative tools in one place.`}},y={name:`No icon`,args:{showIcon:!1}},b={name:`Long copy`,args:{heading:`Adobe Experience Cloud`,body:`Deliver exceptional customer experiences at every touchpoint with AI-powered tools.`}},x={name:`All apps — 3-up grid`,render:()=>n`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:grid;grid-template-columns:repeat(3,488px);gap:16px;">
      ${[{app:`creative-cloud`,heading:`Creative Cloud`,body:`All your creative apps.`,imageSrc:f},{app:`photoshop`,heading:`Photoshop`,body:`Professional image editing.`,imageSrc:p},{app:`premiere-pro`,heading:`Premiere Pro`,body:`Powerful video editing, everywhere.`,imageSrc:m}].map(e=>c(e))}
    </div>
  `},S={name:`Ghost tiles — no image`,render:()=>n`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:grid;grid-template-columns:repeat(3,488px);gap:16px;">
      ${[{app:`creative-cloud`,heading:`Creative Cloud`,body:`All your creative apps.`},{app:`experience-cloud`,heading:`Experience Cloud`,body:`Customer experience tools.`},{app:`document-cloud`,heading:`Document Cloud`,body:`PDF and e-sign solutions.`}].map(e=>c(e))}
    </div>
  `},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Hover — with image',
  args: {
    imageSrc: IMG_1,
    imageAlt: 'Abstract colorful design',
    heading: 'Creative Cloud',
    body: 'All your creative tools in one place.'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'No icon',
  args: {
    showIcon: false
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Long copy',
  args: {
    heading: 'Adobe Experience Cloud',
    body: 'Deliver exceptional customer experiences at every touchpoint with AI-powered tools.'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C=[`Default`,`WithImage`,`NoIcon`,`LongCopy`,`AllApps`,`GhostGrid`]})))()}w();export{x as AllApps,_ as Default,S as GhostGrid,b as LongCopy,y as NoIcon,v as WithImage,C as __namedExportsOrder,g as default};