import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{n as i,t as a}from"./elastic-card-firefly-Dr2-R79Q.js";var o;function s(){return(s=e((()=>{r(),o=({border:e=!0,content:r=n}={})=>t`
    <div class="c-surface" data-border="${e===!0||e===`true`}">${r}</div>
  `})))()}function c(){return(c=e((()=>{s()})))()}var l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{r(),c(),i(),l=`https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4`,u={title:`Atoms/Surface`,tags:[`autodocs`],render:e=>o(e),parameters:{layout:`centered`,docs:{description:{component:`
Themed container atom providing the default background, radius (\`--s2a-border-radius-xs\`),
and padding (\`--s2a-spacing-md\` block / \`--s2a-spacing-sm\` inline) for slotted content.

Every color is a semantic token, so the surface re-themes automatically when rendered
under a dark variable mode — there is no "dark" variant, only tokens resolving.

Matches Figma component set \`Surface\` (Border=true|false + content slot).
        `},source:{language:`html`,code:`<div class="c-surface" data-border="true">…content…</div>`}}},argTypes:{border:{control:{type:`boolean`},description:`Show the 1px subtle border (Figma default: true)`},content:{control:!1}},args:{border:!0}},d=t`
  <span
    style="
      font-family: var(--s2a-font-family-body);
      font-size: var(--s2a-font-size-sm);
      color: var(--s2a-color-content-default);
    "
    >Slotted content</span
  >
`,f={name:`Border`,args:{border:!0,content:d}},p={name:`No border`,args:{border:!1,content:d}},m={name:`Rich content`,args:{border:!0,content:t`
      <div style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xs); min-width: 240px;">
        <strong
          style="
            font-family: var(--s2a-font-family-body);
            color: var(--s2a-color-content-heading);
          "
          >Card title</strong
        >
        <span
          style="
            font-family: var(--s2a-font-family-body);
            font-size: var(--s2a-font-size-sm);
            color: var(--s2a-color-content-body-subtle);
          "
          >Supporting description that sits on the surface.</span
        >
      </div>
    `}},h={name:`With image`,args:{border:!0,content:t`
      <figure style="margin: 0; display: flex; flex-direction: column; gap: var(--s2a-spacing-sm); max-width: 360px;">
        <img
          src=${a}
          alt="Adobe Firefly generative artwork"
          style="width: 100%; display: block; border-radius: var(--s2a-border-radius-xs);"
        />
        <figcaption
          style="
            font-family: var(--s2a-font-family-body);
            font-size: var(--s2a-font-size-sm);
            color: var(--s2a-color-content-body-subtle);
          "
        >
          Media sits on the surface and inherits its radius language.
        </figcaption>
      </figure>
    `}},g={name:`With video`,args:{border:!0,content:t`
      <video
        autoplay
        loop
        muted
        playsinline
        src=${l}
        style="width: 360px; display: block; border-radius: var(--s2a-border-radius-xs);"
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
      <div style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xs); min-width: 240px;">
        <strong
          style="
            font-family: var(--s2a-font-family-body);
            color: var(--s2a-color-content-heading);
          "
          >Card title</strong
        >
        <span
          style="
            font-family: var(--s2a-font-family-body);
            font-size: var(--s2a-font-size-sm);
            color: var(--s2a-color-content-body-subtle);
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
      <figure style="margin: 0; display: flex; flex-direction: column; gap: var(--s2a-spacing-sm); max-width: 360px;">
        <img
          src=\${fireflyImage}
          alt="Adobe Firefly generative artwork"
          style="width: 100%; display: block; border-radius: var(--s2a-border-radius-xs);"
        />
        <figcaption
          style="
            font-family: var(--s2a-font-family-body);
            font-size: var(--s2a-font-size-sm);
            color: var(--s2a-color-content-body-subtle);
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
        style="width: 360px; display: block; border-radius: var(--s2a-border-radius-xs);"
      ></video>
    \`
  }
}`,...g.parameters?.docs?.source}}},_=[`WithBorder`,`WithoutBorder`,`WithRichContent`,`WithImage`,`WithVideo`]})))()}v();export{f as WithBorder,h as WithImage,m as WithRichContent,g as WithVideo,p as WithoutBorder,_ as __namedExportsOrder,u as default};