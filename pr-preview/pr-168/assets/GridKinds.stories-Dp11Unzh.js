import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{C as i,a,c as o,d as s,f as c,i as l,l as u,o as d,p as f,r as p,t as m,u as h,x as g}from"./grid-viz-CqZnjXls.js";var _,v,y,b,x,S;function C(){return(C=e((()=>{r(),i(),a(),_={title:`Foundations/Grid/Grid kinds`,tags:[`autodocs`],parameters:{layout:`fullscreen`}},v=e=>t`
  <p class="gv-note">
    <strong>Proposed.</strong> ${e.name} is specified in Figma with no S2A
    implementation, so the demo below is drawn with inline CSS from the contract's own
    rules rather than with shipped classes. Its rules assert that the classes are
    <em>absent</em>, which is what keeps the gap visible instead of forgotten.
  </p>
`,y={render:()=>{let e=g[`bento-grid`];return f(t`
      ${p(e)}
      ${d()}
      ${u(`Live bento grid`,`A real .bento-grid with real col-lg-* and row-span-lg-* children. Rows are a fixed 120px, which is what makes a row span predictable; packing is dense, so a short tile backfills the hole a tall one leaves.`,t`
          ${h(t`
              <div class="container">
                <div class="bento-grid">
                  ${[{col:6,row:2},{col:3,row:1},{col:3,row:1},{col:3,row:1},{col:3,row:1},{col:4,row:2},{col:4,row:1},{col:4,row:1},{col:8,row:1}].map(e=>t`
                    <div class="gv-cell col-lg-${e.col} row-span-lg-${e.row} col-sm-full" data-tone="accent">
                      ${e.col}×${e.row}
                    </div>
                  `)}
                </div>
              </div>
            `,{overlay:!1})}
        `)}
      ${u(`Per-range behaviour`,null,m(e))}
      ${u(`Surface`,null,s(e))}
      ${u(`Tokens`,null,c(e))}
      ${u(`Rules`,null,o(e.slug))}
      ${u(`Decisions`,null,l(e))}
    `)}},b={name:`Object grid (proposed)`,render:()=>{let e=g[`object-grid`],n=(e,n)=>t`
      ${h(t`
          <div class="container">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,${e}px),1fr));gap:var(--s2a-grid-gutter)">
              ${Array.from({length:n},(e,n)=>t`<div class="gv-cell">${n+1}</div>`)}
            </div>
          </div>
        `,{overlay:!1})}
      <p class="gv-caption">minimum ${e}px · ${n} items — the row wraps on the item's own floor, not on a column count</p>
    `;return f(t`
      ${p(e)}
      ${v(e)}
      ${d()}
      ${u(`Behaviour at the proposed 230px floor`,`Will's note: 'a min of 230 will cover mocks for now'.`,t`${n(230,5)}${n(230,7)}`)}
      ${u(`The same set at a 320px floor`,`Shown because the floor is the whole design decision: it alone determines when a row wraps.`,n(320,5))}
      ${u(`Per-range behaviour`,null,m(e))}
      ${u(`Surface`,null,s(e))}
      ${u(`Tokens`,null,c(e))}
      ${u(`Rules`,null,o(e.slug))}
      ${u(`Decisions`,null,l(e))}
    `)}},x={name:`Ups grid (proposed)`,render:()=>{let e=g[`ups-grid`],r=(e,r,i)=>t`
      ${h(t`
          <div class="container">
            <div style="display:grid;gap:var(--s2a-grid-gutter);grid-template-columns:repeat(1,1fr)"
                 data-ups=${e}
                 class="gv-ups-${e}">
              ${Array.from({length:r},(a,o)=>{let s=i&&o===r-1&&r%e===1;return t`<div class="gv-cell" data-tone=${s?`orphan`:n}>${s?`orphan — full width`:o+1}</div>`})}
            </div>
          </div>
        `,{overlay:!1})}
      <p class="gv-caption">
        <code>.ups-grid.${[``,`one`,`two`,`three`,`four`,`five`,`six`][e]}-up</code>${i?t` <code>.orphan-full</code>`:n}
        — ${r} items
      </p>
    `;return f(t`
      ${p(e)}
      ${v(e)}
      ${d()}
      <style>
        /* The proposal, expressed exactly as Figma documents it. Scoped to this
           story: these are not shipped classes and must not look like they are. */
        @media (width >= 768px) { [class^="gv-ups-"] { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (width >= 1280px) {
          .gv-ups-2 { grid-template-columns: repeat(2, 1fr) !important; }
          .gv-ups-3 { grid-template-columns: repeat(3, 1fr) !important; }
          .gv-ups-4 { grid-template-columns: repeat(4, 1fr) !important; }
          .gv-ups-5 { grid-template-columns: repeat(5, 1fr) !important; }
          .gv-ups-6 { grid-template-columns: repeat(6, 1fr) !important; }
        }
        [class^="gv-ups-"] > .gv-cell[data-tone="orphan"] { grid-column: 1 / -1; }
      </style>
      ${u(`Two-up through six-up`,`Desktop counts as declared. Resize below 1280 and every set becomes two-up; below 768 every set stacks.`,t`
        ${r(2,4,!1)}${r(3,6,!1)}${r(4,8,!1)}${r(5,5,!1)}${r(6,6,!1)}
      `)}
      ${u(`The orphan rule`,`A lone last item stretches to full width instead of sitting half-empty. This is the part Figma documents as .orphan-full.`,t`
        ${r(3,7,!0)}${r(4,9,!0)}
      `)}
      ${u(`Per-range behaviour`,null,m(e))}
      ${u(`Surface`,null,s(e))}
      ${u(`Tokens`,null,c(e))}
      ${u(`Rules`,null,o(e.slug))}
      ${u(`Decisions`,null,l(e))}
    `)}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const c = contracts["bento-grid"];
    const tiles = [{
      col: 6,
      row: 2
    }, {
      col: 3,
      row: 1
    }, {
      col: 3,
      row: 1
    }, {
      col: 3,
      row: 1
    }, {
      col: 3,
      row: 1
    }, {
      col: 4,
      row: 2
    }, {
      col: 4,
      row: 1
    }, {
      col: 4,
      row: 1
    }, {
      col: 8,
      row: 1
    }];
    return wrap(html\`
      \${contractHead(c)}
      \${liveViewport()}
      \${section("Live bento grid", "A real .bento-grid with real col-lg-* and row-span-lg-* children. Rows are a fixed 120px, which is what makes a row span predictable; packing is dense, so a short tile backfills the hole a tall one leaves.", html\`
          \${stage(html\`
              <div class="container">
                <div class="bento-grid">
                  \${tiles.map(t => html\`
                    <div class="gv-cell col-lg-\${t.col} row-span-lg-\${t.row} col-sm-full" data-tone="accent">
                      \${t.col}×\${t.row}
                    </div>
                  \`)}
                </div>
              </div>
            \`, {
      overlay: false
    })}
        \`)}
      \${section("Per-range behaviour", null, behaviorTable(c))}
      \${section("Surface", null, surfaceTable(c))}
      \${section("Tokens", null, tokenTable(c))}
      \${section("Rules", null, ruleList(c.slug))}
      \${section("Decisions", null, decisionList(c))}
    \`);
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: "Object grid (proposed)",
  render: () => {
    const c = contracts["object-grid"];
    // Drawn from the proposal: auto-fit with a declared minimum. The 230px floor
    // is the open decision OBJ_MIN_VALUE, shown so the question is concrete.
    const demo = (min, count) => html\`
      \${stage(html\`
          <div class="container">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,\${min}px),1fr));gap:var(--s2a-grid-gutter)">
              \${Array.from({
      length: count
    }, (_, i) => html\`<div class="gv-cell">\${i + 1}</div>\`)}
            </div>
          </div>
        \`, {
      overlay: false
    })}
      <p class="gv-caption">minimum \${min}px · \${count} items — the row wraps on the item's own floor, not on a column count</p>
    \`;
    return wrap(html\`
      \${contractHead(c)}
      \${proposedWarning(c)}
      \${liveViewport()}
      \${section("Behaviour at the proposed 230px floor", "Will's note: 'a min of 230 will cover mocks for now'.", html\`\${demo(230, 5)}\${demo(230, 7)}\`)}
      \${section("The same set at a 320px floor", "Shown because the floor is the whole design decision: it alone determines when a row wraps.", demo(320, 5))}
      \${section("Per-range behaviour", null, behaviorTable(c))}
      \${section("Surface", null, surfaceTable(c))}
      \${section("Tokens", null, tokenTable(c))}
      \${section("Rules", null, ruleList(c.slug))}
      \${section("Decisions", null, decisionList(c))}
    \`);
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "Ups grid (proposed)",
  render: () => {
    const c = contracts["ups-grid"];
    // Drawn from the Figma specification: N-up at desktop, always two-up at
    // tablet, single column on mobile, with the orphan rule on the last item.
    const ups = (n, count, orphan) => html\`
      \${stage(html\`
          <div class="container">
            <div style="display:grid;gap:var(--s2a-grid-gutter);grid-template-columns:repeat(1,1fr)"
                 data-ups=\${n}
                 class="gv-ups-\${n}">
              \${Array.from({
      length: count
    }, (_, i) => {
      const isOrphan = orphan && i === count - 1 && count % n === 1;
      return html\`<div class="gv-cell" data-tone=\${isOrphan ? "orphan" : nothing}>\${isOrphan ? "orphan — full width" : i + 1}</div>\`;
    })}
            </div>
          </div>
        \`, {
      overlay: false
    })}
      <p class="gv-caption">
        <code>.ups-grid.\${["", "one", "two", "three", "four", "five", "six"][n]}-up</code>\${orphan ? html\` <code>.orphan-full</code>\` : nothing}
        — \${count} items
      </p>
    \`;
    return wrap(html\`
      \${contractHead(c)}
      \${proposedWarning(c)}
      \${liveViewport()}
      <style>
        /* The proposal, expressed exactly as Figma documents it. Scoped to this
           story: these are not shipped classes and must not look like they are. */
        @media (width >= 768px) { [class^="gv-ups-"] { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (width >= 1280px) {
          .gv-ups-2 { grid-template-columns: repeat(2, 1fr) !important; }
          .gv-ups-3 { grid-template-columns: repeat(3, 1fr) !important; }
          .gv-ups-4 { grid-template-columns: repeat(4, 1fr) !important; }
          .gv-ups-5 { grid-template-columns: repeat(5, 1fr) !important; }
          .gv-ups-6 { grid-template-columns: repeat(6, 1fr) !important; }
        }
        [class^="gv-ups-"] > .gv-cell[data-tone="orphan"] { grid-column: 1 / -1; }
      </style>
      \${section("Two-up through six-up", "Desktop counts as declared. Resize below 1280 and every set becomes two-up; below 768 every set stacks.", html\`
        \${ups(2, 4, false)}\${ups(3, 6, false)}\${ups(4, 8, false)}\${ups(5, 5, false)}\${ups(6, 6, false)}
      \`)}
      \${section("The orphan rule", "A lone last item stretches to full width instead of sitting half-empty. This is the part Figma documents as .orphan-full.", html\`
        \${ups(3, 7, true)}\${ups(4, 9, true)}
      \`)}
      \${section("Per-range behaviour", null, behaviorTable(c))}
      \${section("Surface", null, surfaceTable(c))}
      \${section("Tokens", null, tokenTable(c))}
      \${section("Rules", null, ruleList(c.slug))}
      \${section("Decisions", null, decisionList(c))}
    \`);
  }
}`,...x.parameters?.docs?.source}}},S=[`Bento`,`ObjectGrid`,`UpsGrid`]})))()}C();export{y as Bento,b as ObjectGrid,x as UpsGrid,S as __namedExportsOrder,_ as default};