import{E as c,x as e}from"./iframe-DReoqYbu.js";import"./preload-helper-DUW8wTBw.js";const l=({border:r=!0,content:d=c}={})=>e`
    <div class="c-surface" data-border="${r===!0||r==="true"}">${d}</div>
  `,p="/consonant/pr-preview/pr-132/assets/elastic-card-firefly-CDARmW7F.jpg",m="https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4",b={title:"Atoms/Surface",tags:["autodocs"],render:r=>l(r),parameters:{layout:"centered",docs:{description:{component:'\nThemed container atom providing the default background, radius (`--s2a-border-radius-xs`),\nand padding (`--s2a-spacing-md` block / `--s2a-spacing-sm` inline) for slotted content.\n\nEvery color is a semantic token, so the surface re-themes automatically when rendered\nunder a dark variable mode — there is no "dark" variant, only tokens resolving.\n\nMatches Figma component set `Surface` (Border=true|false + content slot).\n        '},source:{language:"html",code:'<div class="c-surface" data-border="true">…content…</div>'}}},argTypes:{border:{control:{type:"boolean"},description:"Show the 1px subtle border (Figma default: true)"},content:{control:!1}},args:{border:!0}},i=e`
  <span
    style="
      font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
      font-size: 14px;
      color: var(--s2a-color-content-default, #000);
    "
    >Slotted content</span
  >
`,n={name:"Border",args:{border:!0,content:i}},o={name:"No border",args:{border:!1,content:i}},a={name:"Rich content",args:{border:!0,content:e`
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
    `}},t={name:"With image",args:{border:!0,content:e`
      <figure style="margin: 0; display: flex; flex-direction: column; gap: 12px; max-width: 360px;">
        <img
          src=${p}
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
    `}},s={name:"With video",args:{border:!0,content:e`
      <video
        autoplay
        loop
        muted
        playsinline
        src=${m}
        style="width: 360px; display: block; border-radius: var(--s2a-border-radius-xs, 8px);"
      ></video>
    `}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "Border",
  args: {
    border: true,
    content: sampleContent
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "No border",
  args: {
    border: false,
    content: sampleContent
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};const y=["WithBorder","WithoutBorder","WithRichContent","WithImage","WithVideo"];export{n as WithBorder,t as WithImage,a as WithRichContent,s as WithVideo,o as WithoutBorder,y as __namedExportsOrder,b as default};
