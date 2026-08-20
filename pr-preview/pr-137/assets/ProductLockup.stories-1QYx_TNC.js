import{x as a}from"./iframe-Jwfh8MPX.js";import{P as y}from"./product-lockup-BuXk4S6R.js";import{b as h}from"./app-icon-CC8adVOX.js";import"./preload-helper-BU6q58kX.js";import"./unsafe-html-Cc2Vu3Ed.js";import"./directive-DoeGSK_T.js";import"./chevron-right-CnbUzkxe.js";const f=h.map(e=>e.slug),v=e=>{if(!(e==null||e==="auto"))return e},o=(e,b={})=>{const r={...e,...b},g=v(r.iconSize);return g?r.iconSize=g:delete r.iconSize,y(r)},_={title:"Molecules/ProductLockup",tags:["autodocs"],render:e=>o(e),parameters:{docs:{description:{component:"<p><strong>v2</strong> — the v1 Context axis is retired; theme flows from variable modes and surface treatment is the <code>styleVariant</code> prop (<code>label · eyebrow · knockout · inverse</code>). App icon + label identifier used across RouterMarquee, hero tiles, and feature lists. Icons come from the AppIcon CDN (see <code>docs/component-audit/app-icons.md</code> for slug ↔︎ SVG mapping).</p>"},source:{language:"html",code:`<!-- Horizontal (default) — used in RouterMarquee nav strip and MediaCard -->
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
</div>`}}},argTypes:{label:{control:"text",description:"Product name text"},app:{control:{type:"select"},options:f,description:"AppIcon slug"},orientation:{control:{type:"select"},options:["horizontal","vertical"],description:"Layout axis"},styleVariant:{name:"styleVariant",control:{type:"select"},options:["label","eyebrow","knockout","inverse"],description:"Typography style"},width:{control:{type:"select"},options:["hug","fill"],description:'Layout width — "fill" lets the label truncate within its container'},showIconStart:{control:"boolean",description:"Toggle the leading AppIcon (matches Figma prop)"},showIconEnd:{control:"boolean",description:"Toggle the caret (horizontal only)"},iconSize:{control:{type:"select"},options:["auto","xs","sm","md","lg"],description:"Icon size override (auto defaults to the matt-atoms 24px tile)"}},args:{label:"Adobe Experience Cloud",app:"experience-cloud",orientation:"horizontal",styleVariant:"label",width:"hug",showIconStart:!0,showIconEnd:!0,iconSize:"auto"}},t={},n={args:{label:"Workflow automation",styleVariant:"eyebrow"}},s={render:e=>a`
    <div style="background: #f3f3f3; padding: 24px; width: 320px;">
      ${o(e,{width:"fill"})}
    </div>
  `},i={render:e=>a`
    <div style="background: #050505; padding: 24px; display: inline-flex;">
      ${o(e,{styleVariant:"knockout"})}
    </div>
  `},l={render:e=>a`
    <div style="border: 1px dashed #ccc; padding: 24px; display: inline-flex;">
      ${o(e,{styleVariant:"inverse"})}
    </div>
  `},c={args:{orientation:"vertical",width:"hug",label:"Creative tools"}},d={args:{orientation:"vertical",styleVariant:"eyebrow",label:"Customer journeys"}},p={args:{showIconStart:!1,label:"Premium features"}},u={args:{showIconEnd:!1}},m={render:e=>a`
      <div
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px;"
      >
        ${[{label:"Inline label",orientation:"horizontal",styleVariant:"label"},{label:"Inline eyebrow",orientation:"horizontal",styleVariant:"eyebrow"},{label:"Vertical label",orientation:"vertical",styleVariant:"label"},{label:"Vertical eyebrow",orientation:"vertical",styleVariant:"eyebrow"},{label:"Inline inverse",orientation:"horizontal",styleVariant:"inverse"}].map(r=>a`
            <div
              style="padding: 16px; border: 1px solid #e1e1e1; border-radius: 12px; background: #fff; min-height: 96px;"
            >
              ${o(e,{...r,width:"fill"})}
            </div>
          `)}
      </div>
    `};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Workflow automation",
    styleVariant: "eyebrow"
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="background: #f3f3f3; padding: 24px; width: 320px;">
      \${renderLockup(args, {
    width: "fill"
  })}
    </div>
  \`
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="background: #050505; padding: 24px; display: inline-flex;">
      \${renderLockup(args, {
    styleVariant: "knockout"
  })}
    </div>
  \`
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="border: 1px dashed #ccc; padding: 24px; display: inline-flex;">
      \${renderLockup(args, {
    styleVariant: "inverse"
  })}
    </div>
  \`
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical",
    width: "hug",
    label: "Creative tools"
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical",
    styleVariant: "eyebrow",
    label: "Customer journeys"
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    showIconStart: false,
    label: "Premium features"
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    showIconEnd: false
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const L=["HorizontalLabel","HorizontalEyebrow","HorizontalFill","Knockout","Inverse","VerticalLabel","VerticalEyebrow","LabelOnly","NoCaret","AllVariants"];export{m as AllVariants,n as HorizontalEyebrow,s as HorizontalFill,t as HorizontalLabel,l as Inverse,i as Knockout,p as LabelOnly,u as NoCaret,d as VerticalEyebrow,c as VerticalLabel,L as __namedExportsOrder,_ as default};
