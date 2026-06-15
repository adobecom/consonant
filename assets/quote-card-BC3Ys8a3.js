import{E as s,x as a}from"./iframe-qK89JQpR.js";import{B as v}from"./button-B3fR2oAf.js";const _=({quote:t="",attributionName:d="",attributionRole:o="",ctaLabel:i="",ctaHref:n="#",showAttribution:e=!0,showCta:r=!0,imageSrc:c="",imageAlt:l=""}={})=>a`
  <div class="c-quote-card">
    <div class="qc-media" aria-hidden="true">
      ${c?a`<img
            class="qc-media__img"
            src=${c}
            alt=${l}
            loading="lazy"
            decoding="async"
          />`:s}
      <div class="qc-media__overlay"></div>
    </div>
    <div class="qc-content">
      <div class="qc-quote">
        <p class="qc-quote__text">${t}</p>
      </div>
      ${e?a`
            <div class="qc-attribution">
              <span class="qc-attribution__name">${d}</span>
              <span class="qc-attribution__role">${o}</span>
            </div>
          `:s}
      ${r&&i?a`
            <div class="qc-actions">
              ${v({label:i,href:n,background:"solid",context:"on-dark"})}
            </div>
          `:s}
    </div>
  </div>
`;export{_ as Q};
