import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{a as i,r as a}from"./app-icon-JdLRqGJJ.js";import{r as o}from"./unsafe-html-t7SGSaWI.js";import{t as s}from"./unsafe-html-BN0uzf8m.js";import{n as c,t as l}from"./chevron-right-D_w3jOSY.js";var u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{r(),s(),i(),c(),u=()=>o(l),d=new Set([`16`,`18`,`24`,`32`,`48`,`80`]),f=new Set([`label`,`eyebrow`,`knockout`,`inverse`]),p=e=>e===`vertical`?`vertical`:`horizontal`,m=e=>f.has(e)?e:`label`,h=e=>e===`fill`?`fill`:`hug`,g=e=>e&&e!==`auto`&&d.has(e)?e:`24`,_=({label:e=`Product label`,productName:r,app:i=`experience-cloud`,secondApp:o=`experience-cloud`,showSecondIcon:s=!1,orientation:c=`horizontal`,styleVariant:l,width:d=`hug`,showIconStart:f=!0,showIcon:_,showIconEnd:v=!0,iconSize:y=`auto`,caret:b=u}={})=>{let x=m(l??`label`),S=p(c),C=h(d),w=typeof _==`boolean`?_:f,T=g(y),E=v&&b!==null,D=r??e,O=S===`vertical`,k=E?t`<span class="c-product-lockup__caret" aria-hidden="true"
        >${typeof b==`function`?b():b}</span
      >`:n,A=w?t`<span class="c-product-lockup__icons" aria-hidden="true">
        <span class="c-product-lockup__icon">${a({app:i,size:T})}</span>
        ${s?t`<span class="c-product-lockup__icon">${a({app:o,size:T})}</span>`:n}
      </span>`:n,j=O&&E?t`<span class="c-product-lockup__label-row"
        ><span class="c-product-lockup__label">${D}</span>${k}</span
      >`:t`<span class="c-product-lockup__label">${D}</span>`;return t`
    <span
      class="c-product-lockup"
      data-orientation=${S}
      data-style=${x}
      data-width=${C}
      data-has-icon-start=${w?`true`:`false`}
      data-has-caret=${E?`true`:`false`}
    >
      ${A}${j}${!O&&E?k:n}
    </span>
  `}})))()}export{v as n,_ as t};