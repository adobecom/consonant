import{E as r,x as e}from"./iframe-DMpSMP9h.js";import{N as d}from"./nav-card-shell-B7_KvjDD.js";const m=e`
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 1L5 5L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`,h=a=>Array.isArray(a)?a:[],u=new Set(["hover","active"]),v=({label:a,href:c,state:n,showIconEnd:o})=>{const t=n&&u.has(n)?n:null;return e`
    <li class="c-nav-card-menu-item__row">
      <a
        class="c-nav-card-menu-item__link"
        data-state=${t??r}
        href=${c||"#"}
      >
        <span class="c-nav-card-menu-item__link-label">${a}</span>
        ${o?e`<span class="c-nav-card-menu-item__link-icon">${m}</span>`:r}
      </a>
    </li>
  `},w=({title:a="Browse",items:c=[],ctaLabel:n="Explore",ctaHref:o=""}={})=>{const t=h(c),l=t.length>0,i=e`
    ${a?e`<header class="c-nav-card-menu-item__heading">
          <h3 class="c-nav-card-menu-item__title">${a}</h3>
        </header>`:r}
    ${l?e`<ul class="c-nav-card-menu-item__list">
          ${t.map(s=>v({label:s?.label??"",href:s?.href??"#",state:s?.state,showIconEnd:s?.showIconEnd}))}
        </ul>`:r}
  `;return d({className:"c-nav-card-menu-item",content:i,ctaButtonLabel:n,ctaButtonHref:o,interactive:!1})};export{w as N};
