import{E as c,x as a}from"./iframe-X0CzthNh.js";import{N as _}from"./nav-card-shell-DckkV0jb.js";const i=a`
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 1L5 5L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`,$=({eyebrow:n="",title:s="",body:r="",ctaLinkLabel:o="",ctaLinkHref:t="",ctaButtonLabel:d="Explore",ctaButtonHref:e="",interactive:l=!0}={})=>{const v=a`
    <div class="c-nav-card__top">
      ${n?a`<p class="c-nav-card__eyebrow">${n}</p>`:c}
      <div class="c-nav-card__content">
        ${s?a`<h3 class="c-nav-card__title">${s}</h3>`:c}
        <div class="c-nav-card__body-area">
          ${r?a`<p class="c-nav-card__body">${r}</p>`:c}
          ${o&&t?a`
                <a class="c-nav-card__cta-link" href=${t}>
                  <span class="c-nav-card__cta-link__label">${o}</span>
                  <span class="c-nav-card__cta-link__icon">${i}</span>
                </a>`:c}
        </div>
      </div>
    </div>
  `;return _({className:"c-nav-card",content:v,ctaButtonLabel:d,ctaButtonHref:e,interactive:l})};export{$ as N};
