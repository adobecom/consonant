import{x as n}from"./iframe-BflPEsqq.js";import{L as a}from"./list-Co4gD27p.js";import"./preload-helper-_BreFF6B.js";const s=n`
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M4 2.5h8.5L16 6v11.5H4V2.5z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <path d="M12.5 2.5V6H16" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
  </svg>
`,l={title:"Molecules/List",tags:["autodocs"],render:r=>a(r),parameters:{layout:"padded",docs:{description:{component:"\nStacked feature sections — each with an optional divider, an icon + bold title\nrow, and an indented list of supporting items. Used inside MerchCard to show\nwhat's included in a plan.\n\nItems render as native `<ul>/<li>`. Section icons are decorative (20×20,\n`aria-hidden`). Matches Figma components `List` / `ListItem` /\n`MerchCard/FeatureSection`.\n        "},source:{language:"html",code:`<div class="c-list">
  <section class="c-list__section">
    <hr class="c-list__divider" />
    <div class="c-list__title">
      <span class="c-list__icon" aria-hidden="true">…</span>
      <span class="c-list__title-text">Section title</span>
    </div>
    <ul class="c-list__items">
      <li class="c-list__item">Feature item 1</li>
    </ul>
  </section>
</div>`}}},argTypes:{sections:{control:"object",description:"Section descriptors"}}},e={args:{sections:[{title:"Section title",icon:s,divider:!0,items:["Feature item 1","Feature item 2","Feature item 3","Feature item 4"]}]}},t={args:{sections:[{title:"Edit and organize",icon:s,divider:!1,items:["Edit text and images","Organize pages","Compress PDFs"]},{title:"Share and sign",icon:s,divider:!0,items:["Request e-signatures","Share for review","Track responses"]}]}},i={args:{sections:[{title:"What's included",divider:!1,items:["Feature item 1","Feature item 2","Feature item 3"]}]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    sections: [{
      title: "Section title",
      icon: pdfIcon,
      divider: true,
      items: ["Feature item 1", "Feature item 2", "Feature item 3", "Feature item 4"]
    }]
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    sections: [{
      title: "Edit and organize",
      icon: pdfIcon,
      divider: false,
      items: ["Edit text and images", "Organize pages", "Compress PDFs"]
    }, {
      title: "Share and sign",
      icon: pdfIcon,
      divider: true,
      items: ["Request e-signatures", "Share for review", "Track responses"]
    }]
  }
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    sections: [{
      title: "What's included",
      divider: false,
      items: ["Feature item 1", "Feature item 2", "Feature item 3"]
    }]
  }
}`,...i.parameters?.docs?.source}}};const m=["SingleSection","MultipleSections","NoIcons"];export{t as MultipleSections,i as NoIcons,e as SingleSection,m as __namedExportsOrder,l as default};
