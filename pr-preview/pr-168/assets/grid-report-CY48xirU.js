import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,n as r,t as i}from"./lit-DRzJKe3d.js";import{C as a,_ as o,a as s,h as c,m as l,n as u,p as d,w as f}from"./grid-viz-CqZnjXls.js";var p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{i(),a(),s(),c(),p={"grid-foundation":`breakpoints--breakpoints`,"container-standard":`containers--standard`,"container-hd":`containers--hd`,"container-token-offset":`containers--token-offset`,"container-fluid":`containers--fluid`,"container-constrained":`containers--constrained`,"column-grid":`column-grid--column-grid`,"bento-grid":`grid-kinds--bento`,"object-grid":`grid-kinds--object-grid`,"ups-grid":`grid-kinds--ups-grid`,"section-spacing":`section-spacing--section-spacing`},m=e=>`./?path=/story/foundations-grid-${p[e]}`,h={STD_XL_1920:`Standard container stops at 1440px`,OFF_HANDOVER_XL:`Hero offset switches one pixel early`,BP_XL_1441:`The XL stylesheet boundary differs`,BP_AGREE_XL:`Grid and token ranges start at different widths`,BENTO_ROW_HEIGHT_TOKEN:`Bento row height has no shipped token`,FLUID_CAP_2560:`Fluid has no fixed width ceiling`},g={pass:`Passed`,fail:`Failure`,warn:`Warning`,manual:`Manual review`},_=e=>e.status===`fail`?e.severity:e.status,v=(e,r)=>t`<span class="gv-badge" data-tone=${r??n}>${e}</span>`,y=(e,n)=>t`<s2a-grid-scroll .label=${e} .content=${n}></s2a-grid-scroll>`,b=(e,r,i,a)=>t`<div class="gv-stat" data-tone=${a??n}>
    <strong>${e}</strong><span>${r}</span><small>${i}</small>
  </div>`,x=e=>f.contracts.find(t=>t.slug===e),S=class extends r{static properties={view:{},query:{state:!0},filter:{state:!0},contract:{state:!0}};constructor(){super(),this.view=`conformance`,this.query=``,this.filter=`all`,this.contract=`all`}createRenderRoot(){return this}reset(){this.query=``,this.filter=`all`,this.contract=`all`}empty(){return t`<div class="gv-empty">
      <h3>No matches found</h3>
      <p>Try another search or clear the filters.</p>
      <button class="fg-button fg-secondary" @click=${()=>this.reset()}>
        Clear filters
      </button>
    </div>`}head(e,n,r){return t`<header class="gv-head">
      <span class="fg-eyebrow">${r}</span>
      <h1>${e}</h1>
      <p>${n}</p>
    </header>`}control(e,n,r){return t`<label class="fg-field"
      >${e}<select
        aria-label=${e}
        .value=${this[r]}
        @change=${e=>this[r]=e.target.value}
      >
        ${n.map(([e,n])=>t`<option value=${e} ?selected=${this[r]===e}>${n}</option>`)}
      </select></label
    >`}search(e){return t`<label class="fg-field gv-search"
      >${e}<input
        type="search"
        aria-label=${e}
        placeholder=${this.view===`index`?`Name, kind, or purpose…`:`Rule, statement, or evidence…`}
        .value=${this.query}
        @input=${e=>this.query=e.target.value}
    /></label>`}index(){let e=f.totals,r=this.query.toLowerCase().trim(),i=o.filter(e=>(this.filter===`all`||e.kind===this.filter)&&`${e.name} ${e.kind} ${e.slug} ${l[e.slug]}`.toLowerCase().includes(r));return t`${this.head(`Grid contracts.`,`Explore the agreements behind the layout system. Each contract connects design intent to responsive behavior, implementation details, and checks you can review.`,`Layout foundation · Contract index`)}
      <div class="gv-stats">
        ${b(o.length,`Contracts`,`Across the layout system`)}${b(o.filter(e=>e.status===`shipped`).length,`Shipped`,`Current implementation`)}${b(o.filter(e=>e.status===`proposed`).length,`Proposed`,`Behavior to review`)}${b(e.openDecisions,`Open decisions`,`Choices still to resolve`)}
      </div>
      <div class="gv-summary">
        <span
          >${e.rules} rules · ${e.pass} passed · ${e.fail} failures · ${e.warn}
          warnings · ${e.manual} manual</span
        ><a
          href="./?path=/story/foundations-grid-conformance--conformance"
          target="_top"
          >Review conformance →</a
        >
      </div>
      <section class="gv-section">
        <h2>Find the agreement you need.</h2>
        <p class="gv-note">
          Start with a container, arrangement, or spacing rule. A shipped
          contract can still have findings; implementation status and check
          results describe different things.
        </p>
        <div class="gv-report-controls">
          ${this.search(`Search contracts`)}${this.control(`Contract kind`,[[`all`,`All kinds`],[`foundation`,`Foundation`],[`container`,`Containers`],[`grid`,`Grids`],[`spacing`,`Spacing`]],`filter`)}
        </div>
        <p class="gv-result-count" role="status">
          ${i.length} of ${o.length} contracts
        </p>
        <div class="gv-catalog">
          ${i.map(e=>{let r=x(e.slug);return t`<article class="gv-contract-card">
              <div class="gv-card-top">
                <span class="gv-card-kind">${e.kind} · ${e.tier}</span
                >${v(e.status,e.status===`proposed`?`info`:void 0)}
              </div>
              <h3><a href=${m(e.slug)} target="_top">${e.name}</a></h3>
              <p>${l[e.slug]}</p>
              <a class="gv-card-link" href=${m(e.slug)} target="_top"
                >Explore contract →</a
              >
              <footer>
                ${r?t`${v(`${r.pass} passed`,`pass`)}${r.fail?v(`${r.fail} failure${r.fail===1?``:`s`}`,`fail`):n}${r.warn?v(`${r.warn} warning${r.warn===1?``:`s`}`,`warn`):n}${r.manual?v(`${r.manual} manual`):n}`:n}
              </footer>
            </article>`})}
        </div>
        ${i.length?n:this.empty()}
      </section>
      <section class="gv-section">
        <h2>A shared responsive foundation.</h2>
        <p class="gv-note">
          The contracts use these four ranges. The XL boundary difference
          remains visible so the design and CSS can be reconciled.
        </p>
        <s2a-grid-scroll
          .label=${`Responsive ranges`}
          .content=${u({active:!1})}
        ></s2a-grid-scroll>
      </section>
      <section class="gv-section">
        <h2>Trace each contract to its sources.</h2>
        <p class="gv-note">
          The generated output records the definitions, CSS evidence, and Figma
          evidence used to build it.
        </p>
        <details class="gv-disclosure">
          <summary>
            <span>Source fingerprints</span
            ><small>${o.length} contracts</small>
          </summary>
          <div class="gv-disclosure-body">
            ${y(`Source fingerprints`,t`<table class="gv-table">
                <thead>
                  <tr>
                    <th>Contract</th>
                    <th>Definitions</th>
                    <th>CSS evidence</th>
                    <th>Figma evidence</th>
                  </tr>
                </thead>
                <tbody>
                  ${o.map(e=>t`<tr>
                  <td>${e.name}</td>
                  ${[`defs`,`code`,`figma`].map(n=>t`<td><code>${e.provenance[n].slice(7,19)}</code></td>`)}
                </tr>`)}
                </tbody>
              </table>`)}
          </div>
        </details>
      </section>`}conformance(){let e=f.totals,r=f.contracts.flatMap(e=>e.rules.filter(e=>e.status===`fail`).map(t=>({...t,slug:e.slug,name:e.name}))).sort((e,t)=>(e.severity===`fail`?0:1)-(t.severity===`fail`?0:1)),i=this.query.trim().toLowerCase(),a=f.contracts.filter(e=>this.contract===`all`||this.contract===e.slug).map(e=>({...e,rules:e.rules.filter(t=>(this.filter===`all`||_(t)===this.filter)&&`${e.name} ${t.id} ${t.statement} ${t.detail}`.toLowerCase().includes(i))})).filter(e=>e.rules.length),o=a.reduce((e,t)=>e+t.rules.length,0);return t`${this.head(`Grid conformance.`,`See where the implementation matches the agreement—and where it needs attention. Review the findings, inspect individual rules, and follow the decisions still open.`,`Layout foundation · Evidence & quality`)}
      <div class="gv-stats">
        ${b(e.pass,`Passed`,`Checks match the agreement`)}${b(e.fail,`Failures`,`Differences to resolve`,`fail`)}${b(e.warn,`Warnings`,`Items to review`)}${b(e.manual,`Manual review`,`Requires a person’s judgment`)}
      </div>
      <div class="gv-summary">
        <span>${e.rules} rules across ${e.contracts} contracts</span
        ><span
          >${e.stale} stale outputs · ${e.schemaInvalid} schema errors</span
        >
      </div>
      <section class="gv-section">
        <div class="gv-report-heading">
          <h2>What needs attention.</h2>
          ${v(`${r.length} findings`)}
        </div>
        <p class="gv-note">
          Failures appear first, followed by warnings. Each finding keeps the
          observed behavior next to the contract it belongs to.
        </p>
        <div class="gv-report-grid">
          ${r.map(e=>t`<article class="gv-finding" data-tone=${e.severity}>
                <div class="gv-card-top">
                  <a href=${m(e.slug)} target="_top">${e.name} ↗</a
                  >${v(g[e.severity],e.severity)}
                </div>
                <h3>${h[e.id]||e.id.replaceAll(`_`,` `)}</h3>
                <p class="gv-evidence">${e.detail}</p>
                <details class="gv-inline-details">
                  <summary>Expected behavior and rule</summary>
                  <p>${e.statement}</p>
                  <p><code>${e.id}</code> · ${e.type}</p>
                </details>
              </article>`)}
        </div>
        ${r.length?n:t`<p class="gv-note">No automated failures or warnings were reported. Manual reviews remain listed below.</p>`}
      </section>
      <section class="gv-section">
        <h2>Inspect the rules.</h2>
        <p class="gv-note">
          Search the report or narrow it by outcome and contract. Expand a group
          to see the exact check and evidence.
        </p>
        <div class="gv-report-controls">
          ${this.search(`Search rules`)}${this.control(`Outcome`,[[`all`,`All outcomes`],[`fail`,`Failures`],[`warn`,`Warnings`],[`manual`,`Manual review`],[`pass`,`Passed`]],`filter`)}${this.control(`Contract`,[[`all`,`All contracts`],...f.contracts.map(e=>[e.slug,e.name])],`contract`)}
        </div>
        <p class="gv-result-count" role="status">
          ${o} of ${e.rules} rules · ${a.length} contracts
        </p>
        <div class="gv-report-rules">
          ${a.map(e=>t`<details
                class="gv-disclosure"
                ?open=${this.filter!==`all`||!!i}
              >
                <summary>
                  <span>${e.name}</span
                  ><small
                    >${e.rules.length} shown · ${e.fail} failures · ${e.warn}
                    warnings</small
                  >
                </summary>
                <div class="gv-disclosure-body">
                  <div class="gv-rules">
                    ${e.rules.map(e=>t`<div
                      class="gv-rule"
                      data-status=${e.status}
                      data-severity=${e.severity}
                    >
                      <span class="gv-rule-mark" aria-hidden="true"
                        >${{pass:`✓`,fail:`×`,warn:`!`,manual:`○`}[_(e)]}</span
                      >
                      <div>
                        <div class="gv-card-top">
                          ${v(g[_(e)],_(e))}<code
                            class="gv-rule-id"
                            >${e.id}</code
                          >
                        </div>
                        <p>${e.statement}</p>
                        <p class="gv-rule-detail">${e.detail}</p>
                      </div>
                    </div>`)}
                  </div>
                </div>
              </details>`)}
        </div>
        ${o?n:this.empty()}
      </section>
      <section class="gv-section">
        <h2>Decisions and supporting evidence.</h2>
        <p class="gv-note">
          Keep unresolved choices and source checks nearby without losing the
          main findings.
        </p>
        <details class="gv-disclosure">
          <summary>
            <span>Open decisions</span
            ><small>${e.openDecisions} questions</small>
          </summary>
          <div class="gv-disclosure-body">
            ${y(`Open decisions`,t`<table class="gv-table">
                <thead>
                  <tr>
                    <th>Contract</th>
                    <th>Owner</th>
                    <th>Question</th>
                  </tr>
                </thead>
                <tbody>
                  ${f.contracts.flatMap(e=>e.openDecisions.map(n=>t`<tr>
                    <td><a href=${m(e.slug)} target="_top">${e.name}</a></td>
                    <td>${n.owner??`Unassigned`}</td>
                    <td>${n.question}</td>
                  </tr>`))}
                </tbody>
              </table>`)}
          </div>
        </details>
        <details class="gv-disclosure">
          <summary>
            <span>Spacing scale inversions</span
            ><small>${f.scaleFindings.length} observations</small>
          </summary>
          <div class="gv-disclosure-body">
            <p class="gv-note">
              These observations are separate from the ${e.rules} rules above. A
              larger named step resolves to a smaller value than the preceding
              step.
            </p>
            ${f.scaleFindings.map(e=>t`<div class="gv-decision">${e.detail}</div>`)}
          </div>
        </details>
        <details class="gv-disclosure">
          <summary>
            <span>Source and freshness</span
            ><small>${e.stale} stale · ${e.schemaInvalid} schema errors</small>
          </summary>
          <div class="gv-disclosure-body">
            <p class="gv-note">
              This page renders
              <code>packages/grid/out/grid-conformance.json</code>, generated by
              <code>npm run grid:check</code>. Freshness below is the result
              recorded in that report, not a live background check.
            </p>
            ${y(`Output freshness`,t`<table class="gv-table">
                <thead>
                  <tr>
                    <th>Generated file</th>
                    <th>Recorded state</th>
                  </tr>
                </thead>
                <tbody>
                  ${f.freshness.map(e=>t`<tr>
                  <td><code>${e.file}</code></td>
                  <td>${e.fresh?v(`Fresh`,`pass`):e.reason}</td>
                </tr>`)}
                </tbody>
              </table>`)}
          </div>
        </details>
      </section>`}render(){return d(this.view===`index`?this.index():this.conformance())}},customElements.get(`s2a-grid-report`)||customElements.define(`s2a-grid-report`,S),C=e=>t`<s2a-grid-report .view=${e}></s2a-grid-report>`})))()}export{C as n,w as t};