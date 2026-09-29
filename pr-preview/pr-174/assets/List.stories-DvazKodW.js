import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";import{n as r,t as i}from"./List-YbW0dv4g.js";var a,o,s,c,l,u;function d(){return(d=e((()=>{n(),i(),a=t`
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M4 2.5h8.5L16 6v11.5H4V2.5z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <path d="M12.5 2.5V6H16" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
  </svg>
`,o={title:`Molecules/List`,tags:[`autodocs`],render:e=>r(e),parameters:{layout:`padded`,docs:{description:{component:"\nStacked feature sections — each with an optional divider, an icon + bold title\nrow, and an indented list of supporting items. Used inside MerchCard to show\nwhat's included in a plan.\n\nItems render as native `<ul>/<li>`. Section icons are decorative (20×20,\n`aria-hidden`). Matches Figma components `List` / `ListItem` /\n`MerchCard/FeatureSection`.\n        "},source:{language:`html`,code:`<div class="c-list">
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
</div>`}}},argTypes:{sections:{control:`object`,description:`Section descriptors`}}},s={args:{sections:[{title:`Section title`,icon:a,divider:!0,items:[`Feature item 1`,`Feature item 2`,`Feature item 3`,`Feature item 4`]}]}},c={args:{sections:[{title:`Edit and organize`,icon:a,divider:!1,items:[`Edit text and images`,`Organize pages`,`Compress PDFs`]},{title:`Share and sign`,icon:a,divider:!0,items:[`Request e-signatures`,`Share for review`,`Track responses`]}]}},l={args:{sections:[{title:`What's included`,divider:!1,items:[`Feature item 1`,`Feature item 2`,`Feature item 3`]}]}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    sections: [{
      title: "Section title",
      icon: pdfIcon,
      divider: true,
      items: ["Feature item 1", "Feature item 2", "Feature item 3", "Feature item 4"]
    }]
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    sections: [{
      title: "What's included",
      divider: false,
      items: ["Feature item 1", "Feature item 2", "Feature item 3"]
    }]
  }
}`,...l.parameters?.docs?.source}}},u=[`SingleSection`,`MultipleSections`,`NoIcons`]})))()}d();export{c as MultipleSections,l as NoIcons,s as SingleSection,u as __namedExportsOrder,o as default};