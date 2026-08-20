import{x as a}from"./iframe-B2X2aCfh.js";import{c as n}from"./button-Cebqltt4.js";import{t as y,I as v,s as w,o as x}from"./define-element-m1ia7VvY.js";import"./preload-helper-FEjktNXw.js";const S=({width:e=24,height:s=24,hidden:o=!1,title:t="Download"}={})=>y`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${e}"
    height="${s}"
    viewBox="0 0 20 20"
    aria-hidden=${o?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${t}"
  >
    <path
      d="m13.53027,9.42676c-.29199-.29199-.7666-.29395-1.06055,0l-1.7168,1.71411V2.75c0-.41406-.33594-.75-.75-.75s-.75.33594-.75.75v8.39941l-1.72266-1.72266c-.29297-.29297-.76758-.29297-1.06055,0s-.29297.76758,0,1.06055l2.99805,2.99805c.14648.14648.33789.21973.53027.21973.19141,0,.38379-.07324.53027-.21973l3.00195-2.99805c.29297-.29199.29297-.76758,0-1.06055Z"
      fill="currentColor"
    />
    <path
      d="m15.75,18H4.25c-1.24023,0-2.25-1.00977-2.25-2.25v-2.02148c0-.41406.33594-.75.75-.75s.75.33594.75.75v2.02148c0,.41309.33691.75.75.75h11.5c.41309,0,.75-.33691.75-.75v-2.02148c0-.41406.33594-.75.75-.75s.75.33594.75.75v2.02148c0,1.24023-1.00977,2.25-2.25,2.25Z"
      fill="currentColor"
    />
  </svg>`,k=({width:e=24,height:s=24,hidden:o=!1,title:t="Save To"}={})=>y`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${s}"
    viewBox="0 0 36 36"
    width="${e}"
    aria-hidden=${o?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${t}"
  >
    <path
      d="M33 10h-6a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h3v16H6V14h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v22a1 1 0 0 0 1 1h30a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1Z"
    />
    <path
      d="m10.2 17.331 7.445 7.525a.5.5 0 0 0 .7 0l7.455-7.525a.782.782 0 0 0 .2-.526.8.8 0 0 0-.8-.8H20V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v13h-5.2a.8.8 0 0 0-.8.8.782.782 0 0 0 .2.531Z"
    />
  </svg>`;class B extends v{render(){return w(a),this.spectrumVersion===2?S({hidden:!this.label,title:this.label}):k({hidden:!this.label,title:this.label})}}x("sp-icon-download",B);const I=({width:e=24,height:s=24,hidden:o=!1,title:t="Folder"}={})=>y`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${e}"
    height="${s}"
    viewBox="0 0 20 20"
    aria-hidden=${o?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${t}"
  >
    <path
      d="m16.75,5h-5.96387c-.21777,0-.42383-.09473-.56689-.25879l-1.70361-1.96484c-.42773-.49316-1.04736-.77637-1.7002-.77637h-3.56543c-1.24072,0-2.25,1.00977-2.25,2.25v10.5c0,1.24023,1.00928,2.25,2.25,2.25h13.5c1.24072,0,2.25-1.00977,2.25-2.25v-7.5c0-1.24023-1.00928-2.25-2.25-2.25ZM3.25,3.5h3.56543c.21777,0,.42383.09473.56689.25879l1.07617,1.24121H2.5v-.75c0-.41309.33643-.75.75-.75Zm14.25,11.25c0,.41309-.33643.75-.75.75H3.25c-.41357,0-.75-.33691-.75-.75V6.5h14.25c.41357,0,.75.33691.75.75v7.5Z"
      fill="currentColor"
    />
  </svg>`,z=({width:e=24,height:s=24,hidden:o=!1,title:t="Folder Outline"}={})=>y`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${s}"
    viewBox="0 0 36 36"
    width="${e}"
    aria-hidden=${o?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${t}"
  >
    <path
      d="m33 8-14.331.008-3.3-3.4A2 2 0 0 0 13.929 4H4a2 2 0 0 0-2 2v23a1 1 0 0 0 1 1h30a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1Zm-1 20H4V10h28Z"
    />
  </svg>`;class _ extends v{render(){return w(a),this.spectrumVersion===2?I({hidden:!this.label,title:this.label}):z({hidden:!this.label,title:this.label})}}x("sp-icon-folder",_);const{fn:T}=__STORYBOOK_MODULE_TEST__,$="width:12px;height:12px;display:inline-flex;align-items:center;justify-content:center;",O=`<sp-icon-download aria-hidden="true" style="${$}"></sp-icon-download>`,H=`<sp-icon-folder aria-hidden="true" style="${$}"></sp-icon-folder>`,A=["solid","outlined","transparent","accent","knockout","outline-inverse"],L={title:"Atoms/Button",tags:["autodocs"],render:e=>n(e),parameters:{docs:{description:{component:`<p>Primary action button — v2 architecture. Matches Figma <code>Button — v2</code> component set <code>10715:35477</code>. Source: <code>packages/components/src/button/button.css</code>.</p>
<p>There is no context prop: light/dark theming flows from the S2A variable modes (use the toolbar Theme toggle). <code>knockout</code> and <code>outline-inverse</code> are the styles for always-dark media surfaces (photos, video, scrims) — they don't flip with the page theme.</p>`},source:{language:"html",code:`<!-- Solid (default) -->
<button class="c-button" data-style="solid" data-size="md" type="button">
  <span class="c-button__label">Label</span>
</button>

<!-- Accent (blue CTA) -->
<button class="c-button" data-style="accent" data-size="md" type="button">
  <span class="c-button__label">Get started</span>
</button>

<!-- Knockout — always-light button for media surfaces -->
<button class="c-button" data-style="knockout" data-size="md" type="button">
  <span class="c-button__label">Watch now</span>
</button>

<!-- Link variant -->
<a class="c-button" data-style="solid" data-size="md" href="/destination">
  <span class="c-button__label">Learn more</span>
</a>`}}},argTypes:{label:{control:"text",description:"Button label text"},style:{control:{type:"select"},options:A,description:"Visual style (Figma Style axis). knockout/outline-inverse are for always-dark media surfaces."},size:{control:{type:"select"},options:["md"],description:"Size variant (v2 ships md only)"},state:{control:{type:"select"},options:["default","hover","active","focus","disabled"],description:"Force a visual state for documentation"},showIconStart:{control:"boolean",description:"Show leading icon slot"},showIconEnd:{control:"boolean",description:"Show trailing icon slot (defaults to caret)"}},args:{onClick:T(),label:"Label",style:"solid",size:"md",state:"default",showIconStart:!1,showIconEnd:!1}},b=e=>a`
  <div
    style="
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
      padding: 40px 32px;
      border-radius: 24px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: center;
    "
  >
    ${e}
  </div>
`,l={args:{style:"solid"}},i={args:{style:"outlined"}},c={args:{style:"transparent"}},d={args:{style:"accent",label:"Get started"}},p={args:{state:"disabled",label:"Disabled"}},u={name:"Knockout (media surface)",render:()=>b(a`${n({label:"Watch now",style:"knockout"})}`)},m={name:"Outline-inverse (media surface)",render:()=>b(a`${n({label:"Learn more",style:"outline-inverse"})}`)},h={render:()=>a`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      ${n({label:"Download presets",showIconStart:!0,iconStart:O,showIconEnd:!0})}
      ${n({style:"accent",showIconStart:!0,iconStart:H,label:"Save to library"})}
    </div>
  `},g={name:"All styles × states",render:()=>{const e=["default","hover","active","focus","disabled"],s=["solid","outlined","transparent","accent"],o=["knockout","outline-inverse"];return a`
      <div style="display: grid; gap: 28px;">
        ${s.map(t=>a`
            <div style="display: grid; gap: 12px;">
              <strong
                style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);text-transform:capitalize;color:var(--s2a-color-content-default);"
                >${t}</strong
              >
              <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                ${e.map(r=>n({label:r,style:t,state:r}))}
              </div>
            </div>
          `)}
        ${o.map(t=>a`
            <div style="display: grid; gap: 12px;">
              <strong
                style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);text-transform:capitalize;color:var(--s2a-color-content-default);"
                >${t} (media surface)</strong
              >
              ${b(a`${e.map(r=>n({label:r,style:t,state:r}))}`)}
            </div>
          `)}
      </div>
    `}},f={name:"Backdrop blur (glassy styles)",render:()=>a`
    <div
      style="
        background: linear-gradient(135deg, #e040fb 0%, #00b0ff 50%, #69f0ae 100%);
        padding: 40px 32px;
        border-radius: 24px;
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        align-items: center;
      "
    >
      ${n({label:"outlined",style:"outlined"})}
      ${n({label:"transparent",style:"transparent"})}
      ${n({label:"knockout",style:"knockout"})}
      ${n({label:"outline-inverse",style:"outline-inverse"})}
    </div>
  `};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    style: "solid"
  }
}`,...l.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    style: "outlined"
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    style: "transparent"
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    style: "accent",
    label: "Get started"
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    state: "disabled",
    label: "Disabled"
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "Knockout (media surface)",
  render: () => darkMedia(html\`\${createButton({
    label: "Watch now",
    style: "knockout"
  })}\`)
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "Outline-inverse (media surface)",
  render: () => darkMedia(html\`\${createButton({
    label: "Learn more",
    style: "outline-inverse"
  })}\`)
}`,...m.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      \${createButton({
    label: "Download presets",
    showIconStart: true,
    iconStart: downloadIconHtml,
    showIconEnd: true
  })}
      \${createButton({
    style: "accent",
    showIconStart: true,
    iconStart: folderIconHtml,
    label: "Save to library"
  })}
    </div>
  \`
}`,...h.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "All styles × states",
  render: () => {
    const states = ["default", "hover", "active", "focus", "disabled"];
    const themeStyles = ["solid", "outlined", "transparent", "accent"];
    const mediaStyles = ["knockout", "outline-inverse"];
    return html\`
      <div style="display: grid; gap: 28px;">
        \${themeStyles.map(style => html\`
            <div style="display: grid; gap: 12px;">
              <strong
                style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);text-transform:capitalize;color:var(--s2a-color-content-default);"
                >\${style}</strong
              >
              <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                \${states.map(state => createButton({
      label: state,
      style,
      state
    }))}
              </div>
            </div>
          \`)}
        \${mediaStyles.map(style => html\`
            <div style="display: grid; gap: 12px;">
              <strong
                style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);text-transform:capitalize;color:var(--s2a-color-content-default);"
                >\${style} (media surface)</strong
              >
              \${darkMedia(html\`\${states.map(state => createButton({
      label: state,
      style,
      state
    }))}\`)}
            </div>
          \`)}
      </div>
    \`;
  }
}`,...g.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "Backdrop blur (glassy styles)",
  render: () => html\`
    <div
      style="
        background: linear-gradient(135deg, #e040fb 0%, #00b0ff 50%, #69f0ae 100%);
        padding: 40px 32px;
        border-radius: 24px;
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        align-items: center;
      "
    >
      \${createButton({
    label: "outlined",
    style: "outlined"
  })}
      \${createButton({
    label: "transparent",
    style: "transparent"
  })}
      \${createButton({
    label: "knockout",
    style: "knockout"
  })}
      \${createButton({
    label: "outline-inverse",
    style: "outline-inverse"
  })}
    </div>
  \`
}`,...f.parameters?.docs?.source}}};const Z=["Solid","Outlined","Transparent","Accent","Disabled","Knockout","OutlineInverse","IconSlots","AllStylesMatrix","BackdropBlur"];export{d as Accent,g as AllStylesMatrix,f as BackdropBlur,p as Disabled,h as IconSlots,u as Knockout,m as OutlineInverse,i as Outlined,l as Solid,c as Transparent,Z as __namedExportsOrder,L as default};
