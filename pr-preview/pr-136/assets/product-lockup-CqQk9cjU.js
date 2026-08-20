import{x as t,E as c}from"./iframe-DGf3QGPt.js";import{o as x}from"./unsafe-html-BaoeYJW3.js";import{A as d}from"./app-icon-DXf0at9o.js";import{c as E}from"./chevron-right-CnbUzkxe.js";const L=()=>x(E),O=new Set(["xs","sm","md","lg"]),P=new Set(["label","eyebrow","knockout","inverse"]),A=o=>o==="vertical"?"vertical":"horizontal",W=o=>P.has(o)?o:"label",N=o=>o==="fill"?"fill":"hug",R=o=>o&&o!=="auto"&&O.has(o)?o:"md",q=({label:o="Product label",productName:m,app:h="experience-cloud",secondApp:_="experience-cloud",showSecondIcon:$=!1,orientation:k="horizontal",styleVariant:S,context:f,width:z="hug",showIconStart:b=!0,showIcon:s,showIconEnd:g=!0,iconSize:v="auto",caret:a=L}={})=>{const w=W(S??(f==="on-dark"?"knockout":"label")),e=A(k),y=N(z),r=typeof s=="boolean"?s:b,l=R(v),n=g&&a!==null,i=m??o,p=e==="vertical",u=n?t`<span class="c-product-lockup__caret" aria-hidden="true"
        >${typeof a=="function"?a():a}</span
      >`:c,C=r?t`<span class="c-product-lockup__icons" aria-hidden="true">
        <span class="c-product-lockup__icon">${d({app:h,size:l})}</span>
        ${$?t`<span class="c-product-lockup__icon">${d({app:_,size:l})}</span>`:c}
      </span>`:c,I=p&&n?t`<span class="c-product-lockup__label-row"
        ><span class="c-product-lockup__label">${i}</span>${u}</span
      >`:t`<span class="c-product-lockup__label">${i}</span>`;return t`
    <span
      class="c-product-lockup"
      data-orientation=${e}
      data-style=${w}
      data-width=${y}
      data-has-icon-start=${r?"true":"false"}
      data-has-caret=${n?"true":"false"}
    >
      ${C}${I}${!p&&n?u:c}
    </span>
  `};export{q as P};
