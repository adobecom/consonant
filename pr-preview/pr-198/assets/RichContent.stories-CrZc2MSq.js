import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";import{n as r,t as i}from"./button-mrx1M3M1.js";import{n as a,t as o}from"./rich-content-C6e_ugTM.js";function s(){return(s=e((()=>{a()})))()}function c(){return(c=e((()=>{s()})))()}var l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{n(),c(),r(),l=(e,n,{align:r=`flex-start`}={})=>t`
  <div style="
    width: 100%;
    box-sizing: border-box;
    padding: 64px 80px;
    background: ${e};
    display: flex;
    flex-direction: column;
    align-items: ${r};
  ">
    ${n}
  </div>
`,u={title:`Molecules/RichContent`,tags:[`autodocs`],render:e=>o(e),parameters:{layout:`fullscreen`,docs:{description:{component:"\nMarketing text content block: eyebrow + title + body paragraph + optional Actions slot.\n\n**Figma component set:** [matt-atoms node 3069-5302](https://www.figma.com/design/0uGUq3eOfXl54AZte1igt4/matt-atoms?node-id=3069-5302)\n\n**Measure drives both max-width and title size (responsive via grid tokens):**\n- `narrow` → `--s2a-grid-container-measure-narrow-_max-width` (500px desktop / 327px mobile), title-4\n- `wide` → `--s2a-grid-container-measure-wide-_max-width` (736px desktop / unconstrained mobile), title-2\n- `none` → no max-width, title-1\n        "},source:{language:`html`,code:`<div class="c-rich-content" data-theme="on-light" data-density="tight" data-justify="start" data-measure="narrow" data-has-actions="false">
  <div class="c-rich-content__text">
    <p class="c-rich-content__eyebrow">Eyebrow</p>
    <h2 class="c-rich-content__title">Section heading.</h2>
    <p class="c-rich-content__body">Supporting body copy that provides context for the section.</p>
  </div>
</div>

<!-- With centered layout and wide measure (used in SectionHeader) -->
<div class="c-rich-content" data-theme="on-light" data-density="tight" data-justify="center" data-measure="wide" data-has-actions="true">
  <div class="c-rich-content__text">
    <h2 class="c-rich-content__title">Everything you need to make anything.</h2>
  </div>
  <div class="c-rich-content__actions">…</div>
