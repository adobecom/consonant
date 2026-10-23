import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{r as i}from"./unsafe-html-t7SGSaWI.js";import{t as a}from"./unsafe-html-BN0uzf8m.js";import{n as o,t as s}from"./chevron-right-D_w3jOSY.js";import{n as c,t as l}from"./product-lockup-DXhkSBrG.js";import{n as u,t as d}from"./media-C03lr5S2.js";import{n as f,t as p}from"./arrow-right-DzMRham4.js";var m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{r(),a(),c(),u(),o(),f(),m=new Set([`resting`,`expanded`,`mobile`]),h=new Set([`standard`,`featured`]),g=new Set([`3:4`,`4:3`,`16:9`,`1:1`]),_=()=>i(s),v=()=>t`
  <span class="c-elastic-card__action c-elastic-card__action--button" aria-hidden="true">
    ${i(p)}
  </span>
`,y=(e,t,n)=>e||(t?`a`:typeof n==`function`?`button`:`article`),b=(e,t,n)=>t.has(e)?e:n,x=({state:e=`resting`,type:r=`standard`,label:i=`Creativity and design`,app:a=`experience-cloud`,product:o={},heading:s,title:c=`Card title`,body:u=`Card description goes here and can wrap to multiple lines.`,mediaSrc:f,mediaAlt:p=``,mediaTemplate:x,mediaAspect:S=`3:4`,mediaOverlay:C=!0,bodyTemplate:w,children:T,showCaret:E,actionTemplate:D,actionLabel:O,href:k,ariaLabel:A,onClick:j,tag:M}={})=>{let N=b(e,m,`resting`),P=b(r,h,`standard`),F=b(S,g,`3:4`),I=y(M,k,j),L={width:N===`resting`?o.width??`hug`:`fill`,showIconEnd:o.showIconEnd??!1,orientation:o.orientation??`horizontal`,styleVariant:o.styleVariant??o.style??`label`,...o,label:o.label??i,app:o.app??a};delete L.context;let R=P===`featured`?t`<p class="c-elastic-card__heading">${s??i}</p>`:l(L),z=D!=null,B=z?t`<span class="c-elastic-card__action" aria-label=${O??n}>${D}</span>`:N===`mobile`?v():E??!1?t`<span class="c-elastic-card__action c-elastic-card__action--caret" aria-hidden="true">
            ${_()}
          </span>`:n,V=z||N===`mobile`?n:v(),H=C===!1?!1:C===!0?void 0:C,U=f?void 0:t`<span class="c-elastic-card__media-placeholder" aria-hidden="true"></span>`,W=x??d({src:f,alt:p,aspectRatio:F,overlay:H,mediaTemplate:U}),G=w??t`
    <p class="c-elastic-card__title">${c}</p>
    ${u?t`<p class="c-elastic-card__body-text">${u}</p>`:n}
    ${T?t`<div class="c-elastic-card__extra">${T}</div>`:n}
  `,K=t`
    <div class="c-elastic-card__header">
      ${R}
      ${B}
    </div>
    <div class="c-elastic-card__media">${W}</div>
    <div class="c-elastic-card__body">
      <div class="c-elastic-card__body-content">
        ${G}
      </div>
      ${V?t`<div class="c-elastic-card__body-action">${V}</div>`:n}
    </div>
  `;return I===`a`?t`
      <a
        class="c-elastic-card"
        data-state=${N}
        data-type=${P}
        data-media-aspect=${F}
        href=${k??n}
        aria-label=${A??n}
        @click=${j??n}
      >${K}</a>
    `:I===`button`?t`
      <button
        class="c-elastic-card"
        data-state=${N}
        data-type=${P}
        data-media-aspect=${F}
        aria-label=${A??n}
        @click=${j??n}
        type="button"
      >${K}</button>
    `:t`
    <article
      class="c-elastic-card"
      data-state=${N}
      data-type=${P}
      data-media-aspect=${F}
      aria-label=${A??n}
      @click=${j??n}
    >${K}</article>
  `}})))()}export{S as n,x as t};