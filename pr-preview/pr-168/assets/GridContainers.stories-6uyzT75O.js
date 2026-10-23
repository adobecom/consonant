import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{C as i,a,b as o,c as s,d as c,f as l,i as u,l as d,o as f,p,r as m,s as h,t as g,u as _,x as v}from"./grid-viz-CqZnjXls.js";function y(e){let n=`gv-m-${Math.random().toString(36).slice(2,8)}`;return requestAnimationFrame(()=>{let t=document.getElementById(n);if(!t)return;let r=()=>{let n=t.getBoundingClientRect(),r=t.querySelector(`[data-measure]`);r&&(r.textContent=`${e} — ${Math.round(n.width)}px wide at ${window.innerWidth}px viewport`)};r(),window.addEventListener(`resize`,r,{passive:!0})}),t`
    <div class=${e} id=${n}>
      <div class="gv-container-fill"><span data-measure>—</span></div>
    </div>
  `}var b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{r(),i(),a(),b={title:`Foundations/Grid/Containers`,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{description:{component:`
Five container families. A container decides the content width and the side
margins; it never decides placement — that is the grid's job, and a container
should wrap a \`.row\` rather than carry column classes itself.

The boxes below are real elements with the real classes, measured in the
browser, so the number under each one is the width the stylesheet actually
produces at your current viewport.
        `}}}},x=e=>{let r=e.anchors?.code?.rootClass;return t`
    ${m(e)}
    ${r?_(t`<div class="gv-container-demo">${y(r)}</div>`,{overlay:!0}):n}
    ${r?t`<p class="gv-caption">The outlined box is <code>.${r}</code>. The blue columns behind it are the grid the container establishes for its children.</p>`:n}
    ${d(`Per-range behaviour`,null,g(e))}
    ${d(`Surface`,null,c(e))}
    ${e.tokens.length?d(`Tokens`,null,l(e)):n}
    ${d(`Rules`,null,s(e.slug))}
    ${d(`Decisions`,null,u(e))}
  `},S={name:`All families`,render:()=>p(t`
      <div class="gv-head">
        <span class="fg-eyebrow">Layout foundation · Reference</span><h1>Container families</h1>
        <p>
          Standard, HD, token-offset, fluid and constrained — side by side at your current
          viewport, each with the column overlay behind it. Resize the preview to watch the
          percentage rule take over from the token margins.
        </p>
      </div>
      ${f()}
      ${h(!0)}
      ${o(`container`).map(e=>{let r=e.anchors?.code?.rootClass;return t`
          <div class="gv-section">
            <h3>${e.name} <span class="gv-badge">${e.status}</span></h3>
            <p class="gv-note">${e.description}</p>
            ${r?_(t`<div class="gv-container-demo">${y(r)}</div>`,{overlay:!0}):n}
          </div>
        `})}
    `)},C={render:()=>p(t`${f()}${h(!0)}${x(v[`container-standard`])}`)},w={name:`HD`,render:()=>p(t`${f()}${h(!0)}${x(v[`container-hd`])}`)},T={name:`Token offset`,render:()=>p(t`${f()}${h(!0)}${x(v[`container-token-offset`])}`)},E={render:()=>p(t`${f()}${h(!0)}${x(v[`container-fluid`])}`)},D={render:()=>{let e=v[`container-constrained`];return p(t`
      ${f()}
      ${h(!0)}
      ${m(e)}
      <p class="gv-note">
        These are modifiers: each is combined with <code>.container</code>, which supplies the
        centring and the side margins, and only the cap is overridden. Used alone they set a
        width with no margins and the section sits flush left — see the open decision below.
      </p>
      ${[`container-12`,`container-10`,`container-8`,`container-6`].map(e=>t`
        ${_(t`<div class="gv-container-demo">${y(`container ${e}`)}</div>`,{overlay:!0})}
        <p class="gv-caption"><code>.container.${e}</code></p>
      `)}
      ${d(`Per-range behaviour`,null,g(e))}
      ${d(`Surface`,null,c(e))}
      ${d(`Rules`,null,s(e.slug))}
      ${d(`Decisions`,null,u(e))}
    `)}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: "All families",
  render: () => wrap(html\`
      <div class="gv-head">
        <span class="fg-eyebrow">Layout foundation · Reference</span><h1>Container families</h1>
        <p>
          Standard, HD, token-offset, fluid and constrained — side by side at your current
          viewport, each with the column overlay behind it. Resize the preview to watch the
          percentage rule take over from the token margins.
        </p>
      </div>
      \${liveViewport()}
      \${overlayToggle(true)}
      \${byKind("container").map(c => {
    const klass = c.anchors?.code?.rootClass;
    return html\`
          <div class="gv-section">
            <h3>\${c.name} <span class="gv-badge">\${c.status}</span></h3>
            <p class="gv-note">\${c.description}</p>
            \${klass ? stage(html\`<div class="gv-container-demo">\${measured(klass)}</div>\`, {
      overlay: true
    }) : nothing}
          </div>
        \`;
  })}
    \`)
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:'{\n  render: () => wrap(html`${liveViewport()}${overlayToggle(true)}${familyPanel(contracts["container-standard"])}`)\n}',...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:'{\n  name: "HD",\n  render: () => wrap(html`${liveViewport()}${overlayToggle(true)}${familyPanel(contracts["container-hd"])}`)\n}',...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:'{\n  name: "Token offset",\n  render: () => wrap(html`${liveViewport()}${overlayToggle(true)}${familyPanel(contracts["container-token-offset"])}`)\n}',...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:'{\n  render: () => wrap(html`${liveViewport()}${overlayToggle(true)}${familyPanel(contracts["container-fluid"])}`)\n}',...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const c = contracts["container-constrained"];
    return wrap(html\`
      \${liveViewport()}
      \${overlayToggle(true)}
      \${contractHead(c)}
      <p class="gv-note">
        These are modifiers: each is combined with <code>.container</code>, which supplies the
        centring and the side margins, and only the cap is overridden. Used alone they set a
        width with no margins and the section sits flush left — see the open decision below.
      </p>
      \${["container-12", "container-10", "container-8", "container-6"].map(k => html\`
        \${stage(html\`<div class="gv-container-demo">\${measured(\`container \${k}\`)}</div>\`, {
      overlay: true
    })}
        <p class="gv-caption"><code>.container.\${k}</code></p>
      \`)}
      \${section("Per-range behaviour", null, behaviorTable(c))}
      \${section("Surface", null, surfaceTable(c))}
      \${section("Rules", null, ruleList(c.slug))}
      \${section("Decisions", null, decisionList(c))}
    \`);
  }
}`,...D.parameters?.docs?.source}}},O=[`AllFamilies`,`Standard`,`HD`,`TokenOffset`,`Fluid`,`Constrained`]})))()}k();export{S as AllFamilies,D as Constrained,E as Fluid,w as HD,C as Standard,T as TokenOffset,O as __namedExportsOrder,b as default};