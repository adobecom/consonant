import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{n as i,t as a}from"./button-CjK_LOp6.js";import{n as o,t as s}from"./section-header-DClU8v79.js";function c(){return(c=e((()=>{o()})))()}function l(){return(l=e((()=>{c()})))()}var u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{r(),l(),i(),u=(e,r,i=!1)=>t`
  <div data-theme=${i?`dark`:n} style="
    width: 100%;
    box-sizing: border-box;
    padding: var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);
    background: ${e};
    display: flex;
    flex-direction: column;
    align-items: center;
  ">
    ${r}
  </div>
`,d={title:`Molecules/SectionHeader`,tags:[`autodocs`],render:e=>u(`var(--s2a-color-surface-default)`,s(e)),parameters:{layout:`fullscreen`,docs:{description:{component:`
Centered section-level heading block — eyebrow + heading-2 title + optional body. A thin, named wrapper around RichContent with \`justifyContent=center\` and \`measure=wide\` locked in.

**Figma:** [elastic-card-updates node 3774-4410](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=3774-4410)
        `},source:{language:`html`,code:`<div class="c-section-header">
  <div class="c-rich-content" data-density="tight" data-justify="center" data-measure="wide">
    <div class="c-rich-content__text">
      <p class="c-rich-content__eyebrow">Optimized Workflows</p>
      <h2 class="c-rich-content__title">Everything you need to make anything.</h2>
      <p class="c-rich-content__body">Bring any idea to life with industry-leading creative tools.</p>
    </div>
  </div>
</div>`}}},argTypes:{eyebrow:{control:`text`,description:`Optional eyebrow label above the title`},showEyebrow:{control:`boolean`},title:{control:`text`},body:{control:`text`,description:`Optional body paragraph below title`},showActions:{control:`boolean`}},args:{eyebrow:`Optimized Workflows`,showEyebrow:!0,title:`Everything you need to make anything.`,body:`Bring any idea to life with industry-leading creative tools, AI-powered features, and a seamless ecosystem built for every creator.`,showActions:!1}},f={name:`On Light`,render:e=>u(`var(--s2a-color-surface-default)`,s(e))},p={name:`On Dark`,render:e=>u(`var(--s2a-color-background-knockout)`,s(e),!0)},m={name:`With Actions`,render:e=>u(`var(--s2a-color-surface-default)`,s({...e,showActions:!0,actions:t`
          ${a({label:`Get started`,style:`solid`})}
          ${a({label:`Learn more`,style:`outlined`})}
        `}))},h={name:`On Dark — With Actions`,render:e=>u(`var(--s2a-color-background-knockout)`,s({...e,showActions:!0,actions:t`
          ${a({label:`Get started`,style:`knockout`})}
          ${a({label:`Learn more`,style:`outline-inverse`})}
        `}),!0)},g={name:`Title Only`,render:()=>u(`var(--s2a-color-surface-subtle)`,s({showEyebrow:!1,title:`Everything you need to make anything.`}))},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "On Light",
  render: args => section("var(--s2a-color-surface-default)", SectionHeader(args))
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "On Dark",
  render: args => section("var(--s2a-color-background-knockout)", SectionHeader(args), true)
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "With Actions",
  render: args => section("var(--s2a-color-surface-default)", SectionHeader({
    ...args,
    showActions: true,
    actions: html\`
          \${Button({
      label: "Get started",
      style: "solid"
    })}
          \${Button({
      label: "Learn more",
      style: "outlined"
    })}
        \`
  }))
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "On Dark — With Actions",
  render: args => section("var(--s2a-color-background-knockout)", SectionHeader({
    ...args,
    showActions: true,
    actions: html\`
          \${Button({
      label: "Get started",
      style: "knockout"
    })}
          \${Button({
      label: "Learn more",
      style: "outline-inverse"
    })}
        \`
  }), true)
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "Title Only",
  render: () => section("var(--s2a-color-surface-subtle)", SectionHeader({
    showEyebrow: false,
    title: "Everything you need to make anything."
  }))
}`,...g.parameters?.docs?.source}}},_=[`OnLight`,`OnDark`,`WithActions`,`OnDarkWithActions`,`TitleOnly`]})))()}v();export{p as OnDark,h as OnDarkWithActions,f as OnLight,g as TitleOnly,m as WithActions,_ as __namedExportsOrder,d as default};