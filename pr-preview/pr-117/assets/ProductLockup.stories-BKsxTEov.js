import{x as p}from"./iframe-Binz0n9K.js";import{P as g}from"./product-lockup-S866WuV0.js";import{b as h}from"./app-icon-7wHdwwKb.js";import"./preload-helper-DWKaJUPY.js";import"./unsafe-html-ClbnpE8W.js";import"./directive-DoeGSK_T.js";import"./chevron-right-CnbUzkxe.js";const y=h.map(e=>e.slug),f=e=>{if(!(e==null||e==="auto"))return e},u=(e,m={})=>{const o={...e,...m},b=f(o.iconSize);return b?o.iconSize=b:delete o.iconSize,g(o)},I={title:"Atoms/ProductLockup",tags:["autodocs"],render:e=>u(e),parameters:{docs:{description:{component:"<p>App icon + label identifier used across RouterMarquee, hero tiles, and feature lists. Icons come from the AppIcon CDN (see <code>docs/component-audit/app-icons.md</code> for slug ↔︎ SVG mapping).</p>"},source:{language:"html",code:`<!-- Horizontal (default) — used in RouterMarquee nav strip and MediaCard -->
<div class="c-product-lockup" data-orientation="horizontal" data-style="label" data-context="on-light" data-width="hug">
  <span class="c-product-lockup__icon" aria-hidden="true">
    <span class="c-app-icon" data-size="md">…</span>
  </span>
  <span class="c-product-lockup__label">Adobe Photoshop</span>
  <span class="c-product-lockup__caret" aria-hidden="true">…</span>
</div>

<!-- Vertical — used in RouterNavItem block tiles -->
<div class="c-product-lockup" data-orientation="vertical" data-style="label" data-context="on-dark" data-width="fill">
  <span class="c-product-lockup__icon" aria-hidden="true">
    <span class="c-app-icon" data-size="md">…</span>
  </span>
  <span class="c-product-lockup__label-row">
    <span class="c-product-lockup__label">Adobe Photoshop</span>
    <span class="c-product-lockup__caret" aria-hidden="true">…</span>
  </span>
</div>`}}},argTypes:{label:{control:"text",description:"Product name text"},app:{control:{type:"select"},options:y,description:"AppIcon slug"},orientation:{control:{type:"select"},options:["horizontal","vertical"],description:"Layout axis"},styleVariant:{name:"styleVariant",control:{type:"select"},options:["label","eyebrow"],description:"Typography style"},context:{control:{type:"select"},options:["on-light","on-dark"],description:"Surface context (controls text color)"},width:{control:{type:"select"},options:["hug","fill"],description:'Layout width — "fill" lets the label truncate within its container'},showIconStart:{control:"boolean",description:"Toggle the leading AppIcon (matches Figma prop)"},showIconEnd:{control:"boolean",description:"Toggle the caret (horizontal only)"},iconSize:{control:{type:"select"},options:["auto","xs","sm","md","lg"],description:"Icon size override (auto defaults to the matt-atoms 24px tile)"}},args:{label:"Adobe Experience Cloud",app:"experience-cloud",orientation:"horizontal",styleVariant:"label",context:"on-light",width:"hug",showIconStart:!0,showIconEnd:!0,iconSize:"auto"}},a={},r={args:{label:"Workflow automation",styleVariant:"eyebrow"}},t={render:e=>p`
    <div style="background: #f3f3f3; padding: 24px; width: 320px;">
      ${u(e,{width:"fill"})}
    </div>
  `},n={render:e=>p`
    <div style="background: #050505; padding: 24px; display: inline-flex;">
      ${u(e,{context:"on-dark"})}
    </div>
  `},s={args:{orientation:"vertical",width:"hug",label:"Creative tools"}},i={args:{orientation:"vertical",styleVariant:"eyebrow",label:"Customer journeys"}},l={args:{showIconStart:!1,label:"Premium features"}},c={args:{showIconEnd:!1}},d={render:e=>p`
      <div
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px;"
      >
        ${[{label:"Inline label",orientation:"horizontal",styleVariant:"label"},{label:"Inline eyebrow",orientation:"horizontal",styleVariant:"eyebrow"},{label:"Vertical label",orientation:"vertical",styleVariant:"label"},{label:"Vertical eyebrow",orientation:"vertical",styleVariant:"eyebrow"}].map(o=>p`
            <div
              style="padding: 16px; border: 1px solid #e1e1e1; border-radius: 12px; background: #fff; min-height: 96px;"
            >
              ${u(e,{...o,width:"fill"})}
            </div>
          `)}
      </div>
    `};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Workflow automation",
    styleVariant: "eyebrow"
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="background: #f3f3f3; padding: 24px; width: 320px;">
      \${renderLockup(args, {
    width: "fill"
  })}
    </div>
  \`
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="background: #050505; padding: 24px; display: inline-flex;">
      \${renderLockup(args, {
    context: "on-dark"
  })}
    </div>
  \`
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical",
    width: "hug",
    label: "Creative tools"
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical",
    styleVariant: "eyebrow",
    label: "Customer journeys"
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    showIconStart: false,
    label: "Premium features"
  }
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    showIconEnd: false
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};const _=["HorizontalLabel","HorizontalEyebrow","HorizontalFill","KnockoutOnDark","VerticalLabel","VerticalEyebrow","LabelOnly","NoCaret","AllVariants"];export{d as AllVariants,r as HorizontalEyebrow,t as HorizontalFill,a as HorizontalLabel,n as KnockoutOnDark,l as LabelOnly,c as NoCaret,i as VerticalEyebrow,s as VerticalLabel,_ as __namedExportsOrder,I as default};
