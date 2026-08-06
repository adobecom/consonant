import{x as n}from"./iframe-BQ_6YrVl.js";import{c as a}from"./button-Cjq5L1h3.js";import{t as f,I as k,s as $,o as S}from"./define-element-BlWf0VOy.js";import"./preload-helper-Ba9zt97U.js";const z=({width:t=24,height:e=24,hidden:r=!1,title:o="Download"}={})=>f`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${t}"
    height="${e}"
    viewBox="0 0 20 20"
    aria-hidden=${r?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${o}"
  >
    <path
      d="m13.53027,9.42676c-.29199-.29199-.7666-.29395-1.06055,0l-1.7168,1.71411V2.75c0-.41406-.33594-.75-.75-.75s-.75.33594-.75.75v8.39941l-1.72266-1.72266c-.29297-.29297-.76758-.29297-1.06055,0s-.29297.76758,0,1.06055l2.99805,2.99805c.14648.14648.33789.21973.53027.21973.19141,0,.38379-.07324.53027-.21973l3.00195-2.99805c.29297-.29199.29297-.76758,0-1.06055Z"
      fill="currentColor"
    />
    <path
      d="m15.75,18H4.25c-1.24023,0-2.25-1.00977-2.25-2.25v-2.02148c0-.41406.33594-.75.75-.75s.75.33594.75.75v2.02148c0,.41309.33691.75.75.75h11.5c.41309,0,.75-.33691.75-.75v-2.02148c0-.41406.33594-.75.75-.75s.75.33594.75.75v2.02148c0,1.24023-1.00977,2.25-2.25,2.25Z"
      fill="currentColor"
    />
  </svg>`,I=({width:t=24,height:e=24,hidden:r=!1,title:o="Save To"}={})=>f`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${e}"
    viewBox="0 0 36 36"
    width="${t}"
    aria-hidden=${r?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${o}"
  >
    <path
      d="M33 10h-6a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h3v16H6V14h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v22a1 1 0 0 0 1 1h30a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1Z"
    />
    <path
      d="m10.2 17.331 7.445 7.525a.5.5 0 0 0 .7 0l7.455-7.525a.782.782 0 0 0 .2-.526.8.8 0 0 0-.8-.8H20V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v13h-5.2a.8.8 0 0 0-.8.8.782.782 0 0 0 .2.531Z"
    />
  </svg>`;class C extends k{render(){return $(n),this.spectrumVersion===2?z({hidden:!this.label,title:this.label}):I({hidden:!this.label,title:this.label})}}S("sp-icon-download",C);const _=({width:t=24,height:e=24,hidden:r=!1,title:o="Folder"}={})=>f`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${t}"
    height="${e}"
    viewBox="0 0 20 20"
    aria-hidden=${r?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${o}"
  >
    <path
      d="m16.75,5h-5.96387c-.21777,0-.42383-.09473-.56689-.25879l-1.70361-1.96484c-.42773-.49316-1.04736-.77637-1.7002-.77637h-3.56543c-1.24072,0-2.25,1.00977-2.25,2.25v10.5c0,1.24023,1.00928,2.25,2.25,2.25h13.5c1.24072,0,2.25-1.00977,2.25-2.25v-7.5c0-1.24023-1.00928-2.25-2.25-2.25ZM3.25,3.5h3.56543c.21777,0,.42383.09473.56689.25879l1.07617,1.24121H2.5v-.75c0-.41309.33643-.75.75-.75Zm14.25,11.25c0,.41309-.33643.75-.75.75H3.25c-.41357,0-.75-.33691-.75-.75V6.5h14.25c.41357,0,.75.33691.75.75v7.5Z"
      fill="currentColor"
    />
  </svg>`,H=({width:t=24,height:e=24,hidden:r=!1,title:o="Folder Outline"}={})=>f`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${e}"
    viewBox="0 0 36 36"
    width="${t}"
    aria-hidden=${r?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${o}"
  >
    <path
      d="m33 8-14.331.008-3.3-3.4A2 2 0 0 0 13.929 4H4a2 2 0 0 0-2 2v23a1 1 0 0 0 1 1h30a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1Zm-1 20H4V10h28Z"
    />
  </svg>`;class T extends k{render(){return $(n),this.spectrumVersion===2?_({hidden:!this.label,title:this.label}):H({hidden:!this.label,title:this.label})}}S("sp-icon-folder",T);const{fn:D}=__STORYBOOK_MODULE_TEST__,B="width:12px;height:12px;display:inline-flex;align-items:center;justify-content:center;",O=`<sp-icon-download aria-hidden="true" style="${B}"></sp-icon-download>`,F=`<sp-icon-folder aria-hidden="true" style="${B}"></sp-icon-folder>`,E={title:"Atoms/Button",tags:["autodocs"],render:t=>a(t),parameters:{docs:{description:{component:"<p>Primary action button. Matches Figma <code>.Button/Core/Primary</code> node <code>141:53460</code>. Source: <code>packages/components/src/button/button.css</code>.</p>"},source:{language:"html",code:`<!-- Solid / on-light (default) -->
<button class="c-button" data-background="solid" data-intent="primary" data-context="on-light" data-size="md" type="button">
  <span class="c-button__label">Label</span>
</button>

<!-- Outlined / on-dark -->
<button class="c-button" data-background="outlined" data-intent="primary" data-context="on-dark" data-size="md" type="button">
  <span class="c-button__label">Label</span>
</button>

<!-- Accent (blue CTA) -->
<button class="c-button" data-background="solid" data-intent="accent" data-context="on-light" data-size="md" type="button">
  <span class="c-button__label">Get started</span>
</button>

<!-- Link variant -->
<a class="c-button" data-background="solid" data-intent="primary" data-context="on-light" data-size="md" href="/destination">
  <span class="c-button__label">Learn more</span>
</a>`}}},argTypes:{label:{control:"text",description:"Button label text"},intent:{control:{type:"select"},options:["primary","accent"],description:"Color intent (primary = core black/white, accent = blue CTA)"},context:{control:{type:"select"},options:["on-light","on-dark"],description:"Surface context the button sits on"},background:{control:{type:"select"},options:["solid","outlined","transparent"],description:"Background variant"},size:{control:{type:"select"},options:["md","xs"],description:"Size variant"},state:{control:{type:"select"},options:["default","hover","active","focus","disabled"],description:"Force a visual state for documentation"},showIconStart:{control:"boolean",description:"Show leading icon slot"},showIconEnd:{control:"boolean",description:"Show trailing icon slot (defaults to caret)"}},args:{onClick:D(),label:"Label",intent:"primary",context:"on-light",background:"solid",size:"md",state:"default",showIconStart:!1,showIconEnd:!1}},s={args:{background:"solid"}},l={args:{background:"outlined"}},i={args:{background:"transparent"}},d={args:{state:"disabled",label:"Disabled"}},c={args:{intent:"accent",background:"solid",label:"Get started"}},p={render:()=>n`
    <div style="display: flex; gap: 16px; align-items: center;">
      ${a({label:"Medium",size:"md",background:"solid"})}
      ${a({label:"Compact",size:"xs",background:"solid"})}
    </div>
  `},g={render:()=>{const t=["solid","outlined","transparent"];return n`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          ${t.map(e=>a({label:e,background:e,context:"on-light"}))}
        </div>
        <div
          style="background: #050505; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;"
        >
          ${t.map(e=>a({label:`${e} on dark`,background:e,context:"on-dark"}))}
        </div>
      </div>
    `}},u={render:()=>n`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      ${a({label:"Download presets",showIconStart:!0,iconStart:O,showIconEnd:!0})}
      ${a({intent:"accent",background:"solid",showIconStart:!0,iconStart:F,label:"Save to library"})}
    </div>
  `},b={render:()=>n`
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        ${["default","hover","active","focus","disabled"].map(e=>a({label:e,state:e,context:"on-light",background:"solid"}))}
      </div>
    `},h={name:"Backdrop blur (outlined & transparent)",render:()=>n`
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
      ${a({label:"outlined on-light",background:"outlined",context:"on-light"})}
      ${a({label:"outlined on-dark",background:"outlined",context:"on-dark"})}
      ${a({label:"transparent on-light",background:"transparent",context:"on-light"})}
      ${a({label:"transparent on-dark",background:"transparent",context:"on-dark"})}
    </div>
  `},m={render:()=>{const t=["solid","outlined","transparent"],e=["on-light","on-dark"],r=["md","xs"],o=["default","hover","active","focus","disabled"];return n`
      <div style="display: grid; gap: 28px;">
        ${e.map(x=>n`
            <section
              style=${x==="on-dark"?"background:#050505;color:#fff;padding:24px;border-radius:24px;":"background:#fff;color:#000;padding:24px;border:1px solid rgba(0,0,0,0.08);border-radius:24px;"}
            >
              <h3 style="margin:0 0 var(--s2a-spacing-md);font-family:var(--s2a-font-family-label);font-size:var(--s2a-font-size-md);font-weight:var(--s2a-font-weight-label);line-height:var(--s2a-typography-line-height-label);letter-spacing:var(--s2a-typography-letter-spacing-label);">${x}</h3>
              <div style="display:grid;gap:20px;">
                ${t.map(v=>n`
                    <div style="display:grid;gap:12px;">
                      <strong style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);line-height:var(--s2a-typography-line-height-label);letter-spacing:var(--s2a-typography-letter-spacing-label);text-transform:capitalize;"
                        >${v}</strong
                      >
                      ${r.map(y=>n`
                          <div
                            style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;"
                          >
                            ${o.map(w=>a({label:`${y} ${w}`,background:v,context:x,size:y,state:w}))}
                          </div>
                        `)}
                    </div>
                  `)}
              </div>
            </section>
          `)}
      </div>
    `}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    background: "solid"
  }
}`,...s.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    background: "outlined"
  }
}`,...l.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    background: "transparent"
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    state: "disabled",
    label: "Disabled"
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    intent: "accent",
    background: "solid",
    label: "Get started"
  }
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: 16px; align-items: center;">
      \${createButton({
    label: "Medium",
    size: "md",
    background: "solid"
  })}
      \${createButton({
    label: "Compact",
    size: "xs",
    background: "solid"
  })}
    </div>
  \`
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const backgrounds = ["solid", "outlined", "transparent"];
    return html\`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          \${backgrounds.map(background => createButton({
      label: background,
      background,
      context: "on-light"
    }))}
        </div>
        <div
          style="background: #050505; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;"
        >
          \${backgrounds.map(background => createButton({
      label: \`\${background} on dark\`,
      background,
      context: "on-dark"
    }))}
        </div>
      </div>
    \`;
  }
}`,...g.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      \${createButton({
    label: "Download presets",
    showIconStart: true,
    iconStart: downloadIconHtml,
    showIconEnd: true
  })}
      \${createButton({
    intent: "accent",
    background: "solid",
    showIconStart: true,
    iconStart: folderIconHtml,
    label: "Save to library"
  })}
    </div>
  \`
}`,...u.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const states = ["default", "hover", "active", "focus", "disabled"];
    return html\`
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        \${states.map(state => createButton({
      label: state,
      state,
      context: "on-light",
      background: "solid"
    }))}
      </div>
    \`;
  }
}`,...b.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "Backdrop blur (outlined & transparent)",
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
    label: "outlined on-light",
    background: "outlined",
    context: "on-light"
  })}
      \${createButton({
    label: "outlined on-dark",
    background: "outlined",
    context: "on-dark"
  })}
      \${createButton({
    label: "transparent on-light",
    background: "transparent",
    context: "on-light"
  })}
      \${createButton({
    label: "transparent on-dark",
    background: "transparent",
    context: "on-dark"
  })}
    </div>
  \`
}`,...h.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const backgrounds = ["solid", "outlined", "transparent"];
    const contexts = ["on-light", "on-dark"];
    const sizes = ["md", "xs"];
    const states = ["default", "hover", "active", "focus", "disabled"];
    return html\`
      <div style="display: grid; gap: 28px;">
        \${contexts.map(context => html\`
            <section
              style=\${context === "on-dark" ? "background:#050505;color:#fff;padding:24px;border-radius:24px;" : "background:#fff;color:#000;padding:24px;border:1px solid rgba(0,0,0,0.08);border-radius:24px;"}
            >
              <h3 style="margin:0 0 var(--s2a-spacing-md);font-family:var(--s2a-font-family-label);font-size:var(--s2a-font-size-md);font-weight:var(--s2a-font-weight-label);line-height:var(--s2a-typography-line-height-label);letter-spacing:var(--s2a-typography-letter-spacing-label);">\${context}</h3>
              <div style="display:grid;gap:20px;">
                \${backgrounds.map(background => html\`
                    <div style="display:grid;gap:12px;">
                      <strong style="font-family:var(--s2a-font-family-label);font-size:var(--s2a-typography-font-size-label);font-weight:var(--s2a-font-weight-label);line-height:var(--s2a-typography-line-height-label);letter-spacing:var(--s2a-typography-letter-spacing-label);text-transform:capitalize;"
                        >\${background}</strong
                      >
                      \${sizes.map(size => html\`
                          <div
                            style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;"
                          >
                            \${states.map(state => createButton({
      label: \`\${size} \${state}\`,
      background,
      context,
      size,
      state
    }))}
                          </div>
                        \`)}
                    </div>
                  \`)}
              </div>
            </section>
          \`)}
      </div>
    \`;
  }
}`,...m.parameters?.docs?.source}}};const L=["Solid","Outlined","Transparent","Disabled","Accent","Sizes","ContextGrid","IconSlots","ForcedStates","BackdropBlur","PrimaryMatrix"];export{c as Accent,h as BackdropBlur,g as ContextGrid,d as Disabled,b as ForcedStates,u as IconSlots,l as Outlined,m as PrimaryMatrix,p as Sizes,s as Solid,i as Transparent,L as __namedExportsOrder,E as default};
