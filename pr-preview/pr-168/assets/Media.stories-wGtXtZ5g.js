import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{n as r,t as i}from"./media-C03lr5S2.js";import{n as a,t as o}from"./elastic-card-firefly-BSC3Nkxm.js";function s(){return(s=e((()=>{r()})))()}var c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{n(),s(),a(),c=`https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4`,l=[`16:9`,`4:3`,`1:1`,`3:2`,`3:4`,`21:9`],u=[`cover`,`contain`,`fill`,`none`,`scale-down`],d={title:`Atoms/Media`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`centered`,docs:{description:{component:'\nConstrained image or video with aspect ratio, object-fit, and an optional\ngradient overlay — the shared media primitive used inside `ElasticCard` and\n`MediaCard`. Figma component set `media`.\n\nRenders an `<img>` by default; set `type="video"` for a `<video>` element\n(autoplaying video must stay muted). Pass `mediaTemplate` to bypass both and\nrender fully custom content inside the same constrained `<figure>` wrapper.\n\nNote: the `size` prop only has a visual effect at `"full"` (100% width) today —\nthe other t-shirt sizes (`xs`–`xl`) are declared in the spec but have no\nmatching CSS rule yet.\n        '}}},argTypes:{src:{control:`text`},alt:{control:`text`},aspectRatio:{control:`select`,options:l},size:{control:`select`,options:[`xs`,`sm`,`md`,`lg`,`xl`,`full`]},objectFit:{control:`select`,options:u},objectPosition:{control:`select`,options:[`center`,`top`,`bottom`,`left`,`right`,`top-left`,`top-right`,`bottom-left`,`bottom-right`]},type:{control:`radio`,options:[`image`,`video`]},lazy:{control:`boolean`},overlay:{control:`boolean`}},args:{src:o,alt:``,aspectRatio:`3:4`,size:`full`,objectFit:`cover`,objectPosition:`center`,type:`image`,lazy:!0,overlay:!1}},f=(e,n=`280px`)=>t`
  <div style="width: ${n};">${e}</div>
`,p={render:e=>f(i(e))},m={args:{overlay:!0},render:e=>f(i(e))},h={args:{type:`video`,src:c,autoplay:!0,muted:!0,loop:!0,aspectRatio:`16:9`},render:e=>f(i(e),`360px`)},g={parameters:{controls:{disable:!0}},render:()=>t`
    <div style="display: grid; grid-template-columns: repeat(3, 160px); gap: var(--s2a-spacing-md);">
      ${l.map(e=>t`
          <div>
            <div style="margin-bottom: var(--s2a-spacing-xs); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-body-subtle);">${e}</div>
            ${i({src:o,aspectRatio:e,size:`full`})}
          </div>
        `)}
    </div>
  `},_={parameters:{controls:{disable:!0}},render:()=>t`
    <div style="display: grid; grid-template-columns: repeat(3, 160px); gap: var(--s2a-spacing-md);">
      ${u.map(e=>t`
          <div>
            <div style="margin-bottom: var(--s2a-spacing-xs); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-body-subtle);">${e}</div>
            ${i({src:o,aspectRatio:`1:1`,objectFit:e,size:`full`})}
          </div>
        `)}
    </div>
  `},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => frame(Media(args))
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    overlay: true
  },
  render: args => frame(Media(args))
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    type: "video",
    src: VIDEO_SRC,
    autoplay: true,
    muted: true,
    loop: true,
    aspectRatio: "16:9"
  },
  render: args => frame(Media(args), "360px")
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    controls: {
      disable: true
    }
  },
  render: () => html\`
    <div style="display: grid; grid-template-columns: repeat(3, 160px); gap: var(--s2a-spacing-md);">
      \${ASPECT_RATIOS.map(aspectRatio => html\`
          <div>
            <div style="margin-bottom: var(--s2a-spacing-xs); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-body-subtle);">\${aspectRatio}</div>
            \${Media({
    src: fireflyImage,
    aspectRatio,
    size: "full"
  })}
          </div>
        \`)}
    </div>
  \`
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  parameters: {
    controls: {
      disable: true
    }
  },
  render: () => html\`
    <div style="display: grid; grid-template-columns: repeat(3, 160px); gap: var(--s2a-spacing-md);">
      \${OBJECT_FITS.map(objectFit => html\`
          <div>
            <div style="margin-bottom: var(--s2a-spacing-xs); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-body-subtle);">\${objectFit}</div>
            \${Media({
    src: fireflyImage,
    aspectRatio: "1:1",
    objectFit,
    size: "full"
  })}
          </div>
        \`)}
    </div>
  \`
}`,..._.parameters?.docs?.source}}},v=[`Default`,`WithOverlay`,`Video`,`AllAspectRatios`,`ObjectFitComparison`]})))()}y();export{g as AllAspectRatios,p as Default,_ as ObjectFitComparison,h as Video,m as WithOverlay,v as __namedExportsOrder,d as default};