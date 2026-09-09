import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";import{r as i,t as a}from"./unsafe-html-K3HXmifv.js";import{n as o,t as s}from"./product-lockup-drfgdkTx.js";import{n as c,t as l}from"./chevron-right-C2fDtaFH.js";import{n as u,t as d}from"./arrow-right-CbD2Dsf5.js";var f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{r(),f=new Set([`16:9`,`4:3`,`1:1`,`3:2`,`3:4`,`21:9`]),p=new Set([`xs`,`sm`,`md`,`lg`,`xl`,`full`]),m=new Set([`cover`,`contain`,`fill`,`none`,`scale-down`]),h=new Set([`center`,`top`,`bottom`,`left`,`right`,`top-left`,`top-right`,`bottom-left`,`bottom-right`]),g=(e,t,n)=>t.has(e)?e:n,_=({src:e,alt:r,lazy:i,decoding:a=`async`,objectPosition:o})=>n`
  <img
    src=${e??``}
    alt=${r??``}
    loading=${i?`lazy`:`eager`}
    decoding=${a}
    style=${o?`object-position: ${o};`:t}
  />
`,v=({src:e,poster:r,autoplay:i,muted:a,loop:o,controls:s,playsinline:c,sources:l})=>n`
  <video
    src=${e??t}
    poster=${r??t}
    ?autoplay=${i}
    ?muted=${a}
    ?loop=${o}
    ?playsinline=${c}
    ?controls=${s}
    preload="metadata"
  >
    ${Array.isArray(l)?l.map(e=>n`<source src=${e.src} type=${e.type??t} media=${e.media??t} />`):t}
  </video>
`,y=n`<span class="c-media__overlay" aria-hidden="true"></span>`,b=({src:e,alt:r=``,aspectRatio:i=`3:4`,size:a=`full`,objectFit:o=`cover`,objectPosition:s=`center`,type:c=`image`,lazy:l=!0,poster:u,autoplay:d=!1,muted:b=!0,loop:x=!0,controls:S=!1,playsinline:C=!0,overlay:w=y,sources:T,mediaTemplate:E}={})=>{let D=g(i,f,`3:4`),O=g(a,p,`full`),k=g(o,m,`cover`),A=g(s,h,`center`),j=w===!1?t:w??y,M=E||(c===`video`?v({src:e,poster:u,autoplay:d,muted:b,loop:x,controls:S,playsinline:C,sources:T}):_({src:e,alt:r,lazy:l,objectPosition:A}));return n`
    <figure
      class="c-media"
      data-aspect=${D}
      data-size=${O}
      data-fit=${k}
      data-position=${A}
    >
      ${M}
      ${j}
    </figure>
  `}})))()}var S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{r(),a(),o(),x(),c(),u(),S=new Set([`resting`,`expanded`,`mobile`]),C=new Set([`standard`,`featured`]),w=new Set([`3:4`,`4:3`,`16:9`,`1:1`]),T=()=>i(l),E=()=>n`
  <span class="c-elastic-card__action c-elastic-card__action--button" aria-hidden="true">
    ${i(d)}
  </span>
`,D=(e,t,n)=>e||(t?`a`:typeof n==`function`?`button`:`article`),O=(e,t,n)=>t.has(e)?e:n,k=({state:e=`resting`,type:r=`standard`,label:i=`Creativity and design`,app:a=`experience-cloud`,product:o={},heading:c,title:l=`Card title`,body:u=`Card description goes here and can wrap to multiple lines.`,mediaSrc:d,mediaAlt:f=``,mediaTemplate:p,mediaAspect:m=`3:4`,mediaOverlay:h=!0,bodyTemplate:g,children:_,showCaret:v,actionTemplate:y,actionLabel:x,href:k,ariaLabel:A,onClick:j,tag:M}={})=>{let N=O(e,S,`resting`),P=O(r,C,`standard`),F=O(m,w,`3:4`),I=D(M,k,j),L={width:N===`resting`?o.width??`hug`:`fill`,showIconEnd:o.showIconEnd??!1,orientation:o.orientation??`horizontal`,styleVariant:o.styleVariant??o.style??`label`,...o,label:o.label??i,app:o.app??a};delete L.context;let R=P===`featured`?n`<p class="c-elastic-card__heading">${c??i}</p>`:s(L),z=y!=null,B=z?n`<span class="c-elastic-card__action" aria-label=${x??t}>${y}</span>`:N===`mobile`?E():v??!1?n`<span class="c-elastic-card__action c-elastic-card__action--caret" aria-hidden="true">
            ${T()}
          </span>`:t,V=z||N===`mobile`?t:E(),H=h===!1?!1:h===!0?void 0:h,U=d?void 0:n`<span class="c-elastic-card__media-placeholder" aria-hidden="true"></span>`,W=p??b({src:d,alt:f,aspectRatio:F,overlay:H,mediaTemplate:U}),G=g??n`
    <p class="c-elastic-card__title">${l}</p>
    ${u?n`<p class="c-elastic-card__body-text">${u}</p>`:t}
    ${_?n`<div class="c-elastic-card__extra">${_}</div>`:t}
  `,K=n`
    <div class="c-elastic-card__header">
      ${R}
      ${B}
    </div>
    <div class="c-elastic-card__media">${W}</div>
    <div class="c-elastic-card__body">
      <div class="c-elastic-card__body-content">
        ${G}
      </div>
      ${V?n`<div class="c-elastic-card__body-action">${V}</div>`:t}
    </div>
  `;return I===`a`?n`
      <a
        class="c-elastic-card"
        data-state=${N}
        data-type=${P}
        data-media-aspect=${F}
        href=${k??t}
        aria-label=${A??t}
        @click=${j??t}
      >${K}</a>
    `:I===`button`?n`
      <button
        class="c-elastic-card"
        data-state=${N}
        data-type=${P}
        data-media-aspect=${F}
        aria-label=${A??t}
        @click=${j??t}
        type="button"
      >${K}</button>
    `:n`
    <article
      class="c-elastic-card"
      data-state=${N}
      data-type=${P}
      data-media-aspect=${F}
      aria-label=${A??t}
      @click=${j??t}
    >${K}</article>
  `}})))()}export{x as i,A as n,b as r,k as t};