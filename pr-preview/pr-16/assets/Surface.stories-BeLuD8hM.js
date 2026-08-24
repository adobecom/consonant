import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";var i;function a(){return(a=e((()=>{r(),i=({border:e=!0,content:r=t}={})=>n`
    <div class="c-surface" data-border="${e===!0||e===`true`}">${r}</div>
  `})))()}function o(){return(o=e((()=>{a()})))()}var s;function c(){return(c=e((()=>{s=`/consonant/pr-preview/pr-16/assets/elastic-card-firefly-CDARmW7F.jpg`})))()}var l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{r(),o(),c(),l=`https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4`,u={title:`Atoms/Surface`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`centered`,docs:{description:{component:`
Themed container atom providing the default background, radius (\`--s2a-border-radius-xs\`),
and padding (\`--s2a-spacing-md\` block / \`--s2a-spacing-sm\` inline) for slotted content.

Every color is a semantic token, so the surface re-themes automatically when rendered
under a dark variable mode — there is no "dark" variant, only tokens resolving.

Matches Figma component set \`Surface\` (Border=true|false + content slot).
        `},source:{language:`html`,code:`<div class="c-surface" data-border="true">…content…</div>`}}},argTypes:{border:{control:{type:`boolean`},description:`Show the 1px subtle border (Figma default: true)`},content:{control:!1}},args:{border:!0}},d=n`
  <span
    style="
      font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
      font-size: 14px;
      color: var(--s2a-color-content-default, #000);
    "
    >Slotted content</span
  >
`,f={name:`Border`,args:{border:!0,content:d}},p={name:`No border`,args:{border:!1,content:d}},m={name:`Rich content`,args:{border:!0,content:n`
      <div style="display: flex; flex-direction: column; gap: 8px; min-width: 240px;">
        <strong
          style="
            font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
            color: var(--s2a-color-content-heading, #000);
          "
          >Card title</strong
        >
        <span
          style="
            font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
            font-size: 14px;
            color: var(--s2a-color-content-body-subtle, rgb(0 0 0 / 64%));
          "
          >Supporting description that sits on the surface.</span
        >
      </div>
    `}},h={name:`With image`,args:{border:!0,content:n`
      <figure style="margin: 0; display: flex; flex-direction: column; gap: 12px; max-width: 360px;">
        <img
          src=${s}
          alt="Adobe Firefly generative artwork"
          style="width: 100%; display: block; border-radius: var(--s2a-border-radius-xs, 8px);"
        />
        <figcaption
          style="
            font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
            font-size: 14px;
            color: var(--s2a-color-content-body-subtle, rgb(0 0 0 / 64%));
          "
        >
          Media sits on the surface and inherits its radius language.
        </figcaption>
      </figure>
    `}},g={name:`With video`,args:{border:!0,content:n`
      <video
        autoplay
        loop
        muted
        playsinline
        src=${l}
        style="width: 360px; display: block; border-radius: var(--s2a-border-radius-xs, 8px);"
      ></video>
    `}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "Border",
  args: {
    border: true,
    content: sampleContent
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "No border",
  args: {
    border: false,
    content: sampleContent
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "Rich content",
  args: {
    border: true,
    content: html\`
      <div style="display: flex; flex-direction: column; gap: 8px; min-width: 240px;">
        <strong
          style="
            font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
            color: var(--s2a-color-content-heading, #000);
          "
          >Card title</strong
        >
        <span
          style="
            font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
            font-size: 14px;
            color: var(--s2a-color-content-body-subtle, rgb(0 0 0 / 64%));
          "
          >Supporting description that sits on the surface.</span
        >
      </div>
    \`
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "With image",
  args: {
    border: true,
    content: html\`
      <figure style="margin: 0; display: flex; flex-direction: column; gap: 12px; max-width: 360px;">
        <img
          src=\${fireflyImage}
          alt="Adobe Firefly generative artwork"
          style="width: 100%; display: block; border-radius: var(--s2a-border-radius-xs, 8px);"
        />
        <figcaption
          style="
            font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
            font-size: 14px;
            color: var(--s2a-color-content-body-subtle, rgb(0 0 0 / 64%));
          "
        >
          Media sits on the surface and inherits its radius language.
        </figcaption>
      </figure>
    \`
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "With video",
  args: {
    border: true,
    content: html\`
      <video
        autoplay
        loop
        muted
        playsinline
        src=\${VIDEO_SRC}
        style="width: 360px; display: block; border-radius: var(--s2a-border-radius-xs, 8px);"
      ></video>
    \`
  }
}`,...g.parameters?.docs?.source}}},_=[`WithBorder`,`WithoutBorder`,`WithRichContent`,`WithImage`,`WithVideo`]})))()}v();export{f as WithBorder,h as WithImage,m as WithRichContent,g as WithVideo,p as WithoutBorder,_ as __namedExportsOrder,u as default};