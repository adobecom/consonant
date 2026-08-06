import{E as t,x as a}from"./iframe-BQ_6YrVl.js";import{c as u}from"./button-Cjq5L1h3.js";const _=({quote:s="",attributionName:n="",attributionRole:o="",ctaLabel:e="",ctaHref:r="#",showAttribution:d=!0,showCta:l=!0,imageSrc:c="",imageAlt:p=""}={})=>{const i=s.startsWith("“")||s.startsWith('"')?s[0]:"",v=i?s.slice(1):s;return a`
  <div class="c-quote-card">
    <div class="qc-media" aria-hidden="true">
      ${c?a`<img
            class="qc-media__img"
            src=${c}
            alt=${p}
            loading="eager"
            decoding="async"
          />`:t}
      <div class="qc-media__overlay"></div>
    </div>
    <div class="qc-content">
      <div class="qc-quote">
        <p class="qc-quote__text">
          ${i?a`<span class="qc-open-quote" aria-hidden="true">${i}</span>`:t}${v}
        </p>
      </div>
      ${d?a`
            <div class="qc-attribution">
              <span class="qc-attribution__name">${n}</span>
              <span class="qc-attribution__role">${o}</span>
            </div>
          `:t}
      ${l&&e?a`
            <div class="qc-actions">
              ${u({label:e,href:r,background:"solid",context:"on-dark"})}
            </div>
          `:t}
    </div>
  </div>
`},m="/consonant/pr-preview/pr-106/assets/slide-1-OrkBQbCA.jpg",g="/consonant/pr-preview/pr-106/assets/slide-2-BCVuwyjx.jpg",b="/consonant/pr-preview/pr-106/assets/slide-3-CE2qaWzE.jpg";export{_ as Q,g as a,b,m as s};
