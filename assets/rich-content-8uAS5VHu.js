import{E as s,x as n}from"./iframe-ClqxSWPX.js";const M=t=>t==="on-dark"?"on-dark":"on-light",k=t=>t==="regular"?"regular":"tight",B=t=>t==="center"?"center":"start",D=t=>t==="wide"||t==="none"?t:"narrow",e=t=>typeof t=="string"&&t.trim().length>0,j=({theme:t="on-light",density:_="tight",justifyContent:m="start",measure:p="narrow",eyebrow:i,showEyebrow:u=!0,title:r,body:a,metaName:c,metaRole:o,textSlot:l,showActions:v=!0,actions:h}={})=>{const y=M(t),g=k(_),b=B(m),f=D(p),x=u&&e(i),w=e(r),z=e(a),T=e(c)||e(o),d=!!l,V=!d&&T,$=!!(v&&h),C=d?l:n`
        ${x?n`<p class="c-rich-content__eyebrow">${i}</p>`:s}
        ${w?n`<h2 class="c-rich-content__title">${r}</h2>`:s}
        ${z?n`<p class="c-rich-content__body">${a}</p>`:s}
        ${V?n`<div class="c-rich-content__meta">
              ${e(c)?n`<p class="c-rich-content__meta-name">${c}</p>`:s}
              ${e(o)?n`<p class="c-rich-content__meta-role">${o}</p>`:s}
            </div>`:s}
      `;return n`
    <div
      class="c-rich-content"
      data-theme=${y}
      data-density=${g}
      data-justify=${b}
      data-measure=${f}
      data-has-actions=${$?"true":"false"}
    >
      <div class="c-rich-content__text">${C}</div>
      ${$?n`<div class="c-rich-content__actions">${h}</div>`:s}
    </div>
  `};export{j as R};
