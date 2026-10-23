import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{a as i,r as a}from"./app-icon-JdLRqGJJ.js";import{r as o}from"./unsafe-html-t7SGSaWI.js";import{t as s}from"./unsafe-html-BN0uzf8m.js";import{n as c,t as l}from"./chevron-right-D_w3jOSY.js";var u,d,f,p,m;function h(){return(h=e((()=>{r(),s(),i(),c(),u=new Set([`full`,`third`]),d=new Set([`left`,`center`]),f=(e,t,n)=>t.has(e)?e:n,p=()=>t`<span class="c-bento__cta-icon" aria-hidden="true">${o(l)}</span>`,m=({width:e=`full`,textAlign:r=`left`,app:i=`creative-cloud`,showIcon:o=!0,imageSrc:s,imageAlt:c=``,headline:l=``,body:m=``,ctaLabel:h=`Learn more`,ctaHref:g=`#`,showCta:_=!0}={})=>{let v=f(e,u,`full`),y=f(r,d,`left`);return t`
    <div class="c-bento" data-width=${v} data-text-align=${y}>
      <div class="c-bento__media" aria-hidden="true">
        ${s?t`<img
              class="c-bento__image"
              src=${s}
              alt=${c}
              loading="lazy"
              decoding="async"
            />`:t`<span class="c-bento__placeholder"></span>`}
      </div>

      ${o?t`<span class="c-bento__icon" aria-hidden="true">${a({app:i,size:`32`})}</span>`:n}

      <div class="c-bento__text">
        <div class="c-bento__headline-body">
          ${l?t`<p class="c-bento__headline">${l}</p>`:n}
          ${m?t`<p class="c-bento__body">${m}</p>`:n}
        </div>
        ${_&&h?t`<a class="c-bento__cta" href=${g}>
              <span class="c-bento__cta-label">${h}</span>${p()}
            </a>`:n}
      </div>
    </div>
  `}})))()}function g(){return(g=e((()=>{h()})))()}function _(){return(_=e((()=>{g()})))()}var v;function y(){return(y=e((()=>{v=`/consonant/pr-preview/pr-168/assets/bento-full-light-D3d9mte2.png`})))()}var b;function x(){return(x=e((()=>{b=`/consonant/pr-preview/pr-168/assets/bento-third-a-nUIqJxcF.jpg`})))()}var S;function C(){return(C=e((()=>{S=`/consonant/pr-preview/pr-168/assets/bento-small-a-LrToTMEE.jpg`})))()}var w;function T(){return(T=e((()=>{w=`/consonant/pr-preview/pr-168/assets/bento-full-dark-DOUKbQJd.jpg`})))()}var E;function D(){return(D=e((()=>{E=`/consonant/pr-preview/pr-168/assets/bento-third-b-CxLNrFk9.jpg`})))()}var O;function k(){return(k=e((()=>{O=`/consonant/pr-preview/pr-168/assets/bento-small-b-CWVn0cRn.jpg`})))()}var A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{r(),_(),y(),x(),C(),T(),D(),k(),A={title:`Cards/Bento`,tags:[`autodocs`],render:e=>t`
    <div style="max-width: 1392px; padding: var(--s2a-spacing-lg);">${m(e)}</div>
  `,parameters:{layout:`fullscreen`,docs:{description:{component:'\nFull-bleed media tile with a top-left app icon and a bottom-left headline / body / CTA lockup.\n\n- **Light/dark is token-driven** — the text uses theme-aware content tokens that flip with `:root[data-theme]`. There is no light/dark variant; wrap the tile in `data-theme="dark"` to see the dark treatment.\n- **`width`** sets the proportion: `full` (1392/711 wide row hero) or `third` (692/711 squarer tile for a 3-up grid). Both scale with their container via `aspect-ratio` and collapse to a taller portrait below 600px.\n- **No scrim** — legibility comes from image selection. Verify 4.5:1 contrast against the region the text overlays, in both themes. (The demo assets are theme-paired for exactly this reason.)\n\n**Figma:** [Bento — v2 node 12869:42943](https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/cpro-hub-and-docementation-cleanup?node-id=12869-42943)\n        '}}},argTypes:{width:{control:{type:`inline-radio`},options:[`full`,`third`],description:`full: 1392/711 wide hero · third: 692/711 squarer grid tile`},textAlign:{control:{type:`inline-radio`},options:[`left`,`center`],description:`Matches Figma's "Text Alignment" variant (default→left, centered→center)`},app:{control:`text`,description:`App slug for the icon badge`},showIcon:{control:`boolean`},imageSrc:{control:`text`},imageAlt:{control:`text`},headline:{control:`text`},body:{control:`text`},ctaLabel:{control:`text`},ctaHref:{control:`text`},showCta:{control:`boolean`}},args:{width:`full`,textAlign:`left`,app:`creative-cloud`,showIcon:!0,imageSrc:v,imageAlt:``,headline:`Bring every idea to life with Creative Cloud.`,body:`20+ apps for photography, design, video, and the web — plus generative AI built in.`,ctaLabel:`Learn more`,ctaHref:`#`,showCta:!0}},j={name:`Full (wide hero)`,args:{imageSrc:w},render:e=>t`<div style="max-width: 1392px; padding: var(--s2a-spacing-lg);">${m(e)}</div>`},M={name:`Full · Dark theme`,globals:{theme:`dark`},args:{app:`photoshop`,imageSrc:w,headline:`Edit anything, anywhere, on any device.`,body:`Photoshop on the web and iPad keeps your work in sync — start on one, finish on another.`,ctaLabel:`Learn more`},render:e=>t`<div style="max-width: 1392px; padding: var(--s2a-spacing-lg);">${m(e)}</div>`},N={name:`Third (grid tile)`,args:{width:`third`,app:`acrobat-pro`,imageSrc:E,headline:`Work smarter with documents.`,body:`Trusted PDF tools, now with AI for editing, insights, and content creation.`,ctaLabel:`Learn more`},render:e=>t`<div style="max-width: 692px; padding: var(--s2a-spacing-lg);">${m(e)}</div>`},P={name:`Centered text alignment`,args:{textAlign:`center`,width:`third`,app:`acrobat-pro`,imageSrc:E,headline:`Edit PDFs in a few clicks.`,body:`Update text and images, rearrange content, and share instantly.`,ctaLabel:`Try it now`},render:e=>t`<div style="max-width: 692px; padding: var(--s2a-spacing-lg);">${m(e)}</div>`},F=({full:e,thirds:n})=>t`
  <style>
    /* Columns track the S2A breakpoints: 3-up (LXL) → 2-up (Medium) → 1-up (Small) */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--s2a-spacing-xs);
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
    <div class="bento-grid__hero">${m(e)}</div>
    ${n.map(e=>m({width:`third`,...e}))}
  </div>
`,I={name:`Bento Grid (hero + 3-up)`,parameters:{layout:`fullscreen`},render:()=>t`
    <div style="padding: var(--s2a-spacing-lg); max-width: 1392px; margin: 0 auto;">
      ${F({full:{width:`full`,app:`creative-cloud`,imageSrc:v,headline:`Bring every idea to life with Creative Cloud.`,body:`20+ apps for photography, design, video, and the web — plus generative AI built in.`,ctaLabel:`Learn more`},thirds:[{app:`acrobat-pro`,imageSrc:b,headline:`Work smarter with documents.`,body:`Trusted PDF tools, now with AI for editing and insights.`,ctaLabel:`Learn more`},{app:`express`,imageSrc:S,headline:`Design standout brand content.`,body:`Templates, fonts, and one-tap effects for social and print.`,ctaLabel:`Learn more`},{app:`photoshop`,imageSrc:b,headline:`Retouch photos in a few clicks.`,body:`AI-powered selections, removals, and blending — right in the browser.`,ctaLabel:`Learn more`}]})}
    </div>
  `},L={name:`Bento Grid · Dark theme`,parameters:{layout:`fullscreen`},globals:{theme:`dark`},render:()=>t`
    <div style="padding: var(--s2a-spacing-lg);">
      <div style="max-width: 1392px; margin: 0 auto;">
        ${F({full:{width:`full`,app:`photoshop`,imageSrc:w,headline:`Edit anything, anywhere, on any device.`,body:`Your work stays in sync across web, desktop, and iPad — start on one, finish on another.`,ctaLabel:`Learn more`},thirds:[{app:`lightroom`,imageSrc:E,headline:`Photos that pop, everywhere.`,body:`Edit, organize, and share from any device with cloud sync.`,ctaLabel:`Learn more`},{app:`firefly`,imageSrc:O,headline:`Generate images and video with AI.`,body:`Commercially safe generative AI, built for creative work.`,ctaLabel:`Learn more`},{app:`creative-cloud`,imageSrc:E,headline:`One membership, every app.`,body:`Everything you need to create, all in one place.`,ctaLabel:`Learn more`}]})}
      </div>
    </div>
  `},R=`Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,z=`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sit amet rhoncus nulla. Praesent sit amet facilisis magna.`,B={full_light:{width:`full`,app:`acrobat-pdf`,imageSrc:v},full_dark:{width:`full`,app:`acrobat-pdf`,imageSrc:w},third_light:{width:`third`,app:`acrobat-pdf`,imageSrc:b},third_dark:{width:`third`,app:`acrobat-pdf`,imageSrc:E},full_light_sm:{width:`full`,app:`acrobat-pdf`,imageSrc:S},full_dark_sm:{width:`full`,app:`acrobat-pdf`,imageSrc:O}},V={name:`Eval Harness`,parameters:{layout:`fullscreen`,chromatic:{disableSnapshot:!0}},args:{sample:`full_light`,tileWidth:1392},argTypes:{sample:{control:`select`,options:Object.keys(B)},tileWidth:{control:`number`}},render:({sample:e,tileWidth:n})=>t`
    <div style="width: ${n}px;">
      ${m({...B[e],headline:R,body:z,ctaLabel:`Label`})}
    </div>
  `},H={name:`No Icon`,args:{showIcon:!1,imageSrc:v,headline:`A cleaner tile without the app badge.`,body:`Drop the icon when the tile isn't tied to a single app.`},render:e=>t`<div style="max-width: 1392px; padding: var(--s2a-spacing-lg);">${m(e)}</div>`},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: "Full (wide hero)",
  // Image + centered crop matched to Figma "Bento — v2 · Dark · 1392×711" (12873:185673)
  args: {
    imageSrc: DARK_FULL
  },
  render: args => html\`<div style="max-width: 1392px; padding: var(--s2a-spacing-lg);">\${Bento(args)}</div>\`
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
  render: args => html\`<div style="max-width: 1392px; padding: var(--s2a-spacing-lg);">\${Bento(args)}</div>\`
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
  render: args => html\`<div style="max-width: 692px; padding: var(--s2a-spacing-lg);">\${Bento(args)}</div>\`
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: "Centered text alignment",
  args: {
    textAlign: "center",
    width: "third",
    app: "acrobat-pro",
    imageSrc: DARK_THIRD_A,
    headline: "Edit PDFs in a few clicks.",
    body: "Update text and images, rearrange content, and share instantly.",
    ctaLabel: "Try it now"
  },
  render: args => html\`<div style="max-width: 692px; padding: var(--s2a-spacing-lg);">\${Bento(args)}</div>\`
}`,...P.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: "Bento Grid (hero + 3-up)",
  parameters: {
    layout: "fullscreen"
  },
  render: () => html\`
    <div style="padding: var(--s2a-spacing-lg); max-width: 1392px; margin: 0 auto;">
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: "Bento Grid · Dark theme",
  parameters: {
    layout: "fullscreen"
  },
  globals: {
    theme: "dark"
  },
  render: () => html\`
    <div style="padding: var(--s2a-spacing-lg);">
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
}`,...L.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: "No Icon",
  args: {
    showIcon: false,
    imageSrc: LIGHT_FULL,
    headline: "A cleaner tile without the app badge.",
    body: "Drop the icon when the tile isn't tied to a single app."
  },
  render: args => html\`<div style="max-width: 1392px; padding: var(--s2a-spacing-lg);">\${Bento(args)}</div>\`
}`,...H.parameters?.docs?.source}}},U=[`Full`,`FullDark`,`Third`,`CenteredText`,`Grid`,`GridDark`,`Eval`,`NoIcon`]})))()}W();export{P as CenteredText,V as Eval,j as Full,M as FullDark,I as Grid,L as GridDark,H as NoIcon,N as Third,U as __namedExportsOrder,A as default};