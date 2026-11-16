import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";var i,a,o,s,c,l;function u(){return(u=e((()=>{r(),i=e=>e===`on-dark`?`on-dark`:`on-light`,a=e=>e===`regular`?`regular`:`tight`,o=e=>e===`center`?`center`:`start`,s=e=>e===`wide`||e===`none`?e:`narrow`,c=e=>typeof e==`string`&&e.trim().length>0,l=({theme:e=`on-light`,density:r=`tight`,justifyContent:l=`start`,measure:u=`narrow`,eyebrow:d,showEyebrow:f=!0,title:p,body:m,metaName:h,metaRole:g,textSlot:_,showActions:v=!0,actions:y}={})=>{let b=i(e),x=a(r),S=o(l),C=s(u),w=f&&c(d),T=c(p),E=c(m),D=c(h)||c(g),O=!!_,k=!O&&D,A=!!(v&&y),j=O?_:n`
        ${w?n`<p class="c-rich-content__eyebrow">${d}</p>`:t}
        ${T?n`<h2 class="c-rich-content__title">${p}</h2>`:t}
        ${E?n`<p class="c-rich-content__body">${m}</p>`:t}
        ${k?n`<div class="c-rich-content__meta">
              ${c(h)?n`<p class="c-rich-content__meta-name">${h}</p>`:t}
              ${c(g)?n`<p class="c-rich-content__meta-role">${g}</p>`:t}
            </div>`:t}
      `;return n`
    <div
      class="c-rich-content"
      data-theme=${b}
      data-density=${x}
      data-justify=${S}
      data-measure=${C}
      data-has-actions=${A?`true`:`false`}
    >
      <div class="c-rich-content__text">${j}</div>
      ${A?n`<div class="c-rich-content__actions">${y}</div>`:t}
    </div>
  `}})))()}export{u as n,l as t};