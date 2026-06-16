import{E as s,x as a}from"./iframe-Cs-hM5Vi.js";import{B as v}from"./button-khbSzUeu.js";const _=({quote:t="",attributionName:d="",attributionRole:o="",ctaLabel:i="",ctaHref:e="#",showAttribution:n=!0,showCta:r=!0,imageSrc:c="",imageAlt:l=""}={})=>a`
  <div class="c-quote-card">
    <div class="qc-media" aria-hidden="true">
      ${c?a`<img
            class="qc-media__img"
            src=${c}
            alt=${l}
            loading="eager"
            decoding="async"
          />`:s}
      <div class="qc-media__overlay"></div>
    </div>
    <div class="qc-content">
      <div class="qc-quote">
        <p class="qc-quote__text">${t}</p>
      </div>
      ${n?a`
            <div class="qc-attribution">
              <span class="qc-attribution__name">${d}</span>
              <span class="qc-attribution__role">${o}</span>
            </div>
          `:s}
      ${r&&i?a`
            <div class="qc-actions">
              ${v({label:i,href:e,background:"solid",context:"on-dark"})}
            </div>
          `:s}
    </div>
  </div>
`;export{_ as Q};
