import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{n as i,t as a}from"./button-CjK_LOp6.js";import{n as o,t as s}from"./rich-content-ZPZDrUUm.js";function c(){return(c=e((()=>{o()})))()}function l(){return(l=e((()=>{c()})))()}var u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{r(),l(),i(),u=(e,r,{align:i=`flex-start`,dark:a=!1}={})=>t`
  <div data-theme=${a?`dark`:n} style="
    width: 100%;
    box-sizing: border-box;
    padding: var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);
    background: ${e};
    display: flex;
    flex-direction: column;
    align-items: ${i};
  ">
    ${r}
  </div>
`,d={title:`Molecules/RichContent`,tags:[`autodocs`],render:e=>s(e),parameters:{layout:`fullscreen`,docs:{description:{component:"\nMarketing text content block: eyebrow + title + body paragraph + optional Actions slot.\n\n**Figma component set:** [matt-atoms node 3069-5302](https://www.figma.com/design/0uGUq3eOfXl54AZte1igt4/matt-atoms?node-id=3069-5302)\n\n**Measure drives both max-width and title size (responsive via grid tokens):**\n- `narrow` → `--s2a-grid-container-measure-narrow-_max-width` (500px desktop / 327px mobile), title-4\n- `wide` → `--s2a-grid-container-measure-wide-_max-width` (736px desktop / unconstrained mobile), title-2\n- `none` → no max-width, title-1\n        "},source:{language:`html`,code:`<div class="c-rich-content" data-density="tight" data-justify="start" data-measure="narrow" data-has-actions="false">
  <div class="c-rich-content__text">
    <p class="c-rich-content__eyebrow">Eyebrow</p>
    <h2 class="c-rich-content__title">Section heading.</h2>
    <p class="c-rich-content__body">Supporting body copy that provides context for the section.</p>
  </div>
</div>

<!-- With centered layout and wide measure (used in SectionHeader) -->
<div class="c-rich-content" data-density="tight" data-justify="center" data-measure="wide" data-has-actions="true">
  <div class="c-rich-content__text">
    <h2 class="c-rich-content__title">Everything you need to make anything.</h2>
  </div>
  <div class="c-rich-content__actions">…</div>
</div>`}}},argTypes:{density:{control:{type:`select`},options:[`tight`,`regular`]},justifyContent:{control:{type:`select`},options:[`start`,`center`]},measure:{control:{type:`select`},options:[`narrow`,`wide`,`none`]},eyebrow:{control:`text`},title:{control:`text`},body:{control:`text`},showActions:{control:`boolean`}},args:{density:`tight`,justifyContent:`start`,measure:`narrow`,eyebrow:``,title:`{title}`,body:``,showActions:!1}},f={name:`3069-5370 · Hero Center / On Light`,render:()=>u(`var(--s2a-color-surface-subtle)`,s({density:`tight`,justifyContent:`center`,measure:`none`,eyebrow:`{eyebrow}`,title:`{title}`,body:`Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.`,showActions:!1}),{align:`center`})},p={name:`3063-5190 · Product Feature / Acrobat`,render:()=>u(`var(--s2a-color-surface-subtle)`,s({density:`tight`,justifyContent:`start`,measure:`wide`,eyebrow:`Acrobat`,title:`{title}`,body:`Create, edit, share, and sign documents with Acrobat Studio. Edit PDFs, collaborate securely, and move work forward with built-in AI and powerful document tools.`,showActions:!0,actions:t`
        ${a({label:`Learn more`,style:`solid`})}
        ${a({label:`Explore plans`,style:`outlined`})}
      `}))},m={name:`3119-9377 · Testimonial / On Dark`,render:()=>u(`var(--s2a-color-background-knockout)`,s({density:`tight`,justifyContent:`start`,measure:`wide`,title:`“Firefly helped me unlock the true speed of my creativity.”`,metaName:`Noah Spence`,metaRole:`Digital Creator, Studio Spence`,showActions:!0,actions:t`
        ${a({label:`Create with Firefly`,style:`knockout`})}
      `}),{dark:!0})},h={name:`3135-4661 · Tools / On Dark Photo`,render:()=>u(`linear-gradient(135deg, var(--s2a-color-background-knockout) 0%, var(--s2a-color-background-knockout) 40%, var(--s2a-color-background-knockout) 70%, var(--s2a-color-background-knockout) 100%)`,s({density:`tight`,justifyContent:`center`,measure:`wide`,title:`Tools that work for you.`,body:`Bring any idea to life with products for creators, businesses, and beyond.`,showActions:!0,actions:t`
        ${a({label:`See all products`,style:`outline-inverse`})}
      `}),{align:`center`,dark:!0})},g={name:`3119-9356 · Features Center / On Light`,render:()=>u(`var(--s2a-color-surface-default)`,s({density:`tight`,justifyContent:`center`,measure:`wide`,eyebrow:`Features and Releases`,title:`Explore what’s new.`,body:`Discover the latest product features from Adobe.`,showActions:!1}),{align:`center`})},_={name:`All Examples (overlay reference)`,render:()=>t`
    <div style="display: flex; flex-direction: column; width: 100%;">

      <div style="width:100%;box-sizing:border-box;padding:var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);background:var(--s2a-color-surface-subtle);display:flex;flex-direction:column;align-items:center;">
        ${s({density:`tight`,justifyContent:`center`,measure:`none`,eyebrow:`{eyebrow}`,title:`{title}`,body:`Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.`,showActions:!1})}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);background:var(--s2a-color-surface-subtle);display:flex;flex-direction:column;align-items:flex-start;">
        ${s({density:`tight`,justifyContent:`start`,measure:`wide`,eyebrow:`Acrobat`,title:`{title}`,body:`Create, edit, share, and sign documents with Acrobat Studio. Edit PDFs, collaborate securely, and move work forward with built-in AI and powerful document tools.`,showActions:!0,actions:t`
            ${a({label:`Learn more`,style:`solid`})}
            ${a({label:`Explore plans`,style:`outlined`})}
          `})}
      </div>

      <div data-theme="dark" style="width:100%;box-sizing:border-box;padding:var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);background:var(--s2a-color-background-knockout);display:flex;flex-direction:column;align-items:flex-start;">
        ${s({density:`tight`,justifyContent:`start`,measure:`wide`,title:`“Firefly helped me unlock the true speed of my creativity.”`,metaName:`Noah Spence`,metaRole:`Digital Creator, Studio Spence`,showActions:!0,actions:t`
            ${a({label:`Create with Firefly`,style:`knockout`})}
          `})}
      </div>

      <div data-theme="dark" style="width:100%;box-sizing:border-box;padding:var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);background:linear-gradient(135deg,var(--s2a-color-background-knockout) 0%,var(--s2a-color-background-knockout) 40%,var(--s2a-color-background-knockout) 70%,var(--s2a-color-background-knockout) 100%);display:flex;flex-direction:column;align-items:center;">
        ${s({density:`tight`,justifyContent:`center`,measure:`wide`,title:`Tools that work for you.`,body:`Bring any idea to life with products for creators, businesses, and beyond.`,showActions:!0,actions:t`
            ${a({label:`See all products`,style:`outline-inverse`})}
          `})}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);background:var(--s2a-color-surface-default);display:flex;flex-direction:column;align-items:center;">
        ${s({density:`tight`,justifyContent:`center`,measure:`wide`,eyebrow:`Features and Releases`,title:`Explore what’s new.`,body:`Discover the latest product features from Adobe.`,showActions:!1})}
      </div>

    </div>
  `},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "3069-5370 · Hero Center / On Light",
  render: () => section("var(--s2a-color-surface-subtle)", RichContent({
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
}`,...f.parameters?.docs?.source},description:{story:`Full-width hero text block — centered, title-1, no actions.
Figma: node 3069-5370`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "3063-5190 · Product Feature / Acrobat",
  render: () => section("var(--s2a-color-surface-subtle)", RichContent({
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
}`,...p.parameters?.docs?.source},description:{story:`Product feature block — wide, left-aligned, eyebrow + title-2 + body + two CTAs.
Figma: node 3063-5190`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "3119-9377 · Testimonial / On Dark",
  render: () => section("var(--s2a-color-background-knockout)", RichContent({
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
  }), {
    dark: true
  })
}`,...m.parameters?.docs?.source},description:{story:`Testimonial — wide, left-aligned, on-dark, quote + meta + inverse CTA.
Figma: node 3119-9377`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "3135-4661 · Tools / On Dark Photo",
  render: () => section("linear-gradient(135deg, var(--s2a-color-background-knockout) 0%, var(--s2a-color-background-knockout) 40%, var(--s2a-color-background-knockout) 70%, var(--s2a-color-background-knockout) 100%)", RichContent({
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
    align: "center",
    dark: true
  })
}`,...h.parameters?.docs?.source},description:{story:`Tools on dark — wide, centered, on-dark photo section, outlined knockout CTA.
Figma: node 3135-4661`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "3119-9356 · Features Center / On Light",
  render: () => section("var(--s2a-color-surface-default)", RichContent({
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
}`,...g.parameters?.docs?.source},description:{story:`Features section header — wide, centered, eyebrow + title-2 + body, no actions.
Figma: node 3119-9356 (identical to 3656-601768)`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: "All Examples (overlay reference)",
  render: () => html\`
    <div style="display: flex; flex-direction: column; width: 100%;">

      <div style="width:100%;box-sizing:border-box;padding:var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);background:var(--s2a-color-surface-subtle);display:flex;flex-direction:column;align-items:center;">
        \${RichContent({
    density: "tight",
    justifyContent: "center",
    measure: "none",
    eyebrow: "{eyebrow}",
    title: "{title}",
    body: "Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.",
    showActions: false
  })}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);background:var(--s2a-color-surface-subtle);display:flex;flex-direction:column;align-items:flex-start;">
        \${RichContent({
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

      <div data-theme="dark" style="width:100%;box-sizing:border-box;padding:var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);background:var(--s2a-color-background-knockout);display:flex;flex-direction:column;align-items:flex-start;">
        \${RichContent({
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

      <div data-theme="dark" style="width:100%;box-sizing:border-box;padding:var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);background:linear-gradient(135deg,var(--s2a-color-background-knockout) 0%,var(--s2a-color-background-knockout) 40%,var(--s2a-color-background-knockout) 70%,var(--s2a-color-background-knockout) 100%);display:flex;flex-direction:column;align-items:center;">
        \${RichContent({
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

      <div style="width:100%;box-sizing:border-box;padding:var(--s2a-spacing-4xl) var(--s2a-spacing-4xl);background:var(--s2a-color-surface-default);display:flex;flex-direction:column;align-items:center;">
        \${RichContent({
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
}`,..._.parameters?.docs?.source},description:{story:`All five examples stacked — use this for full-page overlay comparison against Figma.`,..._.parameters?.docs?.description}}},v=[`Example_3069_5370`,`Example_3063_5190`,`Example_3119_9377`,`Example_3135_4661`,`Example_3119_9356`,`AllExamples`]})))()}y();export{_ as AllExamples,p as Example_3063_5190,f as Example_3069_5370,g as Example_3119_9356,m as Example_3119_9377,h as Example_3135_4661,v as __namedExportsOrder,d as default};