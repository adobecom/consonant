import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";import{i,r as a}from"./app-icon-kJOUm1g_.js";import{r as o,t as s}from"./unsafe-html-K3HXmifv.js";import{n as c,t as l}from"./chevron-right-C2fDtaFH.js";var u,d,f,p;function m(){return(m=e((()=>{r(),s(),i(),c(),u=new Set([`full`,`third`]),d=(e,t,n)=>t.has(e)?e:n,f=()=>n`<span class="c-bento__cta-icon" aria-hidden="true">${o(l)}</span>`,p=({width:e=`full`,app:r=`creative-cloud`,showIcon:i=!0,imageSrc:o,imageAlt:s=``,headline:c=``,body:l=``,ctaLabel:p=`Learn more`,ctaHref:m=`#`,showCta:h=!0}={})=>{let g=d(e,u,`full`);return n`
    <div class="c-bento" data-width=${g}>
      <div class="c-bento__media" aria-hidden="true">
        ${o?n`<img
              class="c-bento__image"
              src=${o}
              alt=${s}
              loading="lazy"
              decoding="async"
            />`:n`<span class="c-bento__placeholder"></span>`}
      </div>

      ${i?n`<span class="c-bento__icon" aria-hidden="true">${a({app:r,size:`lg`})}</span>`:t}

      <div class="c-bento__text">
        <div class="c-bento__headline-body">
          ${c?n`<p class="c-bento__headline">${c}</p>`:t}
          ${l?n`<p class="c-bento__body">${l}</p>`:t}
        </div>
        ${h&&p?n`<a class="c-bento__cta" href=${m}>
              <span class="c-bento__cta-label">${p}</span>${f()}
            </a>`:t}
      </div>
    </div>
  `}})))()}function h(){return(h=e((()=>{m()})))()}function g(){return(g=e((()=>{h()})))()}var _;function v(){return(v=e((()=>{_=`/consonant/pr-preview/pr-166/assets/bento-full-light-D3d9mte2.png`})))()}var y;function b(){return(b=e((()=>{y=`/consonant/pr-preview/pr-166/assets/bento-third-a-nUIqJxcF.jpg`})))()}var x;function S(){return(S=e((()=>{x=`/consonant/pr-preview/pr-166/assets/bento-small-a-LrToTMEE.jpg`})))()}var C;function w(){return(w=e((()=>{C=`/consonant/pr-preview/pr-166/assets/bento-full-dark-DOUKbQJd.jpg`})))()}var T;function E(){return(E=e((()=>{T=`/consonant/pr-preview/pr-166/assets/bento-third-b-CxLNrFk9.jpg`})))()}var D;function O(){return(O=e((()=>{D=`/consonant/pr-preview/pr-166/assets/bento-small-b-CWVn0cRn.jpg`})))()}var k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{r(),g(),v(),b(),S(),w(),E(),O(),k={title:`Cards/Bento`,tags:[`autodocs`],render:e=>n`
    <div style="max-width: 1392px; padding: 24px;">${p(e)}</div>
  `,parameters:{layout:`fullscreen`,docs:{description:{component:'\nFull-bleed media tile with a top-left app icon and a bottom-left headline / body / CTA lockup.\n\n- **Light/dark is token-driven** — the text uses theme-aware content tokens that flip with `:root[data-theme]`. There is no light/dark variant; wrap the tile in `data-theme="dark"` to see the dark treatment.\n- **`width`** sets the proportion: `full` (1392/711 wide row hero) or `third` (692/711 squarer tile for a 3-up grid). Both scale with their container via `aspect-ratio` and collapse to a taller portrait below 600px.\n- **No scrim** — legibility comes from image selection. Verify 4.5:1 contrast against the region the text overlays, in both themes. (The demo assets are theme-paired for exactly this reason.)\n\n**Figma:** [Bento — v2 node 12869:42943](https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/cpro-hub-and-docementation-cleanup?node-id=12869-42943)\n        '}}},argTypes:{width:{control:{type:`inline-radio`},options:[`full`,`third`],description:`full: 1392/711 wide hero · third: 692/711 squarer grid tile`},app:{control:`text`,description:`App slug for the icon badge`},showIcon:{control:`boolean`},imageSrc:{control:`text`},imageAlt:{control:`text`},headline:{control:`text`},body:{control:`text`},ctaLabel:{control:`text`},ctaHref:{control:`text`},showCta:{control:`boolean`}},args:{width:`full`,app:`creative-cloud`,showIcon:!0,imageSrc:_,imageAlt:``,headline:`Bring every idea to life with Creative Cloud.`,body:`20+ apps for photography, design, video, and the web — plus generative AI built in.`,ctaLabel:`Learn more`,ctaHref:`#`,showCta:!0}},A={name:`Full (wide hero)`,args:{imageSrc:C},render:e=>n`<div style="max-width: 1392px; padding: 24px;">${p(e)}</div>`},j={name:`Full · Dark theme`,globals:{theme:`dark`},args:{app:`photoshop`,imageSrc:C,headline:`Edit anything, anywhere, on any device.`,body:`Photoshop on the web and iPad keeps your work in sync — start on one, finish on another.`,ctaLabel:`Learn more`},render:e=>n`<div style="max-width: 1392px; padding: 24px;">${p(e)}</div>`},M={name:`Third (grid tile)`,args:{width:`third`,app:`acrobat-pro`,imageSrc:T,headline:`Work smarter with documents.`,body:`Trusted PDF tools, now with AI for editing, insights, and content creation.`,ctaLabel:`Learn more`},render:e=>n`<div style="max-width: 692px; padding: 24px;">${p(e)}</div>`},N=({full:e,thirds:t})=>n`
  <style>
    /* Columns track the S2A breakpoints: 3-up (LXL) → 2-up (Medium) → 1-up (Small) */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .bento-grid__hero {
      grid-column: 1 / -1;
    }
    @media (max-width: 1279px) {
      .bento-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 599px) {
      .bento-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
  <div class="bento-grid">
    <div class="bento-grid__hero">${p(e)}</div>
    ${t.map(e=>p({width:`third`,...e}))}
  </div>
`,P={name:`Bento Grid (hero + 3-up)`,parameters:{layout:`fullscreen`},render:()=>n`
    <div style="padding: 24px; max-width: 1392px; margin: 0 auto;">
      ${N({full:{width:`full`,app:`creative-cloud`,imageSrc:_,headline:`Bring every idea to life with Creative Cloud.`,body:`20+ apps for photography, design, video, and the web — plus generative AI built in.`,ctaLabel:`Learn more`},thirds:[{app:`acrobat-pro`,imageSrc:y,headline:`Work smarter with documents.`,body:`Trusted PDF tools, now with AI for editing and insights.`,ctaLabel:`Learn more`},{app:`express`,imageSrc:x,headline:`Design standout brand content.`,body:`Templates, fonts, and one-tap effects for social and print.`,ctaLabel:`Learn more`},{app:`photoshop`,imageSrc:y,headline:`Retouch photos in a few clicks.`,body:`AI-powered selections, removals, and blending — right in the browser.`,ctaLabel:`Learn more`}]})}
    </div>
  `},F={name:`Bento Grid · Dark theme`,parameters:{layout:`fullscreen`},globals:{theme:`dark`},render:()=>n`
    <div style="padding: 24px;">
      <div style="max-width: 1392px; margin: 0 auto;">
        ${N({full:{width:`full`,app:`photoshop`,imageSrc:C,headline:`Edit anything, anywhere, on any device.`,body:`Your work stays in sync across web, desktop, and iPad — start on one, finish on another.`,ctaLabel:`Learn more`},thirds:[{app:`lightroom`,imageSrc:T,headline:`Photos that pop, everywhere.`,body:`Edit, organize, and share from any device with cloud sync.`,ctaLabel:`Learn more`},{app:`firefly`,imageSrc:D,headline:`Generate images and video with AI.`,body:`Commercially safe generative AI, built for creative work.`,ctaLabel:`Learn more`},{app:`creative-cloud`,imageSrc:T,headline:`One membership, every app.`,body:`Everything you need to create, all in one place.`,ctaLabel:`Learn more`}]})}
      </div>
    </div>
  `},I=`Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,L=`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sit amet rhoncus nulla. Praesent sit amet facilisis magna.`,R={full_light:{width:`full`,app:`acrobat-pdf`,imageSrc:_},full_dark:{width:`full`,app:`acrobat-pdf`,imageSrc:C},third_light:{width:`third`,app:`acrobat-pdf`,imageSrc:y},third_dark:{width:`third`,app:`acrobat-pdf`,imageSrc:T},full_light_sm:{width:`full`,app:`acrobat-pdf`,imageSrc:x},full_dark_sm:{width:`full`,app:`acrobat-pdf`,imageSrc:D}},z={name:`Eval Harness`,parameters:{layout:`fullscreen`,chromatic:{disableSnapshot:!0}},args:{sample:`full_light`,tileWidth:1392},argTypes:{sample:{control:`select`,options:Object.keys(R)},tileWidth:{control:`number`}},render:({sample:e,tileWidth:t})=>n`
    <div style="width: ${t}px;">
      ${p({...R[e],headline:I,body:L,ctaLabel:`Label`})}
    </div>
  `},B={name:`No Icon`,args:{showIcon:!1,imageSrc:_,headline:`A cleaner tile without the app badge.`,body:`Drop the icon when the tile isn't tied to a single app.`},render:e=>n`<div style="max-width: 1392px; padding: 24px;">${p(e)}</div>`},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: "Full (wide hero)",
  // Image + centered crop matched to Figma "Bento — v2 · Dark · 1392×711" (12873:185673)
  args: {
    imageSrc: DARK_FULL
  },
  render: args => html\`<div style="max-width: 1392px; padding: 24px;">\${Bento(args)}</div>\`
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: "Full · Dark theme",
  // Drive the S2A theme via the toolbar global — it sets data-theme on the
  // document root, which is what the token overrides (:root[data-theme]) key off.
  globals: {
    theme: "dark"
  },
  args: {
    app: "photoshop",
    imageSrc: DARK_FULL,
    headline: "Edit anything, anywhere, on any device.",
    body: "Photoshop on the web and iPad keeps your work in sync — start on one, finish on another.",
    ctaLabel: "Learn more"
  },
  render: args => html\`<div style="max-width: 1392px; padding: 24px;">\${Bento(args)}</div>\`
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: "Third (grid tile)",
  args: {
    width: "third",
    app: "acrobat-pro",
    // Image + centered crop matched to Figma "Bento — v2 · Dark · 692×711" (12873:185723)
    imageSrc: DARK_THIRD_A,
    headline: "Work smarter with documents.",
    body: "Trusted PDF tools, now with AI for editing, insights, and content creation.",
    ctaLabel: "Learn more"
  },
  render: args => html\`<div style="max-width: 692px; padding: 24px;">\${Bento(args)}</div>\`
}`,...M.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: "Bento Grid (hero + 3-up)",
  parameters: {
    layout: "fullscreen"
  },
  render: () => html\`
    <div style="padding: 24px; max-width: 1392px; margin: 0 auto;">
      \${BentoGrid({
    full: {
      width: "full",
      app: "creative-cloud",
      imageSrc: LIGHT_FULL,
      headline: "Bring every idea to life with Creative Cloud.",
      body: "20+ apps for photography, design, video, and the web — plus generative AI built in.",
      ctaLabel: "Learn more"
    },
    thirds: [{
      app: "acrobat-pro",
      imageSrc: LIGHT_THIRD_A,
      headline: "Work smarter with documents.",
      body: "Trusted PDF tools, now with AI for editing and insights.",
      ctaLabel: "Learn more"
    }, {
      app: "express",
      imageSrc: LIGHT_THIRD_B,
      headline: "Design standout brand content.",
      body: "Templates, fonts, and one-tap effects for social and print.",
      ctaLabel: "Learn more"
    }, {
      app: "photoshop",
      imageSrc: LIGHT_THIRD_A,
      headline: "Retouch photos in a few clicks.",
      body: "AI-powered selections, removals, and blending — right in the browser.",
      ctaLabel: "Learn more"
    }]
  })}
    </div>
  \`
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: "Bento Grid · Dark theme",
  parameters: {
    layout: "fullscreen"
  },
  globals: {
    theme: "dark"
  },
  render: () => html\`
    <div style="padding: 24px;">
      <div style="max-width: 1392px; margin: 0 auto;">
        \${BentoGrid({
    full: {
      width: "full",
      app: "photoshop",
      imageSrc: DARK_FULL,
      headline: "Edit anything, anywhere, on any device.",
      body: "Your work stays in sync across web, desktop, and iPad — start on one, finish on another.",
      ctaLabel: "Learn more"
    },
    thirds: [{
      app: "lightroom",
      imageSrc: DARK_THIRD_A,
      headline: "Photos that pop, everywhere.",
      body: "Edit, organize, and share from any device with cloud sync.",
      ctaLabel: "Learn more"
    }, {
      app: "firefly",
      imageSrc: DARK_THIRD_B,
      headline: "Generate images and video with AI.",
      body: "Commercially safe generative AI, built for creative work.",
      ctaLabel: "Learn more"
    }, {
      app: "creative-cloud",
      imageSrc: DARK_THIRD_A,
      headline: "One membership, every app.",
      body: "Everything you need to create, all in one place.",
      ctaLabel: "Learn more"
    }]
  })}
      </div>
    </div>
  \`
}`,...F.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: "Eval Harness",
  parameters: {
    layout: "fullscreen",
    chromatic: {
      disableSnapshot: true
    }
  },
  args: {
    sample: "full_light",
    tileWidth: 1392
  },
  argTypes: {
    sample: {
      control: "select",
      options: Object.keys(EVAL_SAMPLES)
    },
    tileWidth: {
      control: "number"
    }
  },
  render: ({
    sample,
    tileWidth
  }) => html\`
    <div style="width: \${tileWidth}px;">
      \${Bento({
    ...EVAL_SAMPLES[sample],
    headline: EVAL_HEADLINE,
    body: EVAL_BODY,
    ctaLabel: "Label"
  })}
    </div>
  \`
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: "No Icon",
  args: {
    showIcon: false,
    imageSrc: LIGHT_FULL,
    headline: "A cleaner tile without the app badge.",
    body: "Drop the icon when the tile isn't tied to a single app."
  },
  render: args => html\`<div style="max-width: 1392px; padding: 24px;">\${Bento(args)}</div>\`
}`,...B.parameters?.docs?.source}}},V=[`Full`,`FullDark`,`Third`,`Grid`,`GridDark`,`Eval`,`NoIcon`]})))()}H();export{z as Eval,A as Full,j as FullDark,P as Grid,F as GridDark,B as NoIcon,M as Third,V as __namedExportsOrder,k as default};