</div>`}}},argTypes:{theme:{control:{type:`select`},options:[`on-light`,`on-dark`]},density:{control:{type:`select`},options:[`tight`,`regular`]},justifyContent:{control:{type:`select`},options:[`start`,`center`]},measure:{control:{type:`select`},options:[`narrow`,`wide`,`none`]},eyebrow:{control:`text`},title:{control:`text`},body:{control:`text`},showActions:{control:`boolean`}},args:{theme:`on-light`,density:`tight`,justifyContent:`start`,measure:`narrow`,eyebrow:``,title:`{title}`,body:``,showActions:!1}},d={name:`3069-5370 · Hero Center / On Light`,render:()=>l(`#f8f8f8`,o({theme:`on-light`,density:`tight`,justifyContent:`center`,measure:`none`,eyebrow:`{eyebrow}`,title:`{title}`,body:`Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.`,showActions:!1}),{align:`center`})},f={name:`3063-5190 · Product Feature / Acrobat`,render:()=>l(`#f8f8f8`,o({theme:`on-light`,density:`tight`,justifyContent:`start`,measure:`wide`,eyebrow:`Acrobat`,title:`{title}`,body:`Create, edit, share, and sign documents with Acrobat Studio. Edit PDFs, collaborate securely, and move work forward with built-in AI and powerful document tools.`,showActions:!0,actions:t`
        ${i({label:`Learn more`,style:`solid`})}
        ${i({label:`Explore plans`,style:`outlined`})}
      `}))},p={name:`3119-9377 · Testimonial / On Dark`,render:()=>l(`#0f0d0c`,o({theme:`on-dark`,density:`tight`,justifyContent:`start`,measure:`wide`,title:`“Firefly helped me unlock the true speed of my creativity.”`,metaName:`Noah Spence`,metaRole:`Digital Creator, Studio Spence`,showActions:!0,actions:t`
        ${i({label:`Create with Firefly`,style:`knockout`})}
      `}))},m={name:`3135-4661 · Tools / On Dark Photo`,render:()=>l(`linear-gradient(135deg, #2c1f14 0%, #1a120a 40%, #251a0e 70%, #1c1408 100%)`,o({theme:`on-dark`,density:`tight`,justifyContent:`center`,measure:`wide`,title:`Tools that work for you.`,body:`Bring any idea to life with products for creators, businesses, and beyond.`,showActions:!0,actions:t`
        ${i({label:`See all products`,style:`outline-inverse`})}
      `}),{align:`center`})},h={name:`3119-9356 · Features Center / On Light`,render:()=>l(`#ffffff`,o({theme:`on-light`,density:`tight`,justifyContent:`center`,measure:`wide`,eyebrow:`Features and Releases`,title:`Explore what’s new.`,body:`Discover the latest product features from Adobe.`,showActions:!1}),{align:`center`})},g={name:`All Examples (overlay reference)`,render:()=>t`
    <div style="display: flex; flex-direction: column; width: 100%;">

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#f8f8f8;display:flex;flex-direction:column;align-items:center;">
        ${o({theme:`on-light`,density:`tight`,justifyContent:`center`,measure:`none`,eyebrow:`{eyebrow}`,title:`{title}`,body:`Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.`,showActions:!1})}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#f8f8f8;display:flex;flex-direction:column;align-items:flex-start;">
        ${o({theme:`on-light`,density:`tight`,justifyContent:`start`,measure:`wide`,eyebrow:`Acrobat`,title:`{title}`,body:`Create, edit, share, and sign documents with Acrobat Studio. Edit PDFs, collaborate securely, and move work forward with built-in AI and powerful document tools.`,showActions:!0,actions:t`
            ${i({label:`Learn more`,style:`solid`})}
            ${i({label:`Explore plans`,style:`outlined`})}
          `})}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#0f0d0c;display:flex;flex-direction:column;align-items:flex-start;">
        ${o({theme:`on-dark`,density:`tight`,justifyContent:`start`,measure:`wide`,title:`“Firefly helped me unlock the true speed of my creativity.”`,metaName:`Noah Spence`,metaRole:`Digital Creator, Studio Spence`,showActions:!0,actions:t`
            ${i({label:`Create with Firefly`,style:`knockout`})}
          `})}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:linear-gradient(135deg,#2c1f14 0%,#1a120a 40%,#251a0e 70%,#1c1408 100%);display:flex;flex-direction:column;align-items:center;">
        ${o({theme:`on-dark`,density:`tight`,justifyContent:`center`,measure:`wide`,title:`Tools that work for you.`,body:`Bring any idea to life with products for creators, businesses, and beyond.`,showActions:!0,actions:t`
            ${i({label:`See all products`,style:`outline-inverse`})}
          `})}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#ffffff;display:flex;flex-direction:column;align-items:center;">
        ${o({theme:`on-light`,density:`tight`,justifyContent:`center`,measure:`wide`,eyebrow:`Features and Releases`,title:`Explore what’s new.`,body:`Discover the latest product features from Adobe.`,showActions:!1})}
      </div>

    </div>
  `},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "3069-5370 · Hero Center / On Light",
  render: () => section("#f8f8f8", RichContent({
    theme: "on-light",
    density: "tight",
    justifyContent: "center",
    measure: "none",
    eyebrow: "{eyebrow}",
    title: "{title}",
    body: "Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.",
    showActions: false
  }), {
    align: "center"
  })
}`,...d.parameters?.docs?.source},description:{story:`Full-width hero text block — centered, title-1, no actions.
Figma: node 3069-5370`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "3063-5190 · Product Feature / Acrobat",
  render: () => section("#f8f8f8", RichContent({
    theme: "on-light",
    density: "tight",
    justifyContent: "start",
    measure: "wide",
    eyebrow: "Acrobat",
    title: "{title}",
    body: "Create, edit, share, and sign documents with Acrobat Studio. Edit PDFs, collaborate securely, and move work forward with built-in AI and powerful document tools.",
    showActions: true,
    actions: html\`
        \${Button({
      label: "Learn more",
      style: "solid"
    })}
        \${Button({
      label: "Explore plans",
      style: "outlined"
    })}
      \`
  }))
}`,...f.parameters?.docs?.source},description:{story:`Product feature block — wide, left-aligned, eyebrow + title-2 + body + two CTAs.
Figma: node 3063-5190`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "3119-9377 · Testimonial / On Dark",
  render: () => section("#0f0d0c", RichContent({
    theme: "on-dark",
    density: "tight",
    justifyContent: "start",
    measure: "wide",
    title: "\\u201cFirefly helped me unlock the true speed of my creativity.\\u201d",
    metaName: "Noah Spence",
    metaRole: "Digital Creator, Studio Spence",
    showActions: true,
    actions: html\`
        \${Button({
      label: "Create with Firefly",
      style: "knockout"
    })}
      \`
  }))
}`,...p.parameters?.docs?.source},description:{story:`Testimonial — wide, left-aligned, on-dark, quote + meta + inverse CTA.
Figma: node 3119-9377`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "3135-4661 · Tools / On Dark Photo",
  render: () => section("linear-gradient(135deg, #2c1f14 0%, #1a120a 40%, #251a0e 70%, #1c1408 100%)", RichContent({
    theme: "on-dark",
    density: "tight",
    justifyContent: "center",
    measure: "wide",
    title: "Tools that work for you.",
    body: "Bring any idea to life with products for creators, businesses, and beyond.",
    showActions: true,
    actions: html\`
        \${Button({
      label: "See all products",
      style: "outline-inverse"
    })}
      \`
  }), {
    align: "center"
  })
}`,...m.parameters?.docs?.source},description:{story:`Tools on dark — wide, centered, on-dark photo section, outlined knockout CTA.
Figma: node 3135-4661`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "3119-9356 · Features Center / On Light",
  render: () => section("#ffffff", RichContent({
    theme: "on-light",
    density: "tight",
    justifyContent: "center",
    measure: "wide",
    eyebrow: "Features and Releases",
    title: "Explore what\\u2019s new.",
    body: "Discover the latest product features from Adobe.",
    showActions: false
  }), {
    align: "center"
  })
}`,...h.parameters?.docs?.source},description:{story:`Features section header — wide, centered, eyebrow + title-2 + body, no actions.
Figma: node 3119-9356 (identical to 3656-601768)`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "All Examples (overlay reference)",
  render: () => html\`
    <div style="display: flex; flex-direction: column; width: 100%;">

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#f8f8f8;display:flex;flex-direction:column;align-items:center;">
        \${RichContent({
    theme: "on-light",
    density: "tight",
    justifyContent: "center",
    measure: "none",
    eyebrow: "{eyebrow}",
    title: "{title}",
    body: "Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.",
    showActions: false
  })}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#f8f8f8;display:flex;flex-direction:column;align-items:flex-start;">
        \${RichContent({
    theme: "on-light",
    density: "tight",
    justifyContent: "start",
    measure: "wide",
    eyebrow: "Acrobat",
    title: "{title}",
    body: "Create, edit, share, and sign documents with Acrobat Studio. Edit PDFs, collaborate securely, and move work forward with built-in AI and powerful document tools.",
    showActions: true,
    actions: html\`
            \${Button({
      label: "Learn more",
      style: "solid"
    })}
            \${Button({
      label: "Explore plans",
      style: "outlined"
    })}
          \`
  })}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#0f0d0c;display:flex;flex-direction:column;align-items:flex-start;">
        \${RichContent({
    theme: "on-dark",
    density: "tight",
    justifyContent: "start",
    measure: "wide",
    title: "\\u201cFirefly helped me unlock the true speed of my creativity.\\u201d",
    metaName: "Noah Spence",
    metaRole: "Digital Creator, Studio Spence",
    showActions: true,
    actions: html\`
            \${Button({
      label: "Create with Firefly",
      style: "knockout"
    })}
          \`
  })}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:linear-gradient(135deg,#2c1f14 0%,#1a120a 40%,#251a0e 70%,#1c1408 100%);display:flex;flex-direction:column;align-items:center;">
        \${RichContent({
    theme: "on-dark",
    density: "tight",
    justifyContent: "center",
    measure: "wide",
    title: "Tools that work for you.",
    body: "Bring any idea to life with products for creators, businesses, and beyond.",
    showActions: true,
    actions: html\`
            \${Button({
      label: "See all products",
      style: "outline-inverse"
    })}
          \`
  })}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#ffffff;display:flex;flex-direction:column;align-items:center;">
        \${RichContent({
    theme: "on-light",
    density: "tight",
    justifyContent: "center",
    measure: "wide",
    eyebrow: "Features and Releases",
    title: "Explore what\\u2019s new.",
    body: "Discover the latest product features from Adobe.",
    showActions: false
  })}
      </div>

    </div>
  \`
}`,...g.parameters?.docs?.source},description:{story:`All five examples stacked — use this for full-page overlay comparison against Figma.`,...g.parameters?.docs?.description}}},_=[`Example_3069_5370`,`Example_3063_5190`,`Example_3119_9377`,`Example_3135_4661`,`Example_3119_9356`,`AllExamples`]})))()}v();export{g as AllExamples,f as Example_3063_5190,d as Example_3069_5370,h as Example_3119_9356,p as Example_3119_9377,m as Example_3135_4661,_ as __namedExportsOrder,u as default};