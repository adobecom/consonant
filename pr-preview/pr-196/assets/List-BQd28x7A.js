import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{i as t,s as n,u as r}from"./iframe-BgLmQkiJ.js";var i,a;function o(){return(o=e((()=>{t(),i=({text:e=`List item`}={})=>r`
  <li class="c-list__item">${e}</li>
`,a=({sections:e=[]}={})=>r`
  <div class="c-list">
    ${e.map(({title:e=`Section title`,icon:t=n,divider:a=!0,items:o=[]})=>r`
        <section class="c-list__section">
          ${a?r`<hr class="c-list__divider" />`:n}
          <div class="c-list__title">
            ${t===n?n:r`<span class="c-list__icon" aria-hidden="true">${t}</span>`}
            <span class="c-list__title-text">${e}</span>
          </div>
          <ul class="c-list__items">
            ${o.map(e=>i({text:e}))}
          </ul>
        </section>
      `)}
  </div>
`})))()}function s(){return(s=e((()=>{o()})))()}export{a as n,o as r,s as t};