import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{n as i,t as a}from"./button-CjK_LOp6.js";var o;function s(){return(s=e((()=>{r(),i(),o=({quote:e=``,attributionName:r=``,attributionRole:i=``,ctaLabel:o=``,ctaHref:s=`#`,showAttribution:c=!0,showCta:l=!0,imageSrc:u=``,imageAlt:d=``,imageSrcset:f=``,imageSizes:p=`100vw`,imageLoading:m=`eager`}={})=>{let h=e.startsWith(`“`)||e.startsWith(`"`)?e[0]:``,g=h?e.slice(1):e;return t`
  <div class="c-quote-card">
    <div class="qc-media" aria-hidden="true">
      ${u?t`<img
            class="qc-media__img"
            src=${u}
            srcset=${f||n}
            sizes=${f?p:n}
            alt=${d}
            loading=${m}
            decoding="async"
          />`:n}
      <div class="qc-media__overlay"></div>
    </div>
    <div class="qc-content">
      <div class="qc-quote">
        <p class="qc-quote__text">
          ${h?t`<span class="qc-open-quote" aria-hidden="true">${h}</span>`:n}${g}
        </p>
      </div>
      ${c?t`
            <div class="qc-attribution">
              <span class="qc-attribution__name">${r}</span>
              <span class="qc-attribution__role">${i}</span>
            </div>
          `:n}
      ${l&&o?t`
            <div class="qc-actions">
              ${a({label:o,href:s,style:`knockout`})}
            </div>
          `:n}
    </div>
  </div>
`}})))()}export{s as n,o as t};