import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";var i,a;function o(){return(o=e((()=>{r(),i=({text:e=`List item`}={})=>n`
  <li class="c-list__item">${e}</li>
`,a=({sections:e=[]}={})=>n`
  <div class="c-list">
    ${e.map(({title:e=`Section title`,icon:r=t,divider:a=!0,items:o=[]})=>n`
        <section class="c-list__section">
          ${a?n`<hr class="c-list__divider" />`:t}
          <div class="c-list__title">
            ${r===t?t:n`<span class="c-list__icon" aria-hidden="true">${r}</span>`}
            <span class="c-list__title-text">${e}</span>
          </div>
          <ul class="c-list__items">
            ${o.map(e=>i({text:e}))}
          </ul>
        </section>
      `)}
  </div>
`})))()}function s(){return(s=e((()=>{o()})))()}export{a as n,o as r,s as t};