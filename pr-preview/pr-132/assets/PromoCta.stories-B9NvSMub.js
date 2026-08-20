import{E as x,x as e}from"./iframe-DReoqYbu.js";import{b as u}from"./app-icon-Csi4OqYZ.js";import"./preload-helper-DUW8wTBw.js";const C="https://www.adobe.com/content/dam/shared/images/product-icons/svg",k=e`
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M11.106 5.39376L7.50582 1.79359C7.171 1.45878 6.62859 1.45878 6.29377 1.79359C5.95895 2.12841 5.95895 2.67083 6.29377 3.00564L8.43076 5.14264H1.49997C1.0262 5.14264 0.642822 5.52601 0.642822 5.99978C0.642822 6.47355 1.0262 6.85692 1.49997 6.85692H8.43077L6.29378 8.99392C5.95896 9.32874 5.95896 9.87115 6.29378 10.206C6.46119 10.3734 6.68049 10.4571 6.8998 10.4571C7.11911 10.4571 7.33842 10.3734 7.50583 10.206L11.106 6.6058C11.4408 6.27098 11.4408 5.72858 11.106 5.39376Z" fill="currentColor"/>
  </svg>
`;function t({size:a="lg",state:b="default",width:v="hug",label:w="Learn more",showApp:g=!0,showIconEnd:y,showIcon:A,app:S="creative-cloud"}={}){const h=y??A??!0,f=u.find($=>$.slug===S)??u[0],_=`${C}/${f.filename}`;return e`
    <button
      class="c-promo-cta"
      data-size="lg"
      data-state=${b}
      data-width=${v}
      data-show-app=${String(g)}
      data-show-icon-end=${String(h)}
      type="button"
    >
      <span class="c-promo-cta__left">
        ${g?e`
          <span class="c-promo-cta__app-icon">
            <img
              src=${_}
              alt=${f.label}
              width="32"
              height="32"
              style="border-radius:18%;display:block;"
              decoding="async"
              draggable="false"
            />
          </span>
        `:x}
        <span class="c-promo-cta__label-wrapper">
          <span class="c-promo-cta__label">${w}</span>
        </span>
      </span>
      ${h?e`
        <span class="c-promo-cta__right">
          <span class="c-promo-cta__control">
            <span class="c-promo-cta__control-icon">${k}</span>
          </span>
        </span>
      `:x}
    </button>
  `}const z=u.map(a=>a.slug),P=a=>e`
  <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
    ${a}
  </div>
`,B={title:"Molecules/PromoCta",tags:["autodocs"],render:a=>P(t(a)),parameters:{layout:"centered",backgrounds:{default:"dark",values:[{name:"dark",value:"#1a1a1a"}]},docs:{description:{component:'\n**v2** — matches Figma "PromoCTA — v2" (arrow button is its own sub-component set). Compact promotional pill for hero and marquee zones: app icon, label, and a 32px arrow button on a knockout-black surface (theme-invariant by design). Colors bind the `s2a/color/promo-cta/*` token family, fallback-chained to shipped equivalents until it lands in a tokens release.\n\n**Props:**\n- `size` — `lg` only in v2 (the v1 `xl` maps to `lg`)\n- `width` — `hug` (wraps content) · `fill` (stretches to parent)\n- `showApp` — toggles the app icon slot\n- `showIconEnd` — toggles the arrow button\n- `app` — any slug from the AppIcon library (e.g. `creative-cloud`, `photoshop`)\n\n**Accessibility note:** A visible focus ring is present via `:focus-visible`. A dedicated Focused state matching WCAG 2.2 SC 2.4.11 (Focus Appearance) is tracked for a follow-up sprint.\n        '},source:{language:"html",code:`<button class="c-promo-cta" data-size="lg" data-state="default" data-width="hug" data-show-app="true" data-show-icon-end="true" type="button">
  <span class="c-promo-cta__left">
    <span class="c-promo-cta__app-icon">
      <img src="https://www.adobe.com/content/dam/shared/images/product-icons/svg/creative-cloud.svg" alt="Adobe Creative Cloud" width="32" height="32" style="border-radius:18%;display:block;" decoding="async" draggable="false" />
    </span>
    <span class="c-promo-cta__label-wrapper">
      <span class="c-promo-cta__label">Learn more</span>
    </span>
  </span>
  <span class="c-promo-cta__right">
    <span class="c-promo-cta__control">
      <span class="c-promo-cta__control-icon"><!-- arrow-right SVG --></span>
    </span>
  </span>
</button>`}}},argTypes:{size:{control:!1,description:"v2 is lg-only (32px arrow button)"},state:{control:{type:"inline-radio"},options:["default","hover","active"],description:"Interactive state (force for visual QA)"},width:{control:{type:"inline-radio"},options:["hug","fill"],description:"hug wraps content · fill stretches to parent"},label:{control:"text",description:"CTA copy"},showApp:{control:"boolean",description:"Show / hide the app icon slot"},showIconEnd:{control:"boolean",description:"Show / hide the arrow button"},app:{control:{type:"select"},options:z,description:"Adobe app icon slug"}},args:{size:"lg",state:"default",width:"hug",label:"Learn more",showApp:!0,showIconEnd:!0,app:"creative-cloud"}},s={},o={name:"State · hover",args:{state:"hover"}},r={name:"State · active",args:{state:"active"}},n={name:"No app icon",args:{showApp:!1}},l={name:"No arrow button",args:{showIconEnd:!1}},p={name:"Label only",args:{showApp:!1,showIconEnd:!1}},c={name:"Width · fill",args:{width:"fill"},render:a=>e`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;width:320px;">
      ${t(a)}
    </div>
  `},i={name:"All apps — xl · hug",render:()=>e`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      ${u.slice(0,8).map(a=>t({app:a.slug,label:a.label.replace("Adobe ","")}))}
    </div>
  `},d={name:"All states · xl",render:()=>e`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      ${["default","hover","active"].map(a=>e`
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#555;width:56px;">${a}</span>
          ${t({state:a})}
        </div>
      `)}
    </div>
  `},m={name:"Both sizes · default",render:()=>e`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      ${["xl","lg"].map(a=>e`
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#555;width:24px;">${a}</span>
          ${t({size:a})}
        </div>
      `)}
    </div>
  `};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'State · hover',
  args: {
    state: 'hover'
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: 'State · active',
  args: {
    state: 'active'
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: 'No app icon',
  args: {
    showApp: false
  }
}`,...n.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'No arrow button',
  args: {
    showIconEnd: false
  }
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Label only',
  args: {
    showApp: false,
    showIconEnd: false
  }
}`,...p.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Width · fill',
  args: {
    width: 'fill'
  },
  render: args => html\`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;width:320px;">
      \${PromoCta(args)}
    </div>
  \`
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'All apps — xl · hug',
  render: () => html\`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      \${APP_OPTIONS.slice(0, 8).map(a => PromoCta({
    app: a.slug,
    label: a.label.replace('Adobe ', '')
  }))}
    </div>
  \`
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'All states · xl',
  render: () => html\`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      \${['default', 'hover', 'active'].map(state => html\`
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#555;width:56px;">\${state}</span>
          \${PromoCta({
    state
  })}
        </div>
      \`)}
    </div>
  \`
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Both sizes · default',
  render: () => html\`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      \${['xl', 'lg'].map(size => html\`
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#555;width:24px;">\${size}</span>
          \${PromoCta({
    size
  })}
        </div>
      \`)}
    </div>
  \`
}`,...m.parameters?.docs?.source}}};const N=["Default","StateHover","StateActive","NoAppIcon","NoIconEnd","LabelOnly","FillWidth","AllApps","AllStates","BothSizes"];export{i as AllApps,d as AllStates,m as BothSizes,s as Default,c as FillWidth,p as LabelOnly,n as NoAppIcon,l as NoIconEnd,r as StateActive,o as StateHover,N as __namedExportsOrder,B as default};
