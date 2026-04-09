import{x as r}from"./iframe-X0CzthNh.js";import{B as e}from"./button-B2EmgZy9.js";import{t as c,I as m,s as f,o as k}from"./define-element-COK58XN7.js";import"./preload-helper-kk50mwSr.js";const w=`.c-button {
  --c-button-padding-y-base: var(--s2a-spacing-sm, 12px);
  --c-button-padding-x-base: var(--s2a-spacing-lg, 24px);
  --c-button-gap: var(--s2a-spacing-xs, 8px);
  --c-button-border-width: 0px;
  --c-button-radius: var(--s2a-border-radius-round, 999px);
  --c-button-focus-inner: var(--s2a-color-background-default, #ffffff);
  --c-button-focus-outer: var(--s2a-color-focus-ring-default, #1473e6);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--c-button-gap);
  min-width: 0;
  box-sizing: border-box;
  padding: calc(var(--c-button-padding-y-base) - var(--c-button-border-width))
    calc(var(--c-button-padding-x-base) - var(--c-button-border-width));
  border: var(--c-button-border-width) solid transparent;
  border-radius: var(--c-button-radius);
  background-color: transparent;
  color: var(--s2a-color-content-default, #000000);
  font-family: var(--s2a-font-family-default, "adobe-clean-display", "Adobe Clean", sans-serif);
  font-weight: var(--s2a-font-weight-adobe-clean-bold, 700);
  font-size: var(--s2a-font-size-sm, 14px);
  line-height: var(--s2a-font-line-height-2xs, 1.142857);
  letter-spacing: 0;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease,
    box-shadow 200ms ease, opacity 120ms ease;
  position: relative;
}

.c-button[data-size="xs"] {
  --c-button-padding-y-base: var(--s2a-spacing-2xs, 4px);
  --c-button-padding-x-base: var(--s2a-spacing-sm, 12px);
  --c-button-gap: var(--s2a-spacing-2xs, 4px);
}

.c-button[data-context="on-dark"] {
  --c-button-focus-inner: var(--s2a-color-background-knockout, #000000);
}

.c-button[data-context="on-dark"][data-background="solid"] {
  --c-button-focus-inner: var(--s2a-color-background-default, #ffffff);
}

.c-button:disabled,
.c-button[data-force-state="disabled"] {
  opacity: var(--s2a-opacity-disabled, 0.48);
  cursor: not-allowed;
  pointer-events: none;
}

.c-button__label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.c-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: inherit;
  color: currentColor;
}

.c-button[data-size="xs"] .c-button__icon {
  font-size: var(--s2a-font-size-xs, 12px);
}

.c-button:is(:focus-visible, [data-force-state="focus"]) {
  outline: none;
  box-shadow:
    0 0 0 var(--s2a-spacing-3xs, 2px) var(--c-button-focus-inner),
    0 0 0 var(--s2a-spacing-2xs, 4px) var(--c-button-focus-outer);
}

/* ---------- Primary · solid ---------- */

.c-button[data-intent="primary"][data-background="solid"][data-context="on-light"] {
  background-color: var(
    --s2a-color-button-background-primary-solid-on-light-default,
    var(--s2a-color-background-knockout, #000000)
  );
  color: var(
    --s2a-color-button-content-primary-solid-default,
    var(--s2a-color-content-knockout, #ffffff)
  );
}

.c-button[data-intent="primary"][data-background="solid"][data-context="on-light"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-button-background-primary-solid-on-light-hover,
    var(--s2a-color-gray-900, #131313)
  ); /* Primitive: hover fallback until semantic token ships */
}

.c-button[data-intent="primary"][data-background="solid"][data-context="on-light"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-button-background-primary-solid-on-light-active,
    var(--s2a-color-gray-800, #292929)
  ); /* Primitive: active fallback until semantic token ships */
}

.c-button[data-intent="primary"][data-background="solid"][data-context="on-dark"] {
  background-color: var(
    --s2a-color-button-background-primary-solid-on-dark-default,
    var(--s2a-color-background-default, #ffffff)
  );
  color: var(
    --s2a-color-button-content-primary-solid-inverse,
    var(--s2a-color-content-default, #000000)
  );
}

.c-button[data-intent="primary"][data-background="solid"][data-context="on-dark"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-button-background-primary-solid-on-dark-hover,
    var(--s2a-color-background-subtle, #f3f3f3)
  );
}

.c-button[data-intent="primary"][data-background="solid"][data-context="on-dark"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-button-background-primary-solid-on-dark-active,
    var(--s2a-color-gray-200, #e1e1e1)
  );
}

/* ---------- Primary · outlined ---------- */

.c-button[data-intent="primary"][data-background="outlined"] {
  --c-button-border-width: var(--s2a-border-width-sm, 1px);
}

.c-button[data-intent="primary"][data-background="outlined"][data-context="on-light"] {
  border-color: var(
    --s2a-color-button-border-primary-outlined-default,
    var(--s2a-color-content-default, #000000)
  );
  color: var(
    --s2a-color-button-content-primary-outlined-default,
    var(--s2a-color-content-default, #000000)
  );
}

.c-button[data-intent="primary"][data-background="outlined"][data-context="on-light"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-button-background-primary-outlined-on-light-hover,
    var(--s2a-color-transparent-black-08, rgba(0, 0, 0, 0.08))
  );
}

.c-button[data-intent="primary"][data-background="outlined"][data-context="on-light"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-button-background-primary-outlined-on-light-active,
    var(--s2a-color-transparent-black-12, rgba(0, 0, 0, 0.12))
  );
}

.c-button[data-intent="primary"][data-background="outlined"][data-context="on-dark"] {
  border-color: var(
    --s2a-color-button-border-primary-outlined-on-dark,
    var(--s2a-color-content-knockout, #ffffff)
  );
  color: var(
    --s2a-color-button-content-primary-outlined-knockout,
    var(--s2a-color-content-knockout, #ffffff)
  );
}

.c-button[data-intent="primary"][data-background="outlined"][data-context="on-dark"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-button-background-primary-outlined-on-dark-hover,
    var(--s2a-color-transparent-white-08, rgba(255, 255, 255, 0.08))
  );
}

.c-button[data-intent="primary"][data-background="outlined"][data-context="on-dark"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-button-background-primary-outlined-on-dark-active,
    var(--s2a-color-transparent-white-12, rgba(255, 255, 255, 0.12))
  );
}

/* ---------- Primary · transparent ---------- */

.c-button[data-intent="primary"][data-background="transparent"][data-context="on-light"] {
  color: var(
    --s2a-color-button-content-primary-transparent-default,
    var(--s2a-color-content-default, #000000)
  );
}

.c-button[data-intent="primary"][data-background="transparent"][data-context="on-light"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-button-background-primary-transparent-hover,
    var(--s2a-color-transparent-black-08, rgba(0, 0, 0, 0.08))
  );
}

.c-button[data-intent="primary"][data-background="transparent"][data-context="on-light"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-button-background-primary-transparent-active,
    var(--s2a-color-transparent-black-12, rgba(0, 0, 0, 0.12))
  );
}

.c-button[data-intent="primary"][data-background="transparent"][data-context="on-dark"] {
  color: var(
    --s2a-color-button-content-primary-transparent-knockout,
    var(--s2a-color-content-knockout, #ffffff)
  );
}

.c-button[data-intent="primary"][data-background="transparent"][data-context="on-dark"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-button-background-primary-transparent-on-dark-hover,
    var(--s2a-color-transparent-white-08, rgba(255, 255, 255, 0.08))
  );
}

.c-button[data-intent="primary"][data-background="transparent"][data-context="on-dark"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-button-background-primary-transparent-on-dark-active,
    var(--s2a-color-transparent-white-12, rgba(255, 255, 255, 0.12))
  );
}

/* ---------- Accent · solid (on-light only) ---------- */

.c-button[data-intent="accent"][data-background="solid"] {
  background-color: var(
    --s2a-color-button-background-accent-solid-on-light-default,
    var(--s2a-color-blue-900, #3b63fb)
  ); /* Primitive: accent default fallback until semantic token exports */
  color: var(
    --s2a-color-button-content-primary-solid-default,
    var(--s2a-color-content-knockout, #ffffff)
  );
}

.c-button[data-intent="accent"][data-background="solid"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-button-background-accent-solid-on-light-hover,
    var(--s2a-color-blue-1000, #294de9)
  ); /* Primitive: accent hover fallback until semantic token exports */
}

.c-button[data-intent="accent"][data-background="solid"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-button-background-accent-solid-on-light-active,
    var(--s2a-color-blue-1100, #1d3ecf)
  ); /* Primitive: accent active fallback until semantic token exports */
}
`,S=({width:n=24,height:t=24,hidden:a=!1,title:o="Download"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${n}"
    height="${t}"
    viewBox="0 0 20 20"
    aria-hidden=${a?"true":"false"}
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
  </svg>`,$=({width:n=24,height:t=24,hidden:a=!1,title:o="Save To"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${t}"
    viewBox="0 0 36 36"
    width="${n}"
    aria-hidden=${a?"true":"false"}
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
  </svg>`;class I extends m{render(){return f(r),this.spectrumVersion===2?S({hidden:!this.label,title:this.label}):$({hidden:!this.label,title:this.label})}}k("sp-icon-download",I);const C=({width:n=24,height:t=24,hidden:a=!1,title:o="Folder"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${n}"
    height="${t}"
    viewBox="0 0 20 20"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${o}"
  >
    <path
      d="m16.75,5h-5.96387c-.21777,0-.42383-.09473-.56689-.25879l-1.70361-1.96484c-.42773-.49316-1.04736-.77637-1.7002-.77637h-3.56543c-1.24072,0-2.25,1.00977-2.25,2.25v10.5c0,1.24023,1.00928,2.25,2.25,2.25h13.5c1.24072,0,2.25-1.00977,2.25-2.25v-7.5c0-1.24023-1.00928-2.25-2.25-2.25ZM3.25,3.5h3.56543c.21777,0,.42383.09473.56689.25879l1.07617,1.24121H2.5v-.75c0-.41309.33643-.75.75-.75Zm14.25,11.25c0,.41309-.33643.75-.75.75H3.25c-.41357,0-.75-.33691-.75-.75V6.5h14.25c.41357,0,.75.33691.75.75v7.5Z"
      fill="currentColor"
    />
  </svg>`,_=({width:n=24,height:t=24,hidden:a=!1,title:o="Folder Outline"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${t}"
    viewBox="0 0 36 36"
    width="${n}"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${o}"
  >
    <path
      d="m33 8-14.331.008-3.3-3.4A2 2 0 0 0 13.929 4H4a2 2 0 0 0-2 2v23a1 1 0 0 0 1 1h30a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1Zm-1 20H4V10h28Z"
    />
  </svg>`;class D extends m{render(){return f(r),this.spectrumVersion===2?C({hidden:!this.label,title:this.label}):_({hidden:!this.label,title:this.label})}}k("sp-icon-folder",D);const B=({width:n=24,height:t=24,hidden:a=!1,title:o="Chevron Down"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${n}"
    height="${t}"
    viewBox="0 0 20 20"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${o}"
  >
    <path
      d="M3.75488,7.24316c.28711-.29883.76172-.3086,1.05957-.02051l5.18359,4.98633,5.19727-4.99902c.29785-.28808.77246-.27832,1.05957.02051.28711.29687.27832.77246-.02051,1.05957l-5.7168,5.5c-.29004.28027-.74902.28027-1.03906,0l-5.70312-5.4873c-.15332-.14649-.23047-.34375-.23047-.54004,0-.18751.06934-.37501.20996-.51954Z"
      fill="currentColor"
    />
  </svg>`,z=({width:n=24,height:t=24,hidden:a=!1,title:o="Chevron Down"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${t}"
    viewBox="0 0 36 36"
    width="${n}"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${o}"
  >
    <path
      d="M8 14.02a2 2 0 0 1 3.411-1.411l6.578 6.572 6.578-6.572a2 2 0 0 1 2.874 2.773l-.049.049-7.992 7.984a2 2 0 0 1-2.825 0l-7.989-7.983A1.989 1.989 0 0 1 8 14.02Z"
    />
  </svg>`;class E extends m{render(){return f(r),this.spectrumVersion===2?B({hidden:!this.label,title:this.label}):z({hidden:!this.label,title:this.label})}}k("sp-icon-chevron-down",E);const{fn:F}=__STORYBOOK_MODULE_TEST__,x="width:12px;height:12px;display:inline-flex;align-items:center;justify-content:center;",T=()=>r`<sp-icon-download aria-hidden="true" style="${x}"></sp-icon-download>`,Z=()=>r`<sp-icon-folder aria-hidden="true" style="${x}"></sp-icon-folder>`,y=()=>r`<sp-icon-chevron-down aria-hidden="true" style="${x}"></sp-icon-chevron-down>`,P={title:"Components/Button",tags:["autodocs"],render:n=>e(n),parameters:{docs:{description:{component:`
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
<details class="doc-pattern doc-collapse">
  <summary>Preferred · Data-attribute HTML structure <span>Recommended</span></summary>
  <div class="doc-body">
    <p>Mimic the exact Figma variant axes using <code>data-*</code> attributes. Icon slots are optional.</p>

\`\`\`html
<button
  class="c-button"
  data-intent="primary"
  data-background="solid"
  data-context="on-light"
  data-size="md"
  data-has-icon-start="true"
  data-has-icon-end="true"
>
  <span class="c-button__icon c-button__icon--start" aria-hidden="true">
    <sp-icon-download style="width:12px;height:12px" aria-hidden="true"></sp-icon-download>
  </span>
  <span class="c-button__label">Download presets</span>
  <span class="c-button__icon c-button__icon--end" aria-hidden="true">
    <sp-icon-chevron-down style="width:12px;height:12px" aria-hidden="true"></sp-icon-chevron-down>
  </span>
</button>
\`\`\`

\`\`\`css
.c-button[data-background="solid"][data-context="on-light"] {
  background-color: var(--s2a-color-button-background-primary-solid-on-light-default);
  color: var(--s2a-color-button-content-primary-solid-default);
}

.c-button[data-background="outlined"][data-context="on-dark"] {
  border: var(--s2a-border-width-sm) solid var(--s2a-color-button-border-primary-outlined-on-dark);
  color: var(--s2a-color-button-content-primary-outlined-knockout);
}

.c-button[data-intent="accent"][data-background="solid"] {
  background-color: var(--s2a-color-button-background-accent-solid-on-light-default);
  color: var(--s2a-color-button-content-primary-solid-default);
}
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Alternative · BEM / utility classes <span>Class-based</span></summary>
  <div class="doc-body">
    <p>Useful when the consuming stack already embraces class composition. Keep aliases 1:1 with the variant axes.</p>

\`\`\`html
<button class="c-button c-button--solid c-button--on-light c-button--md">
  Learn more
</button>

<button class="c-button c-button--outlined c-button--on-dark c-button--md">
  See all products
</button>
\`\`\`

\`\`\`css
.c-button--solid.c-button--on-light {
  background-color: var(--s2a-color-button-background-primary-solid-on-light-default);
  color: var(--s2a-color-button-content-primary-solid-default);
}

.c-button--outlined.c-button--on-dark {
  border: var(--s2a-border-width-sm) solid var(--s2a-color-button-border-primary-outlined-on-dark);
  color: var(--s2a-color-button-content-primary-outlined-knockout);
}

.c-button--accent.c-button--solid {
  background-color: var(--s2a-color-button-background-accent-solid-on-light-default);
  color: var(--s2a-color-button-content-primary-solid-default);
}
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Full CSS reference <span>Source of truth</span></summary>
  <div class="doc-body">
    <p>This is the exact stylesheet shipped in <code>packages/components/src/button/button.css</code>.</p>

\`\`\`css
${w}
\`\`\`
  </div>
</details>
        `}}},argTypes:{label:{control:"text",description:"Button label text"},intent:{control:{type:"select"},options:["primary","accent"],description:"Color intent (primary = core black/white, accent = blue CTA)"},context:{control:{type:"select"},options:["on-light","on-dark"],description:"Surface context the button sits on"},background:{control:{type:"select"},options:["solid","outlined","transparent"],description:"Background variant"},size:{control:{type:"select"},options:["md","xs"],description:"Size variant"},state:{control:{type:"select"},options:["default","hover","active","focus","disabled"],description:"Force a visual state for documentation"},showIconStart:{control:"boolean",description:"Show leading icon slot"},showIconEnd:{control:"boolean",description:"Show trailing icon slot (defaults to caret)"}},args:{onClick:F(),label:"Label",intent:"primary",context:"on-light",background:"solid",size:"md",state:"default",showIconStart:!1,showIconEnd:!1}},s={args:{background:"solid"}},d={args:{background:"outlined"}},i={args:{background:"transparent"}},l={args:{state:"disabled",label:"Disabled"}},u={args:{intent:"accent",background:"solid",label:"Get started"}},b={args:{background:"outlined",showIconEnd:!0,label:"Filters",iconEnd:y}},p={render:()=>r`
    <div style="display: flex; gap: 16px; align-items: center;">
      ${e({label:"Medium",size:"md",background:"solid"})}
      ${e({label:"Compact",size:"xs",background:"solid"})}
    </div>
  `},g={render:()=>{const n=["solid","outlined","transparent"];return r`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          ${n.map(t=>e({label:t,background:t,context:"on-light"}))}
        </div>
        <div style="background: #050505; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
          ${n.map(t=>e({label:`${t} on dark`,background:t,context:"on-dark"}))}
        </div>
      </div>
    `}},v={render:()=>r`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      ${e({label:"Download presets",showIconStart:!0,iconStart:T,showIconEnd:!0,iconEnd:y})}
      ${e({intent:"accent",background:"solid",showIconStart:!0,iconStart:Z,label:"Save to library"})}
    </div>
  `},h={render:()=>r`
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        ${["default","hover","active","focus","disabled"].map(t=>e({label:t,state:t,context:"on-light",background:"solid"}))}
      </div>
    `};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    background: "solid"
  }
}`,...s.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    background: "outlined"
  }
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    background: "transparent"
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    state: "disabled",
    label: "Disabled"
  }
}`,...l.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    intent: "accent",
    background: "solid",
    label: "Get started"
  }
}`,...u.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    background: "outlined",
    showIconEnd: true,
    label: "Filters",
    iconEnd: SpectrumChevronDownIcon
  }
}`,...b.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: 16px; align-items: center;">
      \${Button({
    label: "Medium",
    size: "md",
    background: "solid"
  })}
      \${Button({
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
          \${backgrounds.map(background => Button({
      label: background,
      background,
      context: "on-light"
    }))}
        </div>
        <div style="background: #050505; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
          \${backgrounds.map(background => Button({
      label: \`\${background} on dark\`,
      background,
      context: "on-dark"
    }))}
        </div>
      </div>
    \`;
  }
}`,...g.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      \${Button({
    label: "Download presets",
    showIconStart: true,
    iconStart: SpectrumDownloadIcon,
    showIconEnd: true,
    iconEnd: SpectrumChevronDownIcon
  })}
      \${Button({
    intent: "accent",
    background: "solid",
    showIconStart: true,
    iconStart: SpectrumFolderIcon,
    label: "Save to library"
  })}
    </div>
  \`
}`,...v.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const states = ["default", "hover", "active", "focus", "disabled"];
    return html\`
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        \${states.map(state => Button({
      label: state,
      state,
      context: "on-light",
      background: "solid"
    }))}
      </div>
    \`;
  }
}`,...h.parameters?.docs?.source}}};const A=["Solid","Outlined","Transparent","Disabled","Accent","Dropdown","Sizes","ContextGrid","IconSlots","ForcedStates"];export{u as Accent,g as ContextGrid,l as Disabled,b as Dropdown,h as ForcedStates,v as IconSlots,d as Outlined,p as Sizes,s as Solid,i as Transparent,A as __namedExportsOrder,P as default};
