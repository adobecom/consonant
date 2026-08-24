import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";import{n as i,t as a}from"./List-YbW0dv4g.js";var o;function s(){return(s=e((()=>{r(),o=({label:e=`See what's included:`,open:r=!1,content:i=t}={})=>n`
  <details class="c-collapsible" ?open=${r}>
    <summary class="c-collapsible__trigger">
      <span class="c-collapsible__label">${e}</span>
      <svg
        class="c-collapsible__chevron"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 7.5L10 13.5L16 7.5"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </summary>
    <div class="c-collapsible__content">${i}</div>
  </details>
`})))()}function c(){return(c=e((()=>{s()})))()}var l;function u(){return(u=e((()=>{l=`/consonant/pr-preview/pr-142/assets/elastic-card-genstudio-B4_nyhG4.jpg`})))()}var d,f,p,m,h,g,_;function v(){return(v=e((()=>{r(),c(),a(),u(),d={title:`Molecules/Collapsible`,tags:[`autodocs`],render:e=>o(e),parameters:{layout:`padded`,docs:{description:{component:`
Disclosure row with a bold label trigger and an expandable content region.
Used inside cards (e.g. MerchCard) to reveal a feature list.

Rendered as a native \`<details>/<summary>\` element — the platform provides the
expanded/collapsed semantics and keyboard interaction, and the chevron flips via
CSS on \`[open]\`. Matches Figma component set \`Collapsible\` (State=open / closed).
        `},source:{language:`html`,code:`<details class="c-collapsible">
  <summary class="c-collapsible__trigger">
    <span class="c-collapsible__label">See what's included:</span>
    <svg class="c-collapsible__chevron" aria-hidden="true">…</svg>
  </summary>
  <div class="c-collapsible__content">…</div>
</details>`}}},argTypes:{label:{control:`text`,description:`Trigger label text`},open:{control:`boolean`,description:`Whether the content starts expanded`},content:{table:{disable:!0}}},args:{label:`See what's included:`,open:!1}},f=n`
  ${i({sections:[{title:`Creative apps`,divider:!1,items:[`Photoshop`,`Illustrator`,`Premiere Pro`]}]})}
`,p={args:{open:!1,content:f}},m={args:{open:!0,content:f}},h={args:{label:`Compare plan features:`,open:!0,content:f}},g={name:`With media content`,args:{label:`See it in action:`,open:!0,content:n`
      <img
        src=${l}
        alt="GenStudio product walkthrough"
        style="width: 100%; max-width: 420px; display: block; border-radius: var(--s2a-border-radius-xs, 8px);"
      />
    `}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    open: false,
    content: sampleContent
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    content: sampleContent
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Compare plan features:",
    open: true,
    content: sampleContent
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "With media content",
  args: {
    label: "See it in action:",
    open: true,
    content: html\`
      <img
        src=\${genstudioImage}
        alt="GenStudio product walkthrough"
        style="width: 100%; max-width: 420px; display: block; border-radius: var(--s2a-border-radius-xs, 8px);"
      />
    \`
  }
}`,...g.parameters?.docs?.source}}},_=[`Closed`,`Open`,`CustomLabel`,`WithMedia`]})))()}v();export{p as Closed,h as CustomLabel,m as Open,g as WithMedia,_ as __namedExportsOrder,d as default};