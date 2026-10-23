import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{C as r,S as i,a,c as o,d as s,f as c,i as l,l as u,n as d,o as f,p,r as m,t as h,v as g,x as _,y as v}from"./grid-viz-CqZnjXls.js";var y,b,x,S;function C(){return(C=e((()=>{n(),r(),a(),y=_[`grid-foundation`],b={title:`Foundations/Grid/Breakpoints`,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{description:{component:y.description}}}},x={render:()=>p(t`
      ${m(y)}
      ${u(`Live`,null,f())}
      ${u(`The ranges`,`Resize the preview and watch the active range move. XL begins at 1441 so that 1440 — the width every desktop mockup is drawn at — sits unambiguously inside the desktop range.`,d())}

      ${u(`Boundaries: stylesheet versus tokens`,`The grid stylesheet and the shipped responsive token files must begin each range at the same pixel. Nothing checked this before these contracts existed.`,t`
          <table class="gv-table">
            <thead><tr><th>Range</th><th>Contract says</th><th>Grid stylesheet</th><th>Token file</th><th>Agree</th></tr></thead>
            <tbody>
              ${v.map(e=>t`
                <tr data-flag=${e.boundaryAgrees?null:`fail`}>
                  <td><strong>${e.id.toUpperCase()}</strong></td>
                  <td class="gv-num">${e.minWidth==null?`no query`:i(e.minWidth)}</td>
                  <td class="gv-num">
                    ${e.stylesheet?t`<code>${e.stylesheet.mediaQuery}</code>`:e.stylesheetNearest?t`<code>${e.stylesheetNearest.mediaQuery}</code> <span class="gv-badge" data-tone="fail">no ${i(e.minWidth)} range</span>`:`—`}
                  </td>
                  <td class="gv-num">${e.tokenFile?.mediaQuery?t`<code>${e.tokenFile.mediaQuery}</code>`:`no query`}</td>
                  <td>${e.boundaryAgrees?`yes`:`no`}</td>
                </tr>
              `)}
            </tbody>
          </table>
          ${g().length?t`<p class="gv-note">
                ${g().length} range(s) disagree. At the disputed width a layout takes its
                columns from one range and its spacing from the other.
              </p>`:t`<p class="gv-note">All ranges agree.</p>`}
        `)}

      ${u(`Per-range behaviour`,null,h(y))}
      ${u(`Surface`,`What a consumer types, and what the stylesheet actually declares.`,s(y))}
      ${u(`Tokens`,`Resolved at each breakpoint from the built token CSS.`,c(y))}
      ${u(`Rules`,`${y.rules.length} rules, run against the evidence by npm run grid:check.`,o(y.slug))}
      ${u(`Decisions`,null,l(y))}
    `)},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:'{\n  render: () => wrap(html`\n      ${contractHead(contract)}\n      ${section("Live", null, liveViewport())}\n      ${section("The ranges", "Resize the preview and watch the active range move. XL begins at 1441 so that 1440 — the width every desktop mockup is drawn at — sits unambiguously inside the desktop range.", breakpointRanges())}\n\n      ${section("Boundaries: stylesheet versus tokens", "The grid stylesheet and the shipped responsive token files must begin each range at the same pixel. Nothing checked this before these contracts existed.", html`\n          <table class="gv-table">\n            <thead><tr><th>Range</th><th>Contract says</th><th>Grid stylesheet</th><th>Token file</th><th>Agree</th></tr></thead>\n            <tbody>\n              ${breakpoints.map(bp => html`\n                <tr data-flag=${bp.boundaryAgrees ? null : "fail"}>\n                  <td><strong>${bp.id.toUpperCase()}</strong></td>\n                  <td class="gv-num">${bp.minWidth == null ? "no query" : fmtPx(bp.minWidth)}</td>\n                  <td class="gv-num">\n                    ${bp.stylesheet ? html`<code>${bp.stylesheet.mediaQuery}</code>` : bp.stylesheetNearest ? html`<code>${bp.stylesheetNearest.mediaQuery}</code> <span class="gv-badge" data-tone="fail">no ${fmtPx(bp.minWidth)} range</span>` : "—"}\n                  </td>\n                  <td class="gv-num">${bp.tokenFile?.mediaQuery ? html`<code>${bp.tokenFile.mediaQuery}</code>` : "no query"}</td>\n                  <td>${bp.boundaryAgrees ? "yes" : "no"}</td>\n                </tr>\n              `)}\n            </tbody>\n          </table>\n          ${boundaryConflicts().length ? html`<p class="gv-note">\n                ${boundaryConflicts().length} range(s) disagree. At the disputed width a layout takes its\n                columns from one range and its spacing from the other.\n              </p>` : html`<p class="gv-note">All ranges agree.</p>`}\n        `)}\n\n      ${section("Per-range behaviour", null, behaviorTable(contract))}\n      ${section("Surface", "What a consumer types, and what the stylesheet actually declares.", surfaceTable(contract))}\n      ${section("Tokens", "Resolved at each breakpoint from the built token CSS.", tokenTable(contract))}\n      ${section("Rules", `${contract.rules.length} rules, run against the evidence by npm run grid:check.`, ruleList(contract.slug))}\n      ${section("Decisions", null, decisionList(contract))}\n    `)\n}',...x.parameters?.docs?.source}}},S=[`Breakpoints`]})))()}C();export{x as Breakpoints,S as __namedExportsOrder,b as default};