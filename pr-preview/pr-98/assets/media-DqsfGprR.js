import{x as a,E as c}from"./iframe-Fb9J7T0F.js";import{o as z}from"./unsafe-html-CBF-rTfq.js";import{c as T}from"./chevron-down-Bqt06uWP.js";const D=new Set(["closed","open","readonly"]),P=(s,e,t)=>e.has(s)?s:t,G=({appIconTemplate:s,eyebrow:e="Standard PDF toolset",heading:t="Acrobat Standard for teams",description:r="Trusted PDF tools for editing and converting documents.",price:i="US$16.99/mo per license",billingNote:p="Annual, billed monthly. Up to 10 licenses with free trial.",licenseCount:l=1,licenseOptions:d=[1,2,3,4,5,6,7,8,9,10],helperText:o="Save 7.5% your first year with 3+ licenses.",termsLabel:_="See terms",termsHref:m,onToggle:b,onLicenseChange:w,ctaLabel:f="Buy now",ctaHref:$,onCtaClick:g,featureSections:u=[],state:x="closed"}={})=>{const v=P(x,D,"closed"),h=v==="open",S=v==="readonly",V=m?a`<a class="c-elastic-card__terms" href=${m} target="_blank">${_}</a>`:_?a`<span class="c-elastic-card__terms">${_}</span>`:c,A=$?a`<a class="c-elastic-card__cta" href=${$} @click=${g??c}>${f}</a>`:a`<button class="c-elastic-card__cta" type="button" @click=${g??c}>${f}</button>`;return a`
    <div class="c-elastic-card" data-state=${v}>
      <div class="c-elastic-card__top">

        <div class="c-elastic-card__mnemonic">
          ${s??c}
          <p class="c-elastic-card__eyebrow">${e}</p>
        </div>

        <div class="c-elastic-card__product">
          <p class="c-elastic-card__heading">${t}</p>
          <p class="c-elastic-card__description">${r}</p>
        </div>

        <div class="c-elastic-card__pricing-block">
          <p class="c-elastic-card__price">${i}</p>
          <p class="c-elastic-card__billing">${p}</p>
        </div>

        <div class="c-elastic-card__license">
          <button
            class="c-elastic-card__license-trigger"
            type="button"
            aria-expanded=${String(h)}
            aria-haspopup="listbox"
            ?disabled=${S}
            @click=${b??c}
          >
            <span class="c-elastic-card__license-value">
              <span class="c-elastic-card__license-count">${l}</span>
              <span class="c-elastic-card__license-unit">License${l!==1?"s":""}</span>
            </span>
            <span class="c-elastic-card__license-chevron" aria-hidden="true">
              ${z(T)}
            </span>
          </button>

          ${h?a`
            <ul class="c-elastic-card__license-options" role="listbox" aria-label="Number of licenses">
              ${d.map(n=>a`
                <li
                  class="c-elastic-card__license-option${n===l?" is-selected":""}"
                  role="option"
                  aria-selected=${String(n===l)}
                  @click=${()=>w?.(n)}
                >${n} License${n!==1?"s":""}</li>
              `)}
            </ul>
          `:c}

          <div class="c-elastic-card__license-helper">
            <p>${o} ${V}</p>
          </div>
        </div>

        ${A}

        <div class="c-elastic-card__secure">
          <svg class="c-elastic-card__lock-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M14 8V6a4 4 0 1 0-8 0v2H5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1Zm-4 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2-5H8V6a2 2 0 1 1 4 0v2Z" fill="currentColor"/>
          </svg>
          <p class="c-elastic-card__secure-text">Secure transaction</p>
        </div>

      </div>

      ${u.length>0?a`
        <div class="c-elastic-card__features">
          ${u.map(({iconTemplate:n,title:E,items:I=[]})=>a`
            <div class="c-elastic-card__feature-section">
              <div class="c-elastic-card__feature-title">
                ${n??c}
                <span>${E}</span>
              </div>
              <ul class="c-elastic-card__feature-items">
                ${I.map(O=>a`<li class="c-elastic-card__feature-item">${O}</li>`)}
              </ul>
            </div>
          `)}
        </div>
      `:c}
    </div>
  `},Z=new Set(["16:9","4:3","1:1","3:2","3:4","21:9"]),F=new Set(["xs","sm","md","lg","xl","full"]),M=new Set(["cover","contain","fill","none","scale-down"]),N=new Set(["center","top","bottom","left","right","top-left","top-right","bottom-left","bottom-right"]),y=(s,e,t)=>e.has(s)?s:t,B=({src:s,alt:e,lazy:t,decoding:r="async",objectPosition:i})=>a`
  <img
    src=${s??""}
    alt=${e??""}
    loading=${t?"lazy":"eager"}
    decoding=${r}
    style=${i?`object-position: ${i};`:c}
  />
`,U=({src:s,poster:e,autoplay:t,muted:r,loop:i,controls:p,playsinline:l,sources:d})=>a`
  <video
    src=${s??c}
    poster=${e??c}
    ?autoplay=${t}
    ?muted=${r}
    ?loop=${i}
    ?playsinline=${l}
    ?controls=${p}
    preload="metadata"
  >
    ${Array.isArray(d)?d.map(o=>a`<source src=${o.src} type=${o.type??c} media=${o.media??c} />`):c}
  </video>
`,k=a`<span class="c-media__overlay" aria-hidden="true"></span>`,H=({src:s,alt:e="",aspectRatio:t="3:4",size:r="full",objectFit:i="cover",objectPosition:p="center",type:l="image",lazy:d=!0,poster:o,autoplay:_=!1,muted:m=!0,loop:b=!0,controls:w=!1,playsinline:f=!0,overlay:$=k,sources:g,mediaTemplate:u}={})=>{const x=y(t,Z,"3:4"),v=y(r,F,"full"),h=y(i,M,"cover"),S=y(p,N,"center"),V=$===!1?c:$??k,A=u||(l==="video"?U({src:s,poster:o,autoplay:_,muted:m,loop:b,controls:w,playsinline:f,sources:g}):B({src:s,alt:e,lazy:d,objectPosition:S}));return a`
    <figure
      class="c-media"
      data-aspect=${x}
      data-size=${v}
      data-fit=${h}
      data-position=${S}
    >
      ${A}
      ${V}
    </figure>
  `};export{G as E,H as M};
