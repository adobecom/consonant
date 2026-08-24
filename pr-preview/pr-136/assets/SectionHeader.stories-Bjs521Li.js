import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";import{n as r,t as i}from"./button-mrx1M3M1.js";import{n as a,t as o}from"./section-header-DtWLNJs_.js";function s(){return(s=e((()=>{a()})))()}function c(){return(c=e((()=>{s()})))()}var l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{n(),c(),r(),l=(e,n)=>t`
  <div style="
    width: 100%;
    box-sizing: border-box;
    padding: 80px 120px;
    background: ${e};
    display: flex;
    flex-direction: column;
    align-items: center;
  ">
    ${n}
  </div>
`,u={title:`Molecules/SectionHeader`,tags:[`autodocs`],render:e=>l(e.theme===`on-dark`?`#0f0d0c`:`#ffffff`,o(e)),parameters:{layout:`fullscreen`,docs:{description:{component:`
Centered section-level heading block — eyebrow + heading-2 title + optional body. A thin, named wrapper around RichContent with \`justifyContent=center\` and \`measure=wide\` locked in.

**Figma:** [elastic-card-updates node 3774-4410](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=3774-4410)
        `},source:{language:`html`,code:`<div class="c-section-header" data-theme="on-light">
  <div class="c-rich-content" data-theme="on-light" data-density="tight" data-justify="center" data-measure="wide">
    <div class="c-rich-content__text">
      <p class="c-rich-content__eyebrow">Optimized Workflows</p>
      <h2 class="c-rich-content__title">Everything you need to make anything.</h2>
      <p class="c-rich-content__body">Bring any idea to life with industry-leading creative tools.</p>
    </div>
  </div>
</div>`}}},argTypes:{theme:{control:{type:`select`},options:[`on-light`,`on-dark`],description:`Surface context — drives RichContent color tokens`},eyebrow:{control:`text`,description:`Optional eyebrow label above the title`},showEyebrow:{control:`boolean`},title:{control:`text`},body:{control:`text`,description:`Optional body paragraph below title`},showActions:{control:`boolean`}},args:{theme:`on-light`,eyebrow:`Optimized Workflows`,showEyebrow:!0,title:`Everything you need to make anything.`,body:`Bring any idea to life with industry-leading creative tools, AI-powered features, and a seamless ecosystem built for every creator.`,showActions:!1}},d={name:`On Light`,render:e=>l(`#ffffff`,o(e))},f={name:`On Dark`,render:e=>l(`#0f0d0c`,o({...e,theme:`on-dark`})),args:{theme:`on-dark`}},p={name:`With Actions`,render:e=>l(`#ffffff`,o({...e,showActions:!0,actions:t`
          ${i({label:`Get started`,style:`solid`})}
          ${i({label:`Learn more`,style:`outlined`})}
        `}))},m={name:`On Dark — With Actions`,render:e=>l(`#0f0d0c`,o({...e,theme:`on-dark`,showActions:!0,actions:t`
          ${i({label:`Get started`,style:`knockout`})}
          ${i({label:`Learn more`,style:`outline-inverse`})}
        `})),args:{theme:`on-dark`}},h={name:`Title Only`,render:()=>l(`#f8f8f8`,o({showEyebrow:!1,title:`Everything you need to make anything.`,theme:`on-light`}))},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "On Light",
  render: args => section("#ffffff", SectionHeader(args))
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "On Dark",
  render: args => section("#0f0d0c", SectionHeader({
    ...args,
    theme: "on-dark"
  })),
  args: {
    theme: "on-dark"
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "With Actions",
  render: args => section("#ffffff", SectionHeader({
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "On Dark — With Actions",
  render: args => section("#0f0d0c", SectionHeader({
    ...args,
    theme: "on-dark",
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
  })),
  args: {
    theme: "on-dark"
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "Title Only",
  render: () => section("#f8f8f8", SectionHeader({
    showEyebrow: false,
    title: "Everything you need to make anything.",
    theme: "on-light"
  }))
}`,...h.parameters?.docs?.source}}},g=[`OnLight`,`OnDark`,`WithActions`,`OnDarkWithActions`,`TitleOnly`]})))()}_();export{f as OnDark,m as OnDarkWithActions,d as OnLight,h as TitleOnly,p as WithActions,g as __namedExportsOrder,u as default};