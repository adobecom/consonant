import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{C as i,a,c as o,f as s,g as c,i as l,l as u,p as d,r as f,w as p,x as m}from"./grid-viz-CqZnjXls.js";var h,g,_,v,y,b,x;function S(){return(S=e((()=>{r(),i(),a(),h=m[`section-spacing`],g=[`none`,`5xs`,`4xs`,`3xs`,`2xs`,`xs`,`sm`,`md`,`lg`,`xl`,`2xl`,`3xl`,`4xl`,`5xl`],_={title:`Foundations/Grid/Section spacing`,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{description:{component:h.description}}}},v=(e,t,n)=>p.scaleFindings.some(r=>r.family===e&&r.mode===t&&r.step===n),y=(e,n)=>{let r=g.map(t=>({step:t,px:h.tokens.find(n=>n.ref===`{s2a.${e}.${t}}`)?.values?.[n]??null})).filter(e=>typeof e.px==`number`),i=Math.max(...r.map(e=>e.px),1);return t`
    <div class="gv-scale">
      ${r.map(r=>t`
        <div class="gv-scale-row">
          <div><code>${r.step}</code></div>
          <div class="gv-scale-bars">
            <div
              class="gv-scale-bar"
              data-inverted=${String(v(e,n,r.step))}
              style="width:${Math.max(2,r.px/i*72)}%"
            >
              <span>${r.px}px${v(e,n,r.step)?` — inverted`:``}</span>
            </div>
          </div>
        </div>
      `)}
    </div>
  `},b={name:`Scales`,render:()=>d(t`
      ${f(h)}
      ${u(`section-spacing — the gap between sections`,`One scale, four faces. The compression on mobile is deliberate: 5xl is 240px in HD and 80px on a phone, so a page does not become a column of air.`,t`${c.map(e=>t`<h4 style="margin:var(--s2a-spacing-md) 0 var(--s2a-spacing-2xs);font-size:var(--s2a-font-size-sm)">${e.toUpperCase()}</h4>${y(`section-spacing`,e)}`)}`)}
      ${u(`viewport-vertical-padding — a section's own top and bottom`,null,t`${c.map(e=>t`<h4 style="margin:var(--s2a-spacing-md) 0 var(--s2a-spacing-2xs);font-size:var(--s2a-font-size-sm)">${e.toUpperCase()}</h4>${y(`viewport-vertical-padding`,e)}`)}`)}
      ${p.scaleFindings.length?u(`Scale inversions`,`Steps where the scale goes backwards — a larger t-shirt size resolving to a smaller value than the step below it. Found by the validator across all four modes, not by eye.`,t`
              <table class="gv-table">
                <thead><tr><th>Family</th><th>Mode</th><th>Step</th><th>Value</th><th>Previous step</th><th>Previous value</th></tr></thead>
                <tbody>
                  ${p.scaleFindings.map(e=>t`
                    <tr data-flag="warn">
                      <td><code>${e.family}</code></td>
                      <td>${e.mode}</td>
                      <td><code>${e.step}</code></td>
                      <td class="gv-num">${e.value}px</td>
                      <td><code>${e.previous}</code></td>
                      <td class="gv-num">${e.previousValue}px</td>
                    </tr>
                  `)}
                </tbody>
              </table>
            `):n}
      ${u(`Tokens`,`Every step, resolved at all four breakpoints from the built token CSS.`,s(h))}
      ${u(`Rules`,null,o(h.slug))}
      ${u(`Decisions`,null,l(h))}
    `)},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:'{\n  name: "Scales",\n  render: () => wrap(html`\n      ${contractHead(contract)}\n      ${section("section-spacing — the gap between sections", "One scale, four faces. The compression on mobile is deliberate: 5xl is 240px in HD and 80px on a phone, so a page does not become a column of air.", html`${MODES.map(m => html`<h4 style="margin:var(--s2a-spacing-md) 0 var(--s2a-spacing-2xs);font-size:var(--s2a-font-size-sm)">${m.toUpperCase()}</h4>${scaleFor("section-spacing", m)}`)}`)}\n      ${section("viewport-vertical-padding — a section\'s own top and bottom", null, html`${MODES.map(m => html`<h4 style="margin:var(--s2a-spacing-md) 0 var(--s2a-spacing-2xs);font-size:var(--s2a-font-size-sm)">${m.toUpperCase()}</h4>${scaleFor("viewport-vertical-padding", m)}`)}`)}\n      ${conformance.scaleFindings.length ? section("Scale inversions", "Steps where the scale goes backwards — a larger t-shirt size resolving to a smaller value than the step below it. Found by the validator across all four modes, not by eye.", html`\n              <table class="gv-table">\n                <thead><tr><th>Family</th><th>Mode</th><th>Step</th><th>Value</th><th>Previous step</th><th>Previous value</th></tr></thead>\n                <tbody>\n                  ${conformance.scaleFindings.map(f => html`\n                    <tr data-flag="warn">\n                      <td><code>${f.family}</code></td>\n                      <td>${f.mode}</td>\n                      <td><code>${f.step}</code></td>\n                      <td class="gv-num">${f.value}px</td>\n                      <td><code>${f.previous}</code></td>\n                      <td class="gv-num">${f.previousValue}px</td>\n                    </tr>\n                  `)}\n                </tbody>\n              </table>\n            `) : nothing}\n      ${section("Tokens", "Every step, resolved at all four breakpoints from the built token CSS.", tokenTable(contract))}\n      ${section("Rules", null, ruleList(contract.slug))}\n      ${section("Decisions", null, decisionList(contract))}\n    `)\n}',...b.parameters?.docs?.source}}},x=[`SectionSpacing`]})))()}S();export{b as SectionSpacing,x as __namedExportsOrder,_ as default};