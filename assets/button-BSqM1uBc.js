import{E as a,x as s}from"./iframe-Dvdium2s.js";import{o as C}from"./unsafe-html-B8fzM46G.js";import{c as I}from"./chevron-down-Bqt06uWP.js";const B=()=>C(I),S=t=>t==="accent"?"accent":"primary",A=(t,n,e)=>t==="accent"?"on-light":n||(e&&(e==="inverse"||e==="knockout")?"on-dark":"on-light"),_=t=>typeof t=="function"?t():t,q=({label:t="Label",background:n="solid",intent:e,context:x,size:g="md",state:c="default",tone:k,showIconStart:r=!1,showIconEnd:v=!1,iconStart:z,iconEnd:y,showElementEnd:u,href:$,onClick:f}={})=>{const i=S(e),b=A(i,x,k),p=g==="xs"?"xs":"md",d=typeof u=="boolean"?u:v,h=c&&c!=="default"?c:null,o=c==="disabled",D=l=>{if(o){l.preventDefault(),l.stopPropagation();return}f?.(l)},m=s`
    ${r?s`<span
          class="c-button__icon c-button__icon--start"
          aria-hidden="true"
        >
          ${_(z)??a}
        </span>`:a}
    <span class="c-button__label">${t}</span>
    ${d?s`<span
          class="c-button__icon c-button__icon--end"
          aria-hidden="true"
        >
          ${_(y)??B()}
        </span>`:a}
  `;return $?s`
      <a
        class="c-button"
        data-background=${n}
        data-intent=${i}
        data-context=${b}
        data-size=${p}
        data-force-state=${h??a}
        data-has-icon-start=${r?"true":"false"}
        data-has-icon-end=${d?"true":"false"}
        href=${o?a:$}
        aria-disabled=${o?"true":a}
        tabindex=${o?"-1":a}
        @click=${D}
      >
        ${m}
      </a>
    `:s`
    <button
      class="c-button"
      data-background=${n}
      data-intent=${i}
      data-context=${b}
      data-size=${p}
      data-force-state=${h??a}
      data-has-icon-start=${r?"true":"false"}
      data-has-icon-end=${d?"true":"false"}
      ?disabled=${o}
      type="button"
      @click=${f}
    >
      ${m}
    </button>
  `};export{q as B};
