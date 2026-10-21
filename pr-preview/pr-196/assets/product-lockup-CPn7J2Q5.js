import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{i as t,s as n,u as r}from"./iframe-BgLmQkiJ.js";import{i,r as a}from"./app-icon-wEiSdMNX.js";import{r as o,t as s}from"./unsafe-html-upnswzzo.js";import{n as c,t as l}from"./chevron-right-ByGBj2Fj.js";var u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{t(),s(),i(),c(),u=()=>o(l),d=new Set([`xs`,`sm`,`md`,`lg`]),f=new Set([`label`,`eyebrow`,`knockout`,`inverse`]),p=e=>e===`vertical`?`vertical`:`horizontal`,m=e=>f.has(e)?e:`label`,h=e=>e===`fill`?`fill`:`hug`,g=e=>e&&e!==`auto`&&d.has(e)?e:`md`,_=({label:e=`Product label`,productName:t,app:i=`experience-cloud`,secondApp:o=`experience-cloud`,showSecondIcon:s=!1,orientation:c=`horizontal`,styleVariant:l,context:d,width:f=`hug`,showIconStart:_=!0,showIcon:v,showIconEnd:y=!0,iconSize:b=`auto`,caret:x=u}={})=>{let S=m(l??(d===`on-dark`?`knockout`:`label`)),C=p(c),w=h(f),T=typeof v==`boolean`?v:_,E=g(b),D=y&&x!==null,O=t??e,k=C===`vertical`,A=D?r`<span class="c-product-lockup__caret" aria-hidden="true"
        >${typeof x==`function`?x():x}</span
      >`:n,j=T?r`<span class="c-product-lockup__icons" aria-hidden="true">
        <span class="c-product-lockup__icon">${a({app:i,size:E})}</span>
        ${s?r`<span class="c-product-lockup__icon">${a({app:o,size:E})}</span>`:n}
      </span>`:n,M=k&&D?r`<span class="c-product-lockup__label-row"
        ><span class="c-product-lockup__label">${O}</span>${A}</span
      >`:r`<span class="c-product-lockup__label">${O}</span>`;return r`
    <span
      class="c-product-lockup"
      data-orientation=${C}
      data-style=${S}
      data-width=${w}
      data-has-icon-start=${T?`true`:`false`}
      data-has-caret=${D?`true`:`false`}
    >
      ${j}${M}${!k&&D?A:n}
    </span>
  `}})))()}export{v as n,_ as t};