import{x as t,E as c}from"./iframe-DkrSOBZ4.js";import{o as v}from"./unsafe-html-CkDs-VLS.js";import{A as w}from"./app-icon-BICNkeNw.js";import{c as I}from"./chevron-right-CnbUzkxe.js";const O=()=>v(I),P=new Set(["xs","sm","md","lg"]),A=o=>o==="vertical"?"vertical":"horizontal",E=o=>o==="eyebrow"?"eyebrow":"label",L=o=>o==="on-dark"?"on-dark":"on-light",W=o=>o==="fill"?"fill":"hug",N=(o,e)=>o&&o!=="auto"&&P.has(o)?o:"md",q=({label:o="Product label",productName:e,app:u="experience-cloud",orientation:m="horizontal",styleVariant:h="label",context:z="on-light",width:$="hug",showIconStart:f=!0,showIcon:s,showIconEnd:b=!0,iconSize:S="auto",caret:a=O}={})=>{const r=A(m),_=E(h),k=L(z),g=W($),l=typeof s=="boolean"?s:f,x=N(S,r),n=b&&a!==null,i=e??o,p=r==="vertical",d=n?t`<span class="c-product-lockup__caret" aria-hidden="true"
        >${typeof a=="function"?a():a}</span
      >`:c,y=p&&n?t`<span class="c-product-lockup__label-row"
        ><span class="c-product-lockup__label">${i}</span>${d}</span
      >`:t`<span class="c-product-lockup__label">${i}</span>`,C=!p&&n?d:c;return t`
    <span
      class="c-product-lockup"
      data-orientation=${r}
      data-style=${_}
      data-context=${k}
      data-width=${g}
      data-has-icon-start=${l?"true":"false"}
      data-has-caret=${n?"true":"false"}
    >
      ${l?t`<span class="c-product-lockup__icon" aria-hidden="true">
            ${w({app:u,size:x})}
          </span>`:c}
      ${y}${C}
    </span>
  `};export{q as P};
