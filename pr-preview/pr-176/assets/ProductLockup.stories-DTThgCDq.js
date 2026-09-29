import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";import{n as r}from"./app-icon-kJOUm1g_.js";import{t as i}from"./AppIcon-BgmWtDpL.js";import{n as a,t as o}from"./product-lockup-drfgdkTx.js";function s(){return(s=e((()=>{a()})))()}function c(){return(c=e((()=>{s()})))()}var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{n(),c(),i(),l=r.map(e=>e.slug),u=e=>{if(e!=null&&e!==`auto`)return e},d=(e,t={})=>{let n={...e,...t},r=u(n.iconSize);return r?n.iconSize=r:delete n.iconSize,o(n)},f={title:`Molecules/ProductLockup`,tags:[`autodocs`],render:e=>d(e),parameters:{docs:{description:{component:`<p><strong>v2</strong> — the v1 Context axis is retired; theme flows from variable modes and surface treatment is the <code>styleVariant</code> prop (<code>label · eyebrow · knockout · inverse</code>). App icon + label identifier used across RouterMarquee, hero tiles, and feature lists. Icons come from the AppIcon CDN (see <code>docs/component-audit/app-icons.md</code> for slug ↔︎ SVG mapping).</p>`},source:{language:`html`,code:`<!-- Horizontal (default) — used in RouterMarquee nav strip and MediaCard -->
<div class="c-product-lockup" data-orientation="horizontal" data-style="label" data-width="hug">
  <span class="c-product-lockup__icon" aria-hidden="true">
    <span class="c-app-icon" data-size="md">…</span>
  </span>
  <span class="c-product-lockup__label">Adobe Photoshop</span>
  <span class="c-product-lockup__caret" aria-hidden="true">…</span>
</div>

<!-- Vertical — used in RouterNavItem block tiles -->
<div class="c-product-lockup" data-orientation="vertical" data-style="knockout" data-width="fill">
  <span class="c-product-lockup__icon" aria-hidden="true">
    <span class="c-app-icon" data-size="md">…</span>
  </span>
  <span class="c-product-lockup__label-row">
    <span class="c-product-lockup__label">Adobe Photoshop</span>
    <span class="c-product-lockup__caret" aria-hidden="true">…</span>
  </span>
</div>`}}},argTypes:{label:{control:`text`,description:`Product name text`},app:{control:{type:`select`},options:l,description:`AppIcon slug`},orientation:{control:{type:`select`},options:[`horizontal`,`vertical`],description:`Layout axis`},styleVariant:{name:`styleVariant`,control:{type:`select`},options:[`label`,`eyebrow`,`knockout`,`inverse`],description:`Typography style`},width:{control:{type:`select`},options:[`hug`,`fill`],description:`Layout width — "fill" lets the label truncate within its container`},showIconStart:{control:`boolean`,description:`Toggle the leading AppIcon (matches Figma prop)`},showIconEnd:{control:`boolean`,description:`Toggle the caret (horizontal only)`},iconSize:{control:{type:`select`},options:[`auto`,`xs`,`sm`,`md`,`lg`],description:`Icon size override (auto defaults to the matt-atoms 24px tile)`}},args:{label:`Adobe Experience Cloud`,app:`experience-cloud`,orientation:`horizontal`,styleVariant:`label`,width:`hug`,showIconStart:!0,showIconEnd:!0,iconSize:`auto`}},p={},m={args:{label:`Workflow automation`,styleVariant:`eyebrow`}},h={render:e=>t`
    <div style="background: #f3f3f3; padding: 24px; width: 320px;">
      ${d(e,{width:`fill`})}
    </div>
  `},g={render:e=>t`
    <div style="background: #050505; padding: 24px; display: inline-flex;">
      ${d(e,{styleVariant:`knockout`})}
    </div>
  `},_={render:e=>t`
    <div style="border: 1px dashed #ccc; padding: 24px; display: inline-flex;">
      ${d(e,{styleVariant:`inverse`})}
    </div>
  `},v={args:{orientation:`vertical`,width:`hug`,label:`Creative tools`}},y={args:{orientation:`vertical`,styleVariant:`eyebrow`,label:`Customer journeys`}},b={args:{showIconStart:!1,label:`Premium features`}},x={args:{showIconEnd:!1}},S={render:e=>t`
      <div
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px;"
      >
        ${[{label:`Inline label`,orientation:`horizontal`,styleVariant:`label`},{label:`Inline eyebrow`,orientation:`horizontal`,styleVariant:`eyebrow`},{label:`Vertical label`,orientation:`vertical`,styleVariant:`label`},{label:`Vertical eyebrow`,orientation:`vertical`,styleVariant:`eyebrow`},{label:`Inline inverse`,orientation:`horizontal`,styleVariant:`inverse`}].map(n=>t`
            <div
              style="padding: 16px; border: 1px solid #e1e1e1; border-radius: 12px; background: #fff; min-height: 96px;"
            >
              ${d(e,{...n,width:`fill`})}
            </div>
          `)}
      </div>
    `},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Workflow automation",
    styleVariant: "eyebrow"
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="background: #f3f3f3; padding: 24px; width: 320px;">
      \${renderLockup(args, {
    width: "fill"
  })}
    </div>
  \`
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="background: #050505; padding: 24px; display: inline-flex;">
      \${renderLockup(args, {
    styleVariant: "knockout"
  })}
    </div>
  \`
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="border: 1px dashed #ccc; padding: 24px; display: inline-flex;">
      \${renderLockup(args, {
    styleVariant: "inverse"
  })}
    </div>
  \`
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical",
    width: "hug",
    label: "Creative tools"
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical",
    styleVariant: "eyebrow",
    label: "Customer journeys"
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    showIconStart: false,
    label: "Premium features"
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    showIconEnd: false
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const combos = [{
      label: "Inline label",
      orientation: "horizontal",
      styleVariant: "label"
    }, {
      label: "Inline eyebrow",
      orientation: "horizontal",
      styleVariant: "eyebrow"
    }, {
      label: "Vertical label",
      orientation: "vertical",
      styleVariant: "label"
    }, {
      label: "Vertical eyebrow",
      orientation: "vertical",
      styleVariant: "eyebrow"
    }, {
      label: "Inline inverse",
      orientation: "horizontal",
      styleVariant: "inverse"
    }];
    return html\`
      <div
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px;"
      >
        \${combos.map(combo => html\`
            <div
              style="padding: 16px; border: 1px solid #e1e1e1; border-radius: 12px; background: #fff; min-height: 96px;"
            >
              \${renderLockup(args, {
      ...combo,
      width: "fill"
    })}
            </div>
          \`)}
      </div>
    \`;
  }
}`,...S.parameters?.docs?.source}}},C=[`HorizontalLabel`,`HorizontalEyebrow`,`HorizontalFill`,`Knockout`,`Inverse`,`VerticalLabel`,`VerticalEyebrow`,`LabelOnly`,`NoCaret`,`AllVariants`]})))()}w();export{S as AllVariants,m as HorizontalEyebrow,h as HorizontalFill,p as HorizontalLabel,_ as Inverse,g as Knockout,b as LabelOnly,x as NoCaret,y as VerticalEyebrow,v as VerticalLabel,C as __namedExportsOrder,f as default};