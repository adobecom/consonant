import{E as i,x as t}from"./iframe-2kp_66TH.js";import{B as o}from"./button-ChYb7Jqh.js";import"./preload-helper-DOg3i_cw.js";const P=e=>e==="on-dark"?"on-dark":"on-light",L=e=>e==="regular"?"regular":"tight",N=e=>e==="center"?"center":"start",M=e=>e==="wide"||e==="none"?e:"narrow",r=e=>typeof e=="string"&&e.trim().length>0,n=({theme:e="on-light",density:m="tight",justifyContent:f="start",measure:C="narrow",eyebrow:y,showEyebrow:A=!0,title:b,body:x,metaName:p,metaRole:g,textSlot:w,showActions:$=!0,actions:v}={})=>{const z=P(e),F=L(m),j=N(f),E=M(C),S=A&&r(y),B=r(b),R=r(x),D=r(p)||r(g),k=!!w,T=!k&&D,_=!!($&&v),O=k?w:t`
        ${S?t`<p class="c-rich-content__eyebrow">${y}</p>`:i}
        ${B?t`<h2 class="c-rich-content__title">${b}</h2>`:i}
        ${R?t`<p class="c-rich-content__body">${x}</p>`:i}
        ${T?t`<div class="c-rich-content__meta">
              ${r(p)?t`<p class="c-rich-content__meta-name">${p}</p>`:i}
              ${r(g)?t`<p class="c-rich-content__meta-role">${g}</p>`:i}
            </div>`:i}
      `;return t`
    <div
      class="c-rich-content"
      data-theme=${z}
      data-density=${F}
      data-justify=${j}
      data-measure=${E}
      data-has-actions=${_?"true":"false"}
    >
      <div class="c-rich-content__text">${O}</div>
      ${_?t`<div class="c-rich-content__actions">${v}</div>`:i}
    </div>
  `},I=`.c-rich-content {
  --c-rich-content-gap: var(--s2a-spacing-2xl, 24px);
  --c-rich-content-text-gap: var(--s2a-spacing-xs, 8px);
  --c-rich-content-color-title: var(--s2a-color-content-default, #050505);
  --c-rich-content-color-body: var(--s2a-color-content-subtle, rgba(0, 0, 0, 0.64));
  --c-rich-content-color-eyebrow: var(--s2a-color-content-eyebrow, rgba(0, 0, 0, 0.64));

  display: flex;
  flex-direction: column;
  gap: var(--c-rich-content-gap);
  width: 100%;
  color: var(--c-rich-content-color-title);
}

.c-rich-content[data-density="regular"] {
  --c-rich-content-gap: var(--s2a-spacing-3xl, 32px);
  --c-rich-content-text-gap: var(--s2a-spacing-md, 16px);
}

.c-rich-content[data-theme="on-dark"] {
  --c-rich-content-color-title: var(--s2a-color-content-knockout, #ffffff);
  --c-rich-content-color-body: var(--s2a-color-transparent-white-80, rgba(255, 255, 255, 0.8));
  --c-rich-content-color-eyebrow: var(--s2a-color-transparent-white-64, rgba(255, 255, 255, 0.64));
}

.c-rich-content[data-justify="center"] {
  align-items: center;
}

.c-rich-content__text {
  display: flex;
  flex-direction: column;
  gap: var(--c-rich-content-text-gap);
  align-items: flex-start;
  width: 100%;
  max-width: var(--s2a-grid-container-measure-narrow-_max-width, 500px);
}

.c-rich-content[data-measure="wide"] .c-rich-content__text {
  max-width: var(--s2a-grid-container-measure-wide-_max-width, 736px);
}

.c-rich-content[data-measure="none"] .c-rich-content__text {
  max-width: none;
}

.c-rich-content[data-justify="center"] .c-rich-content__text {
  text-align: center;
  align-items: center;
}

.c-rich-content__eyebrow {
  font-family: var(--s2a-font-family-eyebrow, "Adobe Clean");
  font-size: var(--s2a-font-size-md, 16px);
  line-height: var(--s2a-font-line-height-sm, 20px);
  font-weight: var(--s2a-font-weight-adobe-clean-bold, 700);
  letter-spacing: -0.2px; /* Primitive: eyebrow tracking from Figma spec */
  color: var(--c-rich-content-color-eyebrow);
}

.c-rich-content__title {
  font-family: var(--s2a-font-family-heading, "Adobe Clean Display");
  font-weight: var(--s2a-font-weight-adobe-clean-bold, 700);
  color: var(--c-rich-content-color-title);
}

.c-rich-content[data-measure="narrow"] .c-rich-content__title {
  font-size: var(--s2a-font-size-2xl, 24px);
  line-height: var(--s2a-font-line-height-md, 24px);
}

.c-rich-content[data-measure="wide"] .c-rich-content__title {
  font-size: var(--s2a-font-size-6xl, 56px);
  line-height: var(--s2a-font-line-height-6xl, 56px);
}

.c-rich-content[data-measure="none"] .c-rich-content__title {
  font-size: var(--s2a-font-size-9xl, 80px);
  line-height: var(--s2a-font-line-height-5xl, 76px);
}

.c-rich-content__body {
  font-family: var(--s2a-font-family-body, "Adobe Clean");
  font-size: var(--s2a-font-size-xl, 20px);
  line-height: var(--s2a-font-line-height-md, 24px);
  font-weight: var(--s2a-font-weight-adobe-clean, 400);
  color: var(--c-rich-content-color-body);
}

.c-rich-content__meta-role {
  font-family: var(--s2a-font-family-body, "Adobe Clean");
  font-size: var(--s2a-font-size-sm, 14px);
  line-height: var(--s2a-font-line-height-sm, 20px);
  font-weight: var(--s2a-font-weight-adobe-clean, 400);
  color: var(--c-rich-content-color-body);
}

.c-rich-content__meta {
  display: flex;
  flex-direction: column;
  gap: var(--s2a-spacing-3xs, 4px);
  color: var(--c-rich-content-color-body);
}

.c-rich-content[data-justify="center"] .c-rich-content__meta {
  align-items: center;
}

.c-rich-content__meta-name {
  font-family: var(--s2a-font-family-default, "Adobe Clean");
  font-size: var(--s2a-font-size-md, 16px);
  line-height: var(--s2a-font-line-height-lg, 32px);
  font-weight: var(--s2a-font-weight-adobe-clean-bold, 700);
  color: var(--c-rich-content-color-title);
}

.c-rich-content__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s2a-spacing-xs, 8px);
}

.c-rich-content[data-justify="center"] .c-rich-content__actions {
  justify-content: center;
}
`,u=(e,m,{align:f="flex-start"}={})=>t`
  <div style="
    width: 100%;
    box-sizing: border-box;
    padding: 64px 80px;
    background: ${e};
    display: flex;
    flex-direction: column;
    align-items: ${f};
  ">
    ${m}
  </div>
`,H={title:"Components/RichContent",tags:["autodocs"],render:e=>n(e),parameters:{layout:"fullscreen",docs:{description:{component:`
Marketing text content block: eyebrow + title + body paragraph + optional Actions slot.

**Figma component set:** [matt-atoms node 3069-5302](https://www.figma.com/design/0uGUq3eOfXl54AZte1igt4/matt-atoms?node-id=3069-5302)

**Measure drives both max-width and title size (responsive via grid tokens):**
- \`narrow\` → \`--s2a-grid-container-measure-narrow-_max-width\` (500px desktop / 327px mobile), title-4
- \`wide\` → \`--s2a-grid-container-measure-wide-_max-width\` (736px desktop / unconstrained mobile), title-2
- \`none\` → no max-width, title-1

\`\`\`css
${I}
\`\`\`
        `}}},argTypes:{theme:{control:{type:"select"},options:["on-light","on-dark"]},density:{control:{type:"select"},options:["tight","regular"]},justifyContent:{control:{type:"select"},options:["start","center"]},measure:{control:{type:"select"},options:["narrow","wide","none"]},eyebrow:{control:"text"},title:{control:"text"},body:{control:"text"},showActions:{control:"boolean"}},args:{theme:"on-light",density:"tight",justifyContent:"start",measure:"narrow",eyebrow:"",title:"{title}",body:"",showActions:!1}},a={name:"3069-5370 · Hero Center / On Light",render:()=>u("#f8f8f8",n({theme:"on-light",density:"tight",justifyContent:"center",measure:"none",eyebrow:"{eyebrow}",title:"{title}",body:"Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.",showActions:!1}),{align:"center"})},s={name:"3063-5190 · Product Feature / Acrobat",render:()=>u("#f8f8f8",n({theme:"on-light",density:"tight",justifyContent:"start",measure:"wide",eyebrow:"Acrobat",title:"{title}",body:"Create, edit, share, and sign documents with Acrobat Studio. Edit PDFs, collaborate securely, and move work forward with built-in AI and powerful document tools.",showActions:!0,actions:t`
        ${o({label:"Learn more",background:"solid",context:"on-light"})}
        ${o({label:"Explore plans",background:"outlined",context:"on-light"})}
      `}))},c={name:"3119-9377 · Testimonial / On Dark",render:()=>u("#0f0d0c",n({theme:"on-dark",density:"tight",justifyContent:"start",measure:"wide",title:"“Firefly helped me unlock the true speed of my creativity.”",metaName:"Noah Spence",metaRole:"Digital Creator, Studio Spence",showActions:!0,actions:t`
        ${o({label:"Create with Firefly",background:"solid",context:"on-dark"})}
      `}))},l={name:"3135-4661 · Tools / On Dark Photo",render:()=>u("linear-gradient(135deg, #2c1f14 0%, #1a120a 40%, #251a0e 70%, #1c1408 100%)",n({theme:"on-dark",density:"tight",justifyContent:"center",measure:"wide",title:"Tools that work for you.",body:"Bring any idea to life with products for creators, businesses, and beyond.",showActions:!0,actions:t`
        ${o({label:"See all products",background:"outlined",context:"on-dark"})}
      `}),{align:"center"})},d={name:"3119-9356 · Features Center / On Light",render:()=>u("#ffffff",n({theme:"on-light",density:"tight",justifyContent:"center",measure:"wide",eyebrow:"Features and Releases",title:"Explore what’s new.",body:"Discover the latest product features from Adobe.",showActions:!1}),{align:"center"})},h={name:"All Examples (overlay reference)",render:()=>t`
    <div style="display: flex; flex-direction: column; width: 100%;">

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#f8f8f8;display:flex;flex-direction:column;align-items:center;">
        ${n({theme:"on-light",density:"tight",justifyContent:"center",measure:"none",eyebrow:"{eyebrow}",title:"{title}",body:"Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.",showActions:!1})}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#f8f8f8;display:flex;flex-direction:column;align-items:flex-start;">
        ${n({theme:"on-light",density:"tight",justifyContent:"start",measure:"wide",eyebrow:"Acrobat",title:"{title}",body:"Create, edit, share, and sign documents with Acrobat Studio. Edit PDFs, collaborate securely, and move work forward with built-in AI and powerful document tools.",showActions:!0,actions:t`
            ${o({label:"Learn more",background:"solid",context:"on-light"})}
            ${o({label:"Explore plans",background:"outlined",context:"on-light"})}
          `})}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#0f0d0c;display:flex;flex-direction:column;align-items:flex-start;">
        ${n({theme:"on-dark",density:"tight",justifyContent:"start",measure:"wide",title:"“Firefly helped me unlock the true speed of my creativity.”",metaName:"Noah Spence",metaRole:"Digital Creator, Studio Spence",showActions:!0,actions:t`
            ${o({label:"Create with Firefly",background:"solid",context:"on-dark"})}
          `})}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:linear-gradient(135deg,#2c1f14 0%,#1a120a 40%,#251a0e 70%,#1c1408 100%);display:flex;flex-direction:column;align-items:center;">
        ${n({theme:"on-dark",density:"tight",justifyContent:"center",measure:"wide",title:"Tools that work for you.",body:"Bring any idea to life with products for creators, businesses, and beyond.",showActions:!0,actions:t`
            ${o({label:"See all products",background:"outlined",context:"on-dark"})}
          `})}
      </div>

      <div style="width:100%;box-sizing:border-box;padding:64px 80px;background:#ffffff;display:flex;flex-direction:column;align-items:center;">
        ${n({theme:"on-light",density:"tight",justifyContent:"center",measure:"wide",eyebrow:"Features and Releases",title:"Explore what’s new.",body:"Discover the latest product features from Adobe.",showActions:!1})}
      </div>

    </div>
  `};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source},description:{story:`Full-width hero text block — centered, title-1, no actions.
Figma: node 3069-5370`,...a.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
      background: "solid",
      context: "on-light"
    })}
        \${Button({
      label: "Explore plans",
      background: "outlined",
      context: "on-light"
    })}
      \`
  }))
}`,...s.parameters?.docs?.source},description:{story:`Product feature block — wide, left-aligned, eyebrow + title-2 + body + two CTAs.
Figma: node 3063-5190`,...s.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
      background: "solid",
      context: "on-dark"
    })}
      \`
  }))
}`,...c.parameters?.docs?.source},description:{story:`Testimonial — wide, left-aligned, on-dark, quote + meta + inverse CTA.
Figma: node 3119-9377`,...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
      background: "outlined",
      context: "on-dark"
    })}
      \`
  }), {
    align: "center"
  })
}`,...l.parameters?.docs?.source},description:{story:`Tools on dark — wide, centered, on-dark photo section, outlined knockout CTA.
Figma: node 3135-4661`,...l.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source},description:{story:`Features section header — wide, centered, eyebrow + title-2 + body, no actions.
Figma: node 3119-9356 (identical to 3656-601768)`,...d.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
      background: "solid",
      context: "on-light"
    })}
            \${Button({
      label: "Explore plans",
      background: "outlined",
      context: "on-light"
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
      background: "solid",
      context: "on-dark"
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
      background: "outlined",
      context: "on-dark"
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
}`,...h.parameters?.docs?.source},description:{story:"All five examples stacked — use this for full-page overlay comparison against Figma.",...h.parameters?.docs?.description}}};const J=["Example_3069_5370","Example_3063_5190","Example_3119_9377","Example_3135_4661","Example_3119_9356","AllExamples"];export{h as AllExamples,s as Example_3063_5190,a as Example_3069_5370,d as Example_3119_9356,c as Example_3119_9377,l as Example_3135_4661,J as __namedExportsOrder,H as default};
