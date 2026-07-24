import{E as v,x as e}from"./iframe-CFguANTP.js";import{b as u}from"./app-icon-DMsBDvcG.js";import"./preload-helper-DH4Nyqrf.js";const $="https://www.adobe.com/content/dam/shared/images/product-icons/svg",C=e`
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M11.106 5.39376L7.50582 1.79359C7.171 1.45878 6.62859 1.45878 6.29377 1.79359C5.95895 2.12841 5.95895 2.67083 6.29377 3.00564L8.43076 5.14264H1.49997C1.0262 5.14264 0.642822 5.52601 0.642822 5.99978C0.642822 6.47355 1.0262 6.85692 1.49997 6.85692H8.43077L6.29378 8.99392C5.95896 9.32874 5.95896 9.87115 6.29378 10.206C6.46119 10.3734 6.68049 10.4571 6.8998 10.4571C7.11911 10.4571 7.33842 10.3734 7.50583 10.206L11.106 6.6058C11.4408 6.27098 11.4408 5.72858 11.106 5.39376Z" fill="currentColor"/>
  </svg>
`;function t({size:a="xl",state:b="default",width:w="hug",label:y="Learn more",showApp:h=!0,showIcon:x=!0,app:S="creative-cloud"}={}){const f=u.find(_=>_.slug===S)??u[0],A=`${$}/${f.filename}`;return e`
    <button
      class="c-promo-cta"
      data-size=${a}
      data-state=${b}
      data-width=${w}
      data-show-app=${String(h)}
      data-show-icon=${String(x)}
      type="button"
    >
      <span class="c-promo-cta__left">
        ${h?e`
          <span class="c-promo-cta__app-icon">
            <img
              src=${A}
              alt=${f.label}
              width="24"
              height="24"
              style="border-radius:18%;display:block;"
              decoding="async"
              draggable="false"
            />
          </span>
        `:v}
        <span class="c-promo-cta__label-wrapper">
          <span class="c-promo-cta__label">${y}</span>
        </span>
      </span>
      ${x?e`
        <span class="c-promo-cta__right">
          <span class="c-promo-cta__control">
            <span class="c-promo-cta__control-icon">${C}</span>
          </span>
        </span>
      `:v}
    </button>
  `}const z=u.map(a=>a.slug),k=a=>e`
  <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;">
    ${a}
  </div>
`,B={title:"Atoms/PromoCta",tags:["autodocs"],render:a=>k(t(a)),parameters:{layout:"centered",backgrounds:{default:"dark",values:[{name:"dark",value:"#1a1a1a"}]},docs:{description:{component:"\nCompact promotional pill for hero and marquee zones. Pairs an app icon, a label, and a directional caret on a knockout-black surface. Dark context only — an on-light variant is tracked for a future sprint.\n\n**Props:**\n- `size` — `xl` (48px caret, default) · `lg` (32px caret)\n- `width` — `hug` (wraps content) · `fill` (stretches to parent)\n- `showApp` — toggles the app icon slot\n- `showIcon` — toggles the caret control\n- `app` — any slug from the AppIcon library (e.g. `creative-cloud`, `photoshop`)\n\n**Accessibility note:** A visible focus ring is present via `:focus-visible`. A dedicated Focused state matching WCAG 2.2 SC 2.4.11 (Focus Appearance) is tracked for a follow-up sprint.\n        "},source:{language:"html",code:`<button class="c-promo-cta" data-size="xl" data-state="default" data-width="hug" data-show-app="true" data-show-icon="true" type="button">
  <span class="c-promo-cta__left">
    <span class="c-promo-cta__app-icon">
      <img src="https://www.adobe.com/content/dam/shared/images/product-icons/svg/creative-cloud.svg" alt="Adobe Creative Cloud" width="24" height="24" style="border-radius:18%;display:block;" decoding="async" draggable="false" />
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
</button>`}}},argTypes:{size:{control:{type:"inline-radio"},options:["xl","lg"],description:"xl → 48px caret · lg → 32px caret"},state:{control:{type:"inline-radio"},options:["default","hover","active"],description:"Interactive state (force for visual QA)"},width:{control:{type:"inline-radio"},options:["hug","fill"],description:"hug wraps content · fill stretches to parent"},label:{control:"text",description:"CTA copy"},showApp:{control:"boolean",description:"Show / hide the app icon slot"},showIcon:{control:"boolean",description:"Show / hide the caret control"},app:{control:{type:"select"},options:z,description:"Adobe app icon slug"}},args:{size:"xl",state:"default",width:"hug",label:"Learn more",showApp:!0,showIcon:!0,app:"creative-cloud"}},s={},r={name:"Size · lg",args:{size:"lg"}},o={name:"State · hover",args:{state:"hover"}},n={name:"State · active",args:{state:"active"}},p={name:"No app icon",args:{showApp:!1}},c={name:"No caret",args:{showIcon:!1}},l={name:"Label only",args:{showApp:!1,showIcon:!1}},i={name:"Width · fill",args:{width:"fill"},render:a=>e`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;width:320px;">
      ${t(a)}
    </div>
  `},d={name:"All apps — xl · hug",render:()=>e`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      ${u.slice(0,8).map(a=>t({app:a.slug,label:a.label.replace("Adobe ","")}))}
    </div>
  `},m={name:"All states · xl",render:()=>e`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      ${["default","hover","active"].map(a=>e`
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#555;width:56px;">${a}</span>
          ${t({state:a})}
        </div>
      `)}
    </div>
  `},g={name:"Both sizes · default",render:()=>e`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      ${["xl","lg"].map(a=>e`
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#555;width:24px;">${a}</span>
          ${t({size:a})}
        </div>
      `)}
    </div>
  `};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: 'Size · lg',
  args: {
    size: 'lg'
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'State · hover',
  args: {
    state: 'hover'
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: 'State · active',
  args: {
    state: 'active'
  }
}`,...n.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'No app icon',
  args: {
    showApp: false
  }
}`,...p.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'No caret',
  args: {
    showIcon: false
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Label only',
  args: {
    showApp: false,
    showIcon: false
  }
}`,...l.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Width · fill',
  args: {
    width: 'fill'
  },
  render: args => html\`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;width:320px;">
      \${PromoCta(args)}
    </div>
  \`
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'All apps — xl · hug',
  render: () => html\`
    <div style="padding:48px;background:#1a1a1a;border-radius:16px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      \${APP_OPTIONS.slice(0, 8).map(a => PromoCta({
    app: a.slug,
    label: a.label.replace('Adobe ', '')
  }))}
    </div>
  \`
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};const N=["Default","SizeLg","StateHover","StateActive","NoAppIcon","NoIcon","LabelOnly","FillWidth","AllApps","AllStates","BothSizes"];export{d as AllApps,m as AllStates,g as BothSizes,s as Default,i as FillWidth,l as LabelOnly,p as NoAppIcon,c as NoIcon,r as SizeLg,n as StateActive,o as StateHover,N as __namedExportsOrder,B as default};
