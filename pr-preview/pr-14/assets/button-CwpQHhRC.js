import{E as o,x as a}from"./iframe-BGELIyqH.js";const y=()=>a`<i class="ph-bold ph-caret-down" aria-hidden="true"></i>`,I=t=>t==="accent"?"accent":"primary",B=(t,n,e)=>t==="accent"?"on-light":n||(e&&(e==="inverse"||e==="knockout")?"on-dark":"on-light"),h=t=>typeof t=="function"?t():t,D=({label:t="Label",background:n="solid",intent:e,context:_,size:x="md",state:s="default",tone:m,showIconStart:c=!1,showIconEnd:k=!1,iconStart:v,iconEnd:z,showElementEnd:i,href:l,onClick:u}={})=>{const r=I(e),$=B(r,_,m),f=x==="xs"?"xs":"md",d=typeof i=="boolean"?i:k,b=s&&s!=="default"?s:null,g=s==="disabled",p=a`
    ${c?a`<span class="c-button__icon c-button__icon--start" aria-hidden="true">
          ${h(v)??o}
        </span>`:o}
    <span class="c-button__label">${t}</span>
    ${d?a`<span class="c-button__icon c-button__icon--end" aria-hidden="true">
          ${h(z)??y()}
        </span>`:o}
  `;return l?a`
      <a
        class="c-button"
        data-background=${n}
        data-intent=${r}
        data-context=${$}
        data-size=${f}
        data-force-state=${b??o}
        data-has-icon-start=${c?"true":"false"}
        data-has-icon-end=${d?"true":"false"}
        href=${l}
        @click=${u}
      >
        ${p}
      </a>
    `:a`
    <button
      class="c-button"
      data-background=${n}
      data-intent=${r}
      data-context=${$}
      data-size=${f}
      data-force-state=${b??o}
      data-has-icon-start=${c?"true":"false"}
      data-has-icon-end=${d?"true":"false"}
      ?disabled=${g}
      type="button"
      @click=${u}
    >
      ${p}
    </button>
  `};export{D as B};
