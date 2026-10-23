import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{a as i,n as a}from"./app-icon-JdLRqGJJ.js";import{t as o}from"./AppIcon-BCqSFiLW.js";function s({size:e=`lg`,state:r=`default`,width:i=`hug`,label:o=`Learn more`,showApp:s=!0,showIconEnd:u,showIcon:d,app:f=`creative-cloud`}={}){let p=u??d??!0,m=a.find(e=>e.slug===f)??a[0],h=`${c}/${m.filename}`;return t`
    <button
      class="c-promo-cta"
      data-size="lg"
      data-state=${r}
      data-width=${i}
      data-show-app=${String(s)}
      data-show-icon-end=${String(p)}
      type="button"
    >
      <span class="c-promo-cta__left">
        ${s?t`
          <span class="c-promo-cta__app-icon">
            <img
              src=${h}
              alt=${m.label}
              width="32"
              height="32"
              style="border-radius:18%;display:block;"
              decoding="async"
              draggable="false"
            />
          </span>
        `:n}
        <span class="c-promo-cta__label-wrapper">
          <span class="c-promo-cta__label">${o}</span>
        </span>
      </span>
      ${p?t`
        <span class="c-promo-cta__right">
          <span class="c-promo-cta__control">
            <span class="c-promo-cta__control-icon">${l}</span>
          </span>
        </span>
      `:n}
    </button>
  `}var c,l;function u(){return(u=e((()=>{r(),i(),c=`https://www.adobe.com/content/dam/shared/images/product-icons/svg`,l=t`
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M11.106 5.39376L7.50582 1.79359C7.171 1.45878 6.62859 1.45878 6.29377 1.79359C5.95895 2.12841 5.95895 2.67083 6.29377 3.00564L8.43076 5.14264H1.49997C1.0262 5.14264 0.642822 5.52601 0.642822 5.99978C0.642822 6.47355 1.0262 6.85692 1.49997 6.85692H8.43077L6.29378 8.99392C5.95896 9.32874 5.95896 9.87115 6.29378 10.206C6.46119 10.3734 6.68049 10.4571 6.8998 10.4571C7.11911 10.4571 7.33842 10.3734 7.50583 10.206L11.106 6.6058C11.4408 6.27098 11.4408 5.72858 11.106 5.39376Z" fill="currentColor"/>
  </svg>
`})))()}function d(){return(d=e((()=>{u()})))()}var f,p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{r(),d(),o(),f=a.map(e=>e.slug),p=e=>t`
  <div data-theme="dark" style="padding:var(--s2a-spacing-3xl);background:var(--s2a-color-background-knockout);border-radius:var(--s2a-border-radius-md);display:inline-flex;align-items:center;justify-content:center;">
    ${e}
  </div>
`,m={title:`Molecules/PromoCta`,tags:[`autodocs`],render:e=>p(s(e)),parameters:{layout:`centered`,backgrounds:{default:`dark`,values:[{name:`dark`,value:`var(--s2a-color-background-knockout)`}]},docs:{description:{component:'\n**v2** — matches Figma "PromoCTA — v2" (arrow button is its own sub-component set). Compact promotional pill for hero and marquee zones: app icon, label, and a 32px arrow button on a knockout-black surface (theme-invariant by design). Colors bind the `s2a/color/promo-cta/*` token family, fallback-chained to shipped equivalents until it lands in a tokens release.\n\n**Props:**\n- `size` — `lg` only in v2 (the v1 `xl` maps to `lg`)\n- `width` — `hug` (wraps content) · `fill` (stretches to parent)\n- `showApp` — toggles the app icon slot\n- `showIconEnd` — toggles the arrow button\n- `app` — any slug from the AppIcon library (e.g. `creative-cloud`, `photoshop`)\n\n**Accessibility note:** A visible focus ring is present via `:focus-visible`. A dedicated Focused state matching WCAG 2.2 SC 2.4.11 (Focus Appearance) is tracked for a follow-up sprint.\n        '},source:{language:`html`,code:`<button class="c-promo-cta" data-size="lg" data-state="default" data-width="hug" data-show-app="true" data-show-icon-end="true" type="button">
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
</button>`}}},argTypes:{size:{control:!1,description:`v2 is lg-only (32px arrow button)`},state:{control:{type:`inline-radio`},options:[`default`,`hover`,`active`],description:`Interactive state (force for visual QA)`},width:{control:{type:`inline-radio`},options:[`hug`,`fill`],description:`hug wraps content · fill stretches to parent`},label:{control:`text`,description:`CTA copy`},showApp:{control:`boolean`,description:`Show / hide the app icon slot`},showIconEnd:{control:`boolean`,description:`Show / hide the arrow button`},app:{control:{type:`select`},options:f,description:`Adobe app icon slug`}},args:{size:`lg`,state:`default`,width:`hug`,label:`Learn more`,showApp:!0,showIconEnd:!0,app:`creative-cloud`}},h={},g={name:`State · hover`,args:{state:`hover`}},_={name:`State · active`,args:{state:`active`}},v={name:`No app icon`,args:{showApp:!1}},y={name:`No arrow button`,args:{showIconEnd:!1}},b={name:`Label only`,args:{showApp:!1,showIconEnd:!1}},x={name:`Width · fill`,args:{width:`fill`},render:e=>t`
    <div data-theme="dark" style="padding:var(--s2a-spacing-3xl);background:var(--s2a-color-background-knockout);border-radius:var(--s2a-border-radius-md);width:320px;">
      ${s(e)}
    </div>
  `},S={name:`All apps — xl · hug`,render:()=>t`
    <div data-theme="dark" style="padding:var(--s2a-spacing-3xl);background:var(--s2a-color-background-knockout);border-radius:var(--s2a-border-radius-md);display:flex;flex-direction:column;gap:var(--s2a-spacing-xs);align-items:flex-start;">
      ${a.slice(0,8).map(e=>s({app:e.slug,label:e.label.replace(`Adobe `,``)}))}
    </div>
  `},C={name:`All states · xl`,render:()=>t`
    <div data-theme="dark" style="padding:var(--s2a-spacing-3xl);background:var(--s2a-color-background-knockout);border-radius:var(--s2a-border-radius-md);display:flex;flex-direction:column;gap:var(--s2a-spacing-xs);align-items:flex-start;">
      ${[`default`,`hover`,`active`].map(e=>t`
        <div style="display:flex;align-items:center;gap:var(--s2a-spacing-md);">
          <span style="font-size:var(--s2a-font-size-xs);font-weight:var(--s2a-font-weight-label);letter-spacing:var(--s2a-font-letter-spacing-6xl);text-transform:uppercase;color:var(--s2a-color-content-body-subtle);width:56px;">${e}</span>
          ${s({state:e})}
        </div>
      `)}
    </div>
  `},w={name:`Both sizes · default`,render:()=>t`
    <div data-theme="dark" style="padding:var(--s2a-spacing-3xl);background:var(--s2a-color-background-knockout);border-radius:var(--s2a-border-radius-md);display:flex;flex-direction:column;gap:var(--s2a-spacing-xs);align-items:flex-start;">
      ${[`xl`,`lg`].map(e=>t`
        <div style="display:flex;align-items:center;gap:var(--s2a-spacing-md);">
          <span style="font-size:var(--s2a-font-size-xs);font-weight:var(--s2a-font-weight-label);letter-spacing:var(--s2a-font-letter-spacing-6xl);text-transform:uppercase;color:var(--s2a-color-content-body-subtle);width:24px;">${e}</span>
          ${s({size:e})}
        </div>
      `)}
    </div>
  `},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'State · hover',
  args: {
    state: 'hover'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'State · active',
  args: {
    state: 'active'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'No app icon',
  args: {
    showApp: false
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'No arrow button',
  args: {
    showIconEnd: false
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Label only',
  args: {
    showApp: false,
    showIconEnd: false
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Width · fill',
  args: {
    width: 'fill'
  },
  render: args => html\`
    <div data-theme="dark" style="padding:var(--s2a-spacing-3xl);background:var(--s2a-color-background-knockout);border-radius:var(--s2a-border-radius-md);width:320px;">
      \${PromoCta(args)}
    </div>
  \`
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'All apps — xl · hug',
  render: () => html\`
    <div data-theme="dark" style="padding:var(--s2a-spacing-3xl);background:var(--s2a-color-background-knockout);border-radius:var(--s2a-border-radius-md);display:flex;flex-direction:column;gap:var(--s2a-spacing-xs);align-items:flex-start;">
      \${APP_OPTIONS.slice(0, 8).map(a => PromoCta({
    app: a.slug,
    label: a.label.replace('Adobe ', '')
  }))}
    </div>
  \`
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'All states · xl',
  render: () => html\`
    <div data-theme="dark" style="padding:var(--s2a-spacing-3xl);background:var(--s2a-color-background-knockout);border-radius:var(--s2a-border-radius-md);display:flex;flex-direction:column;gap:var(--s2a-spacing-xs);align-items:flex-start;">
      \${['default', 'hover', 'active'].map(state => html\`
        <div style="display:flex;align-items:center;gap:var(--s2a-spacing-md);">
          <span style="font-size:var(--s2a-font-size-xs);font-weight:var(--s2a-font-weight-label);letter-spacing:var(--s2a-font-letter-spacing-6xl);text-transform:uppercase;color:var(--s2a-color-content-body-subtle);width:56px;">\${state}</span>
          \${PromoCta({
    state
  })}
        </div>
      \`)}
    </div>
  \`
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Both sizes · default',
  render: () => html\`
    <div data-theme="dark" style="padding:var(--s2a-spacing-3xl);background:var(--s2a-color-background-knockout);border-radius:var(--s2a-border-radius-md);display:flex;flex-direction:column;gap:var(--s2a-spacing-xs);align-items:flex-start;">
      \${['xl', 'lg'].map(size => html\`
        <div style="display:flex;align-items:center;gap:var(--s2a-spacing-md);">
          <span style="font-size:var(--s2a-font-size-xs);font-weight:var(--s2a-font-weight-label);letter-spacing:var(--s2a-font-letter-spacing-6xl);text-transform:uppercase;color:var(--s2a-color-content-body-subtle);width:24px;">\${size}</span>
          \${PromoCta({
    size
  })}
        </div>
      \`)}
    </div>
  \`
}`,...w.parameters?.docs?.source}}},T=[`Default`,`StateHover`,`StateActive`,`NoAppIcon`,`NoIconEnd`,`LabelOnly`,`FillWidth`,`AllApps`,`AllStates`,`BothSizes`]})))()}E();export{S as AllApps,C as AllStates,w as BothSizes,h as Default,x as FillWidth,b as LabelOnly,v as NoAppIcon,y as NoIconEnd,_ as StateActive,g as StateHover,T as __namedExportsOrder,m as default};