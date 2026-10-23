import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{C as r,a as i,c as a,d as o,f as s,i as c,l,o as u,p as d,r as f,s as p,t as m,u as h,x as g}from"./grid-viz-CqZnjXls.js";var _,v,y,b,x,S;function C(){return(C=e((()=>{n(),r(),i(),_=g[`column-grid`],v={title:`Foundations/Grid/Column grid`,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{description:{component:_.description}}}},y=e=>t`
  ${h(t`
      <div class="container">
        <div class="row">
          ${e.map(e=>t`
            <div class="gv-cell col-lg-${e} col-md-${Math.min(12,Math.max(1,e))} col-sm-${e<=3?3:6}" data-tone="accent">
              ${e}
            </div>
          `)}
        </div>
      </div>
    `,{overlay:!0})}
  <p class="gv-caption">
    ${e.map(e=>t`<code>.col-lg-${e}</code> `)}
    — ${e.reduce((e,t)=>e+t,0)} of 12 columns
  </p>
`,b={name:`Spans`,render:()=>d(t`
      ${f(_)}
      ${u()}
      ${p(!0)}
      ${l(`Span patterns`,`Every row below is a real .container wrapping a real .row. The cells carry col-lg-*, col-md-* and col-sm-* classes from packages/grid — nothing here is drawn by hand.`,t`${_.visualize.spans.map(y)}`)}
      ${l(`Per-range behaviour`,null,m(_))}
      ${l(`Surface`,`The whole class vocabulary, with what the stylesheet declares.`,o(_))}
      ${l(`Tokens`,null,s(_))}
      ${l(`Rules`,null,a(_.slug))}
      ${l(`Decisions`,null,c(_))}
    `)},x={render:()=>d(t`
      <div class="gv-head">
        <span class="fg-eyebrow">Layout foundation · Reference</span><h1>Column starts</h1>
        <p>
          <code>start-lg-*</code> places an item at a named column, which is how an
          asymmetric layout is expressed without an empty spacer element.
        </p>
      </div>
      ${u()}
      ${p(!0)}
      ${[{start:2,span:10},{start:3,span:8},{start:4,span:6},{start:7,span:6}].map(({start:e,span:n})=>t`
        ${h(t`
            <div class="container">
              <div class="row">
                <div class="gv-cell col-lg-${n} start-lg-${e} col-sm-full" data-tone="accent">
                  start ${e} · span ${n}
                </div>
              </div>
            </div>
          `,{overlay:!0})}
        <p class="gv-caption"><code>.col-lg-${n}.start-lg-${e}</code></p>
      `)}
    `)},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:'{\n  name: "Spans",\n  render: () => wrap(html`\n      ${contractHead(contract)}\n      ${liveViewport()}\n      ${overlayToggle(true)}\n      ${section("Span patterns", "Every row below is a real .container wrapping a real .row. The cells carry col-lg-*, col-md-* and col-sm-* classes from packages/grid — nothing here is drawn by hand.", html`${contract.visualize.spans.map(spanRow)}`)}\n      ${section("Per-range behaviour", null, behaviorTable(contract))}\n      ${section("Surface", "The whole class vocabulary, with what the stylesheet declares.", surfaceTable(contract))}\n      ${section("Tokens", null, tokenTable(contract))}\n      ${section("Rules", null, ruleList(contract.slug))}\n      ${section("Decisions", null, decisionList(contract))}\n    `)\n}',...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => wrap(html\`
      <div class="gv-head">
        <span class="fg-eyebrow">Layout foundation · Reference</span><h1>Column starts</h1>
        <p>
          <code>start-lg-*</code> places an item at a named column, which is how an
          asymmetric layout is expressed without an empty spacer element.
        </p>
      </div>
      \${liveViewport()}
      \${overlayToggle(true)}
      \${[{
    start: 2,
    span: 10
  }, {
    start: 3,
    span: 8
  }, {
    start: 4,
    span: 6
  }, {
    start: 7,
    span: 6
  }].map(({
    start,
    span
  }) => html\`
        \${stage(html\`
            <div class="container">
              <div class="row">
                <div class="gv-cell col-lg-\${span} start-lg-\${start} col-sm-full" data-tone="accent">
                  start \${start} · span \${span}
                </div>
              </div>
            </div>
          \`, {
    overlay: true
  })}
        <p class="gv-caption"><code>.col-lg-\${span}.start-lg-\${start}</code></p>
      \`)}
    \`)
}`,...x.parameters?.docs?.source}}},S=[`ColumnGrid`,`Offsets`]})))()}C();export{b as ColumnGrid,x as Offsets,S as __namedExportsOrder,v as default};