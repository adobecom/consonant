import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{i as t,s as n,u as r}from"./iframe-BgLmQkiJ.js";import{r as i,t as a}from"./unsafe-html-upnswzzo.js";import{n as o,t as s}from"./chevron-right-ByGBj2Fj.js";import{n as c,t as l}from"./product-lockup-CPn7J2Q5.js";import{n as u,t as d}from"./arrow-right-CvO8GDMP.js";var f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),f=new Set([`16:9`,`4:3`,`1:1`,`3:2`,`3:4`,`21:9`]),p=new Set([`xs`,`sm`,`md`,`lg`,`xl`,`full`]),m=new Set([`cover`,`contain`,`fill`,`none`,`scale-down`]),h=new Set([`center`,`top`,`bottom`,`left`,`right`,`top-left`,`top-right`,`bottom-left`,`bottom-right`]),g=(e,t,n)=>t.has(e)?e:n,_=({src:e,alt:t,lazy:i,decoding:a=`async`,objectPosition:o})=>r`
  <img
    src=${e??``}
    alt=${t??``}
    loading=${i?`lazy`:`eager`}
    decoding=${a}
    style=${o?`object-position: ${o};`:n}
  />
`,v=({src:e,poster:t,autoplay:i,muted:a,loop:o,controls:s,playsinline:c,sources:l})=>r`
  <video
    src=${e??n}
    poster=${t??n}
    ?autoplay=${i}
    ?muted=${a}
    ?loop=${o}
    ?playsinline=${c}
    ?controls=${s}
    preload="metadata"
  >
    ${Array.isArray(l)?l.map(e=>r`<source src=${e.src} type=${e.type??n} media=${e.media??n} />`):n}
  </video>
`,y=r`<span class="c-media__overlay" aria-hidden="true"></span>`,b=({src:e,alt:t=``,aspectRatio:i=`3:4`,size:a=`full`,objectFit:o=`cover`,objectPosition:s=`center`,type:c=`image`,lazy:l=!0,poster:u,autoplay:d=!1,muted:b=!0,loop:x=!0,controls:S=!1,playsinline:C=!0,overlay:w=y,sources:T,mediaTemplate:E}={})=>{let D=g(i,f,`3:4`),O=g(a,p,`full`),k=g(o,m,`cover`),A=g(s,h,`center`),j=w===!1?n:w??y,M=E||(c===`video`?v({src:e,poster:u,autoplay:d,muted:b,loop:x,controls:S,playsinline:C,sources:T}):_({src:e,alt:t,lazy:l,objectPosition:A}));return r`
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
  `}})))()}var S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{t(),a(),c(),x(),o(),u(),S=new Set([`resting`,`expanded`,`mobile`]),C=new Set([`standard`,`featured`]),w=new Set([`3:4`,`4:3`,`16:9`,`1:1`]),T=()=>i(s),E=()=>r`
  <span class="c-elastic-card__action c-elastic-card__action--button" aria-hidden="true">
    ${i(d)}
  </span>
`,D=(e,t,n)=>e||(t?`a`:typeof n==`function`?`button`:`article`),O=(e,t,n)=>t.has(e)?e:n,k=({state:e=`resting`,type:t=`standard`,label:i=`Creativity and design`,app:a=`experience-cloud`,product:o={},heading:s,title:c=`Card title`,body:u=`Card description goes here and can wrap to multiple lines.`,mediaSrc:d,mediaAlt:f=``,mediaTemplate:p,mediaAspect:m=`3:4`,mediaOverlay:h=!0,bodyTemplate:g,children:_,showCaret:v,actionTemplate:y,actionLabel:x,href:k,ariaLabel:A,onClick:j,tag:M}={})=>{let N=O(e,S,`resting`),P=O(t,C,`standard`),F=O(m,w,`3:4`),I=D(M,k,j),L={width:N===`resting`?o.width??`hug`:`fill`,showIconEnd:o.showIconEnd??!1,orientation:o.orientation??`horizontal`,styleVariant:o.styleVariant??o.style??`label`,...o,label:o.label??i,app:o.app??a};delete L.context;let R=P===`featured`?r`<p class="c-elastic-card__heading">${s??i}</p>`:l(L),z=y!=null,B=z?r`<span class="c-elastic-card__action" aria-label=${x??n}>${y}</span>`:N===`mobile`?E():v??!1?r`<span class="c-elastic-card__action c-elastic-card__action--caret" aria-hidden="true">
            ${T()}
          </span>`:n,V=z||N===`mobile`?n:E(),H=h===!1?!1:h===!0?void 0:h,U=d?void 0:r`<span class="c-elastic-card__media-placeholder" aria-hidden="true"></span>`,W=p??b({src:d,alt:f,aspectRatio:F,overlay:H,mediaTemplate:U}),G=g??r`
    <p class="c-elastic-card__title">${c}</p>
    ${u?r`<p class="c-elastic-card__body-text">${u}</p>`:n}
    ${_?r`<div class="c-elastic-card__extra">${_}</div>`:n}
  `,K=r`
    <div class="c-elastic-card__header">
      ${R}
      ${B}
    </div>
    <div class="c-elastic-card__media">${W}</div>
    <div class="c-elastic-card__body">
      <div class="c-elastic-card__body-content">
        ${G}
      </div>
      ${V?r`<div class="c-elastic-card__body-action">${V}</div>`:n}
    </div>
  `;return I===`a`?r`
      <a
        class="c-elastic-card"
        data-state=${N}
        data-type=${P}
        data-media-aspect=${F}
        href=${k??n}
        aria-label=${A??n}
        @click=${j??n}
      >${K}</a>
    `:I===`button`?r`
      <button
        class="c-elastic-card"
        data-state=${N}
        data-type=${P}
        data-media-aspect=${F}
        aria-label=${A??n}
        @click=${j??n}
        type="button"
      >${K}</button>
    `:r`
    <article
      class="c-elastic-card"
      data-state=${N}
      data-type=${P}
      data-media-aspect=${F}
      aria-label=${A??n}
      @click=${j??n}
    >${K}</article>
  `}})))()}export{x as i,A as n,b as r,k as t};