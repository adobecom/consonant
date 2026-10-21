import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{i as t,s as n,u as r}from"./iframe-BgLmQkiJ.js";import{n as i,t as a}from"./nav-card-shell-D7oyd6WF.js";var o,s,c,l,u;function d(){return(d=e((()=>{t(),i(),o=r`
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 1L5 5L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`,s=e=>Array.isArray(e)?e:[],c=new Set([`hover`,`active`]),l=({label:e,href:t,state:i,showIconEnd:a})=>{let s=i&&c.has(i)?i:null;return r`
    <li class="c-nav-card-menu-item__row">
      <a
        class="c-nav-card-menu-item__link"
        data-state=${s??n}
        href=${t||`#`}
      >
        <span class="c-nav-card-menu-item__link-label">${e}</span>
        ${a?r`<span class="c-nav-card-menu-item__link-icon">${o}</span>`:n}
      </a>
    </li>
  `},u=({title:e=`Browse`,items:t=[],ctaLabel:i=`Explore`,ctaHref:o=``}={})=>{let c=s(t),u=c.length>0,d=r`
    ${e?r`<header class="c-nav-card-menu-item__heading">
          <h3 class="c-nav-card-menu-item__title">${e}</h3>
        </header>`:n}
    ${u?r`<ul class="c-nav-card-menu-item__list">
          ${c.map(e=>l({label:e?.label??``,href:e?.href??`#`,state:e?.state,showIconEnd:e?.showIconEnd}))}
        </ul>`:n}
  `;return a({className:`c-nav-card-menu-item`,content:d,ctaButtonLabel:i,ctaButtonHref:o,interactive:!1})}})))()}export{d as n,u as t};