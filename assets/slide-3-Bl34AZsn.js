import{E as t,x as a}from"./iframe-DDgLX23t.js";import{c as u}from"./button-Cjq5L1h3.js";const _=({quote:s="",attributionName:e="",attributionRole:o="",ctaLabel:c="",ctaHref:d="#",showAttribution:r=!0,showCta:l=!0,imageSrc:n="",imageAlt:p=""}={})=>{const i=s.startsWith("“")||s.startsWith('"')?s[0]:"",v=i?s.slice(1):s;return a`
  <div class="c-quote-card">
    <div class="qc-media" aria-hidden="true">
      ${n?a`<img
            class="qc-media__img"
            src=${n}
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
      ${r?a`
            <div class="qc-attribution">
              <span class="qc-attribution__name">${e}</span>
              <span class="qc-attribution__role">${o}</span>
            </div>
          `:t}
      ${l&&c?a`
            <div class="qc-actions">
              ${u({label:c,href:d,background:"solid",context:"on-dark"})}
            </div>
          `:t}
    </div>
  </div>
`},m="/consonant/assets/slide-1-OrkBQbCA.jpg",g="/consonant/assets/slide-2-BCVuwyjx.jpg",b="/consonant/assets/slide-3-CE2qaWzE.jpg";export{_ as Q,g as a,b,m as s};
