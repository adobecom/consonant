import{E as a,x as t}from"./iframe-BoGTDT1x.js";import{o as N}from"./unsafe-html-B-hzyErX.js";import{P as Z}from"./product-lockup-CYVVLOnU.js";import{c as q}from"./chevron-right-CnbUzkxe.js";import{a as B}from"./arrow-right-Do-kvyXB.js";const G=new Set(["16:9","4:3","1:1","3:2","3:4","21:9"]),H=new Set(["xs","sm","md","lg","xl","full"]),J=new Set(["cover","contain","fill","none","scale-down"]),K=new Set(["center","top","bottom","left","right","top-left","top-right","bottom-left","bottom-right"]),y=(e,i,c)=>i.has(e)?e:c,Q=({src:e,alt:i,lazy:c,decoding:r="async",objectPosition:s})=>t`
  <img
    src=${e??""}
    alt=${i??""}
    loading=${c?"lazy":"eager"}
    decoding=${r}
    style=${s?`object-position: ${s};`:a}
  />
`,U=({src:e,poster:i,autoplay:c,muted:r,loop:s,controls:p,playsinline:u,sources:l})=>t`
  <video
    src=${e??a}
    poster=${i??a}
    ?autoplay=${c}
    ?muted=${r}
    ?loop=${s}
    ?playsinline=${u}
    ?controls=${p}
    preload="metadata"
  >
    ${Array.isArray(l)?l.map(n=>t`<source src=${n.src} type=${n.type??a} media=${n.media??a} />`):a}
  </video>
`,k=t`<span class="c-media__overlay" aria-hidden="true"></span>`,W=({src:e,alt:i="",aspectRatio:c="3:4",size:r="full",objectFit:s="cover",objectPosition:p="center",type:u="image",lazy:l=!0,poster:n,autoplay:v=!1,muted:S=!0,loop:w=!0,controls:f=!1,playsinline:A=!0,overlay:m=k,sources:E,mediaTemplate:$}={})=>{const V=y(c,G,"3:4"),b=y(r,H,"full"),_=y(s,J,"cover"),d=y(p,K,"center"),x=m===!1?a:m??k,o=$||(u==="video"?U({src:e,poster:n,autoplay:v,muted:S,loop:w,controls:f,playsinline:A,sources:E}):Q({src:e,alt:i,lazy:l,objectPosition:d}));return t`
    <figure
      class="c-media"
      data-aspect=${V}
      data-size=${b}
      data-fit=${_}
      data-position=${d}
    >
      ${o}
      ${x}
    </figure>
  `},X=new Set(["resting","expanded","mobile"]),aa=new Set(["standard","featured"]),ta=new Set(["3:4","4:3","16:9","1:1"]),ea=()=>N(q),D=()=>t`
  <span class="c-elastic-card__action c-elastic-card__action--button" aria-hidden="true">
    ${N(B)}
  </span>
`,sa=(e,i,c)=>e||(i?"a":typeof c=="function"?"button":"article"),T=(e,i,c)=>i.has(e)?e:c,$a=({state:e="resting",type:i="standard",label:c="Creativity and design",app:r="experience-cloud",product:s={},heading:p,title:u="Card title",body:l="Card description goes here and can wrap to multiple lines.",mediaSrc:n,mediaAlt:v="",mediaTemplate:S,mediaAspect:w="3:4",mediaOverlay:f=!0,bodyTemplate:A,children:m,showCaret:E,actionTemplate:$,actionLabel:V,href:b,ariaLabel:_,onClick:d,tag:x}={})=>{const o=T(e,X,"resting"),g=T(i,aa,"standard"),h=T(w,ta,"3:4"),I=sa(x,b,d),z={width:o==="resting"?s.width??"hug":"fill",showIconEnd:s.showIconEnd??!1,orientation:s.orientation??"horizontal",styleVariant:s.styleVariant??s.style??"label",...s,label:s.label??c,app:s.app??r};delete z.context;const R=g==="featured"?t`<p class="c-elastic-card__heading">${p??c}</p>`:Z(z),P=$!=null,O=P?t`<span class="c-elastic-card__action" aria-label=${V??a}>${$}</span>`:o==="mobile"?D():E??!1?t`<span class="c-elastic-card__action c-elastic-card__action--caret" aria-hidden="true">
            ${ea()}
          </span>`:a,M=P?a:o==="mobile"?a:D(),j=f===!1?!1:f===!0?void 0:f,F=n?void 0:t`<span class="c-elastic-card__media-placeholder" aria-hidden="true"></span>`,L=S??W({src:n,alt:v,aspectRatio:h,overlay:j,mediaTemplate:F}),Y=A??t`
    <p class="c-elastic-card__title">${u}</p>
    ${l?t`<p class="c-elastic-card__body-text">${l}</p>`:a}
    ${m?t`<div class="c-elastic-card__extra">${m}</div>`:a}
  `,C=t`
    <div class="c-elastic-card__header">
      ${R}
      ${O}
    </div>
    <div class="c-elastic-card__media">${L}</div>
    <div class="c-elastic-card__body">
      <div class="c-elastic-card__body-content">
        ${Y}
      </div>
      ${M?t`<div class="c-elastic-card__body-action">${M}</div>`:a}
    </div>
  `;return I==="a"?t`
      <a
        class="c-elastic-card"
        data-state=${o}
        data-type=${g}
        data-media-aspect=${h}
        href=${b??a}
        aria-label=${_??a}
        @click=${d??a}
      >${C}</a>
    `:I==="button"?t`
      <button
        class="c-elastic-card"
        data-state=${o}
        data-type=${g}
        data-media-aspect=${h}
        aria-label=${_??a}
        @click=${d??a}
        type="button"
      >${C}</button>
    `:t`
    <article
      class="c-elastic-card"
      data-state=${o}
      data-type=${g}
      data-media-aspect=${h}
      aria-label=${_??a}
      @click=${d??a}
    >${C}</article>
  `};export{$a as E,W as M};
