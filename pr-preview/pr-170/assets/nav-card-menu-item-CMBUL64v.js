import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";import{n as i,t as a}from"./nav-card-shell-DBDRLaHx.js";var o,s,c,l,u;function d(){return(d=e((()=>{r(),i(),o=n`
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 1L5 5L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`,s=e=>Array.isArray(e)?e:[],c=new Set([`hover`,`active`]),l=({label:e,href:r,state:i,showIconEnd:a})=>{let s=i&&c.has(i)?i:null;return n`
    <li class="c-nav-card-menu-item__row">
      <a
        class="c-nav-card-menu-item__link"
        data-state=${s??t}
        href=${r||`#`}
      >
        <span class="c-nav-card-menu-item__link-label">${e}</span>
        ${a?n`<span class="c-nav-card-menu-item__link-icon">${o}</span>`:t}
      </a>
    </li>
  `},u=({title:e=`Browse`,items:r=[],ctaLabel:i=`Explore`,ctaHref:o=``}={})=>{let c=s(r),u=c.length>0,d=n`
    ${e?n`<header class="c-nav-card-menu-item__heading">
          <h3 class="c-nav-card-menu-item__title">${e}</h3>
        </header>`:t}
    ${u?n`<ul class="c-nav-card-menu-item__list">
          ${c.map(e=>l({label:e?.label??``,href:e?.href??`#`,state:e?.state,showIconEnd:e?.showIconEnd}))}
        </ul>`:t}
  `;return a({className:`c-nav-card-menu-item`,content:d,ctaButtonLabel:i,ctaButtonHref:o,interactive:!1})}})))()}export{d as n,u as t};