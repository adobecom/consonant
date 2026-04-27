import{E as a,x as n}from"./iframe-BJXp3qu0.js";/* empty css               */const D=()=>n`<i class="ph-bold ph-caret-down" aria-hidden="true"></i>`,I=t=>t==="accent"?"accent":"primary",B=(t,e,o)=>t==="accent"?"on-light":e||(o&&(o==="inverse"||o==="knockout")?"on-dark":"on-light"),x=t=>typeof t=="function"?t():t,P=({label:t="Label",background:e="solid",intent:o,context:m,size:k="md",state:c="default",tone:g,showIconStart:r=!1,showIconEnd:z=!1,iconStart:v,iconEnd:y,showElementEnd:u,href:$,onClick:f}={})=>{const i=I(o),b=B(i,m,g),p=k==="xs"?"xs":"md",d=typeof u=="boolean"?u:z,h=c&&c!=="default"?c:null,s=c==="disabled",C=l=>{if(s){l.preventDefault(),l.stopPropagation();return}f?.(l)},_=n`
    ${r?n`<span
          class="c-button__icon c-button__icon--start"
          aria-hidden="true"
        >
          ${x(v)??a}
        </span>`:a}
    <span class="c-button__label">${t}</span>
    ${d?n`<span
          class="c-button__icon c-button__icon--end"
          aria-hidden="true"
        >
          ${x(y)??D()}
        </span>`:a}
  `;return $?n`
      <a
        class="c-button"
        data-background=${e}
        data-intent=${i}
        data-context=${b}
        data-size=${p}
        data-force-state=${h??a}
        data-has-icon-start=${r?"true":"false"}
        data-has-icon-end=${d?"true":"false"}
        href=${s?a:$}
        aria-disabled=${s?"true":a}
        tabindex=${s?"-1":a}
        @click=${C}
      >
        ${_}
      </a>
    `:n`
    <button
      class="c-button"
      data-background=${e}
      data-intent=${i}
      data-context=${b}
      data-size=${p}
      data-force-state=${h??a}
      data-has-icon-start=${r?"true":"false"}
      data-has-icon-end=${d?"true":"false"}
      ?disabled=${s}
      type="button"
      @click=${f}
    >
      ${_}
    </button>
  `};export{P as B};
