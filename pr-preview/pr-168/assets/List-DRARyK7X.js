import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";var i,a;function o(){return(o=e((()=>{r(),i=({text:e=`List item`}={})=>t`
  <li class="c-list__item">${e}</li>
`,a=({sections:e=[]}={})=>t`
  <div class="c-list">
    ${e.map(({title:e=`Section title`,icon:r=n,divider:a=!0,items:o=[]})=>t`
        <section class="c-list__section">
          ${a?t`<hr class="c-list__divider" />`:n}
          <div class="c-list__title">
            ${r===n?n:t`<span class="c-list__icon" aria-hidden="true">${r}</span>`}
            <span class="c-list__title-text">${e}</span>
          </div>
          <ul class="c-list__items">
            ${o.map(e=>i({text:e}))}
          </ul>
        </section>
      `)}
  </div>
`})))()}function s(){return(s=e((()=>{o()})))()}export{a as n,o as r,s as t};