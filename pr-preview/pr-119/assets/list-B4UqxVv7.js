import{E as t,x as s}from"./iframe-ANPZYgWM.js";const n=({text:i="List item"}={})=>s`
  <li class="c-list__item">${i}</li>
`,d=({sections:i=[]}={})=>s`
  <div class="c-list">
    ${i.map(({title:c="Section title",icon:l=t,divider:a=!0,items:e=[]})=>s`
        <section class="c-list__section">
          ${a?s`<hr class="c-list__divider" />`:t}
          <div class="c-list__title">
            ${l!==t?s`<span class="c-list__icon" aria-hidden="true">${l}</span>`:t}
            <span class="c-list__title-text">${c}</span>
          </div>
          <ul class="c-list__items">
            ${e.map(_=>n({text:_}))}
          </ul>
        </section>
      `)}
  </div>
`;export{d as L};
