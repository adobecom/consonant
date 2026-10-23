import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";var i,a,o,s,c;function l(){return(l=e((()=>{r(),i=e=>e===`regular`?`regular`:`tight`,a=e=>e===`center`?`center`:`start`,o=e=>e===`wide`||e===`none`?e:`narrow`,s=e=>typeof e==`string`&&e.trim().length>0,c=({density:e=`tight`,justifyContent:r=`start`,measure:c=`narrow`,eyebrow:l,showEyebrow:u=!0,title:d,body:f,metaName:p,metaRole:m,textSlot:h,showActions:g=!0,actions:_}={})=>{let v=i(e),y=a(r),b=o(c),x=u&&s(l),S=s(d),C=s(f),w=s(p)||s(m),T=!!h,E=!T&&w,D=!!(g&&_),O=T?h:t`
        ${x?t`<p class="c-rich-content__eyebrow">${l}</p>`:n}
        ${S?t`<h2 class="c-rich-content__title">${d}</h2>`:n}
        ${C?t`<p class="c-rich-content__body">${f}</p>`:n}
        ${E?t`<div class="c-rich-content__meta">
              ${s(p)?t`<p class="c-rich-content__meta-name">${p}</p>`:n}
              ${s(m)?t`<p class="c-rich-content__meta-role">${m}</p>`:n}
            </div>`:n}
      `;return t`
    <div
      class="c-rich-content"
      data-density=${v}
      data-justify=${y}
      data-measure=${b}
      data-has-actions=${D?`true`:`false`}
    >
      <div class="c-rich-content__text">${O}</div>
      ${D?t`<div class="c-rich-content__actions">${_}</div>`:n}
    </div>
  `}})))()}export{l as n,c as t};