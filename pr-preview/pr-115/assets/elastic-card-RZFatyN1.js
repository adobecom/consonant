import{E as a,x as s}from"./iframe-Bu6Bj6ip.js";import{o as P}from"./unsafe-html-D-B0R0HM.js";import{P as F}from"./product-lockup-BqxHkWWo.js";import{c as Z}from"./chevron-right-CnbUzkxe.js";import{a as q}from"./arrow-right-Do-kvyXB.js";const B=new Set(["16:9","4:3","1:1","3:2","3:4","21:9"]),G=new Set(["xs","sm","md","lg","xl","full"]),H=new Set(["cover","contain","fill","none","scale-down"]),J=new Set(["center","top","bottom","left","right","top-left","top-right","bottom-left","bottom-right"]),h=(e,c,t)=>c.has(e)?e:t,K=({src:e,alt:c,lazy:t,decoding:o="async",objectPosition:n})=>s`
  <img
    src=${e??""}
    alt=${c??""}
    loading=${t?"lazy":"eager"}
    decoding=${o}
    style=${n?`object-position: ${n};`:a}
  />
`,L=({src:e,poster:c,autoplay:t,muted:o,loop:n,controls:m,playsinline:r,sources:d})=>s`
  <video
    src=${e??a}
    poster=${c??a}
    ?autoplay=${t}
    ?muted=${o}
    ?loop=${n}
    ?playsinline=${r}
    ?controls=${m}
    preload="metadata"
  >
    ${Array.isArray(d)?d.map(l=>s`<source src=${l.src} type=${l.type??a} media=${l.media??a} />`):a}
  </video>
`,I=s`<span class="c-media__overlay" aria-hidden="true"></span>`,Q=({src:e,alt:c="",aspectRatio:t="3:4",size:o="full",objectFit:n="cover",objectPosition:m="center",type:r="image",lazy:d=!0,poster:l,autoplay:y=!1,muted:f=!0,loop:S=!0,controls:g=!1,playsinline:w=!0,overlay:$=I,sources:A,mediaTemplate:_}={})=>{const b=h(t,B,"3:4"),p=h(o,G,"full"),E=h(n,H,"cover"),i=h(m,J,"center"),u=$===!1?a:$??I,v=_||(r==="video"?L({src:e,poster:l,autoplay:y,muted:f,loop:S,controls:g,playsinline:w,sources:A}):K({src:e,alt:c,lazy:d,objectPosition:i}));return s`
    <figure
      class="c-media"
      data-aspect=${b}
      data-size=${p}
      data-fit=${E}
      data-position=${i}
    >
      ${v}
      ${u}
    </figure>
  `},U=new Set(["resting","expanded","mobile"]),W=new Set(["3:4","4:3","16:9","1:1"]),X=()=>P(Z),z=()=>s`
  <span class="c-elastic-card__action c-elastic-card__action--button" aria-hidden="true">
    ${P(q)}
  </span>
`,Y=(e,c,t)=>e||(c?"a":typeof t=="function"?"button":"article"),T=(e,c,t)=>c.has(e)?e:t,nt=({label:e="Creativity and design",app:c="experience-cloud",product:t={},title:o="Card title",body:n="Card description goes here and can wrap to multiple lines.",state:m="resting",mediaSrc:r,mediaAlt:d="",mediaTemplate:l,mediaAspect:y="3:4",mediaOverlay:f=!0,bodyTemplate:S,children:g,showCaret:w,actionTemplate:$,actionLabel:A,href:_,ariaLabel:b,onClick:p,tag:E}={})=>{const i=T(m,U,"resting"),u=T(y,W,"3:4"),v=Y(E,_,p),k=i==="resting"?"on-light":"on-dark",M={width:i==="resting"?t.width??"hug":"fill",showIconEnd:t.showIconEnd??!1,context:t.context??k,orientation:t.orientation??"horizontal",styleVariant:t.styleVariant??t.style??"label",...t,label:t.label??e,app:t.app??c},C=$!=null,N=C?s`<span class="c-elastic-card__action" aria-label=${A??a}>${$}</span>`:i==="mobile"?z():w??!1?s`<span class="c-elastic-card__action c-elastic-card__action--caret" aria-hidden="true">
            ${X()}
          </span>`:a,V=C?a:i==="mobile"?a:z(),R=f===!1?!1:f===!0?void 0:f,D=r?void 0:s`<span class="c-elastic-card__media-placeholder" aria-hidden="true"></span>`,O=l??Q({src:r,alt:d,aspectRatio:u,overlay:R,mediaTemplate:D}),j=S??s`
    <p class="c-elastic-card__title">${o}</p>
    ${n?s`<p class="c-elastic-card__body-text">${n}</p>`:a}
    ${g?s`<div class="c-elastic-card__extra">${g}</div>`:a}
  `,x=s`
    <div class="c-elastic-card__header">
      ${F(M)}
      ${N}
    </div>
    <div class="c-elastic-card__media">${O}</div>
    <div class="c-elastic-card__body">
      <div class="c-elastic-card__body-content">
        ${j}
      </div>
      ${V?s`<div class="c-elastic-card__body-action">${V}</div>`:a}
    </div>
  `;return v==="a"?s`
      <a
        class="c-elastic-card"
        data-state=${i}
        data-media-aspect=${u}
        href=${_??a}
        aria-label=${b??a}
        @click=${p??a}
      >${x}</a>
    `:v==="button"?s`
      <button
        class="c-elastic-card"
        data-state=${i}
        data-media-aspect=${u}
        aria-label=${b??a}
        @click=${p??a}
        type="button"
      >${x}</button>
    `:s`
    <article
      class="c-elastic-card"
      data-state=${i}
      data-media-aspect=${u}
      aria-label=${b??a}
      @click=${p??a}
    >${x}</article>
  `};export{nt as E,Q as M};
