import{x as p}from"./iframe-BONZzNHC.js";import{P as b}from"./product-lockup-JVL6DGNh.js";import{b as h}from"./app-icon-B6EJ1Hro.js";import"./preload-helper-ibVNIjf-.js";const y=`.c-product-lockup {
  --c-product-lockup-gap: var(--s2a-spacing-md, 16px);
  --c-product-lockup-caret-size: calc(var(--s2a-spacing-sm, 12px) / 2);
  display: inline-flex;
  align-items: center;
  gap: var(--s2a-product-lockup-gap-inline);
  color: var(--s2a-color-content-default, #000000);
  font-family: var(
    --s2a-font-family-default,
    "adobe-clean-display",
    "Adobe Clean",
    sans-serif
  );
  text-decoration: none;
}

.c-product-lockup[data-orientation="vertical"] {
  flex-direction: column;
  align-items: flex-start;
  --c-product-lockup-gap: var(--s2a-spacing-sm, 12px);
}

.c-product-lockup[data-context="on-dark"] {
  color: var(--s2a-color-content-knockout, #ffffff);
}

.c-product-lockup[data-width="fill"] {
  display: flex;
  width: 100%;
}

.c-product-lockup__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.c-product-lockup__label {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  color: inherit;
  font-weight: var(--s2a-font-weight-adobe-clean-bold, 700);
}

.c-product-lockup[data-style="label"] .c-product-lockup__label {
  font-size: var(--s2a-font-size-sm, 14px);
  line-height: var(--s2a-font-line-height-2xs, 1.285714);
  letter-spacing: 0;
}

.c-product-lockup[data-style="eyebrow"] .c-product-lockup__label {
  font-size: var(--s2a-font-size-md, 16px);
  line-height: var(--s2a-font-line-height-sm, 1.25);
  letter-spacing: -0.2px;
  /* Primitive: eyebrow tracking requires -0.2px until semantic token exists */
}

.c-product-lockup[data-orientation="horizontal"] .c-product-lockup__label {
  white-space: nowrap;
}

.c-product-lockup[data-orientation="vertical"] .c-product-lockup__label {
  display: block;
  white-space: normal;
}

.c-product-lockup[data-width="fill"] .c-product-lockup__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.c-product-lockup__caret {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
}

.c-product-lockup__caret svg {
  width: var(--c-product-lockup-caret-size);
  height: var(--c-product-lockup-caret-size);
  display: block;
}

.c-product-lockup[data-width="fill"][data-orientation="horizontal"][data-has-caret="true"]
  .c-product-lockup__caret {
  margin-left: auto;
}
`,f=h.map(e=>e.slug),k=e=>{if(!(e==null||e==="auto"))return e},u=(e,m={})=>{const o={...e,...m},g=k(o.iconSize);return g?o.iconSize=g:delete o.iconSize,b(o)},_={title:"Components/ProductLockup",tags:["autodocs"],render:e=>u(e),parameters:{docs:{description:{component:`
<style>
.doc-pattern {
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 16px;
  margin: 12px 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,248,248,0.9));
}
.doc-collapse summary {
  list-style: none;
  cursor: pointer;
  padding: 18px 24px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.doc-collapse summary::-webkit-details-marker { display: none; }
.doc-collapse summary span { color: #555; font-size: 13px; font-weight: 600; }
.doc-collapse[open] summary { border-bottom: 1px solid rgba(0,0,0,0.08); }
.doc-body { padding: 20px 24px 24px; }
.doc-body p { margin: 0 0 12px; font-size: 14px; color: #333; }
.doc-body code { font-weight: 600; }
</style>
<p>App icon + label identifier used across RouterMarquee, hero tiles, and feature lists. Icons come from the AppIcon CDN (see <code>docs/component-audit/app-icons.md</code> for slug ↔︎ SVG mapping).</p>

<details class="doc-pattern doc-collapse">
  <summary>Preferred · Data-attribute HTML structure <span>Recommended</span></summary>
  <div class="doc-body">
    <p>Use <code>data-orientation</code>, <code>data-style</code>, and <code>data-context</code> to mirror the Figma component axes. App icons render via <code>&lt;span class="c-app-icon"&gt;</code> with the CDN URL.</p>

\`\`\`html
<div
  class="c-product-lockup"
  data-orientation="horizontal"
  data-style="label"
  data-context="on-light"
  data-width="hug"
>
  <span class="c-product-lockup__icon" aria-hidden="true">
    <span class="c-app-icon" data-size="md" role="img" aria-hidden="true">
      <img
        class="c-app-icon__img"
        src="https://www.adobe.com/content/dam/shared/images/product-icons/svg/experience-cloud.svg"
        alt=""
        width="24"
        height="24"
        loading="lazy"
      />
    </span>
  </span>
  <span class="c-product-lockup__label">Adobe Experience Cloud</span>
  <span class="c-product-lockup__caret" aria-hidden="true">
    <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 1 4.25 3 2 5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </span>
</div>
\`\`\`

\`\`\`css
.c-product-lockup[data-context="on-dark"] {
  color: var(--s2a-color-content-knockout);
}

.c-product-lockup[data-style="eyebrow"] .c-product-lockup__label {
  font-size: var(--s2a-font-size-md);
  line-height: var(--s2a-font-line-height-sm);
}
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Alternative · BEM / utility classes <span>Class-based</span></summary>
  <div class="doc-body">
    <p>Utility CSS can alias each variant axis to a modifier class without nesting.</p>

\`\`\`html
<div class="c-product-lockup c-product-lockup--vertical c-product-lockup--eyebrow c-product-lockup--on-dark" data-width="fill">
  <span class="c-product-lockup__label">Customer journeys</span>
</div>
\`\`\`

\`\`\`css
.c-product-lockup--on-dark {
  color: var(--s2a-color-content-knockout);
}

.c-product-lockup--vertical {
  flex-direction: column;
  gap: var(--s2a-spacing-sm);
}
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Full CSS reference <span>Source of truth</span></summary>
  <div class="doc-body">

\`\`\`css
${y}
\`\`\`
  </div>
</details>
        `}}},argTypes:{label:{control:"text",description:"Product name text"},app:{control:{type:"select"},options:f,description:"AppIcon slug"},orientation:{control:{type:"select"},options:["horizontal","vertical"],description:"Layout axis"},styleVariant:{name:"styleVariant",control:{type:"select"},options:["label","eyebrow"],description:"Typography style"},context:{control:{type:"select"},options:["on-light","on-dark"],description:"Surface context (controls text color)"},width:{control:{type:"select"},options:["hug","fill"],description:'Layout width — "fill" lets the label truncate within its container'},showIconStart:{control:"boolean",description:"Toggle the leading AppIcon (matches Figma prop)"},showIconEnd:{control:"boolean",description:"Toggle the caret (horizontal only)"},iconSize:{control:{type:"select"},options:["auto","xs","sm","md","lg"],description:"Icon size override (auto defaults to the matt-atoms 24px tile)"}},args:{label:"Adobe Experience Cloud",app:"experience-cloud",orientation:"horizontal",styleVariant:"label",context:"on-light",width:"hug",showIconStart:!0,showIconEnd:!0,iconSize:"auto"}},t={},n={args:{label:"Workflow automation",styleVariant:"eyebrow"}},a={render:e=>p`
    <div style="background: #f3f3f3; padding: 24px; width: 320px;">
      ${u(e,{width:"fill"})}
    </div>
  `},r={render:e=>p`
    <div style="background: #050505; padding: 24px; display: inline-flex;">
      ${u(e,{context:"on-dark"})}
    </div>
  `},c={args:{orientation:"vertical",width:"hug",label:"Creative tools"}},i={args:{orientation:"vertical",styleVariant:"eyebrow",label:"Customer journeys"}},l={args:{showIconStart:!1,label:"Premium features"}},s={args:{showIconEnd:!1}},d={render:e=>p`
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
    `};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Workflow automation",
    styleVariant: "eyebrow"
  }
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="background: #f3f3f3; padding: 24px; width: 320px;">
      \${renderLockup(args, {
    width: "fill"
  })}
    </div>
  \`
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="background: #050505; padding: 24px; display: inline-flex;">
      \${renderLockup(args, {
    context: "on-dark"
  })}
    </div>
  \`
}`,...r.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical",
    width: "hug",
    label: "Creative tools"
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    showIconEnd: false
  }
}`,...s.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};const S=["HorizontalLabel","HorizontalEyebrow","HorizontalFill","KnockoutOnDark","VerticalLabel","VerticalEyebrow","LabelOnly","NoCaret","AllVariants"];export{d as AllVariants,n as HorizontalEyebrow,a as HorizontalFill,t as HorizontalLabel,r as KnockoutOnDark,l as LabelOnly,s as NoCaret,i as VerticalEyebrow,c as VerticalLabel,S as __namedExportsOrder,_ as default};
