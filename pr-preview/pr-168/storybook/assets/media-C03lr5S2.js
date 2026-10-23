import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";var i,a,o,s,c,l,u,d,f;function p(){return(p=e((()=>{r(),i=new Set([`16:9`,`4:3`,`1:1`,`3:2`,`3:4`,`21:9`]),a=new Set([`xs`,`sm`,`md`,`lg`,`xl`,`full`]),o=new Set([`cover`,`contain`,`fill`,`none`,`scale-down`]),s=new Set([`center`,`top`,`bottom`,`left`,`right`,`top-left`,`top-right`,`bottom-left`,`bottom-right`]),c=(e,t,n)=>t.has(e)?e:n,l=({src:e,alt:r,lazy:i,decoding:a=`async`,objectPosition:o})=>t`
  <img
    src=${e??``}
    alt=${r??``}
    loading=${i?`lazy`:`eager`}
    decoding=${a}
    style=${o?`object-position: ${o};`:n}
  />
`,u=({src:e,poster:r,autoplay:i,muted:a,loop:o,controls:s,playsinline:c,sources:l,preload:u=`metadata`})=>t`
  <video
    src=${e??n}
    poster=${r??n}
    ?autoplay=${i}
    ?muted=${a}
    ?loop=${o}
    ?playsinline=${c}
    ?controls=${s}
    preload=${u}
  >
    ${Array.isArray(l)?l.map(e=>t`<source src=${e.src} type=${e.type??n} media=${e.media??n} />`):n}
  </video>
`,d=t`<span class="c-media__overlay" aria-hidden="true"></span>`,f=({src:e,alt:r=``,aspectRatio:f=`3:4`,size:p=`full`,objectFit:m=`cover`,objectPosition:h=`center`,type:g=`image`,lazy:_=!0,poster:v,autoplay:y=!1,muted:b=!0,loop:x=!0,controls:S=!1,playsinline:C=!0,preload:w=`metadata`,overlay:T=d,sources:E,mediaTemplate:D}={})=>{let O=c(f,i,`3:4`),k=c(p,a,`full`),A=c(m,o,`cover`),j=c(h,s,`center`),M=T===!1?n:T??d,N=D||(g===`video`?u({src:e,poster:v,autoplay:y,muted:b,loop:x,controls:S,playsinline:C,sources:E,preload:w}):l({src:e,alt:r,lazy:_,objectPosition:j}));return t`
    <figure
      class="c-media"
      data-aspect=${O}
      data-size=${k}
      data-fit=${A}
      data-position=${j}
    >
      ${N}
      ${M}
    </figure>
  `}})))()}export{p as n,f as t};