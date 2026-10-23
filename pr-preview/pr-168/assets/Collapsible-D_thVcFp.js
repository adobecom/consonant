import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{r as i,t as a}from"./unsafe-svg-DGjnSU_B.js";import{i as o,n as s,r as c,t as l}from"./ControlButton-BWccl9JB.js";var u,d,f;function p(){return(p=e((()=>{r(),a(),c(),s(),u=e=>{let t=e.currentTarget,n=t.closest(`.c-collapsible`),r=n&&document.getElementById(t.getAttribute(`aria-controls`)),i=n.getAttribute(`data-open`)!==`true`;n.setAttribute(`data-open`,String(i)),t.setAttribute(`aria-expanded`,String(i)),r&&(r.inert=!i)},d=0,f=({content:e=``,size:r=`default`,open:a=!1,style:s=`default`,label:c=`See what's included:`}={})=>{let f=`c-collapsible-${++d}`;return t`
      <div
        class="c-collapsible"
        data-size=${r}
        data-open=${String(a)}
        data-style=${s}
      >
      <button type="button" class="c-collapsible__trigger" aria-expanded=${String(a)} aria-controls="${f}" @click=${u}>
        ${(e=>e===n?n:t`<div class="c-collapsible__control-button">${e}</div>`)(s==="default"?n:t`<span data-open-state="true">${s===`control`?l({size:`md`,forceState:`default`,icon:`arrow-down`}):n}</span><span data-open-state="false">${l({size:`md`,forceState:`default`,icon:`arrow-right`})}</span>`)}
        <span class="c-collapsible__label">${c||`See what's included:`}</span>
        ${(e=>e===n?n:t`<div class="c-collapsible__s2-icon-chevron-down-20-n">${e}</div>`)(s===`control`?n:t`<span data-open-state="true">${i((o.entries[`s2-chevron-up`]??{}).svg??``)}</span><span data-open-state="false">${i((o.entries[`s2-chevron-down`]??{}).svg??``)}</span>`)}
      </button>
      <div id="${f}" role="region" class="c-collapsible__content" ?inert=${!a}>
        <div>
${e}
        </div>
      </div>
      </div>
`}})))()}export{p as n,f as t};