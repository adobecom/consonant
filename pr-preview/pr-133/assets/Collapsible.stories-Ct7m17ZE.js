import{E as i,x as r}from"./iframe-QYXQcKw5.js";import{L as d}from"./list-Def0OCGF.js";import"./preload-helper-CalCxyei.js";const p=({label:o="See what's included:",open:l=!1,content:c=i}={})=>r`
  <details class="c-collapsible" ?open=${l}>
    <summary class="c-collapsible__trigger">
      <span class="c-collapsible__label">${o}</span>
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
    <div class="c-collapsible__content">${c}</div>
  </details>
`,m="/consonant/pr-preview/pr-133/assets/elastic-card-genstudio-B4_nyhG4.jpg",b={title:"Molecules/Collapsible",tags:["autodocs"],render:o=>p(o),parameters:{layout:"padded",docs:{description:{component:`
Disclosure row with a bold label trigger and an expandable content region.
Used inside cards (e.g. MerchCard) to reveal a feature list.

Rendered as a native \`<details>/<summary>\` element — the platform provides the
expanded/collapsed semantics and keyboard interaction, and the chevron flips via
CSS on \`[open]\`. Matches Figma component set \`Collapsible\` (State=open / closed).
        `},source:{language:"html",code:`<details class="c-collapsible">
  <summary class="c-collapsible__trigger">
    <span class="c-collapsible__label">See what's included:</span>
    <svg class="c-collapsible__chevron" aria-hidden="true">…</svg>
  </summary>
  <div class="c-collapsible__content">…</div>
</details>`}}},argTypes:{label:{control:"text",description:"Trigger label text"},open:{control:"boolean",description:"Whether the content starts expanded"},content:{table:{disable:!0}}},args:{label:"See what's included:",open:!1}},n=r`
  ${d({sections:[{title:"Creative apps",divider:!1,items:["Photoshop","Illustrator","Premiere Pro"]}]})}
`,e={args:{open:!1,content:n}},a={args:{open:!0,content:n}},s={args:{label:"Compare plan features:",open:!0,content:n}},t={name:"With media content",args:{label:"See it in action:",open:!0,content:r`
      <img
        src=${m}
        alt="GenStudio product walkthrough"
        style="width: 100%; max-width: 420px; display: block; border-radius: var(--s2a-border-radius-xs, 8px);"
      />
    `}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    open: false,
    content: sampleContent
  }
}`,...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    content: sampleContent
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Compare plan features:",
    open: true,
    content: sampleContent
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const v=["Closed","Open","CustomLabel","WithMedia"];export{e as Closed,s as CustomLabel,a as Open,t as WithMedia,v as __namedExportsOrder,b as default};
